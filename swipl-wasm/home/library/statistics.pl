/*  Part of SWI-Prolog

    Author:        Jan Wielemaker
    E-mail:        J.Wielemaker@vu.nl
    WWW:           http://www.swi-prolog.org
    Copyright (c)  1999-2020, University of Amsterdam
                              VU University Amsterdam
                              CWI, Amsterdam
                              SWI-Prolog Solutions b.v.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

    1. Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in
       the documentation and/or other materials provided with the
       distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
    FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
    COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
    INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
    ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
*/

:- module(prolog_statistics,
          [ statistics/0,
            statistics/1,               % -Stats
            thread_statistics/2,        % ?Thread, -Stats
            time/1,                     % :Goal
            call_time/2,                % :Goal, -Time
            call_time/3,                % :Goal, -Time, -Result
            profile/1,                  % :Goal
            profile/2,                  % :Goal, +Options
            show_profile/1,             % +Options
            profile_data/1,             % -Dict
            profile_procedure_data/2    % :PI, -Data
          ]).
:- autoload(library(error),[must_be/2]).
:- autoload(library(lists),[append/3,member/2]).
:- autoload(library(option),[option/3]).
:- autoload(library(pairs),[map_list_to_pairs/3,pairs_values/2]).
:- autoload(library(prolog_code),
	    [predicate_sort_key/2,predicate_label/2]).

:- set_prolog_flag(generate_debug_info, false).

:- meta_predicate
    time(0),
    call_time(0, -, -),
    call_time(0, -),
    profile(0),
    profile(0, +),
    profile_procedure_data(:, -).

/** <module> Get information about resource usage

This library provides predicates to   obtain  information about resource
usage by your program. The predicates of  this library are for human use
at the toplevel: information is _printed_.   All predicates obtain their
information using public low-level primitives.   These primitives can be
use to obtain selective statistics during execution.
*/

%!  statistics is det.
%
%   Print information about resource usage using print_message/2.
%
%   @see    All statistics printed are obtained through statistics/2.

statistics :-
    phrase(collect_stats, Stats),
    print_message(information, statistics(Stats)).

%!  statistics(-Stats:dict) is det.
%
%   Stats  is  a  dict   representing    the   same  information  as
%   statistics/0. This convience function is   primarily intended to
%   pass  statistical  information  to  e.g.,  a  web  client.  Time
%   critical code that wishes to   collect statistics typically only
%   need a small subset  and  should   use  statistics/2  to  obtain
%   exactly the data they need.

statistics(Stats) :-
    phrase(collect_stats, [CoreStats|StatList]),
    dict_pairs(CoreStats, _, CorePairs),
    map_list_to_pairs(dict_key, StatList, ExtraPairs),
    append(CorePairs, ExtraPairs, Pairs),
    dict_pairs(Stats, statistics, Pairs).

dict_key(Dict, Key) :-
    gc{type:atom} :< Dict,
    !,
    Key = agc.
dict_key(Dict, Key) :-
    gc{type:clause} :< Dict,
    !,
    Key = cgc.
dict_key(Dict, Key) :-
    is_dict(Dict, Key).

collect_stats -->
    core_statistics,
    gc_statistics,
    agc_statistics,
    cgc_statistics,
    shift_statistics,
    thread_counts,
    engine_counts.

core_statistics -->
    { statistics(process_cputime, Cputime),
      statistics(process_epoch, Epoch),
      statistics(inferences, Inferences),
      statistics(atoms, Atoms),
      statistics(functors, Functors),
      statistics(predicates, Predicates),
      statistics(modules, Modules),
      statistics(codes, Codes),
      thread_self(Me),
      thread_stack_statistics(Me, Stacks)
    },
    [ core{ time:time{cpu:Cputime, inferences:Inferences, epoch:Epoch},
            data:counts{atoms:Atoms, functors:Functors,
                        predicates:Predicates, modules:Modules,
                        vm_codes:Codes},
            stacks:Stacks
          }
    ].

:- if(\+current_predicate(thread_statistics/3)).
thread_statistics(_Thread, Key, Value) :-       % single threaded version
    statistics(Key, Value).
:- endif.

thread_stack_statistics(Thread,
                  stacks{local:stack{name:local,
                                     allocated:Local,
                                     usage:LocalUsed},
                         global:stack{name:global,
                                      allocated:Global,
                                      usage:GlobalUsed},
                         trail:stack{name:trail,
                                     allocated:Trail,
                                     usage:TrailUsed},
                         total:stack{name:stacks,
                                     limit:StackLimit,
                                     allocated:StackAllocated,
                                     usage:StackUsed}
                        }) :-
    thread_statistics(Thread, trail,       Trail),
    thread_statistics(Thread, trailused,   TrailUsed),
    thread_statistics(Thread, local,       Local),
    thread_statistics(Thread, localused,   LocalUsed),
    thread_statistics(Thread, global,      Global),
    thread_statistics(Thread, globalused,  GlobalUsed),
    thread_statistics(Thread, stack_limit, StackLimit), %
    StackUsed is LocalUsed+GlobalUsed+TrailUsed,
    StackAllocated is Local+Global+Trail.

gc_statistics -->
    { statistics(collections, Collections),
      Collections > 0,
      !,
      statistics(collected, Collected),
      statistics(gctime, GcTime)
    },
    [ gc{type:stack, unit:byte,
         count:Collections, time:GcTime, gained:Collected } ].
gc_statistics --> [].

agc_statistics -->
    { catch(statistics(agc, Agc), _, fail),
      Agc > 0,
      !,
      statistics(agc_gained, Gained),
      statistics(agc_time, Time)
    },
    [ gc{type:atom, unit:atom,
         count:Agc, time:Time, gained:Gained} ].
agc_statistics --> [].

cgc_statistics -->
    { catch(statistics(cgc, Cgc), _, fail),
      Cgc > 0,
      !,
      statistics(cgc_gained, Gained),
      statistics(cgc_time, Time)
    },
    [ gc{type:clause, unit:clause,
         count:Cgc, time:Time, gained:Gained} ].
cgc_statistics --> [].

shift_statistics -->
    { statistics(local_shifts, LS),
      statistics(global_shifts, GS),
      statistics(trail_shifts, TS),
      (   LS > 0
      ;   GS > 0
      ;   TS > 0
      ),
      !,
      statistics(shift_time, Time)
    },
    [ shift{local:LS, global:GS, trail:TS, time:Time} ].
shift_statistics --> [].

thread_counts -->
    { current_prolog_flag(threads, true),
      statistics(threads, Active),
      statistics(threads_created, Created),
      Created > 1,
      !,
      statistics(thread_cputime, CpuTime),
      Finished is Created - Active
    },
    [ thread{count:Active, finished:Finished, time:CpuTime} ].
thread_counts --> [].

engine_counts -->
    { current_prolog_flag(threads, true),
      statistics(engines, Active),
      statistics(engines_created, Created),
      Created > 0,
      !,
      Finished is Created - Active
    },
    [ engine{count:Active, finished:Finished} ].
engine_counts --> [].


%!  thread_statistics(?Thread, -Stats:dict) is nondet.
%
%   Obtain statistical information about a single thread.  Fails
%   silently of the Thread is no longer alive.
%
%   @arg    Stats is a dict containing status, time and stack-size
%           information about Thread.

thread_statistics(Thread, Stats) :-
    thread_property(Thread, status(Status)),
    human_thread_id(Thread, Id),
    Error = error(_,_),
    (   catch(thread_stats(Thread, Stacks, Time), Error, fail)
    ->  Stats = thread{id:Id,
                       status:Status,
                       time:Time,
                       stacks:Stacks}
    ;   Stats = thread{id:Thread,
                       status:Status}
    ).

human_thread_id(Thread, Id) :-
    atom(Thread),
    !,
    Id = Thread.
human_thread_id(Thread, Id) :-
    thread_property(Thread, id(Id)).

thread_stats(Thread, Stacks,
             time{cpu:CpuTime,
                  inferences:Inferences,
                  epoch:Epoch
                 }) :-
    thread_statistics(Thread, cputime, CpuTime),
    thread_statistics(Thread, inferences, Inferences),
    thread_statistics(Thread, epoch, Epoch),
    thread_stack_statistics(Thread, Stacks).


%!  time(:Goal) is nondet.
%
%   Execute Goal, reporting statistics to the user. If Goal succeeds
%   non-deterministically,  retrying  reports  the   statistics  for
%   providing the next answer.
%
%   Statistics  are  retrieved  using   thread_statistics/3  on  the
%   calling   thread.   Note   that   not    all   systems   support
%   thread-specific CPU time. Notable, this is lacking on MacOS X.
%
%   @bug Inference statistics are often a few off.
%   @see statistics/2 for obtaining statistics in your program and
%        understanding the reported values.
%   @see call_time/2, call_time/3 to obtain the timing in a dict.

time(Goal) :-
    time_state(State0),
    (   call_cleanup(catch(Goal, E, (report(State0,10), throw(E))),
                     Det = true),
        time_true_report(State0),
        (   Det == true
        ->  !
        ;   true
        )
    ;   report(State0, 11),
        fail
    ).

%!  call_time(:Goal, -Time:dict).
%!  call_time(:Goal, -Time:dict, -Result).
%
%   Call Goal as  call/1,  unifying  Time   with  a  dict  that provides
%   information on the  resource  usage.   Currently  Time  contains the
%   keys below.  Future versions may provide additional keys.
%
%     - wall:Seconds
%     - cpu:Seconds
%     - inferences:Count
%
%   @arg Result is one of `true` or  `false` depending on whether or not
%   the goal succeeded.

call_time(Goal, Time) :-
    call_time(Goal, Time, true).
call_time(Goal, Time, Result) :-
    time_state(State0),
    (   call_cleanup(catch(Goal, E, (report(State0,10), throw(E))),
                     Det = true),
        Result = true,
        time_true_used(State0, Time),
        (   Det == true
        ->  !
        ;   true
        )
    ;   time_used(State0, 11, Time),
        Result = false
    ).

report(State0, Sub) :-
    time_used(State0, Sub, time{wall:Wall, cpu:Time, inferences:Inferences}),
    (   Time =:= 0
    ->  Lips = 'Infinite'
    ;   Lips is integer(Inferences/Time)
    ),
    print_message(information, time(Inferences, Time, Wall, Lips)).

time_used(time{wall:OldWall, cpu:OldTime, inferences:OldInferences}, Sub,
          time{wall:Wall, cpu:Time, inferences:Inferences}) :-
    time_state(time{wall:NewWall, cpu:NewTime, inferences:NewInferences}),
    Time       is NewTime - OldTime,
    Inferences is NewInferences - OldInferences - Sub,
    Wall       is NewWall - OldWall.

time_state(time{wall:Wall, cpu:Time, inferences:Inferences}) :-
    get_time(Wall),
    statistics(cputime, Time),
    statistics(inferences, Inferences).

time_true_report(State) :-             % leave choice-point
    report(State, 12).
time_true_report(State) :-
    time_true(State).

time_true_used(State, Time) :-         % leave choice-point
    time_used(State, 12, Time).
time_true_used(State, _) :-
    time_true(State).


time_true(State) :-
    get_time(Wall),
    statistics(cputime, Time),
    statistics(inferences, Inferences0),
    Inferences is Inferences0 - 5,
    nb_set_dict(wall, State, Wall),
    nb_set_dict(cpu, State, Time),
    nb_set_dict(inferences, State, Inferences),
    fail.


                 /*******************************
                 *     EXECUTION PROFILING      *
                 *******************************/

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
This module provides a simple backward compatibility frontend on the new
(in version 5.1.10) execution profiler  with  a   hook  to  the  new GUI
visualiser for profiling results defined in library('swi/pce_profile').

Later we will add a proper textual report-generator.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

:- multifile
    prolog:show_profile_hook/1.

%!  profile(:Goal).
%!  profile(:Goal, +Options).
%
%   Run Goal under the execution profiler.  Defined options are:
%
%     * time(Which)
%     Profile =cpu= or =wall= time.  The default is CPU time.
%     * top(N)
%     When generating a textual report, show the top N predicates.
%     * cumulative(Bool)
%     If =true= (default =false=), show cumulative output in
%     a textual report.

profile(Goal) :-
    profile(Goal, []).

profile(Goal0, Options) :-
    option(time(Which), Options, cpu),
    time_name(Which, How),
    expand_goal(Goal0, Goal),
    call_cleanup('$profile'(Goal, How),
                 prolog_statistics:show_profile(Options)).

time_name(cpu,      cputime)  :- !.
time_name(wall,     walltime) :- !.
time_name(cputime,  cputime)  :- !.
time_name(walltime, walltime) :- !.
time_name(Time, _) :-
    must_be(oneof([cpu,wall]), Time).

%!  show_profile(+Options)
%
%   Display last collected profiling data.  Options are
%
%     * top(N)
%     When generating a textual report, show the top N predicates.
%     * cumulative(Bool)
%     If =true= (default =false=), show cumulative output in
%     a textual report.

show_profile(N) :-
    integer(N),
    !,
    show_profile([top(N)]).
show_profile(Options) :-
    profiler(Old, false),
    show_profile_(Options),
    profiler(_, Old).

show_profile_(Options) :-
    prolog:show_profile_hook(Options),
    !.
show_profile_(Options) :-
    prof_statistics(Stat),
    sort_on(Options, SortKey),
    findall(Node, profile_procedure_data(_:_, Node), Nodes),
    sort_prof_nodes(SortKey, Nodes, Sorted),
    format('~`=t~69|~n'),
    format('Total time: ~3f seconds~n', [Stat.time]),
    format('~`=t~69|~n'),
    format('~w~t~w =~45|~t~w~60|~t~w~69|~n',
           [ 'Predicate', 'Box Entries', 'Calls+Redos', 'Time'
           ]),
    format('~`=t~69|~n'),
    option(top(N), Options, 25),
    show_plain(Sorted, N, Stat, SortKey).

sort_on(Options, ticks_self) :-
    option(cumulative(false), Options, false),
    !.
sort_on(_, ticks).

sort_prof_nodes(ticks, Nodes, Sorted) :-
    !,
    map_list_to_pairs(key_ticks, Nodes, Keyed),
    sort(1, >=, Keyed, KeySorted),
    pairs_values(KeySorted, Sorted).
sort_prof_nodes(Key, Nodes, Sorted) :-
    sort(Key, >=, Nodes, Sorted).

key_ticks(Node, Ticks) :-
    Ticks is Node.ticks_self + Node.ticks_siblings.

show_plain([], _, _, _).
show_plain(_, 0, _, _) :- !.
show_plain([H|T], N, Stat, Key) :-
    show_plain(H, Stat, Key),
    N2 is N - 1,
    show_plain(T, N2, Stat, Key).

show_plain(Node, Stat, Key) :-
    value(label,                       Node, Pred),
    value(call,                        Node, Call),
    value(redo,                        Node, Redo),
    value(time(Key, percentage, Stat), Node, Percent),
    IntPercent is round(Percent*10),
    Entry is Call + Redo,
    format('~w~t~D =~45|~t~D+~55|~D ~t~1d%~69|~n',
           [Pred, Entry, Call, Redo, IntPercent]).


                 /*******************************
                 *         DATA GATHERING       *
                 *******************************/

%!  profile_data(-Data) is det.
%
%   Gather all relevant data from profiler. This predicate may be called
%   while profiling is active  in  which   case  it  is  suspended while
%   collecting the data. Data is a dict providing the following fields:
%
%     - summary:Dict
%       Overall statistics providing
%       - samples:Count:
%         Times the statistical profiler was called
%       - ticks:Count
%         Virtual ticks during profiling
%       - accounting:Count
%         Tick spent on accounting
%       - time:Seconds
%         Total time sampled
%       - nodes:Count
%         Nodes in the call graph.
%     - nodes
%       List of nodes.  Each node provides:
%       - predicate:PredicateIndicator
%       - ticks_self:Count
%       - ticks_siblings:Count
%       - call:Count
%       - redo:Count
%       - exit:Count
%       - callers:list_of(Relative)
%       - callees:list_of(Relative)
%
%    _Relative_ is a term of the shape below that represents a caller or
%    callee. Future versions are likely to use a dict instead.
%
%        node(PredicateIndicator, CycleID, Ticks, TicksSiblings,
%             Calls, Redos, Exits)

profile_data(Data) :-
    setup_call_cleanup(
        profiler(Old, false),
        profile_data_(Data),
        profiler(_, Old)).

profile_data_(profile{summary:Summary, nodes:Nodes}) :-
    prof_statistics(Summary),
    findall(Node, profile_procedure_data(_:_, Node), Nodes).

%!  prof_statistics(-Node) is det.
%
%   Get overall statistics
%
%   @param Node     term of the format prof(Ticks, Account, Time, Nodes)

prof_statistics(summary{samples:Samples, ticks:Ticks,
                        accounting:Account, time:Time, nodes:Nodes}) :-
    '$prof_statistics'(Samples, Ticks, Account, Time, Nodes).

%!  profile_procedure_data(?Pred, -Data:dict) is nondet.
%
%   Collect data for Pred. If Pred is   unbound  data for each predicate
%   that has profile data available is   returned.  Data is described in
%   profile_data/1 as an element of the `nodes` key.

profile_procedure_data(Pred, Node) :-
    Node = node{predicate:Pred,
                ticks_self:TicksSelf, ticks_siblings:TicksSiblings,
                call:Call, redo:Redo, exit:Exit,
                callers:Parents, callees:Siblings},
    (   specified(Pred)
    ->  true
    ;   profiled_predicates(Preds),
        member(Pred, Preds)
    ),
    '$prof_procedure_data'(Pred,
                           TicksSelf, TicksSiblings,
                           Call, Redo, Exit,
                           Parents, Siblings).

specified(Module:Head) :-
    atom(Module),
    callable(Head).

profiled_predicates(Preds) :-
    setof(Pred, prof_impl(Pred), Preds).

prof_impl(Pred) :-
    prof_node_id(Node),
    node_id_pred(Node, Pred).

prof_node_id(N) :-
    prof_node_id_below(N, -).

prof_node_id_below(N, Root) :-
    '$prof_sibling_of'(N0, Root),
    (   N = N0
    ;   prof_node_id_below(N, N0)
    ).

node_id_pred(Node, Pred) :-
    '$prof_node'(Node, Pred, _Calls, _Redos, _Exits, _Recur,
                 _Ticks, _SiblingTicks).

%!  value(+Key, +NodeData, -Value)
%
%   Obtain possible computed attributes from NodeData.

value(name, Data, Name) :-
    !,
    predicate_sort_key(Data.predicate, Name).
value(label, Data, Label) :-
    !,
    predicate_label(Data.predicate, Label).
value(ticks, Data, Ticks) :-
    !,
    Ticks is Data.ticks_self + Data.ticks_siblings.
value(time(Key, percentage, Stat), Data, Percent) :-
    !,
    value(Key, Data, Ticks),
    Total = Stat.ticks,
    Account = Stat.accounting,
    (   Total-Account > 0
    ->  Percent is 100 * (Ticks/(Total-Account))
    ;   Percent is 0.0
    ).
value(Name, Data, Value) :-
    Value = Data.Name.


                 /*******************************
                 *            MESSAGES          *
                 *******************************/

:- multifile
    prolog:message/3.

% NOTE: The code below uses get_dict/3 rather than the functional
% notation to make this code work with `swipl --traditional`

prolog:message(time(UsedInf, UsedTime, Wall, Lips)) -->
    [ '~D inferences, ~3f CPU in ~3f seconds (~w% CPU, ~w Lips)'-
      [UsedInf, UsedTime, Wall, Perc, Lips] ],
    {   Wall > 0
    ->  Perc is round(100*UsedTime/Wall)
    ;   Perc = ?
    }.
prolog:message(statistics(List)) -->
    msg_statistics(List).

msg_statistics([]) --> [].
msg_statistics([H|T]) -->
    { is_dict(H, Tag) },
    msg_statistics(Tag, H),
    (   { T == [] }
    ->  []
    ;   [nl], msg_statistics(T)
    ).

msg_statistics(core, S) -->
    { get_dict(time, S, Time),
      get_dict(data, S, Data),
      get_dict(stacks, S, Stacks)
    },
    time_stats(Time), [nl],
    data_stats(Data), [nl,nl],
    stacks_stats(Stacks).
msg_statistics(gc, S) -->
    {   (   get_dict(type, S, stack)
        ->  Label = ''
        ;   get_dict(type, S, Type),
            string_concat(Type, " ", Label)
        ),
        get_dict(count, S, Count),
        get_dict(gained, S, Gained),
        get_dict(unit, S, Unit),
        get_dict(time, S, Time)
    },
    [ '~D ~wgarbage collections gained ~D ~ws in ~3f seconds.'-
      [ Count, Label, Gained, Unit, Time]
    ].
msg_statistics(shift, S) -->
    { get_dict(local, S, Local),
      get_dict(global, S, Global),
      get_dict(trail, S, Trail),
      get_dict(time, S, Time)
    },
    [ 'Stack shifts: ~D local, ~D global, ~D trail in ~3f seconds'-
      [ Local, Global, Trail, Time ]
    ].
msg_statistics(thread, S) -->
    { get_dict(count, S, Count),
      get_dict(finished, S, Finished),
      get_dict(time, S, Time)
    },
    [ '~D threads, ~D finished threads used ~3f seconds'-
      [Count, Finished, Time]
    ].
msg_statistics(engine, S) -->
    { get_dict(count, S, Count),
      get_dict(finished, S, Finished)
    },
    [ '~D engines, ~D finished engines'-
      [Count, Finished]
    ].

time_stats(T) -->
    { get_dict(epoch, T, Epoch),
      format_time(string(EpochS), '%+', Epoch),
      get_dict(cpu, T, CPU),
      get_dict(inferences, T, Inferences)
    },
    [ 'Started at ~s'-[EpochS], nl,
      '~3f seconds cpu time for ~D inferences'-
      [ CPU, Inferences ]
    ].
data_stats(C) -->
    { get_dict(atoms, C, Atoms),
      get_dict(functors, C, Functors),
      get_dict(predicates, C, Predicates),
      get_dict(modules, C, Modules),
      get_dict(vm_codes, C, VMCodes)
    },
    [ '~D atoms, ~D functors, ~D predicates, ~D modules, ~D VM-codes'-
      [ Atoms, Functors, Predicates, Modules, VMCodes]
    ].
stacks_stats(S) -->
    { get_dict(local, S, Local),
      get_dict(global, S, Global),
      get_dict(trail, S, Trail),
      get_dict(total, S, Total)
    },
    [ '~|~tLimit~25+~tAllocated~12+~tIn use~12+'-[], nl ],
    stack_stats('Local',  Local),  [nl],
    stack_stats('Global', Global), [nl],
    stack_stats('Trail',  Trail),  [nl],
    stack_stats('Total',  Total),  [nl].

stack_stats('Total', S) -->
    { dict_human_bytes(limit,     S, Limit),
      dict_human_bytes(allocated, S, Allocated),
      dict_human_bytes(usage,     S, Usage)
    },
    !,
    [ '~|~tTotal:~13+~t~s~12+ ~t~s~12+ ~t~s~12+'-
      [Limit, Allocated, Usage]
    ].
stack_stats(Stack, S) -->
    { dict_human_bytes(allocated, S, Allocated),
      dict_human_bytes(usage,     S, Usage)
    },
    [ '~|~w ~tstack:~13+~t~w~12+ ~t~s~12+ ~t~s~12+'-
      [Stack, -, Allocated, Usage]
    ].

dict_human_bytes(Key, Dict, String) :-
    get_dict(Key, Dict, Bytes),
    human_bytes(Bytes, String).

human_bytes(Bytes, String) :-
    Bytes < 20_000,
    !,
    format(string(String), '~D  b', [Bytes]).
human_bytes(Bytes, String) :-
    Bytes < 20_000_000,
    !,
    Kb is (Bytes+512) // 1024,
    format(string(String), '~D Kb', [Kb]).
human_bytes(Bytes, String) :-
    Bytes < 20_000_000_000,
    !,
    Mb is (Bytes+512*1024) // (1024*1024),
    format(string(String), '~D Mb', [Mb]).
human_bytes(Bytes, String) :-
    Gb is (Bytes+512*1024*1024) // (1024*1024*1024),
    format(string(String), '~D Gb', [Gb]).


:- multifile sandbox:safe_primitive/1.

sandbox:safe_primitive(prolog_statistics:statistics(_)).
sandbox:safe_primitive(prolog_statistics:statistics).
sandbox:safe_meta_predicate(prolog_statistics:profile/1).
sandbox:safe_meta_predicate(prolog_statistics:profile/2).
