var SWIPL = (() => {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
    return (
        function(SWIPL) {
            SWIPL = SWIPL || {};

            var Module = typeof SWIPL != "undefined" ? SWIPL : {};
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise(function(resolve, reject) {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            if (!Module.expectedDataFileDownloads) {
                Module.expectedDataFileDownloads = 0
            }
            Module.expectedDataFileDownloads++;
            (function() {
                if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
                var loadPackage = function(metadata) {
                    var PACKAGE_PATH = "";
                    if (typeof window === "object") {
                        PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/")
                    } else if (typeof process === "undefined" && typeof location !== "undefined") {
                        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/")
                    }
                    var PACKAGE_NAME = "src/swipl-web.data";
                    var REMOTE_PACKAGE_BASE = "swipl-web.data";
                    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
                        Module["locateFile"] = Module["locateFilePackage"];
                        err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
                    }
                    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
                    var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];

                    function fetchRemotePackage(packageName, packageSize, callback, errback) {
                        if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
                            require("fs").readFile(packageName, function(err, contents) {
                                if (err) {
                                    errback(err)
                                } else {
                                    callback(contents.buffer)
                                }
                            });
                            return
                        }
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", packageName, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onprogress = function(event) {
                            var url = packageName;
                            var size = packageSize;
                            if (event.total) size = event.total;
                            if (event.loaded) {
                                if (!xhr.addedTotal) {
                                    xhr.addedTotal = true;
                                    if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                                    Module.dataFileDownloads[url] = {
                                        loaded: event.loaded,
                                        total: size
                                    }
                                } else {
                                    Module.dataFileDownloads[url].loaded = event.loaded
                                }
                                var total = 0;
                                var loaded = 0;
                                var num = 0;
                                for (var download in Module.dataFileDownloads) {
                                    var data = Module.dataFileDownloads[download];
                                    total += data.total;
                                    loaded += data.loaded;
                                    num++
                                }
                                total = Math.ceil(total * Module.expectedDataFileDownloads / num);
                                if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")")
                            } else if (!Module.dataFileDownloads) {
                                if (Module["setStatus"]) Module["setStatus"]("Downloading data...")
                            }
                        };
                        xhr.onerror = function(event) {
                            throw new Error("NetworkError for: " + packageName)
                        };
                        xhr.onload = function(event) {
                            if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
                                var packageData = xhr.response;
                                callback(packageData)
                            } else {
                                throw new Error(xhr.statusText + " : " + xhr.responseURL)
                            }
                        };
                        xhr.send(null)
                    }

                    function handleError(error) {
                        console.error("package error:", error)
                    }
                    var fetchedCallback = null;
                    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
                    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
                        if (fetchedCallback) {
                            fetchedCallback(data);
                            fetchedCallback = null
                        } else {
                            fetched = data
                        }
                    }, handleError);

                    function runWithFS() {
                        function assert(check, msg) {
                            if (!check) throw msg + (new Error).stack
                        }
                        Module["FS_createPath"]("/", "swipl", true, true);
                        Module["FS_createPath"]("/swipl", "library", true, true);
                        Module["FS_createPath"]("/swipl/library", "iri_scheme", true, true);
                        Module["FS_createPath"]("/swipl/library", "theme", true, true);
                        Module["FS_createPath"]("/swipl/library", "lynx", true, true);
                        Module["FS_createPath"]("/swipl/library", "clp", true, true);
                        Module["FS_createPath"]("/swipl/library", "dcg", true, true);
                        Module["FS_createPath"]("/swipl/library", "unicode", true, true);
                        Module["FS_createPath"]("/swipl/library", "build", true, true);
                        Module["FS_createPath"]("/swipl/library", "dialect", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "swi", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "xsb", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "sicstus4", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "eclipse", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "yap", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "sicstus", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "hprolog", true, true);
                        Module["FS_createPath"]("/swipl/library/dialect", "iso", true, true);

                        function DataRequest(start, end, audio) {
                            this.start = start;
                            this.end = end;
                            this.audio = audio
                        }
                        DataRequest.prototype = {
                            requests: {},
                            open: function(mode, name) {
                                this.name = name;
                                this.requests[name] = this;
                                Module["addRunDependency"]("fp " + this.name)
                            },
                            send: function() {},
                            onload: function() {
                                var byteArray = this.byteArray.subarray(this.start, this.end);
                                this.finish(byteArray)
                            },
                            finish: function(byteArray) {
                                var that = this;
                                Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
                                Module["removeRunDependency"]("fp " + that.name);
                                this.requests[this.name] = null
                            }
                        };
                        var files = metadata["files"];
                        for (var i = 0; i < files.length; ++i) {
                            new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"])
                        }

                        function processPackageData(arrayBuffer) {
                            assert(arrayBuffer, "Loading data file failed.");
                            assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
                            var byteArray = new Uint8Array(arrayBuffer);
                            DataRequest.prototype.byteArray = byteArray;
                            var files = metadata["files"];
                            for (var i = 0; i < files.length; ++i) {
                                DataRequest.prototype.requests[files[i].filename].onload()
                            }
                            Module["removeRunDependency"]("datafile_src/swipl-web.data")
                        }
                        Module["addRunDependency"]("datafile_src/swipl-web.data");
                        if (!Module.preloadResults) Module.preloadResults = {};
                        Module.preloadResults[PACKAGE_NAME] = {
                            fromCache: false
                        };
                        if (fetched) {
                            processPackageData(fetched);
                            fetched = null
                        } else {
                            fetchedCallback = processPackageData
                        }
                    }
                    if (Module["calledRun"]) {
                        runWithFS()
                    } else {
                        if (!Module["preRun"]) Module["preRun"] = [];
                        Module["preRun"].push(runWithFS)
                    }
                };
                loadPackage({
                    "files": [{
                        "filename": "/swipl/boot.prc",
                        "start": 0,
                        "end": 106078
                    }, {
                        "filename": "/swipl/library/predicate_options.pl",
                        "start": 106078,
                        "end": 137120
                    }, {
                        "filename": "/swipl/library/coinduction.pl",
                        "start": 137120,
                        "end": 143180
                    }, {
                        "filename": "/swipl/library/sort.pl",
                        "start": 143180,
                        "end": 147e3
                    }, {
                        "filename": "/swipl/library/readutil.pl",
                        "start": 147e3,
                        "end": 158089
                    }, {
                        "filename": "/swipl/library/portray_text.pl",
                        "start": 158089,
                        "end": 166831
                    }, {
                        "filename": "/swipl/library/prolog_source.pl",
                        "start": 166831,
                        "end": 203595
                    }, {
                        "filename": "/swipl/library/settings.pl",
                        "start": 203595,
                        "end": 227559
                    }, {
                        "filename": "/swipl/library/obfuscate.pl",
                        "start": 227559,
                        "end": 231681
                    }, {
                        "filename": "/swipl/library/prolog_breakpoints.pl",
                        "start": 231681,
                        "end": 246050
                    }, {
                        "filename": "/swipl/library/main.pl",
                        "start": 246050,
                        "end": 276614
                    }, {
                        "filename": "/swipl/library/fastrw.pl",
                        "start": 276614,
                        "end": 281003
                    }, {
                        "filename": "/swipl/library/varnumbers.pl",
                        "start": 281003,
                        "end": 288144
                    }, {
                        "filename": "/swipl/library/ctypes.pl",
                        "start": 288144,
                        "end": 293166
                    }, {
                        "filename": "/swipl/library/prolog_codewalk.pl",
                        "start": 293166,
                        "end": 332628
                    }, {
                        "filename": "/swipl/library/prolog_autoload.pl",
                        "start": 332628,
                        "end": 341177
                    }, {
                        "filename": "/swipl/library/quintus.pl",
                        "start": 341177,
                        "end": 354270
                    }, {
                        "filename": "/swipl/library/utf8.pl",
                        "start": 354270,
                        "end": 358875
                    }, {
                        "filename": "/swipl/library/check.pl",
                        "start": 358875,
                        "end": 392372
                    }, {
                        "filename": "/swipl/library/ordsets.pl",
                        "start": 392372,
                        "end": 408924
                    }, {
                        "filename": "/swipl/library/writef.pl",
                        "start": 408924,
                        "end": 418845
                    }, {
                        "filename": "/swipl/library/apply.pl",
                        "start": 418845,
                        "end": 432641
                    }, {
                        "filename": "/swipl/library/heaps.pl",
                        "start": 432641,
                        "end": 440918
                    }, {
                        "filename": "/swipl/library/ugraphs.pl",
                        "start": 440918,
                        "end": 461382
                    }, {
                        "filename": "/swipl/library/tty.pl",
                        "start": 461382,
                        "end": 470657
                    }, {
                        "filename": "/swipl/library/files.pl",
                        "start": 470657,
                        "end": 473414
                    }, {
                        "filename": "/swipl/library/optparse.pl",
                        "start": 473414,
                        "end": 511181
                    }, {
                        "filename": "/swipl/library/atom.pl",
                        "start": 511181,
                        "end": 516603
                    }, {
                        "filename": "/swipl/library/prolog_deps.pl",
                        "start": 516603,
                        "end": 533786
                    }, {
                        "filename": "/swipl/library/gensym.pl",
                        "start": 533786,
                        "end": 537800
                    }, {
                        "filename": "/swipl/library/prolog_install.pl",
                        "start": 537800,
                        "end": 543582
                    }, {
                        "filename": "/swipl/library/wasm.pl",
                        "start": 543582,
                        "end": 550591
                    }, {
                        "filename": "/swipl/library/yall.pl",
                        "start": 550591,
                        "end": 570101
                    }, {
                        "filename": "/swipl/library/qsave.pl",
                        "start": 570101,
                        "end": 612058
                    }, {
                        "filename": "/swipl/library/occurs.pl",
                        "start": 612058,
                        "end": 618889
                    }, {
                        "filename": "/swipl/library/aggregate.pl",
                        "start": 618889,
                        "end": 643274
                    }, {
                        "filename": "/swipl/library/hotfix.pl",
                        "start": 643274,
                        "end": 651156
                    }, {
                        "filename": "/swipl/library/git.pl",
                        "start": 651156,
                        "end": 679160
                    }, {
                        "filename": "/swipl/library/debug.pl",
                        "start": 679160,
                        "end": 692564
                    }, {
                        "filename": "/swipl/library/nb_set.pl",
                        "start": 692564,
                        "end": 698230
                    }, {
                        "filename": "/swipl/library/dicts.pl",
                        "start": 698230,
                        "end": 708886
                    }, {
                        "filename": "/swipl/library/zip.pl",
                        "start": 708886,
                        "end": 716527
                    }, {
                        "filename": "/swipl/library/prolog_clause.pl",
                        "start": 716527,
                        "end": 752499
                    }, {
                        "filename": "/swipl/library/persistency.pl",
                        "start": 752499,
                        "end": 774418
                    }, {
                        "filename": "/swipl/library/vm.pl",
                        "start": 774418,
                        "end": 782543
                    }, {
                        "filename": "/swipl/library/prolog_pack.pl",
                        "start": 782543,
                        "end": 859846
                    }, {
                        "filename": "/swipl/library/shlib.pl",
                        "start": 859846,
                        "end": 880415
                    }, {
                        "filename": "/swipl/library/prolog_code.pl",
                        "start": 880415,
                        "end": 892676
                    }, {
                        "filename": "/swipl/library/explain.pl",
                        "start": 892676,
                        "end": 906918
                    }, {
                        "filename": "/swipl/library/solution_sequences.pl",
                        "start": 906918,
                        "end": 919170
                    }, {
                        "filename": "/swipl/library/checkselect.pl",
                        "start": 919170,
                        "end": 922365
                    }, {
                        "filename": "/swipl/library/operators.pl",
                        "start": 922365,
                        "end": 927609
                    }, {
                        "filename": "/swipl/library/nb_rbtrees.pl",
                        "start": 927609,
                        "end": 935547
                    }, {
                        "filename": "/swipl/library/prolog_xref.qlf",
                        "start": 935547,
                        "end": 971666
                    }, {
                        "filename": "/swipl/library/pprint.pl",
                        "start": 971666,
                        "end": 999890
                    }, {
                        "filename": "/swipl/library/arithmetic.pl",
                        "start": 999890,
                        "end": 1008976
                    }, {
                        "filename": "/swipl/library/www_browser.pl",
                        "start": 1008976,
                        "end": 1017276
                    }, {
                        "filename": "/swipl/library/ansi_term.pl",
                        "start": 1017276,
                        "end": 1035969
                    }, {
                        "filename": "/swipl/library/edit.pl",
                        "start": 1035969,
                        "end": 1055082
                    }, {
                        "filename": "/swipl/library/iostream.pl",
                        "start": 1055082,
                        "end": 1063859
                    }, {
                        "filename": "/swipl/library/shell.pl",
                        "start": 1063859,
                        "end": 1074564
                    }, {
                        "filename": "/swipl/library/when.pl",
                        "start": 1074564,
                        "end": 1082321
                    }, {
                        "filename": "/swipl/library/pio.pl",
                        "start": 1082321,
                        "end": 1084248
                    }, {
                        "filename": "/swipl/library/quasi_quotations.pl",
                        "start": 1084248,
                        "end": 1095634
                    }, {
                        "filename": "/swipl/library/prolog_xref.pl",
                        "start": 1095634,
                        "end": 1187831
                    }, {
                        "filename": "/swipl/library/check_installation.pl",
                        "start": 1187831,
                        "end": 1213090
                    }, {
                        "filename": "/swipl/library/base64.pl",
                        "start": 1213090,
                        "end": 1225735
                    }, {
                        "filename": "/swipl/library/error.pl",
                        "start": 1225735,
                        "end": 1241611
                    }, {
                        "filename": "/swipl/library/date.pl",
                        "start": 1241611,
                        "end": 1251063
                    }, {
                        "filename": "/swipl/library/prolog_colour.qlf",
                        "start": 1251063,
                        "end": 1296218
                    }, {
                        "filename": "/swipl/library/prolog_config.pl",
                        "start": 1296218,
                        "end": 1301026
                    }, {
                        "filename": "/swipl/library/increval.pl",
                        "start": 1301026,
                        "end": 1308330
                    }, {
                        "filename": "/swipl/library/codesio.pl",
                        "start": 1308330,
                        "end": 1314779
                    }, {
                        "filename": "/swipl/library/rbtrees.pl",
                        "start": 1314779,
                        "end": 1352176
                    }, {
                        "filename": "/swipl/library/prolog_versions.pl",
                        "start": 1352176,
                        "end": 1359101
                    }, {
                        "filename": "/swipl/library/wfs.pl",
                        "start": 1359101,
                        "end": 1366022
                    }, {
                        "filename": "/swipl/library/listing.pl",
                        "start": 1366022,
                        "end": 1403819
                    }, {
                        "filename": "/swipl/library/broadcast.pl",
                        "start": 1403819,
                        "end": 1409174
                    }, {
                        "filename": "/swipl/library/random.pl",
                        "start": 1409174,
                        "end": 1422623
                    }, {
                        "filename": "/swipl/library/sandbox.pl",
                        "start": 1422623,
                        "end": 1465309
                    }, {
                        "filename": "/swipl/library/make.pl",
                        "start": 1465309,
                        "end": 1471929
                    }, {
                        "filename": "/swipl/library/oset.pl",
                        "start": 1471929,
                        "end": 1476622
                    }, {
                        "filename": "/swipl/library/modules.pl",
                        "start": 1476622,
                        "end": 1481471
                    }, {
                        "filename": "/swipl/library/intercept.pl",
                        "start": 1481471,
                        "end": 1490093
                    }, {
                        "filename": "/swipl/library/prolog_colour.pl",
                        "start": 1490093,
                        "end": 1592881
                    }, {
                        "filename": "/swipl/library/strings.pl",
                        "start": 1592881,
                        "end": 1608429
                    }, {
                        "filename": "/swipl/library/hashtable.pl",
                        "start": 1608429,
                        "end": 1618753
                    }, {
                        "filename": "/swipl/library/url.pl",
                        "start": 1618753,
                        "end": 1646906
                    }, {
                        "filename": "/swipl/library/record.pl",
                        "start": 1646906,
                        "end": 1663514
                    }, {
                        "filename": "/swipl/library/prolog_format.pl",
                        "start": 1663514,
                        "end": 1670377
                    }, {
                        "filename": "/swipl/library/qpforeign.pl",
                        "start": 1670377,
                        "end": 1692682
                    }, {
                        "filename": "/swipl/library/tabling.pl",
                        "start": 1692682,
                        "end": 1694482
                    }, {
                        "filename": "/swipl/library/prolog_debug.pl",
                        "start": 1694482,
                        "end": 1703435
                    }, {
                        "filename": "/swipl/library/dif.pl",
                        "start": 1703435,
                        "end": 1716077
                    }, {
                        "filename": "/swipl/library/threadutil.pl",
                        "start": 1716077,
                        "end": 1731380
                    }, {
                        "filename": "/swipl/library/assoc.pl",
                        "start": 1731380,
                        "end": 1749707
                    }, {
                        "filename": "/swipl/library/prolog_wrap.pl",
                        "start": 1749707,
                        "end": 1755111
                    }, {
                        "filename": "/swipl/library/prolog_trace.pl",
                        "start": 1755111,
                        "end": 1762770
                    }, {
                        "filename": "/swipl/library/charsio.pl",
                        "start": 1762770,
                        "end": 1769406
                    }, {
                        "filename": "/swipl/library/pure_input.pl",
                        "start": 1769406,
                        "end": 1779278
                    }, {
                        "filename": "/swipl/library/base32.pl",
                        "start": 1779278,
                        "end": 1787571
                    }, {
                        "filename": "/swipl/library/apply_macros.pl",
                        "start": 1787571,
                        "end": 1802454
                    }, {
                        "filename": "/swipl/library/prolog_jiti.pl",
                        "start": 1802454,
                        "end": 1807639
                    }, {
                        "filename": "/swipl/library/system.pl",
                        "start": 1807639,
                        "end": 1810947
                    }, {
                        "filename": "/swipl/library/thread.pl",
                        "start": 1810947,
                        "end": 1838477
                    }, {
                        "filename": "/swipl/library/csv.pl",
                        "start": 1838477,
                        "end": 1857394
                    }, {
                        "filename": "/swipl/library/prolog_metainference.pl",
                        "start": 1857394,
                        "end": 1867208
                    }, {
                        "filename": "/swipl/library/dialect.pl",
                        "start": 1867208,
                        "end": 1871301
                    }, {
                        "filename": "/swipl/library/backcomp.pl",
                        "start": 1871301,
                        "end": 1891198
                    }, {
                        "filename": "/swipl/library/terms.pl",
                        "start": 1891198,
                        "end": 1905891
                    }, {
                        "filename": "/swipl/library/edinburgh.pl",
                        "start": 1905891,
                        "end": 1910396
                    }, {
                        "filename": "/swipl/library/INDEX.pl",
                        "start": 1910396,
                        "end": 1955123
                    }, {
                        "filename": "/swipl/library/readln.pl",
                        "start": 1955123,
                        "end": 1964050
                    }, {
                        "filename": "/swipl/library/prolog_stack.pl",
                        "start": 1964050,
                        "end": 1989825
                    }, {
                        "filename": "/swipl/library/tables.pl",
                        "start": 1989825,
                        "end": 2002436
                    }, {
                        "filename": "/swipl/library/statistics.pl",
                        "start": 2002436,
                        "end": 2027006
                    }, {
                        "filename": "/swipl/library/pairs.pl",
                        "start": 2027006,
                        "end": 2032870
                    }, {
                        "filename": "/swipl/library/.created",
                        "start": 2032870,
                        "end": 2032870
                    }, {
                        "filename": "/swipl/library/prolog_history.pl",
                        "start": 2032870,
                        "end": 2038735
                    }, {
                        "filename": "/swipl/library/lazy_lists.pl",
                        "start": 2038735,
                        "end": 2055235
                    }, {
                        "filename": "/swipl/library/checklast.pl",
                        "start": 2055235,
                        "end": 2058491
                    }, {
                        "filename": "/swipl/library/lists.pl",
                        "start": 2058491,
                        "end": 2082769
                    }, {
                        "filename": "/swipl/library/console_input.pl",
                        "start": 2082769,
                        "end": 2086456
                    }, {
                        "filename": "/swipl/library/thread_pool.pl",
                        "start": 2086456,
                        "end": 2103337
                    }, {
                        "filename": "/swipl/library/option.pl",
                        "start": 2103337,
                        "end": 2115951
                    }, {
                        "filename": "/swipl/library/iri_scheme/file.pl",
                        "start": 2115951,
                        "end": 2118776
                    }, {
                        "filename": "/swipl/library/iri_scheme/.created",
                        "start": 2118776,
                        "end": 2118776
                    }, {
                        "filename": "/swipl/library/theme/auto.pl",
                        "start": 2118776,
                        "end": 2121001
                    }, {
                        "filename": "/swipl/library/theme/dark.pl",
                        "start": 2121001,
                        "end": 2132905
                    }, {
                        "filename": "/swipl/library/theme/.created",
                        "start": 2132905,
                        "end": 2132905
                    }, {
                        "filename": "/swipl/library/lynx/html_text.pl",
                        "start": 2132905,
                        "end": 2157643
                    }, {
                        "filename": "/swipl/library/lynx/format.pl",
                        "start": 2157643,
                        "end": 2168434
                    }, {
                        "filename": "/swipl/library/lynx/html_style.pl",
                        "start": 2168434,
                        "end": 2172915
                    }, {
                        "filename": "/swipl/library/lynx/pldoc_style.pl",
                        "start": 2172915,
                        "end": 2176160
                    }, {
                        "filename": "/swipl/library/lynx/INDEX.pl",
                        "start": 2176160,
                        "end": 2176684
                    }, {
                        "filename": "/swipl/library/lynx/.created",
                        "start": 2176684,
                        "end": 2176684
                    }, {
                        "filename": "/swipl/library/clp/clp_distinct.pl",
                        "start": 2176684,
                        "end": 2183282
                    }, {
                        "filename": "/swipl/library/clp/bounds.pl",
                        "start": 2183282,
                        "end": 2222591
                    }, {
                        "filename": "/swipl/library/clp/clpb.pl",
                        "start": 2222591,
                        "end": 2288643
                    }, {
                        "filename": "/swipl/library/clp/clp_events.pl",
                        "start": 2288643,
                        "end": 2291355
                    }, {
                        "filename": "/swipl/library/clp/INDEX.pl",
                        "start": 2291355,
                        "end": 2295305
                    }, {
                        "filename": "/swipl/library/clp/.created",
                        "start": 2295305,
                        "end": 2295305
                    }, {
                        "filename": "/swipl/library/clp/clpfd.pl",
                        "start": 2295305,
                        "end": 2572159
                    }, {
                        "filename": "/swipl/library/dcg/high_order.pl",
                        "start": 2572159,
                        "end": 2579635
                    }, {
                        "filename": "/swipl/library/dcg/basics.pl",
                        "start": 2579635,
                        "end": 2590516
                    }, {
                        "filename": "/swipl/library/dcg/INDEX.pl",
                        "start": 2590516,
                        "end": 2591830
                    }, {
                        "filename": "/swipl/library/dcg/.created",
                        "start": 2591830,
                        "end": 2591830
                    }, {
                        "filename": "/swipl/library/unicode/blocks.pl",
                        "start": 2591830,
                        "end": 2602071
                    }, {
                        "filename": "/swipl/library/unicode/INDEX.pl",
                        "start": 2602071,
                        "end": 2602245
                    }, {
                        "filename": "/swipl/library/unicode/.created",
                        "start": 2602245,
                        "end": 2602245
                    }, {
                        "filename": "/swipl/library/unicode/unicode_data.pl",
                        "start": 2602245,
                        "end": 2607739
                    }, {
                        "filename": "/swipl/library/build/conan.pl",
                        "start": 2607739,
                        "end": 2614734
                    }, {
                        "filename": "/swipl/library/build/tools.pl",
                        "start": 2614734,
                        "end": 2641008
                    }, {
                        "filename": "/swipl/library/build/cmake.pl",
                        "start": 2641008,
                        "end": 2645865
                    }, {
                        "filename": "/swipl/library/build/make.pl",
                        "start": 2645865,
                        "end": 2651867
                    }, {
                        "filename": "/swipl/library/build/.created",
                        "start": 2651867,
                        "end": 2651867
                    }, {
                        "filename": "/swipl/library/dialect/yap.pl",
                        "start": 2651867,
                        "end": 2659001
                    }, {
                        "filename": "/swipl/library/dialect/bim.pl",
                        "start": 2659001,
                        "end": 2663282
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4.pl",
                        "start": 2663282,
                        "end": 2670669
                    }, {
                        "filename": "/swipl/library/dialect/xsb.pl",
                        "start": 2670669,
                        "end": 2691912
                    }, {
                        "filename": "/swipl/library/dialect/hprolog.pl",
                        "start": 2691912,
                        "end": 2700304
                    }, {
                        "filename": "/swipl/library/dialect/ifprolog.pl",
                        "start": 2700304,
                        "end": 2736761
                    }, {
                        "filename": "/swipl/library/dialect/commons.pl",
                        "start": 2736761,
                        "end": 2739321
                    }, {
                        "filename": "/swipl/library/dialect/sicstus.pl",
                        "start": 2739321,
                        "end": 2756143
                    }, {
                        "filename": "/swipl/library/dialect/.created",
                        "start": 2756143,
                        "end": 2756143
                    }, {
                        "filename": "/swipl/library/dialect/swi/syspred_options.pl",
                        "start": 2756143,
                        "end": 2764010
                    }, {
                        "filename": "/swipl/library/dialect/swi/.created",
                        "start": 2764010,
                        "end": 2764010
                    }, {
                        "filename": "/swipl/library/dialect/xsb/source.pl",
                        "start": 2764010,
                        "end": 2773806
                    }, {
                        "filename": "/swipl/library/dialect/xsb/curr_sym.pl",
                        "start": 2773806,
                        "end": 2776069
                    }, {
                        "filename": "/swipl/library/dialect/xsb/storage.pl",
                        "start": 2776069,
                        "end": 2778639
                    }, {
                        "filename": "/swipl/library/dialect/xsb/consult.pl",
                        "start": 2778639,
                        "end": 2780481
                    }, {
                        "filename": "/swipl/library/dialect/xsb/ordsets.pl",
                        "start": 2780481,
                        "end": 2782703
                    }, {
                        "filename": "/swipl/library/dialect/xsb/README.md",
                        "start": 2782703,
                        "end": 2783354
                    }, {
                        "filename": "/swipl/library/dialect/xsb/gensym.pl",
                        "start": 2783354,
                        "end": 2785396
                    }, {
                        "filename": "/swipl/library/dialect/xsb/gpp.pl",
                        "start": 2785396,
                        "end": 2790460
                    }, {
                        "filename": "/swipl/library/dialect/xsb/machine.pl",
                        "start": 2790460,
                        "end": 2797502
                    }, {
                        "filename": "/swipl/library/dialect/xsb/timed_call.pl",
                        "start": 2797502,
                        "end": 2803241
                    }, {
                        "filename": "/swipl/library/dialect/xsb/string.pl",
                        "start": 2803241,
                        "end": 2805795
                    }, {
                        "filename": "/swipl/library/dialect/xsb/standard.pl",
                        "start": 2805795,
                        "end": 2810600
                    }, {
                        "filename": "/swipl/library/dialect/xsb/basics.pl",
                        "start": 2810600,
                        "end": 2817967
                    }, {
                        "filename": "/swipl/library/dialect/xsb/intern.pl",
                        "start": 2817967,
                        "end": 2819889
                    }, {
                        "filename": "/swipl/library/dialect/xsb/thread.pl",
                        "start": 2819889,
                        "end": 2822074
                    }, {
                        "filename": "/swipl/library/dialect/xsb/.created",
                        "start": 2822074,
                        "end": 2822074
                    }, {
                        "filename": "/swipl/library/dialect/xsb/error_handler.pl",
                        "start": 2822074,
                        "end": 2826271
                    }, {
                        "filename": "/swipl/library/dialect/xsb/lists.pl",
                        "start": 2826271,
                        "end": 2828169
                    }, {
                        "filename": "/swipl/library/dialect/xsb/setof.pl",
                        "start": 2828169,
                        "end": 2830708
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/ordsets.pl",
                        "start": 2830708,
                        "end": 2832730
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/timeout.pl",
                        "start": 2832730,
                        "end": 2834510
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/file_systems.pl",
                        "start": 2834510,
                        "end": 2851993
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/sets.pl",
                        "start": 2851993,
                        "end": 2855539
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/aggregate.pl",
                        "start": 2855539,
                        "end": 2857959
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/types.pl",
                        "start": 2857959,
                        "end": 2862252
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/between.pl",
                        "start": 2862252,
                        "end": 2864381
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/system.pl",
                        "start": 2864381,
                        "end": 2867294
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/samsort.pl",
                        "start": 2867294,
                        "end": 2870256
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/terms.pl",
                        "start": 2870256,
                        "end": 2873148
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/.created",
                        "start": 2873148,
                        "end": 2873148
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/lists.pl",
                        "start": 2873148,
                        "end": 2881140
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/clpfd.pl",
                        "start": 2881140,
                        "end": 2883680
                    }, {
                        "filename": "/swipl/library/dialect/sicstus4/sockets.pl",
                        "start": 2883680,
                        "end": 2889877
                    }, {
                        "filename": "/swipl/library/dialect/eclipse/test_util_iso.pl",
                        "start": 2889877,
                        "end": 2899729
                    }, {
                        "filename": "/swipl/library/dialect/eclipse/.created",
                        "start": 2899729,
                        "end": 2899729
                    }, {
                        "filename": "/swipl/library/dialect/yap/README.TXT",
                        "start": 2899729,
                        "end": 2900080
                    }, {
                        "filename": "/swipl/library/dialect/yap/.created",
                        "start": 2900080,
                        "end": 2900080
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/ordsets.pl",
                        "start": 2900080,
                        "end": 2902034
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/timeout.pl",
                        "start": 2902034,
                        "end": 2905785
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/README.TXT",
                        "start": 2905785,
                        "end": 2905816
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/swipl-lfr.pl",
                        "start": 2905816,
                        "end": 2909816
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/block.pl",
                        "start": 2909816,
                        "end": 2920259
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/arrays.pl",
                        "start": 2920259,
                        "end": 2923963
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/system.pl",
                        "start": 2923963,
                        "end": 2930538
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/terms.pl",
                        "start": 2930538,
                        "end": 2932777
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/.created",
                        "start": 2932777,
                        "end": 2932777
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/lists.pl",
                        "start": 2932777,
                        "end": 2937434
                    }, {
                        "filename": "/swipl/library/dialect/sicstus/sockets.pl",
                        "start": 2937434,
                        "end": 2943653
                    }, {
                        "filename": "/swipl/library/dialect/hprolog/format.pl",
                        "start": 2943653,
                        "end": 2945490
                    }, {
                        "filename": "/swipl/library/dialect/hprolog/.created",
                        "start": 2945490,
                        "end": 2945490
                    }, {
                        "filename": "/swipl/library/dialect/iso/iso_predicates.pl",
                        "start": 2945490,
                        "end": 2955180
                    }, {
                        "filename": "/swipl/library/dialect/iso/.created",
                        "start": 2955180,
                        "end": 2955180
                    }],
                    "remote_package_size": 2955180
                })
            })();
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = typeof window == "object";
            var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
            var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }
            var read_, readAsync, readBinary, setWindowTitle;

            function logExceptionOnExit(e) {
                if (e instanceof ExitStatus) return;
                let toLog = e;
                err("exiting due to exception: " + toLog)
            }
            var fs;
            var nodePath;
            var requireNodeFS;
            if (ENVIRONMENT_IS_NODE) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = require("path").dirname(scriptDirectory) + "/"
                } else {
                    scriptDirectory = __dirname + "/"
                }
                requireNodeFS = () => {
                    if (!nodePath) {
                        fs = require("fs");
                        nodePath = require("path")
                    }
                };
                read_ = function shell_read(filename, binary) {
                    requireNodeFS();
                    filename = nodePath["normalize"](filename);
                    return fs.readFileSync(filename, binary ? undefined : "utf8")
                };
                readBinary = filename => {
                    var ret = read_(filename, true);
                    if (!ret.buffer) {
                        ret = new Uint8Array(ret)
                    }
                    return ret
                };
                readAsync = (filename, onload, onerror) => {
                    requireNodeFS();
                    filename = nodePath["normalize"](filename);
                    fs.readFile(filename, function(err, data) {
                        if (err) onerror(err);
                        else onload(data.buffer)
                    })
                };
                if (process["argv"].length > 1) {
                    thisProgram = process["argv"][1].replace(/\\/g, "/")
                }
                arguments_ = process["argv"].slice(2);
                process["on"]("uncaughtException", function(ex) {
                    if (!(ex instanceof ExitStatus)) {
                        throw ex
                    }
                });
                process["on"]("unhandledRejection", function(reason) {
                    throw reason
                });
                quit_ = (status, toThrow) => {
                    if (keepRuntimeAlive()) {
                        process["exitCode"] = status;
                        throw toThrow
                    }
                    logExceptionOnExit(toThrow);
                    process["exit"](status)
                };
                Module["inspect"] = function() {
                    return "[Emscripten Module object]"
                }
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document != "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                } {
                    read_ = url => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = url => {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = (url, onload, onerror) => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = () => {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
                setWindowTitle = title => document.title = title
            } else {}
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.warn.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var tempRet0 = 0;
            var setTempRet0 = value => {
                tempRet0 = value
            };
            var getTempRet0 = () => tempRet0;
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime = Module["noExitRuntime"] || false;
            if (typeof WebAssembly != "object") {
                abort("no native wasm support detected")
            }
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;

            function assert(condition, text) {
                if (!condition) {
                    abort(text)
                }
            }
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
                }
                var str = "";
                while (idx < endPtr) {
                    var u0 = heapOrArray[idx++];
                    if (!(u0 & 128)) {
                        str += String.fromCharCode(u0);
                        continue
                    }
                    var u1 = heapOrArray[idx++] & 63;
                    if ((u0 & 224) == 192) {
                        str += String.fromCharCode((u0 & 31) << 6 | u1);
                        continue
                    }
                    var u2 = heapOrArray[idx++] & 63;
                    if ((u0 & 240) == 224) {
                        u0 = (u0 & 15) << 12 | u1 << 6 | u2
                    } else {
                        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                    }
                    if (u0 < 65536) {
                        str += String.fromCharCode(u0)
                    } else {
                        var ch = u0 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            }

            function stringToUTF8(str, outPtr, maxBytesToWrite) {
                return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
            }

            function lengthBytesUTF8(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var c = str.charCodeAt(i);
                    if (c <= 127) {
                        len++
                    } else if (c <= 2047) {
                        len += 2
                    } else if (c >= 55296 && c <= 57343) {
                        len += 4;
                        ++i
                    } else {
                        len += 3
                    }
                }
                return len
            }
            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferAndViews(buf) {
                buffer = buf;
                Module["HEAP8"] = HEAP8 = new Int8Array(buf);
                Module["HEAP16"] = HEAP16 = new Int16Array(buf);
                Module["HEAP32"] = HEAP32 = new Int32Array(buf);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
            }
            var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
            var wasmTable;
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATEXIT__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;
            var runtimeExited = false;
            var runtimeKeepaliveCounter = 0;

            function keepRuntimeAlive() {
                return noExitRuntime || runtimeKeepaliveCounter > 0
            }

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
                FS.ignorePermissions = false;
                TTY.init();
                callRuntimeCallbacks(__ATINIT__)
            }

            function exitRuntime() {
                ___funcs_on_exit();
                callRuntimeCallbacks(__ATEXIT__);
                FS.quit();
                TTY.shutdown();
                runtimeExited = true
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnInit(cb) {
                __ATINIT__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function getUniqueRunDependency(id) {
                return id
            }

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            function abort(what) {
                {
                    if (Module["onAbort"]) {
                        Module["onAbort"](what)
                    }
                }
                what = "Aborted(" + what + ")";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what += ". Build with -sASSERTIONS for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }
            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return filename.startsWith(dataURIPrefix)
            }

            function isFileURI(filename) {
                return filename.startsWith("file://")
            }
            var wasmBinaryFile;
            wasmBinaryFile = "swipl-web.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary(file) {
                try {
                    if (file == wasmBinaryFile && wasmBinary) {
                        return new Uint8Array(wasmBinary)
                    }
                    if (readBinary) {
                        return readBinary(file)
                    }
                    throw "both async and sync fetching of the wasm failed"
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                    if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
                        return fetch(wasmBinaryFile, {
                            credentials: "same-origin"
                        }).then(function(response) {
                            if (!response["ok"]) {
                                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                            }
                            return response["arrayBuffer"]()
                        }).catch(function() {
                            return getBinary(wasmBinaryFile)
                        })
                    } else {
                        if (readAsync) {
                            return new Promise(function(resolve, reject) {
                                readAsync(wasmBinaryFile, function(response) {
                                    resolve(new Uint8Array(response))
                                }, reject)
                            })
                        }
                    }
                }
                return Promise.resolve().then(function() {
                    return getBinary(wasmBinaryFile)
                })
            }

            function createWasm() {
                var info = {
                    "a": asmLibraryArg
                };

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    wasmMemory = Module["asm"]["na"];
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    wasmTable = Module["asm"]["Lb"];
                    addOnInit(Module["asm"]["oa"]);
                    removeRunDependency("wasm-instantiate")
                }
                addRunDependency("wasm-instantiate");

                function receiveInstantiationResult(result) {
                    receiveInstance(result["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function(binary) {
                        return WebAssembly.instantiate(binary, info)
                    }).then(function(instance) {
                        return instance
                    }).then(receiver, function(reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
                        return fetch(wasmBinaryFile, {
                            credentials: "same-origin"
                        }).then(function(response) {
                            var result = WebAssembly.instantiateStreaming(response, info);
                            return result.then(receiveInstantiationResult, function(reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                return instantiateArrayBuffer(receiveInstantiationResult)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiationResult)
                    }
                }
                if (Module["instantiateWasm"]) {
                    try {
                        var exports = Module["instantiateWasm"](info, receiveInstance);
                        return exports
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync().catch(readyPromiseReject);
                return {}
            }
            var tempDouble;
            var tempI64;
            var ASM_CONSTS = {
                170232: $0 => {
                    release_registered_object($0)
                },
                170267: ($0, $1) => {
                    return prolog_js_call($0, $1)
                }
            };

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    callbacks.shift()(Module)
                }
            }

            function getValue(ptr, type = "i8") {
                if (type.endsWith("*")) type = "*";
                switch (type) {
                    case "i1":
                        return HEAP8[ptr >> 0];
                    case "i8":
                        return HEAP8[ptr >> 0];
                    case "i16":
                        return HEAP16[ptr >> 1];
                    case "i32":
                        return HEAP32[ptr >> 2];
                    case "i64":
                        return HEAP32[ptr >> 2];
                    case "float":
                        return HEAPF32[ptr >> 2];
                    case "double":
                        return HEAPF64[ptr >> 3];
                    case "*":
                        return HEAPU32[ptr >> 2];
                    default:
                        abort("invalid type for getValue: " + type)
                }
                return null
            }

            function setValue(ptr, value, type = "i8") {
                if (type.endsWith("*")) type = "*";
                switch (type) {
                    case "i1":
                        HEAP8[ptr >> 0] = value;
                        break;
                    case "i8":
                        HEAP8[ptr >> 0] = value;
                        break;
                    case "i16":
                        HEAP16[ptr >> 1] = value;
                        break;
                    case "i32":
                        HEAP32[ptr >> 2] = value;
                        break;
                    case "i64":
                        tempI64 = [value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
                        break;
                    case "float":
                        HEAPF32[ptr >> 2] = value;
                        break;
                    case "double":
                        HEAPF64[ptr >> 3] = value;
                        break;
                    case "*":
                        HEAPU32[ptr >> 2] = value;
                        break;
                    default:
                        abort("invalid type for setValue: " + type)
                }
            }

            function writeArrayToMemory(array, buffer) {
                HEAP8.set(array, buffer)
            }
            var PATH = {
                isAbs: path => path.charAt(0) === "/",
                splitPath: filename => {
                    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                    return splitPathRe.exec(filename).slice(1)
                },
                normalizeArray: (parts, allowAboveRoot) => {
                    var up = 0;
                    for (var i = parts.length - 1; i >= 0; i--) {
                        var last = parts[i];
                        if (last === ".") {
                            parts.splice(i, 1)
                        } else if (last === "..") {
                            parts.splice(i, 1);
                            up++
                        } else if (up) {
                            parts.splice(i, 1);
                            up--
                        }
                    }
                    if (allowAboveRoot) {
                        for (; up; up--) {
                            parts.unshift("..")
                        }
                    }
                    return parts
                },
                normalize: path => {
                    var isAbsolute = PATH.isAbs(path),
                        trailingSlash = path.substr(-1) === "/";
                    path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
                    if (!path && !isAbsolute) {
                        path = "."
                    }
                    if (path && trailingSlash) {
                        path += "/"
                    }
                    return (isAbsolute ? "/" : "") + path
                },
                dirname: path => {
                    var result = PATH.splitPath(path),
                        root = result[0],
                        dir = result[1];
                    if (!root && !dir) {
                        return "."
                    }
                    if (dir) {
                        dir = dir.substr(0, dir.length - 1)
                    }
                    return root + dir
                },
                basename: path => {
                    if (path === "/") return "/";
                    path = PATH.normalize(path);
                    path = path.replace(/\/$/, "");
                    var lastSlash = path.lastIndexOf("/");
                    if (lastSlash === -1) return path;
                    return path.substr(lastSlash + 1)
                },
                join: function() {
                    var paths = Array.prototype.slice.call(arguments, 0);
                    return PATH.normalize(paths.join("/"))
                },
                join2: (l, r) => {
                    return PATH.normalize(l + "/" + r)
                }
            };

            function getRandomDevice() {
                if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
                    var randomBuffer = new Uint8Array(1);
                    return () => {
                        crypto.getRandomValues(randomBuffer);
                        return randomBuffer[0]
                    }
                } else if (ENVIRONMENT_IS_NODE) {
                    try {
                        var crypto_module = require("crypto");
                        return () => crypto_module["randomBytes"](1)[0]
                    } catch (e) {}
                }
                return () => abort("randomDevice")
            }
            var PATH_FS = {
                resolve: function() {
                    var resolvedPath = "",
                        resolvedAbsolute = false;
                    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                        var path = i >= 0 ? arguments[i] : FS.cwd();
                        if (typeof path != "string") {
                            throw new TypeError("Arguments to path.resolve must be strings")
                        } else if (!path) {
                            return ""
                        }
                        resolvedPath = path + "/" + resolvedPath;
                        resolvedAbsolute = PATH.isAbs(path)
                    }
                    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
                    return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
                },
                relative: (from, to) => {
                    from = PATH_FS.resolve(from).substr(1);
                    to = PATH_FS.resolve(to).substr(1);

                    function trim(arr) {
                        var start = 0;
                        for (; start < arr.length; start++) {
                            if (arr[start] !== "") break
                        }
                        var end = arr.length - 1;
                        for (; end >= 0; end--) {
                            if (arr[end] !== "") break
                        }
                        if (start > end) return [];
                        return arr.slice(start, end - start + 1)
                    }
                    var fromParts = trim(from.split("/"));
                    var toParts = trim(to.split("/"));
                    var length = Math.min(fromParts.length, toParts.length);
                    var samePartsLength = length;
                    for (var i = 0; i < length; i++) {
                        if (fromParts[i] !== toParts[i]) {
                            samePartsLength = i;
                            break
                        }
                    }
                    var outputParts = [];
                    for (var i = samePartsLength; i < fromParts.length; i++) {
                        outputParts.push("..")
                    }
                    outputParts = outputParts.concat(toParts.slice(samePartsLength));
                    return outputParts.join("/")
                }
            };

            function intArrayFromString(stringy, dontAddNull, length) {
                var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
                var u8array = new Array(len);
                var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
                if (dontAddNull) u8array.length = numBytesWritten;
                return u8array
            }
            var TTY = {
                ttys: [],
                init: function() {},
                shutdown: function() {},
                register: function(dev, ops) {
                    TTY.ttys[dev] = {
                        input: [],
                        output: [],
                        ops: ops
                    };
                    FS.registerDevice(dev, TTY.stream_ops)
                },
                stream_ops: {
                    open: function(stream) {
                        var tty = TTY.ttys[stream.node.rdev];
                        if (!tty) {
                            throw new FS.ErrnoError(43)
                        }
                        stream.tty = tty;
                        stream.seekable = false
                    },
                    close: function(stream) {
                        stream.tty.ops.flush(stream.tty)
                    },
                    flush: function(stream) {
                        stream.tty.ops.flush(stream.tty)
                    },
                    read: function(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.get_char) {
                            throw new FS.ErrnoError(60)
                        }
                        var bytesRead = 0;
                        for (var i = 0; i < length; i++) {
                            var result;
                            try {
                                result = stream.tty.ops.get_char(stream.tty)
                            } catch (e) {
                                throw new FS.ErrnoError(29)
                            }
                            if (result === undefined && bytesRead === 0) {
                                throw new FS.ErrnoError(6)
                            }
                            if (result === null || result === undefined) break;
                            bytesRead++;
                            buffer[offset + i] = result
                        }
                        if (bytesRead) {
                            stream.node.timestamp = Date.now()
                        }
                        return bytesRead
                    },
                    write: function(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.put_char) {
                            throw new FS.ErrnoError(60)
                        }
                        try {
                            for (var i = 0; i < length; i++) {
                                stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                            }
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                        if (length) {
                            stream.node.timestamp = Date.now()
                        }
                        return i
                    }
                },
                default_tty_ops: {
                    get_char: function(tty) {
                        if (!tty.input.length) {
                            var result = null;
                            if (ENVIRONMENT_IS_NODE) {
                                var BUFSIZE = 256;
                                var buf = Buffer.alloc(BUFSIZE);
                                var bytesRead = 0;
                                try {
                                    bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1)
                                } catch (e) {
                                    if (e.toString().includes("EOF")) bytesRead = 0;
                                    else throw e
                                }
                                if (bytesRead > 0) {
                                    result = buf.slice(0, bytesRead).toString("utf-8")
                                } else {
                                    result = null
                                }
                            } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                                result = window.prompt("Input: ");
                                if (result !== null) {
                                    result += "\n"
                                }
                            } else if (typeof readline == "function") {
                                result = readline();
                                if (result !== null) {
                                    result += "\n"
                                }
                            }
                            if (!result) {
                                return null
                            }
                            tty.input = intArrayFromString(result, true)
                        }
                        return tty.input.shift()
                    },
                    put_char: function(tty, val) {
                        if (val === null || val === 10) {
                            out(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    flush: function(tty) {
                        if (tty.output && tty.output.length > 0) {
                            out(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        }
                    }
                },
                default_tty1_ops: {
                    put_char: function(tty, val) {
                        if (val === null || val === 10) {
                            err(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    flush: function(tty) {
                        if (tty.output && tty.output.length > 0) {
                            err(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        }
                    }
                }
            };

            function zeroMemory(address, size) {
                HEAPU8.fill(0, address, address + size)
            }

            function alignMemory(size, alignment) {
                return Math.ceil(size / alignment) * alignment
            }

            function mmapAlloc(size) {
                size = alignMemory(size, 65536);
                var ptr = _emscripten_builtin_memalign(65536, size);
                if (!ptr) return 0;
                zeroMemory(ptr, size);
                return ptr
            }
            var MEMFS = {
                ops_table: null,
                mount: function(mount) {
                    return MEMFS.createNode(null, "/", 16384 | 511, 0)
                },
                createNode: function(parent, name, mode, dev) {
                    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                        throw new FS.ErrnoError(63)
                    }
                    if (!MEMFS.ops_table) {
                        MEMFS.ops_table = {
                            dir: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr,
                                    lookup: MEMFS.node_ops.lookup,
                                    mknod: MEMFS.node_ops.mknod,
                                    rename: MEMFS.node_ops.rename,
                                    unlink: MEMFS.node_ops.unlink,
                                    rmdir: MEMFS.node_ops.rmdir,
                                    readdir: MEMFS.node_ops.readdir,
                                    symlink: MEMFS.node_ops.symlink
                                },
                                stream: {
                                    llseek: MEMFS.stream_ops.llseek
                                }
                            },
                            file: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr
                                },
                                stream: {
                                    llseek: MEMFS.stream_ops.llseek,
                                    read: MEMFS.stream_ops.read,
                                    write: MEMFS.stream_ops.write,
                                    allocate: MEMFS.stream_ops.allocate,
                                    mmap: MEMFS.stream_ops.mmap,
                                    msync: MEMFS.stream_ops.msync
                                }
                            },
                            link: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr,
                                    readlink: MEMFS.node_ops.readlink
                                },
                                stream: {}
                            },
                            chrdev: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr
                                },
                                stream: FS.chrdev_stream_ops
                            }
                        }
                    }
                    var node = FS.createNode(parent, name, mode, dev);
                    if (FS.isDir(node.mode)) {
                        node.node_ops = MEMFS.ops_table.dir.node;
                        node.stream_ops = MEMFS.ops_table.dir.stream;
                        node.contents = {}
                    } else if (FS.isFile(node.mode)) {
                        node.node_ops = MEMFS.ops_table.file.node;
                        node.stream_ops = MEMFS.ops_table.file.stream;
                        node.usedBytes = 0;
                        node.contents = null
                    } else if (FS.isLink(node.mode)) {
                        node.node_ops = MEMFS.ops_table.link.node;
                        node.stream_ops = MEMFS.ops_table.link.stream
                    } else if (FS.isChrdev(node.mode)) {
                        node.node_ops = MEMFS.ops_table.chrdev.node;
                        node.stream_ops = MEMFS.ops_table.chrdev.stream
                    }
                    node.timestamp = Date.now();
                    if (parent) {
                        parent.contents[name] = node;
                        parent.timestamp = node.timestamp
                    }
                    return node
                },
                getFileDataAsTypedArray: function(node) {
                    if (!node.contents) return new Uint8Array(0);
                    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
                    return new Uint8Array(node.contents)
                },
                expandFileStorage: function(node, newCapacity) {
                    var prevCapacity = node.contents ? node.contents.length : 0;
                    if (prevCapacity >= newCapacity) return;
                    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                    newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
                    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                    var oldContents = node.contents;
                    node.contents = new Uint8Array(newCapacity);
                    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
                },
                resizeFileStorage: function(node, newSize) {
                    if (node.usedBytes == newSize) return;
                    if (newSize == 0) {
                        node.contents = null;
                        node.usedBytes = 0
                    } else {
                        var oldContents = node.contents;
                        node.contents = new Uint8Array(newSize);
                        if (oldContents) {
                            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                        }
                        node.usedBytes = newSize
                    }
                },
                node_ops: {
                    getattr: function(node) {
                        var attr = {};
                        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                        attr.ino = node.id;
                        attr.mode = node.mode;
                        attr.nlink = 1;
                        attr.uid = 0;
                        attr.gid = 0;
                        attr.rdev = node.rdev;
                        if (FS.isDir(node.mode)) {
                            attr.size = 4096
                        } else if (FS.isFile(node.mode)) {
                            attr.size = node.usedBytes
                        } else if (FS.isLink(node.mode)) {
                            attr.size = node.link.length
                        } else {
                            attr.size = 0
                        }
                        attr.atime = new Date(node.timestamp);
                        attr.mtime = new Date(node.timestamp);
                        attr.ctime = new Date(node.timestamp);
                        attr.blksize = 4096;
                        attr.blocks = Math.ceil(attr.size / attr.blksize);
                        return attr
                    },
                    setattr: function(node, attr) {
                        if (attr.mode !== undefined) {
                            node.mode = attr.mode
                        }
                        if (attr.timestamp !== undefined) {
                            node.timestamp = attr.timestamp
                        }
                        if (attr.size !== undefined) {
                            MEMFS.resizeFileStorage(node, attr.size)
                        }
                    },
                    lookup: function(parent, name) {
                        throw FS.genericErrors[44]
                    },
                    mknod: function(parent, name, mode, dev) {
                        return MEMFS.createNode(parent, name, mode, dev)
                    },
                    rename: function(old_node, new_dir, new_name) {
                        if (FS.isDir(old_node.mode)) {
                            var new_node;
                            try {
                                new_node = FS.lookupNode(new_dir, new_name)
                            } catch (e) {}
                            if (new_node) {
                                for (var i in new_node.contents) {
                                    throw new FS.ErrnoError(55)
                                }
                            }
                        }
                        delete old_node.parent.contents[old_node.name];
                        old_node.parent.timestamp = Date.now();
                        old_node.name = new_name;
                        new_dir.contents[new_name] = old_node;
                        new_dir.timestamp = old_node.parent.timestamp;
                        old_node.parent = new_dir
                    },
                    unlink: function(parent, name) {
                        delete parent.contents[name];
                        parent.timestamp = Date.now()
                    },
                    rmdir: function(parent, name) {
                        var node = FS.lookupNode(parent, name);
                        for (var i in node.contents) {
                            throw new FS.ErrnoError(55)
                        }
                        delete parent.contents[name];
                        parent.timestamp = Date.now()
                    },
                    readdir: function(node) {
                        var entries = [".", ".."];
                        for (var key in node.contents) {
                            if (!node.contents.hasOwnProperty(key)) {
                                continue
                            }
                            entries.push(key)
                        }
                        return entries
                    },
                    symlink: function(parent, newname, oldpath) {
                        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                        node.link = oldpath;
                        return node
                    },
                    readlink: function(node) {
                        if (!FS.isLink(node.mode)) {
                            throw new FS.ErrnoError(28)
                        }
                        return node.link
                    }
                },
                stream_ops: {
                    read: function(stream, buffer, offset, length, position) {
                        var contents = stream.node.contents;
                        if (position >= stream.node.usedBytes) return 0;
                        var size = Math.min(stream.node.usedBytes - position, length);
                        if (size > 8 && contents.subarray) {
                            buffer.set(contents.subarray(position, position + size), offset)
                        } else {
                            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
                        }
                        return size
                    },
                    write: function(stream, buffer, offset, length, position, canOwn) {
                        if (buffer.buffer === HEAP8.buffer) {
                            canOwn = false
                        }
                        if (!length) return 0;
                        var node = stream.node;
                        node.timestamp = Date.now();
                        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                            if (canOwn) {
                                node.contents = buffer.subarray(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (node.usedBytes === 0 && position === 0) {
                                node.contents = buffer.slice(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (position + length <= node.usedBytes) {
                                node.contents.set(buffer.subarray(offset, offset + length), position);
                                return length
                            }
                        }
                        MEMFS.expandFileStorage(node, position + length);
                        if (node.contents.subarray && buffer.subarray) {
                            node.contents.set(buffer.subarray(offset, offset + length), position)
                        } else {
                            for (var i = 0; i < length; i++) {
                                node.contents[position + i] = buffer[offset + i]
                            }
                        }
                        node.usedBytes = Math.max(node.usedBytes, position + length);
                        return length
                    },
                    llseek: function(stream, offset, whence) {
                        var position = offset;
                        if (whence === 1) {
                            position += stream.position
                        } else if (whence === 2) {
                            if (FS.isFile(stream.node.mode)) {
                                position += stream.node.usedBytes
                            }
                        }
                        if (position < 0) {
                            throw new FS.ErrnoError(28)
                        }
                        return position
                    },
                    allocate: function(stream, offset, length) {
                        MEMFS.expandFileStorage(stream.node, offset + length);
                        stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
                    },
                    mmap: function(stream, length, position, prot, flags) {
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        var ptr;
                        var allocated;
                        var contents = stream.node.contents;
                        if (!(flags & 2) && contents.buffer === buffer) {
                            allocated = false;
                            ptr = contents.byteOffset
                        } else {
                            if (position > 0 || position + length < contents.length) {
                                if (contents.subarray) {
                                    contents = contents.subarray(position, position + length)
                                } else {
                                    contents = Array.prototype.slice.call(contents, position, position + length)
                                }
                            }
                            allocated = true;
                            ptr = mmapAlloc(length);
                            if (!ptr) {
                                throw new FS.ErrnoError(48)
                            }
                            HEAP8.set(contents, ptr)
                        }
                        return {
                            ptr: ptr,
                            allocated: allocated
                        }
                    },
                    msync: function(stream, buffer, offset, length, mmapFlags) {
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        if (mmapFlags & 2) {
                            return 0
                        }
                        var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                        return 0
                    }
                }
            };

            function asyncLoad(url, onload, onerror, noRunDep) {
                var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
                readAsync(url, arrayBuffer => {
                    assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
                    onload(new Uint8Array(arrayBuffer));
                    if (dep) removeRunDependency(dep)
                }, event => {
                    if (onerror) {
                        onerror()
                    } else {
                        throw 'Loading data file "' + url + '" failed.'
                    }
                });
                if (dep) addRunDependency(dep)
            }
            var FS = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: false,
                ignorePermissions: true,
                ErrnoError: null,
                genericErrors: {},
                filesystems: null,
                syncFSRequests: 0,
                lookupPath: (path, opts = {}) => {
                    path = PATH_FS.resolve(FS.cwd(), path);
                    if (!path) return {
                        path: "",
                        node: null
                    };
                    var defaults = {
                        follow_mount: true,
                        recurse_count: 0
                    };
                    opts = Object.assign(defaults, opts);
                    if (opts.recurse_count > 8) {
                        throw new FS.ErrnoError(32)
                    }
                    var parts = PATH.normalizeArray(path.split("/").filter(p => !!p), false);
                    var current = FS.root;
                    var current_path = "/";
                    for (var i = 0; i < parts.length; i++) {
                        var islast = i === parts.length - 1;
                        if (islast && opts.parent) {
                            break
                        }
                        current = FS.lookupNode(current, parts[i]);
                        current_path = PATH.join2(current_path, parts[i]);
                        if (FS.isMountpoint(current)) {
                            if (!islast || islast && opts.follow_mount) {
                                current = current.mounted.root
                            }
                        }
                        if (!islast || opts.follow) {
                            var count = 0;
                            while (FS.isLink(current.mode)) {
                                var link = FS.readlink(current_path);
                                current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                                var lookup = FS.lookupPath(current_path, {
                                    recurse_count: opts.recurse_count + 1
                                });
                                current = lookup.node;
                                if (count++ > 40) {
                                    throw new FS.ErrnoError(32)
                                }
                            }
                        }
                    }
                    return {
                        path: current_path,
                        node: current
                    }
                },
                getPath: node => {
                    var path;
                    while (true) {
                        if (FS.isRoot(node)) {
                            var mount = node.mount.mountpoint;
                            if (!path) return mount;
                            return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
                        }
                        path = path ? node.name + "/" + path : node.name;
                        node = node.parent
                    }
                },
                hashName: (parentid, name) => {
                    var hash = 0;
                    for (var i = 0; i < name.length; i++) {
                        hash = (hash << 5) - hash + name.charCodeAt(i) | 0
                    }
                    return (parentid + hash >>> 0) % FS.nameTable.length
                },
                hashAddNode: node => {
                    var hash = FS.hashName(node.parent.id, node.name);
                    node.name_next = FS.nameTable[hash];
                    FS.nameTable[hash] = node
                },
                hashRemoveNode: node => {
                    var hash = FS.hashName(node.parent.id, node.name);
                    if (FS.nameTable[hash] === node) {
                        FS.nameTable[hash] = node.name_next
                    } else {
                        var current = FS.nameTable[hash];
                        while (current) {
                            if (current.name_next === node) {
                                current.name_next = node.name_next;
                                break
                            }
                            current = current.name_next
                        }
                    }
                },
                lookupNode: (parent, name) => {
                    var errCode = FS.mayLookup(parent);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode, parent)
                    }
                    var hash = FS.hashName(parent.id, name);
                    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                        var nodeName = node.name;
                        if (node.parent.id === parent.id && nodeName === name) {
                            return node
                        }
                    }
                    return FS.lookup(parent, name)
                },
                createNode: (parent, name, mode, rdev) => {
                    var node = new FS.FSNode(parent, name, mode, rdev);
                    FS.hashAddNode(node);
                    return node
                },
                destroyNode: node => {
                    FS.hashRemoveNode(node)
                },
                isRoot: node => {
                    return node === node.parent
                },
                isMountpoint: node => {
                    return !!node.mounted
                },
                isFile: mode => {
                    return (mode & 61440) === 32768
                },
                isDir: mode => {
                    return (mode & 61440) === 16384
                },
                isLink: mode => {
                    return (mode & 61440) === 40960
                },
                isChrdev: mode => {
                    return (mode & 61440) === 8192
                },
                isBlkdev: mode => {
                    return (mode & 61440) === 24576
                },
                isFIFO: mode => {
                    return (mode & 61440) === 4096
                },
                isSocket: mode => {
                    return (mode & 49152) === 49152
                },
                flagModes: {
                    "r": 0,
                    "r+": 2,
                    "w": 577,
                    "w+": 578,
                    "a": 1089,
                    "a+": 1090
                },
                modeStringToFlags: str => {
                    var flags = FS.flagModes[str];
                    if (typeof flags == "undefined") {
                        throw new Error("Unknown file open mode: " + str)
                    }
                    return flags
                },
                flagsToPermissionString: flag => {
                    var perms = ["r", "w", "rw"][flag & 3];
                    if (flag & 512) {
                        perms += "w"
                    }
                    return perms
                },
                nodePermissions: (node, perms) => {
                    if (FS.ignorePermissions) {
                        return 0
                    }
                    if (perms.includes("r") && !(node.mode & 292)) {
                        return 2
                    } else if (perms.includes("w") && !(node.mode & 146)) {
                        return 2
                    } else if (perms.includes("x") && !(node.mode & 73)) {
                        return 2
                    }
                    return 0
                },
                mayLookup: dir => {
                    var errCode = FS.nodePermissions(dir, "x");
                    if (errCode) return errCode;
                    if (!dir.node_ops.lookup) return 2;
                    return 0
                },
                mayCreate: (dir, name) => {
                    try {
                        var node = FS.lookupNode(dir, name);
                        return 20
                    } catch (e) {}
                    return FS.nodePermissions(dir, "wx")
                },
                mayDelete: (dir, name, isdir) => {
                    var node;
                    try {
                        node = FS.lookupNode(dir, name)
                    } catch (e) {
                        return e.errno
                    }
                    var errCode = FS.nodePermissions(dir, "wx");
                    if (errCode) {
                        return errCode
                    }
                    if (isdir) {
                        if (!FS.isDir(node.mode)) {
                            return 54
                        }
                        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                            return 10
                        }
                    } else {
                        if (FS.isDir(node.mode)) {
                            return 31
                        }
                    }
                    return 0
                },
                mayOpen: (node, flags) => {
                    if (!node) {
                        return 44
                    }
                    if (FS.isLink(node.mode)) {
                        return 32
                    } else if (FS.isDir(node.mode)) {
                        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                            return 31
                        }
                    }
                    return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
                },
                MAX_OPEN_FDS: 4096,
                nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
                    for (var fd = fd_start; fd <= fd_end; fd++) {
                        if (!FS.streams[fd]) {
                            return fd
                        }
                    }
                    throw new FS.ErrnoError(33)
                },
                getStream: fd => FS.streams[fd],
                createStream: (stream, fd_start, fd_end) => {
                    if (!FS.FSStream) {
                        FS.FSStream = function() {
                            this.shared = {}
                        };
                        FS.FSStream.prototype = {};
                        Object.defineProperties(FS.FSStream.prototype, {
                            object: {
                                get: function() {
                                    return this.node
                                },
                                set: function(val) {
                                    this.node = val
                                }
                            },
                            isRead: {
                                get: function() {
                                    return (this.flags & 2097155) !== 1
                                }
                            },
                            isWrite: {
                                get: function() {
                                    return (this.flags & 2097155) !== 0
                                }
                            },
                            isAppend: {
                                get: function() {
                                    return this.flags & 1024
                                }
                            },
                            flags: {
                                get: function() {
                                    return this.shared.flags
                                },
                                set: function(val) {
                                    this.shared.flags = val
                                }
                            },
                            position: {
                                get: function() {
                                    return this.shared.position
                                },
                                set: function(val) {
                                    this.shared.position = val
                                }
                            }
                        })
                    }
                    stream = Object.assign(new FS.FSStream, stream);
                    var fd = FS.nextfd(fd_start, fd_end);
                    stream.fd = fd;
                    FS.streams[fd] = stream;
                    return stream
                },
                closeStream: fd => {
                    FS.streams[fd] = null
                },
                chrdev_stream_ops: {
                    open: stream => {
                        var device = FS.getDevice(stream.node.rdev);
                        stream.stream_ops = device.stream_ops;
                        if (stream.stream_ops.open) {
                            stream.stream_ops.open(stream)
                        }
                    },
                    llseek: () => {
                        throw new FS.ErrnoError(70)
                    }
                },
                major: dev => dev >> 8,
                minor: dev => dev & 255,
                makedev: (ma, mi) => ma << 8 | mi,
                registerDevice: (dev, ops) => {
                    FS.devices[dev] = {
                        stream_ops: ops
                    }
                },
                getDevice: dev => FS.devices[dev],
                getMounts: mount => {
                    var mounts = [];
                    var check = [mount];
                    while (check.length) {
                        var m = check.pop();
                        mounts.push(m);
                        check.push.apply(check, m.mounts)
                    }
                    return mounts
                },
                syncfs: (populate, callback) => {
                    if (typeof populate == "function") {
                        callback = populate;
                        populate = false
                    }
                    FS.syncFSRequests++;
                    if (FS.syncFSRequests > 1) {
                        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
                    }
                    var mounts = FS.getMounts(FS.root.mount);
                    var completed = 0;

                    function doCallback(errCode) {
                        FS.syncFSRequests--;
                        return callback(errCode)
                    }

                    function done(errCode) {
                        if (errCode) {
                            if (!done.errored) {
                                done.errored = true;
                                return doCallback(errCode)
                            }
                            return
                        }
                        if (++completed >= mounts.length) {
                            doCallback(null)
                        }
                    }
                    mounts.forEach(mount => {
                        if (!mount.type.syncfs) {
                            return done(null)
                        }
                        mount.type.syncfs(mount, populate, done)
                    })
                },
                mount: (type, opts, mountpoint) => {
                    var root = mountpoint === "/";
                    var pseudo = !mountpoint;
                    var node;
                    if (root && FS.root) {
                        throw new FS.ErrnoError(10)
                    } else if (!root && !pseudo) {
                        var lookup = FS.lookupPath(mountpoint, {
                            follow_mount: false
                        });
                        mountpoint = lookup.path;
                        node = lookup.node;
                        if (FS.isMountpoint(node)) {
                            throw new FS.ErrnoError(10)
                        }
                        if (!FS.isDir(node.mode)) {
                            throw new FS.ErrnoError(54)
                        }
                    }
                    var mount = {
                        type: type,
                        opts: opts,
                        mountpoint: mountpoint,
                        mounts: []
                    };
                    var mountRoot = type.mount(mount);
                    mountRoot.mount = mount;
                    mount.root = mountRoot;
                    if (root) {
                        FS.root = mountRoot
                    } else if (node) {
                        node.mounted = mount;
                        if (node.mount) {
                            node.mount.mounts.push(mount)
                        }
                    }
                    return mountRoot
                },
                unmount: mountpoint => {
                    var lookup = FS.lookupPath(mountpoint, {
                        follow_mount: false
                    });
                    if (!FS.isMountpoint(lookup.node)) {
                        throw new FS.ErrnoError(28)
                    }
                    var node = lookup.node;
                    var mount = node.mounted;
                    var mounts = FS.getMounts(mount);
                    Object.keys(FS.nameTable).forEach(hash => {
                        var current = FS.nameTable[hash];
                        while (current) {
                            var next = current.name_next;
                            if (mounts.includes(current.mount)) {
                                FS.destroyNode(current)
                            }
                            current = next
                        }
                    });
                    node.mounted = null;
                    var idx = node.mount.mounts.indexOf(mount);
                    node.mount.mounts.splice(idx, 1)
                },
                lookup: (parent, name) => {
                    return parent.node_ops.lookup(parent, name)
                },
                mknod: (path, mode, dev) => {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    if (!name || name === "." || name === "..") {
                        throw new FS.ErrnoError(28)
                    }
                    var errCode = FS.mayCreate(parent, name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.mknod) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.mknod(parent, name, mode, dev)
                },
                create: (path, mode) => {
                    mode = mode !== undefined ? mode : 438;
                    mode &= 4095;
                    mode |= 32768;
                    return FS.mknod(path, mode, 0)
                },
                mkdir: (path, mode) => {
                    mode = mode !== undefined ? mode : 511;
                    mode &= 511 | 512;
                    mode |= 16384;
                    return FS.mknod(path, mode, 0)
                },
                mkdirTree: (path, mode) => {
                    var dirs = path.split("/");
                    var d = "";
                    for (var i = 0; i < dirs.length; ++i) {
                        if (!dirs[i]) continue;
                        d += "/" + dirs[i];
                        try {
                            FS.mkdir(d, mode)
                        } catch (e) {
                            if (e.errno != 20) throw e
                        }
                    }
                },
                mkdev: (path, mode, dev) => {
                    if (typeof dev == "undefined") {
                        dev = mode;
                        mode = 438
                    }
                    mode |= 8192;
                    return FS.mknod(path, mode, dev)
                },
                symlink: (oldpath, newpath) => {
                    if (!PATH_FS.resolve(oldpath)) {
                        throw new FS.ErrnoError(44)
                    }
                    var lookup = FS.lookupPath(newpath, {
                        parent: true
                    });
                    var parent = lookup.node;
                    if (!parent) {
                        throw new FS.ErrnoError(44)
                    }
                    var newname = PATH.basename(newpath);
                    var errCode = FS.mayCreate(parent, newname);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.symlink) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.symlink(parent, newname, oldpath)
                },
                rename: (old_path, new_path) => {
                    var old_dirname = PATH.dirname(old_path);
                    var new_dirname = PATH.dirname(new_path);
                    var old_name = PATH.basename(old_path);
                    var new_name = PATH.basename(new_path);
                    var lookup, old_dir, new_dir;
                    lookup = FS.lookupPath(old_path, {
                        parent: true
                    });
                    old_dir = lookup.node;
                    lookup = FS.lookupPath(new_path, {
                        parent: true
                    });
                    new_dir = lookup.node;
                    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                    if (old_dir.mount !== new_dir.mount) {
                        throw new FS.ErrnoError(75)
                    }
                    var old_node = FS.lookupNode(old_dir, old_name);
                    var relative = PATH_FS.relative(old_path, new_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(28)
                    }
                    relative = PATH_FS.relative(new_path, old_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(55)
                    }
                    var new_node;
                    try {
                        new_node = FS.lookupNode(new_dir, new_name)
                    } catch (e) {}
                    if (old_node === new_node) {
                        return
                    }
                    var isdir = FS.isDir(old_node.mode);
                    var errCode = FS.mayDelete(old_dir, old_name, isdir);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!old_dir.node_ops.rename) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                        throw new FS.ErrnoError(10)
                    }
                    if (new_dir !== old_dir) {
                        errCode = FS.nodePermissions(old_dir, "w");
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    FS.hashRemoveNode(old_node);
                    try {
                        old_dir.node_ops.rename(old_node, new_dir, new_name)
                    } catch (e) {
                        throw e
                    } finally {
                        FS.hashAddNode(old_node)
                    }
                },
                rmdir: path => {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, true);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.rmdir) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    parent.node_ops.rmdir(parent, name);
                    FS.destroyNode(node)
                },
                readdir: path => {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    if (!node.node_ops.readdir) {
                        throw new FS.ErrnoError(54)
                    }
                    return node.node_ops.readdir(node)
                },
                unlink: path => {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    if (!parent) {
                        throw new FS.ErrnoError(44)
                    }
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, false);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.unlink) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    parent.node_ops.unlink(parent, name);
                    FS.destroyNode(node)
                },
                readlink: path => {
                    var lookup = FS.lookupPath(path);
                    var link = lookup.node;
                    if (!link) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!link.node_ops.readlink) {
                        throw new FS.ErrnoError(28)
                    }
                    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
                },
                stat: (path, dontFollow) => {
                    var lookup = FS.lookupPath(path, {
                        follow: !dontFollow
                    });
                    var node = lookup.node;
                    if (!node) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!node.node_ops.getattr) {
                        throw new FS.ErrnoError(63)
                    }
                    return node.node_ops.getattr(node)
                },
                lstat: path => {
                    return FS.stat(path, true)
                },
                chmod: (path, mode, dontFollow) => {
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    node.node_ops.setattr(node, {
                        mode: mode & 4095 | node.mode & ~4095,
                        timestamp: Date.now()
                    })
                },
                lchmod: (path, mode) => {
                    FS.chmod(path, mode, true)
                },
                fchmod: (fd, mode) => {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    FS.chmod(stream.node, mode)
                },
                chown: (path, uid, gid, dontFollow) => {
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    node.node_ops.setattr(node, {
                        timestamp: Date.now()
                    })
                },
                lchown: (path, uid, gid) => {
                    FS.chown(path, uid, gid, true)
                },
                fchown: (fd, uid, gid) => {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    FS.chown(stream.node, uid, gid)
                },
                truncate: (path, len) => {
                    if (len < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    var node;
                    if (typeof path == "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: true
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!FS.isFile(node.mode)) {
                        throw new FS.ErrnoError(28)
                    }
                    var errCode = FS.nodePermissions(node, "w");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    node.node_ops.setattr(node, {
                        size: len,
                        timestamp: Date.now()
                    })
                },
                ftruncate: (fd, len) => {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(28)
                    }
                    FS.truncate(stream.node, len)
                },
                utime: (path, atime, mtime) => {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    node.node_ops.setattr(node, {
                        timestamp: Math.max(atime, mtime)
                    })
                },
                open: (path, flags, mode) => {
                    if (path === "") {
                        throw new FS.ErrnoError(44)
                    }
                    flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
                    mode = typeof mode == "undefined" ? 438 : mode;
                    if (flags & 64) {
                        mode = mode & 4095 | 32768
                    } else {
                        mode = 0
                    }
                    var node;
                    if (typeof path == "object") {
                        node = path
                    } else {
                        path = PATH.normalize(path);
                        try {
                            var lookup = FS.lookupPath(path, {
                                follow: !(flags & 131072)
                            });
                            node = lookup.node
                        } catch (e) {}
                    }
                    var created = false;
                    if (flags & 64) {
                        if (node) {
                            if (flags & 128) {
                                throw new FS.ErrnoError(20)
                            }
                        } else {
                            node = FS.mknod(path, mode, 0);
                            created = true
                        }
                    }
                    if (!node) {
                        throw new FS.ErrnoError(44)
                    }
                    if (FS.isChrdev(node.mode)) {
                        flags &= ~512
                    }
                    if (flags & 65536 && !FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    if (!created) {
                        var errCode = FS.mayOpen(node, flags);
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    if (flags & 512 && !created) {
                        FS.truncate(node, 0)
                    }
                    flags &= ~(128 | 512 | 131072);
                    var stream = FS.createStream({
                        node: node,
                        path: FS.getPath(node),
                        flags: flags,
                        seekable: true,
                        position: 0,
                        stream_ops: node.stream_ops,
                        ungotten: [],
                        error: false
                    });
                    if (stream.stream_ops.open) {
                        stream.stream_ops.open(stream)
                    }
                    if (Module["logReadFiles"] && !(flags & 1)) {
                        if (!FS.readFiles) FS.readFiles = {};
                        if (!(path in FS.readFiles)) {
                            FS.readFiles[path] = 1
                        }
                    }
                    return stream
                },
                close: stream => {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (stream.getdents) stream.getdents = null;
                    try {
                        if (stream.stream_ops.close) {
                            stream.stream_ops.close(stream)
                        }
                    } catch (e) {
                        throw e
                    } finally {
                        FS.closeStream(stream.fd)
                    }
                    stream.fd = null
                },
                isClosed: stream => {
                    return stream.fd === null
                },
                llseek: (stream, offset, whence) => {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (!stream.seekable || !stream.stream_ops.llseek) {
                        throw new FS.ErrnoError(70)
                    }
                    if (whence != 0 && whence != 1 && whence != 2) {
                        throw new FS.ErrnoError(28)
                    }
                    stream.position = stream.stream_ops.llseek(stream, offset, whence);
                    stream.ungotten = [];
                    return stream.position
                },
                read: (stream, buffer, offset, length, position) => {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.read) {
                        throw new FS.ErrnoError(28)
                    }
                    var seeking = typeof position != "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
                    if (!seeking) stream.position += bytesRead;
                    return bytesRead
                },
                write: (stream, buffer, offset, length, position, canOwn) => {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.write) {
                        throw new FS.ErrnoError(28)
                    }
                    if (stream.seekable && stream.flags & 1024) {
                        FS.llseek(stream, 0, 2)
                    }
                    var seeking = typeof position != "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
                    if (!seeking) stream.position += bytesWritten;
                    return bytesWritten
                },
                allocate: (stream, offset, length) => {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (offset < 0 || length <= 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(8)
                    }
                    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(43)
                    }
                    if (!stream.stream_ops.allocate) {
                        throw new FS.ErrnoError(138)
                    }
                    stream.stream_ops.allocate(stream, offset, length)
                },
                mmap: (stream, length, position, prot, flags) => {
                    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                        throw new FS.ErrnoError(2)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(2)
                    }
                    if (!stream.stream_ops.mmap) {
                        throw new FS.ErrnoError(43)
                    }
                    return stream.stream_ops.mmap(stream, length, position, prot, flags)
                },
                msync: (stream, buffer, offset, length, mmapFlags) => {
                    if (!stream || !stream.stream_ops.msync) {
                        return 0
                    }
                    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
                },
                munmap: stream => 0,
                ioctl: (stream, cmd, arg) => {
                    if (!stream.stream_ops.ioctl) {
                        throw new FS.ErrnoError(59)
                    }
                    return stream.stream_ops.ioctl(stream, cmd, arg)
                },
                readFile: (path, opts = {}) => {
                    opts.flags = opts.flags || 0;
                    opts.encoding = opts.encoding || "binary";
                    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                        throw new Error('Invalid encoding type "' + opts.encoding + '"')
                    }
                    var ret;
                    var stream = FS.open(path, opts.flags);
                    var stat = FS.stat(path);
                    var length = stat.size;
                    var buf = new Uint8Array(length);
                    FS.read(stream, buf, 0, length, 0);
                    if (opts.encoding === "utf8") {
                        ret = UTF8ArrayToString(buf, 0)
                    } else if (opts.encoding === "binary") {
                        ret = buf
                    }
                    FS.close(stream);
                    return ret
                },
                writeFile: (path, data, opts = {}) => {
                    opts.flags = opts.flags || 577;
                    var stream = FS.open(path, opts.flags, opts.mode);
                    if (typeof data == "string") {
                        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
                        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
                    } else if (ArrayBuffer.isView(data)) {
                        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
                    } else {
                        throw new Error("Unsupported data type")
                    }
                    FS.close(stream)
                },
                cwd: () => FS.currentPath,
                chdir: path => {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    if (lookup.node === null) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!FS.isDir(lookup.node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    var errCode = FS.nodePermissions(lookup.node, "x");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    FS.currentPath = lookup.path
                },
                createDefaultDirectories: () => {
                    FS.mkdir("/tmp");
                    FS.mkdir("/home");
                    FS.mkdir("/home/web_user")
                },
                createDefaultDevices: () => {
                    FS.mkdir("/dev");
                    FS.registerDevice(FS.makedev(1, 3), {
                        read: () => 0,
                        write: (stream, buffer, offset, length, pos) => length
                    });
                    FS.mkdev("/dev/null", FS.makedev(1, 3));
                    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                    FS.mkdev("/dev/tty", FS.makedev(5, 0));
                    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                    var random_device = getRandomDevice();
                    FS.createDevice("/dev", "random", random_device);
                    FS.createDevice("/dev", "urandom", random_device);
                    FS.mkdir("/dev/shm");
                    FS.mkdir("/dev/shm/tmp")
                },
                createSpecialDirectories: () => {
                    FS.mkdir("/proc");
                    var proc_self = FS.mkdir("/proc/self");
                    FS.mkdir("/proc/self/fd");
                    FS.mount({
                        mount: () => {
                            var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                            node.node_ops = {
                                lookup: (parent, name) => {
                                    var fd = +name;
                                    var stream = FS.getStream(fd);
                                    if (!stream) throw new FS.ErrnoError(8);
                                    var ret = {
                                        parent: null,
                                        mount: {
                                            mountpoint: "fake"
                                        },
                                        node_ops: {
                                            readlink: () => stream.path
                                        }
                                    };
                                    ret.parent = ret;
                                    return ret
                                }
                            };
                            return node
                        }
                    }, {}, "/proc/self/fd")
                },
                createStandardStreams: () => {
                    if (Module["stdin"]) {
                        FS.createDevice("/dev", "stdin", Module["stdin"])
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdin")
                    }
                    if (Module["stdout"]) {
                        FS.createDevice("/dev", "stdout", null, Module["stdout"])
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdout")
                    }
                    if (Module["stderr"]) {
                        FS.createDevice("/dev", "stderr", null, Module["stderr"])
                    } else {
                        FS.symlink("/dev/tty1", "/dev/stderr")
                    }
                    var stdin = FS.open("/dev/stdin", 0);
                    var stdout = FS.open("/dev/stdout", 1);
                    var stderr = FS.open("/dev/stderr", 1)
                },
                ensureErrnoError: () => {
                    if (FS.ErrnoError) return;
                    FS.ErrnoError = function ErrnoError(errno, node) {
                        this.node = node;
                        this.setErrno = function(errno) {
                            this.errno = errno
                        };
                        this.setErrno(errno);
                        this.message = "FS error"
                    };
                    FS.ErrnoError.prototype = new Error;
                    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
                    [44].forEach(code => {
                        FS.genericErrors[code] = new FS.ErrnoError(code);
                        FS.genericErrors[code].stack = "<generic error, no stack>"
                    })
                },
                staticInit: () => {
                    FS.ensureErrnoError();
                    FS.nameTable = new Array(4096);
                    FS.mount(MEMFS, {}, "/");
                    FS.createDefaultDirectories();
                    FS.createDefaultDevices();
                    FS.createSpecialDirectories();
                    FS.filesystems = {
                        "MEMFS": MEMFS
                    }
                },
                init: (input, output, error) => {
                    FS.init.initialized = true;
                    FS.ensureErrnoError();
                    Module["stdin"] = input || Module["stdin"];
                    Module["stdout"] = output || Module["stdout"];
                    Module["stderr"] = error || Module["stderr"];
                    FS.createStandardStreams()
                },
                quit: () => {
                    FS.init.initialized = false;
                    _fflush(0);
                    for (var i = 0; i < FS.streams.length; i++) {
                        var stream = FS.streams[i];
                        if (!stream) {
                            continue
                        }
                        FS.close(stream)
                    }
                },
                getMode: (canRead, canWrite) => {
                    var mode = 0;
                    if (canRead) mode |= 292 | 73;
                    if (canWrite) mode |= 146;
                    return mode
                },
                findObject: (path, dontResolveLastLink) => {
                    var ret = FS.analyzePath(path, dontResolveLastLink);
                    if (!ret.exists) {
                        return null
                    }
                    return ret.object
                },
                analyzePath: (path, dontResolveLastLink) => {
                    try {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        path = lookup.path
                    } catch (e) {}
                    var ret = {
                        isRoot: false,
                        exists: false,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: false,
                        parentPath: null,
                        parentObject: null
                    };
                    try {
                        var lookup = FS.lookupPath(path, {
                            parent: true
                        });
                        ret.parentExists = true;
                        ret.parentPath = lookup.path;
                        ret.parentObject = lookup.node;
                        ret.name = PATH.basename(path);
                        lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        ret.exists = true;
                        ret.path = lookup.path;
                        ret.object = lookup.node;
                        ret.name = lookup.node.name;
                        ret.isRoot = lookup.path === "/"
                    } catch (e) {
                        ret.error = e.errno
                    }
                    return ret
                },
                createPath: (parent, path, canRead, canWrite) => {
                    parent = typeof parent == "string" ? parent : FS.getPath(parent);
                    var parts = path.split("/").reverse();
                    while (parts.length) {
                        var part = parts.pop();
                        if (!part) continue;
                        var current = PATH.join2(parent, part);
                        try {
                            FS.mkdir(current)
                        } catch (e) {}
                        parent = current
                    }
                    return current
                },
                createFile: (parent, name, properties, canRead, canWrite) => {
                    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                    var mode = FS.getMode(canRead, canWrite);
                    return FS.create(path, mode)
                },
                createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
                    var path = name;
                    if (parent) {
                        parent = typeof parent == "string" ? parent : FS.getPath(parent);
                        path = name ? PATH.join2(parent, name) : parent
                    }
                    var mode = FS.getMode(canRead, canWrite);
                    var node = FS.create(path, mode);
                    if (data) {
                        if (typeof data == "string") {
                            var arr = new Array(data.length);
                            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                            data = arr
                        }
                        FS.chmod(node, mode | 146);
                        var stream = FS.open(node, 577);
                        FS.write(stream, data, 0, data.length, 0, canOwn);
                        FS.close(stream);
                        FS.chmod(node, mode)
                    }
                    return node
                },
                createDevice: (parent, name, input, output) => {
                    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                    var mode = FS.getMode(!!input, !!output);
                    if (!FS.createDevice.major) FS.createDevice.major = 64;
                    var dev = FS.makedev(FS.createDevice.major++, 0);
                    FS.registerDevice(dev, {
                        open: stream => {
                            stream.seekable = false
                        },
                        close: stream => {
                            if (output && output.buffer && output.buffer.length) {
                                output(10)
                            }
                        },
                        read: (stream, buffer, offset, length, pos) => {
                            var bytesRead = 0;
                            for (var i = 0; i < length; i++) {
                                var result;
                                try {
                                    result = input()
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                                if (result === undefined && bytesRead === 0) {
                                    throw new FS.ErrnoError(6)
                                }
                                if (result === null || result === undefined) break;
                                bytesRead++;
                                buffer[offset + i] = result
                            }
                            if (bytesRead) {
                                stream.node.timestamp = Date.now()
                            }
                            return bytesRead
                        },
                        write: (stream, buffer, offset, length, pos) => {
                            for (var i = 0; i < length; i++) {
                                try {
                                    output(buffer[offset + i])
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                            }
                            if (length) {
                                stream.node.timestamp = Date.now()
                            }
                            return i
                        }
                    });
                    return FS.mkdev(path, mode, dev)
                },
                forceLoadFile: obj => {
                    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
                    if (typeof XMLHttpRequest != "undefined") {
                        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
                    } else if (read_) {
                        try {
                            obj.contents = intArrayFromString(read_(obj.url), true);
                            obj.usedBytes = obj.contents.length
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                    } else {
                        throw new Error("Cannot load without read() or XMLHttpRequest.")
                    }
                },
                createLazyFile: (parent, name, url, canRead, canWrite) => {
                    function LazyUint8Array() {
                        this.lengthKnown = false;
                        this.chunks = []
                    }
                    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
                        if (idx > this.length - 1 || idx < 0) {
                            return undefined
                        }
                        var chunkOffset = idx % this.chunkSize;
                        var chunkNum = idx / this.chunkSize | 0;
                        return this.getter(chunkNum)[chunkOffset]
                    };
                    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
                        this.getter = getter
                    };
                    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
                        var xhr = new XMLHttpRequest;
                        xhr.open("HEAD", url, false);
                        xhr.send(null);
                        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                        var datalength = Number(xhr.getResponseHeader("Content-length"));
                        var header;
                        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                        var chunkSize = 1024 * 1024;
                        if (!hasByteServing) chunkSize = datalength;
                        var doXHR = (from, to) => {
                            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                            if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                            xhr.responseType = "arraybuffer";
                            if (xhr.overrideMimeType) {
                                xhr.overrideMimeType("text/plain; charset=x-user-defined")
                            }
                            xhr.send(null);
                            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                            if (xhr.response !== undefined) {
                                return new Uint8Array(xhr.response || [])
                            }
                            return intArrayFromString(xhr.responseText || "", true)
                        };
                        var lazyArray = this;
                        lazyArray.setDataGetter(chunkNum => {
                            var start = chunkNum * chunkSize;
                            var end = (chunkNum + 1) * chunkSize - 1;
                            end = Math.min(end, datalength - 1);
                            if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                                lazyArray.chunks[chunkNum] = doXHR(start, end)
                            }
                            if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
                            return lazyArray.chunks[chunkNum]
                        });
                        if (usesGzip || !datalength) {
                            chunkSize = datalength = 1;
                            datalength = this.getter(0).length;
                            chunkSize = datalength;
                            out("LazyFiles on gzip forces download of the whole file when length is accessed")
                        }
                        this._length = datalength;
                        this._chunkSize = chunkSize;
                        this.lengthKnown = true
                    };
                    if (typeof XMLHttpRequest != "undefined") {
                        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        var lazyArray = new LazyUint8Array;
                        Object.defineProperties(lazyArray, {
                            length: {
                                get: function() {
                                    if (!this.lengthKnown) {
                                        this.cacheLength()
                                    }
                                    return this._length
                                }
                            },
                            chunkSize: {
                                get: function() {
                                    if (!this.lengthKnown) {
                                        this.cacheLength()
                                    }
                                    return this._chunkSize
                                }
                            }
                        });
                        var properties = {
                            isDevice: false,
                            contents: lazyArray
                        }
                    } else {
                        var properties = {
                            isDevice: false,
                            url: url
                        }
                    }
                    var node = FS.createFile(parent, name, properties, canRead, canWrite);
                    if (properties.contents) {
                        node.contents = properties.contents
                    } else if (properties.url) {
                        node.contents = null;
                        node.url = properties.url
                    }
                    Object.defineProperties(node, {
                        usedBytes: {
                            get: function() {
                                return this.contents.length
                            }
                        }
                    });
                    var stream_ops = {};
                    var keys = Object.keys(node.stream_ops);
                    keys.forEach(key => {
                        var fn = node.stream_ops[key];
                        stream_ops[key] = function forceLoadLazyFile() {
                            FS.forceLoadFile(node);
                            return fn.apply(null, arguments)
                        }
                    });

                    function writeChunks(stream, buffer, offset, length, position) {
                        var contents = stream.node.contents;
                        if (position >= contents.length) return 0;
                        var size = Math.min(contents.length - position, length);
                        if (contents.slice) {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents[position + i]
                            }
                        } else {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents.get(position + i)
                            }
                        }
                        return size
                    }
                    stream_ops.read = (stream, buffer, offset, length, position) => {
                        FS.forceLoadFile(node);
                        return writeChunks(stream, buffer, offset, length, position)
                    };
                    stream_ops.mmap = (stream, length, position, prot, flags) => {
                        FS.forceLoadFile(node);
                        var ptr = mmapAlloc(length);
                        if (!ptr) {
                            throw new FS.ErrnoError(48)
                        }
                        writeChunks(stream, HEAP8, ptr, length, position);
                        return {
                            ptr: ptr,
                            allocated: true
                        }
                    };
                    node.stream_ops = stream_ops;
                    return node
                },
                createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
                    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
                    var dep = getUniqueRunDependency("cp " + fullname);

                    function processData(byteArray) {
                        function finish(byteArray) {
                            if (preFinish) preFinish();
                            if (!dontCreateFile) {
                                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                            }
                            if (onload) onload();
                            removeRunDependency(dep)
                        }
                        if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
                                if (onerror) onerror();
                                removeRunDependency(dep)
                            })) {
                            return
                        }
                        finish(byteArray)
                    }
                    addRunDependency(dep);
                    if (typeof url == "string") {
                        asyncLoad(url, byteArray => processData(byteArray), onerror)
                    } else {
                        processData(url)
                    }
                },
                indexedDB: () => {
                    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
                },
                DB_NAME: () => {
                    return "EM_FS_" + window.location.pathname
                },
                DB_VERSION: 20,
                DB_STORE_NAME: "FILE_DATA",
                saveFilesToDB: (paths, onload, onerror) => {
                    onload = onload || (() => {});
                    onerror = onerror || (() => {});
                    var indexedDB = FS.indexedDB();
                    try {
                        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
                    } catch (e) {
                        return onerror(e)
                    }
                    openRequest.onupgradeneeded = () => {
                        out("creating db");
                        var db = openRequest.result;
                        db.createObjectStore(FS.DB_STORE_NAME)
                    };
                    openRequest.onsuccess = () => {
                        var db = openRequest.result;
                        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
                        var files = transaction.objectStore(FS.DB_STORE_NAME);
                        var ok = 0,
                            fail = 0,
                            total = paths.length;

                        function finish() {
                            if (fail == 0) onload();
                            else onerror()
                        }
                        paths.forEach(path => {
                            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                            putRequest.onsuccess = () => {
                                ok++;
                                if (ok + fail == total) finish()
                            };
                            putRequest.onerror = () => {
                                fail++;
                                if (ok + fail == total) finish()
                            }
                        });
                        transaction.onerror = onerror
                    };
                    openRequest.onerror = onerror
                },
                loadFilesFromDB: (paths, onload, onerror) => {
                    onload = onload || (() => {});
                    onerror = onerror || (() => {});
                    var indexedDB = FS.indexedDB();
                    try {
                        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
                    } catch (e) {
                        return onerror(e)
                    }
                    openRequest.onupgradeneeded = onerror;
                    openRequest.onsuccess = () => {
                        var db = openRequest.result;
                        try {
                            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
                        } catch (e) {
                            onerror(e);
                            return
                        }
                        var files = transaction.objectStore(FS.DB_STORE_NAME);
                        var ok = 0,
                            fail = 0,
                            total = paths.length;

                        function finish() {
                            if (fail == 0) onload();
                            else onerror()
                        }
                        paths.forEach(path => {
                            var getRequest = files.get(path);
                            getRequest.onsuccess = () => {
                                if (FS.analyzePath(path).exists) {
                                    FS.unlink(path)
                                }
                                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                                ok++;
                                if (ok + fail == total) finish()
                            };
                            getRequest.onerror = () => {
                                fail++;
                                if (ok + fail == total) finish()
                            }
                        });
                        transaction.onerror = onerror
                    };
                    openRequest.onerror = onerror
                }
            };
            var SYSCALLS = {
                DEFAULT_POLLMASK: 5,
                calculateAt: function(dirfd, path, allowEmpty) {
                    if (PATH.isAbs(path)) {
                        return path
                    }
                    var dir;
                    if (dirfd === -100) {
                        dir = FS.cwd()
                    } else {
                        var dirstream = FS.getStream(dirfd);
                        if (!dirstream) throw new FS.ErrnoError(8);
                        dir = dirstream.path
                    }
                    if (path.length == 0) {
                        if (!allowEmpty) {
                            throw new FS.ErrnoError(44)
                        }
                        return dir
                    }
                    return PATH.join2(dir, path)
                },
                doStat: function(func, path, buf) {
                    try {
                        var stat = func(path)
                    } catch (e) {
                        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                            return -54
                        }
                        throw e
                    }
                    HEAP32[buf >> 2] = stat.dev;
                    HEAP32[buf + 8 >> 2] = stat.ino;
                    HEAP32[buf + 12 >> 2] = stat.mode;
                    HEAP32[buf + 16 >> 2] = stat.nlink;
                    HEAP32[buf + 20 >> 2] = stat.uid;
                    HEAP32[buf + 24 >> 2] = stat.gid;
                    HEAP32[buf + 28 >> 2] = stat.rdev;
                    tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
                    HEAP32[buf + 48 >> 2] = 4096;
                    HEAP32[buf + 52 >> 2] = stat.blocks;
                    tempI64 = [Math.floor(stat.atime.getTime() / 1e3) >>> 0, (tempDouble = Math.floor(stat.atime.getTime() / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
                    HEAP32[buf + 64 >> 2] = 0;
                    tempI64 = [Math.floor(stat.mtime.getTime() / 1e3) >>> 0, (tempDouble = Math.floor(stat.mtime.getTime() / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
                    HEAP32[buf + 80 >> 2] = 0;
                    tempI64 = [Math.floor(stat.ctime.getTime() / 1e3) >>> 0, (tempDouble = Math.floor(stat.ctime.getTime() / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
                    HEAP32[buf + 96 >> 2] = 0;
                    tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 104 >> 2] = tempI64[0], HEAP32[buf + 108 >> 2] = tempI64[1];
                    return 0
                },
                doMsync: function(addr, stream, len, flags, offset) {
                    var buffer = HEAPU8.slice(addr, addr + len);
                    FS.msync(stream, buffer, offset, len, flags)
                },
                varargs: undefined,
                get: function() {
                    SYSCALLS.varargs += 4;
                    var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
                    return ret
                },
                getStr: function(ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                },
                getStreamFromFD: function(fd) {
                    var stream = FS.getStream(fd);
                    if (!stream) throw new FS.ErrnoError(8);
                    return stream
                }
            };

            function ___syscall_chdir(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.chdir(path);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_chmod(path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.chmod(path, mode);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_dup3(fd, suggestFD, flags) {
                try {
                    var old = SYSCALLS.getStreamFromFD(fd);
                    if (old.fd === suggestFD) return -28;
                    var suggest = FS.getStream(suggestFD);
                    if (suggest) FS.close(suggest);
                    return FS.createStream(old, suggestFD, suggestFD + 1).fd
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_faccessat(dirfd, path, amode, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    if (amode & ~7) {
                        return -28
                    }
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    if (!node) {
                        return -44
                    }
                    var perms = "";
                    if (amode & 4) perms += "r";
                    if (amode & 2) perms += "w";
                    if (amode & 1) perms += "x";
                    if (perms && FS.nodePermissions(node, perms)) {
                        return -2
                    }
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function setErrNo(value) {
                HEAP32[___errno_location() >> 2] = value;
                return value
            }

            function ___syscall_fcntl64(fd, cmd, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    switch (cmd) {
                        case 0: {
                            var arg = SYSCALLS.get();
                            if (arg < 0) {
                                return -28
                            }
                            var newStream;
                            newStream = FS.createStream(stream, arg);
                            return newStream.fd
                        }
                        case 1:
                        case 2:
                            return 0;
                        case 3:
                            return stream.flags;
                        case 4: {
                            var arg = SYSCALLS.get();
                            stream.flags |= arg;
                            return 0
                        }
                        case 5: {
                            var arg = SYSCALLS.get();
                            var offset = 0;
                            HEAP16[arg + offset >> 1] = 2;
                            return 0
                        }
                        case 6:
                        case 7:
                            return 0;
                        case 16:
                        case 8:
                            return -28;
                        case 9:
                            setErrNo(28);
                            return -1;
                        default: {
                            return -28
                        }
                    }
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_fstat64(fd, buf) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    return SYSCALLS.doStat(FS.stat, stream.path, buf)
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function convertI32PairToI53Checked(lo, hi) {
                return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN
            }

            function ___syscall_ftruncate64(fd, length_low, length_high) {
                try {
                    var length = convertI32PairToI53Checked(length_low, length_high);
                    if (isNaN(length)) return -61;
                    FS.ftruncate(fd, length);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_getcwd(buf, size) {
                try {
                    if (size === 0) return -28;
                    var cwd = FS.cwd();
                    var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
                    if (size < cwdLengthInBytes) return -68;
                    stringToUTF8(cwd, buf, size);
                    return cwdLengthInBytes
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_getdents64(fd, dirp, count) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    if (!stream.getdents) {
                        stream.getdents = FS.readdir(stream.path)
                    }
                    var struct_size = 280;
                    var pos = 0;
                    var off = FS.llseek(stream, 0, 1);
                    var idx = Math.floor(off / struct_size);
                    while (idx < stream.getdents.length && pos + struct_size <= count) {
                        var id;
                        var type;
                        var name = stream.getdents[idx];
                        if (name === ".") {
                            id = stream.node.id;
                            type = 4
                        } else if (name === "..") {
                            var lookup = FS.lookupPath(stream.path, {
                                parent: true
                            });
                            id = lookup.node.id;
                            type = 4
                        } else {
                            var child = FS.lookupNode(stream.node, name);
                            id = child.id;
                            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
                        }
                        tempI64 = [id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
                        tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
                        HEAP16[dirp + pos + 16 >> 1] = 280;
                        HEAP8[dirp + pos + 18 >> 0] = type;
                        stringToUTF8(name, dirp + pos + 19, 256);
                        pos += struct_size;
                        idx += 1
                    }
                    FS.llseek(stream, idx * struct_size, 0);
                    return pos
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_ioctl(fd, op, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    switch (op) {
                        case 21509:
                        case 21505: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21510:
                        case 21511:
                        case 21512:
                        case 21506:
                        case 21507:
                        case 21508: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21519: {
                            if (!stream.tty) return -59;
                            var argp = SYSCALLS.get();
                            HEAP32[argp >> 2] = 0;
                            return 0
                        }
                        case 21520: {
                            if (!stream.tty) return -59;
                            return -28
                        }
                        case 21531: {
                            var argp = SYSCALLS.get();
                            return FS.ioctl(stream, op, argp)
                        }
                        case 21523: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21524: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        default:
                            return -28
                    }
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_lstat64(path, buf) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doStat(FS.lstat, path, buf)
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_mkdirat(dirfd, path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    path = PATH.normalize(path);
                    if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
                    FS.mkdir(path, mode, 0);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_newfstatat(dirfd, path, buf, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    var nofollow = flags & 256;
                    var allowEmpty = flags & 4096;
                    flags = flags & ~4352;
                    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
                    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf)
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_openat(dirfd, path, flags, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    var mode = varargs ? SYSCALLS.get() : 0;
                    return FS.open(path, flags, mode).fd
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_poll(fds, nfds, timeout) {
                try {
                    var nonzero = 0;
                    for (var i = 0; i < nfds; i++) {
                        var pollfd = fds + 8 * i;
                        var fd = HEAP32[pollfd >> 2];
                        var events = HEAP16[pollfd + 4 >> 1];
                        var mask = 32;
                        var stream = FS.getStream(fd);
                        if (stream) {
                            mask = SYSCALLS.DEFAULT_POLLMASK;
                            if (stream.stream_ops.poll) {
                                mask = stream.stream_ops.poll(stream)
                            }
                        }
                        mask &= events | 8 | 16;
                        if (mask) nonzero++;
                        HEAP16[pollfd + 6 >> 1] = mask
                    }
                    return nonzero
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    if (bufsize <= 0) return -28;
                    var ret = FS.readlink(path);
                    var len = Math.min(bufsize, lengthBytesUTF8(ret));
                    var endChar = HEAP8[buf + len];
                    stringToUTF8(ret, buf, bufsize + 1);
                    HEAP8[buf + len] = endChar;
                    return len
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
                try {
                    oldpath = SYSCALLS.getStr(oldpath);
                    newpath = SYSCALLS.getStr(newpath);
                    oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
                    newpath = SYSCALLS.calculateAt(newdirfd, newpath);
                    FS.rename(oldpath, newpath);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_rmdir(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.rmdir(path);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_stat64(path, buf) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doStat(FS.stat, path, buf)
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function ___syscall_unlinkat(dirfd, path, flags) {
                try {
                    path = SYSCALLS.getStr(path);
                    path = SYSCALLS.calculateAt(dirfd, path);
                    if (flags === 0) {
                        FS.unlink(path)
                    } else if (flags === 512) {
                        FS.rmdir(path)
                    } else {
                        abort("Invalid flags passed to unlinkat")
                    }
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function __dlinit(main_dso_handle) {}
            var dlopenMissingError = "To use dlopen, you need enable dynamic linking, see https://github.com/emscripten-core/emscripten/wiki/Linking";

            function __dlopen_js(filename, flag) {
                abort(dlopenMissingError)
            }

            function __dlsym_js(handle, symbol) {
                abort(dlopenMissingError)
            }

            function __emscripten_date_now() {
                return Date.now()
            }
            var nowIsMonotonic = true;

            function __emscripten_get_now_is_monotonic() {
                return nowIsMonotonic
            }

            function __emscripten_throw_longjmp() {
                throw Infinity
            }

            function readI53FromI64(ptr) {
                return HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296
            }

            function __localtime_js(time, tmPtr) {
                var date = new Date(readI53FromI64(time) * 1e3);
                HEAP32[tmPtr >> 2] = date.getSeconds();
                HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                HEAP32[tmPtr + 8 >> 2] = date.getHours();
                HEAP32[tmPtr + 12 >> 2] = date.getDate();
                HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
                HEAP32[tmPtr + 24 >> 2] = date.getDay();
                var start = new Date(date.getFullYear(), 0, 1);
                var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday;
                HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
                var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                var winterOffset = start.getTimezoneOffset();
                var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
                HEAP32[tmPtr + 32 >> 2] = dst
            }

            function __mktime_js(tmPtr) {
                var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
                var dst = HEAP32[tmPtr + 32 >> 2];
                var guessedOffset = date.getTimezoneOffset();
                var start = new Date(date.getFullYear(), 0, 1);
                var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                var winterOffset = start.getTimezoneOffset();
                var dstOffset = Math.min(winterOffset, summerOffset);
                if (dst < 0) {
                    HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
                } else if (dst > 0 != (dstOffset == guessedOffset)) {
                    var nonDstOffset = Math.max(winterOffset, summerOffset);
                    var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
                    date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
                }
                HEAP32[tmPtr + 24 >> 2] = date.getDay();
                var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday;
                HEAP32[tmPtr >> 2] = date.getSeconds();
                HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                HEAP32[tmPtr + 8 >> 2] = date.getHours();
                HEAP32[tmPtr + 12 >> 2] = date.getDate();
                HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                return date.getTime() / 1e3 | 0
            }

            function __munmap_js(addr, len, prot, flags, fd, offset) {
                try {
                    var stream = FS.getStream(fd);
                    if (stream) {
                        if (prot & 2) {
                            SYSCALLS.doMsync(addr, stream, len, flags, offset)
                        }
                        FS.munmap(stream)
                    }
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return -e.errno
                }
            }

            function allocateUTF8(str) {
                var size = lengthBytesUTF8(str) + 1;
                var ret = _malloc(size);
                if (ret) stringToUTF8Array(str, HEAP8, ret, size);
                return ret
            }

            function _tzset_impl(timezone, daylight, tzname) {
                var currentYear = (new Date).getFullYear();
                var winter = new Date(currentYear, 0, 1);
                var summer = new Date(currentYear, 6, 1);
                var winterOffset = winter.getTimezoneOffset();
                var summerOffset = summer.getTimezoneOffset();
                var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
                HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
                HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

                function extractZone(date) {
                    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                    return match ? match[1] : "GMT"
                }
                var winterName = extractZone(winter);
                var summerName = extractZone(summer);
                var winterNamePtr = allocateUTF8(winterName);
                var summerNamePtr = allocateUTF8(summerName);
                if (summerOffset < winterOffset) {
                    HEAPU32[tzname >> 2] = winterNamePtr;
                    HEAPU32[tzname + 4 >> 2] = summerNamePtr
                } else {
                    HEAPU32[tzname >> 2] = summerNamePtr;
                    HEAPU32[tzname + 4 >> 2] = winterNamePtr
                }
            }

            function __tzset_js(timezone, daylight, tzname) {
                if (__tzset_js.called) return;
                __tzset_js.called = true;
                _tzset_impl(timezone, daylight, tzname)
            }

            function _abort() {
                abort("")
            }
            var readAsmConstArgsArray = [];

            function readAsmConstArgs(sigPtr, buf) {
                readAsmConstArgsArray.length = 0;
                var ch;
                buf >>= 2;
                while (ch = HEAPU8[sigPtr++]) {
                    buf += ch != 105 & buf;
                    readAsmConstArgsArray.push(ch == 105 ? HEAP32[buf] : HEAPF64[buf++ >> 1]);
                    ++buf
                }
                return readAsmConstArgsArray
            }

            function _emscripten_asm_const_int(code, sigPtr, argbuf) {
                var args = readAsmConstArgs(sigPtr, argbuf);
                return ASM_CONSTS[code].apply(null, args)
            }

            function getHeapMax() {
                return 2147483648
            }

            function _emscripten_get_heap_max() {
                return getHeapMax()
            }
            var _emscripten_get_now;
            if (ENVIRONMENT_IS_NODE) {
                _emscripten_get_now = () => {
                    var t = process["hrtime"]();
                    return t[0] * 1e3 + t[1] / 1e6
                }
            } else _emscripten_get_now = () => performance.now();

            function _emscripten_memcpy_big(dest, src, num) {
                HEAPU8.copyWithin(dest, src, src + num)
            }

            function emscripten_realloc_buffer(size) {
                try {
                    wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    return 1
                } catch (e) {}
            }

            function _emscripten_resize_heap(requestedSize) {
                var oldSize = HEAPU8.length;
                requestedSize = requestedSize >>> 0;
                var maxHeapSize = getHeapMax();
                if (requestedSize > maxHeapSize) {
                    return false
                }
                let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = emscripten_realloc_buffer(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            }

            function _emscripten_run_script(ptr) {
                eval(UTF8ToString(ptr))
            }
            var ENV = {};

            function getExecutableName() {
                return thisProgram || "./this.program"
            }

            function getEnvStrings() {
                if (!getEnvStrings.strings) {
                    var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
                    var env = {
                        "USER": "web_user",
                        "LOGNAME": "web_user",
                        "PATH": "/",
                        "PWD": "/",
                        "HOME": "/home/web_user",
                        "LANG": lang,
                        "_": getExecutableName()
                    };
                    for (var x in ENV) {
                        if (ENV[x] === undefined) delete env[x];
                        else env[x] = ENV[x]
                    }
                    var strings = [];
                    for (var x in env) {
                        strings.push(x + "=" + env[x])
                    }
                    getEnvStrings.strings = strings
                }
                return getEnvStrings.strings
            }

            function writeAsciiToMemory(str, buffer, dontAddNull) {
                for (var i = 0; i < str.length; ++i) {
                    HEAP8[buffer++ >> 0] = str.charCodeAt(i)
                }
                if (!dontAddNull) HEAP8[buffer >> 0] = 0
            }

            function _environ_get(__environ, environ_buf) {
                var bufSize = 0;
                getEnvStrings().forEach(function(string, i) {
                    var ptr = environ_buf + bufSize;
                    HEAPU32[__environ + i * 4 >> 2] = ptr;
                    writeAsciiToMemory(string, ptr);
                    bufSize += string.length + 1
                });
                return 0
            }

            function _environ_sizes_get(penviron_count, penviron_buf_size) {
                var strings = getEnvStrings();
                HEAPU32[penviron_count >> 2] = strings.length;
                var bufSize = 0;
                strings.forEach(function(string) {
                    bufSize += string.length + 1
                });
                HEAPU32[penviron_buf_size >> 2] = bufSize;
                return 0
            }

            function _proc_exit(code) {
                EXITSTATUS = code;
                if (!keepRuntimeAlive()) {
                    if (Module["onExit"]) Module["onExit"](code);
                    ABORT = true
                }
                quit_(code, new ExitStatus(code))
            }

            function exitJS(status, implicit) {
                EXITSTATUS = status;
                if (!keepRuntimeAlive()) {
                    exitRuntime()
                }
                _proc_exit(status)
            }
            var _exit = exitJS;

            function _fd_close(fd) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    FS.close(stream);
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return e.errno
                }
            }

            function _fd_fdstat_get(fd, pbuf) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
                    HEAP8[pbuf >> 0] = type;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return e.errno
                }
            }

            function doReadv(stream, iov, iovcnt, offset) {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    var curr = FS.read(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr;
                    if (curr < len) break
                }
                return ret
            }

            function _fd_read(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = doReadv(stream, iov, iovcnt);
                    HEAP32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return e.errno
                }
            }

            function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
                try {
                    var offset = convertI32PairToI53Checked(offset_low, offset_high);
                    if (isNaN(offset)) return 61;
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    FS.llseek(stream, offset, whence);
                    tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
                    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return e.errno
                }
            }

            function doWritev(stream, iov, iovcnt, offset) {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    var curr = FS.write(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr
                }
                return ret
            }

            function _fd_write(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = doWritev(stream, iov, iovcnt);
                    HEAPU32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
                    return e.errno
                }
            }

            function _getTempRet0() {
                return getTempRet0()
            }

            function _setTempRet0(val) {
                setTempRet0(val)
            }

            function __isLeapYear(year) {
                return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
            }

            function __arraySum(array, index) {
                var sum = 0;
                for (var i = 0; i <= index; sum += array[i++]) {}
                return sum
            }
            var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            function __addDays(date, days) {
                var newDate = new Date(date.getTime());
                while (days > 0) {
                    var leap = __isLeapYear(newDate.getFullYear());
                    var currentMonth = newDate.getMonth();
                    var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
                    if (days > daysInCurrentMonth - newDate.getDate()) {
                        days -= daysInCurrentMonth - newDate.getDate() + 1;
                        newDate.setDate(1);
                        if (currentMonth < 11) {
                            newDate.setMonth(currentMonth + 1)
                        } else {
                            newDate.setMonth(0);
                            newDate.setFullYear(newDate.getFullYear() + 1)
                        }
                    } else {
                        newDate.setDate(newDate.getDate() + days);
                        return newDate
                    }
                }
                return newDate
            }

            function _strftime(s, maxsize, format, tm) {
                var tm_zone = HEAP32[tm + 40 >> 2];
                var date = {
                    tm_sec: HEAP32[tm >> 2],
                    tm_min: HEAP32[tm + 4 >> 2],
                    tm_hour: HEAP32[tm + 8 >> 2],
                    tm_mday: HEAP32[tm + 12 >> 2],
                    tm_mon: HEAP32[tm + 16 >> 2],
                    tm_year: HEAP32[tm + 20 >> 2],
                    tm_wday: HEAP32[tm + 24 >> 2],
                    tm_yday: HEAP32[tm + 28 >> 2],
                    tm_isdst: HEAP32[tm + 32 >> 2],
                    tm_gmtoff: HEAP32[tm + 36 >> 2],
                    tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
                };
                var pattern = UTF8ToString(format);
                var EXPANSION_RULES_1 = {
                    "%c": "%a %b %d %H:%M:%S %Y",
                    "%D": "%m/%d/%y",
                    "%F": "%Y-%m-%d",
                    "%h": "%b",
                    "%r": "%I:%M:%S %p",
                    "%R": "%H:%M",
                    "%T": "%H:%M:%S",
                    "%x": "%m/%d/%y",
                    "%X": "%H:%M:%S",
                    "%Ec": "%c",
                    "%EC": "%C",
                    "%Ex": "%m/%d/%y",
                    "%EX": "%H:%M:%S",
                    "%Ey": "%y",
                    "%EY": "%Y",
                    "%Od": "%d",
                    "%Oe": "%e",
                    "%OH": "%H",
                    "%OI": "%I",
                    "%Om": "%m",
                    "%OM": "%M",
                    "%OS": "%S",
                    "%Ou": "%u",
                    "%OU": "%U",
                    "%OV": "%V",
                    "%Ow": "%w",
                    "%OW": "%W",
                    "%Oy": "%y"
                };
                for (var rule in EXPANSION_RULES_1) {
                    pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
                }
                var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                function leadingSomething(value, digits, character) {
                    var str = typeof value == "number" ? value.toString() : value || "";
                    while (str.length < digits) {
                        str = character[0] + str
                    }
                    return str
                }

                function leadingNulls(value, digits) {
                    return leadingSomething(value, digits, "0")
                }

                function compareByDay(date1, date2) {
                    function sgn(value) {
                        return value < 0 ? -1 : value > 0 ? 1 : 0
                    }
                    var compare;
                    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
                        if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                            compare = sgn(date1.getDate() - date2.getDate())
                        }
                    }
                    return compare
                }

                function getFirstWeekStartDate(janFourth) {
                    switch (janFourth.getDay()) {
                        case 0:
                            return new Date(janFourth.getFullYear() - 1, 11, 29);
                        case 1:
                            return janFourth;
                        case 2:
                            return new Date(janFourth.getFullYear(), 0, 3);
                        case 3:
                            return new Date(janFourth.getFullYear(), 0, 2);
                        case 4:
                            return new Date(janFourth.getFullYear(), 0, 1);
                        case 5:
                            return new Date(janFourth.getFullYear() - 1, 11, 31);
                        case 6:
                            return new Date(janFourth.getFullYear() - 1, 11, 30)
                    }
                }

                function getWeekBasedYear(date) {
                    var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
                    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
                    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
                    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
                    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
                    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
                        if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                            return thisDate.getFullYear() + 1
                        }
                        return thisDate.getFullYear()
                    }
                    return thisDate.getFullYear() - 1
                }
                var EXPANSION_RULES_2 = {
                    "%a": function(date) {
                        return WEEKDAYS[date.tm_wday].substring(0, 3)
                    },
                    "%A": function(date) {
                        return WEEKDAYS[date.tm_wday]
                    },
                    "%b": function(date) {
                        return MONTHS[date.tm_mon].substring(0, 3)
                    },
                    "%B": function(date) {
                        return MONTHS[date.tm_mon]
                    },
                    "%C": function(date) {
                        var year = date.tm_year + 1900;
                        return leadingNulls(year / 100 | 0, 2)
                    },
                    "%d": function(date) {
                        return leadingNulls(date.tm_mday, 2)
                    },
                    "%e": function(date) {
                        return leadingSomething(date.tm_mday, 2, " ")
                    },
                    "%g": function(date) {
                        return getWeekBasedYear(date).toString().substring(2)
                    },
                    "%G": function(date) {
                        return getWeekBasedYear(date)
                    },
                    "%H": function(date) {
                        return leadingNulls(date.tm_hour, 2)
                    },
                    "%I": function(date) {
                        var twelveHour = date.tm_hour;
                        if (twelveHour == 0) twelveHour = 12;
                        else if (twelveHour > 12) twelveHour -= 12;
                        return leadingNulls(twelveHour, 2)
                    },
                    "%j": function(date) {
                        return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
                    },
                    "%m": function(date) {
                        return leadingNulls(date.tm_mon + 1, 2)
                    },
                    "%M": function(date) {
                        return leadingNulls(date.tm_min, 2)
                    },
                    "%n": function() {
                        return "\n"
                    },
                    "%p": function(date) {
                        if (date.tm_hour >= 0 && date.tm_hour < 12) {
                            return "AM"
                        }
                        return "PM"
                    },
                    "%S": function(date) {
                        return leadingNulls(date.tm_sec, 2)
                    },
                    "%t": function() {
                        return "\t"
                    },
                    "%u": function(date) {
                        return date.tm_wday || 7
                    },
                    "%U": function(date) {
                        var days = date.tm_yday + 7 - date.tm_wday;
                        return leadingNulls(Math.floor(days / 7), 2)
                    },
                    "%V": function(date) {
                        var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
                        if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
                            val++
                        }
                        if (!val) {
                            val = 52;
                            var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
                            if (dec31 == 4 || dec31 == 5 && __isLeapYear(date.tm_year % 400 - 1)) {
                                val++
                            }
                        } else if (val == 53) {
                            var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
                            if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) val = 1
                        }
                        return leadingNulls(val, 2)
                    },
                    "%w": function(date) {
                        return date.tm_wday
                    },
                    "%W": function(date) {
                        var days = date.tm_yday + 7 - (date.tm_wday + 6) % 7;
                        return leadingNulls(Math.floor(days / 7), 2)
                    },
                    "%y": function(date) {
                        return (date.tm_year + 1900).toString().substring(2)
                    },
                    "%Y": function(date) {
                        return date.tm_year + 1900
                    },
                    "%z": function(date) {
                        var off = date.tm_gmtoff;
                        var ahead = off >= 0;
                        off = Math.abs(off) / 60;
                        off = off / 60 * 100 + off % 60;
                        return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
                    },
                    "%Z": function(date) {
                        return date.tm_zone
                    },
                    "%%": function() {
                        return "%"
                    }
                };
                pattern = pattern.replace(/%%/g, "\0\0");
                for (var rule in EXPANSION_RULES_2) {
                    if (pattern.includes(rule)) {
                        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
                    }
                }
                pattern = pattern.replace(/\0\0/g, "%");
                var bytes = intArrayFromString(pattern, false);
                if (bytes.length > maxsize) {
                    return 0
                }
                writeArrayToMemory(bytes, s);
                return bytes.length - 1
            }
            var wasmTableMirror = [];

            function getWasmTableEntry(funcPtr) {
                var func = wasmTableMirror[funcPtr];
                if (!func) {
                    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
                    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr)
                }
                return func
            }
            var ALLOC_NORMAL = 0;
            var ALLOC_STACK = 1;

            function allocate(slab, allocator) {
                var ret;
                if (allocator == ALLOC_STACK) {
                    ret = stackAlloc(slab.length)
                } else {
                    ret = _malloc(slab.length)
                }
                if (!slab.subarray && !slab.slice) {
                    slab = new Uint8Array(slab)
                }
                HEAPU8.set(slab, ret);
                return ret
            }

            function getCFunc(ident) {
                var func = Module["_" + ident];
                return func
            }

            function ccall(ident, returnType, argTypes, args, opts) {
                var toC = {
                    "string": str => {
                        var ret = 0;
                        if (str !== null && str !== undefined && str !== 0) {
                            var len = (str.length << 2) + 1;
                            ret = stackAlloc(len);
                            stringToUTF8(str, ret, len)
                        }
                        return ret
                    },
                    "array": arr => {
                        var ret = stackAlloc(arr.length);
                        writeArrayToMemory(arr, ret);
                        return ret
                    }
                };

                function convertReturnValue(ret) {
                    if (returnType === "string") {
                        return UTF8ToString(ret)
                    }
                    if (returnType === "boolean") return Boolean(ret);
                    return ret
                }
                var func = getCFunc(ident);
                var cArgs = [];
                var stack = 0;
                if (args) {
                    for (var i = 0; i < args.length; i++) {
                        var converter = toC[argTypes[i]];
                        if (converter) {
                            if (stack === 0) stack = stackSave();
                            cArgs[i] = converter(args[i])
                        } else {
                            cArgs[i] = args[i]
                        }
                    }
                }
                var ret = func.apply(null, cArgs);

                function onDone(ret) {
                    if (stack !== 0) stackRestore(stack);
                    return convertReturnValue(ret)
                }
                ret = onDone(ret);
                return ret
            }

            function cwrap(ident, returnType, argTypes, opts) {
                argTypes = argTypes || [];
                var numericArgs = argTypes.every(type => type === "number" || type === "boolean");
                var numericRet = returnType !== "string";
                if (numericRet && numericArgs && !opts) {
                    return getCFunc(ident)
                }
                return function() {
                    return ccall(ident, returnType, argTypes, arguments, opts)
                }
            }
            var FSNode = function(parent, name, mode, rdev) {
                if (!parent) {
                    parent = this
                }
                this.parent = parent;
                this.mount = parent.mount;
                this.mounted = null;
                this.id = FS.nextInode++;
                this.name = name;
                this.mode = mode;
                this.node_ops = {};
                this.stream_ops = {};
                this.rdev = rdev
            };
            var readMode = 292 | 73;
            var writeMode = 146;
            Object.defineProperties(FSNode.prototype, {
                read: {
                    get: function() {
                        return (this.mode & readMode) === readMode
                    },
                    set: function(val) {
                        val ? this.mode |= readMode : this.mode &= ~readMode
                    }
                },
                write: {
                    get: function() {
                        return (this.mode & writeMode) === writeMode
                    },
                    set: function(val) {
                        val ? this.mode |= writeMode : this.mode &= ~writeMode
                    }
                },
                isFolder: {
                    get: function() {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function() {
                        return FS.isChrdev(this.mode)
                    }
                }
            });
            FS.FSNode = FSNode;
            FS.staticInit();
            Module["FS_createPath"] = FS.createPath;
            Module["FS_createDataFile"] = FS.createDataFile;
            Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
            Module["FS_unlink"] = FS.unlink;
            Module["FS_createLazyFile"] = FS.createLazyFile;
            Module["FS_createDevice"] = FS.createDevice;
            var asmLibraryArg = {
                "ga": ___syscall_chdir,
                "fa": ___syscall_chmod,
                "ea": ___syscall_dup3,
                "ha": ___syscall_faccessat,
                "k": ___syscall_fcntl64,
                "X": ___syscall_fstat64,
                "E": ___syscall_ftruncate64,
                "T": ___syscall_getcwd,
                "O": ___syscall_getdents64,
                "v": ___syscall_ioctl,
                "U": ___syscall_lstat64,
                "R": ___syscall_mkdirat,
                "V": ___syscall_newfstatat,
                "w": ___syscall_openat,
                "P": ___syscall_poll,
                "N": ___syscall_readlinkat,
                "L": ___syscall_renameat,
                "s": ___syscall_rmdir,
                "W": ___syscall_stat64,
                "M": ___syscall_unlinkat,
                "ba": __dlinit,
                "da": __dlopen_js,
                "ca": __dlsym_js,
                "p": __emscripten_date_now,
                "Y": __emscripten_get_now_is_monotonic,
                "I": __emscripten_throw_longjmp,
                "Z": __localtime_js,
                "_": __mktime_js,
                "Q": __munmap_js,
                "$": __tzset_js,
                "q": _abort,
                "y": _emscripten_asm_const_int,
                "K": _emscripten_get_heap_max,
                "x": _emscripten_get_now,
                "aa": _emscripten_memcpy_big,
                "J": _emscripten_resize_heap,
                "ka": _emscripten_run_script,
                "ia": _environ_get,
                "ja": _environ_sizes_get,
                "l": _exit,
                "m": _fd_close,
                "t": _fd_fdstat_get,
                "u": _fd_read,
                "D": _fd_seek,
                "o": _fd_write,
                "b": _getTempRet0,
                "h": invoke_i,
                "d": invoke_ii,
                "c": invoke_iii,
                "e": invoke_iiii,
                "j": invoke_iiiii,
                "i": invoke_iiiiii,
                "z": invoke_iiiiiii,
                "r": invoke_iiiiiiii,
                "A": invoke_iiiiiiiii,
                "B": invoke_iiiiiiiiii,
                "C": invoke_iiiiiiiiiii,
                "ma": invoke_iiiiiiiiiiii,
                "G": invoke_iij,
                "H": invoke_iiji,
                "F": invoke_ij,
                "n": invoke_v,
                "g": invoke_vi,
                "f": invoke_vii,
                "S": invoke_viii,
                "a": _setTempRet0,
                "la": _strftime
            };
            var asm = createWasm();
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
                return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["oa"]).apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function() {
                return (_malloc = Module["_malloc"] = Module["asm"]["pa"]).apply(null, arguments)
            };
            var _PL_initialise = Module["_PL_initialise"] = function() {
                return (_PL_initialise = Module["_PL_initialise"] = Module["asm"]["qa"]).apply(null, arguments)
            };
            var _PL_halt = Module["_PL_halt"] = function() {
                return (_PL_halt = Module["_PL_halt"] = Module["asm"]["ra"]).apply(null, arguments)
            };
            var _PL_toplevel = Module["_PL_toplevel"] = function() {
                return (_PL_toplevel = Module["_PL_toplevel"] = Module["asm"]["sa"]).apply(null, arguments)
            };
            var _PL_unregister_blob_type = Module["_PL_unregister_blob_type"] = function() {
                return (_PL_unregister_blob_type = Module["_PL_unregister_blob_type"] = Module["asm"]["ta"]).apply(null, arguments)
            };
            var _PL_unregister_atom = Module["_PL_unregister_atom"] = function() {
                return (_PL_unregister_atom = Module["_PL_unregister_atom"] = Module["asm"]["ua"]).apply(null, arguments)
            };
            var _PL_agc_hook = Module["_PL_agc_hook"] = function() {
                return (_PL_agc_hook = Module["_PL_agc_hook"] = Module["asm"]["va"]).apply(null, arguments)
            };
            var _PL_register_atom = Module["_PL_register_atom"] = function() {
                return (_PL_register_atom = Module["_PL_register_atom"] = Module["asm"]["wa"]).apply(null, arguments)
            };
            var _PL_open_foreign_frame = Module["_PL_open_foreign_frame"] = function() {
                return (_PL_open_foreign_frame = Module["_PL_open_foreign_frame"] = Module["asm"]["xa"]).apply(null, arguments)
            };
            var _PL_close_foreign_frame = Module["_PL_close_foreign_frame"] = function() {
                return (_PL_close_foreign_frame = Module["_PL_close_foreign_frame"] = Module["asm"]["ya"]).apply(null, arguments)
            };
            var _PL_rewind_foreign_frame = Module["_PL_rewind_foreign_frame"] = function() {
                return (_PL_rewind_foreign_frame = Module["_PL_rewind_foreign_frame"] = Module["asm"]["za"]).apply(null, arguments)
            };
            var _PL_discard_foreign_frame = Module["_PL_discard_foreign_frame"] = function() {
                return (_PL_discard_foreign_frame = Module["_PL_discard_foreign_frame"] = Module["asm"]["Aa"]).apply(null, arguments)
            };
            var _PL_open_query = Module["_PL_open_query"] = function() {
                return (_PL_open_query = Module["_PL_open_query"] = Module["asm"]["Ba"]).apply(null, arguments)
            };
            var _PL_exception = Module["_PL_exception"] = function() {
                return (_PL_exception = Module["_PL_exception"] = Module["asm"]["Ca"]).apply(null, arguments)
            };
            var _PL_cut_query = Module["_PL_cut_query"] = function() {
                return (_PL_cut_query = Module["_PL_cut_query"] = Module["asm"]["Da"]).apply(null, arguments)
            };
            var _PL_close_query = Module["_PL_close_query"] = function() {
                return (_PL_close_query = Module["_PL_close_query"] = Module["asm"]["Ea"]).apply(null, arguments)
            };
            var _PL_current_query = Module["_PL_current_query"] = function() {
                return (_PL_current_query = Module["_PL_current_query"] = Module["asm"]["Fa"]).apply(null, arguments)
            };
            var _PL_next_solution = Module["_PL_next_solution"] = function() {
                return (_PL_next_solution = Module["_PL_next_solution"] = Module["asm"]["Ga"]).apply(null, arguments)
            };
            var _PL_instantiation_error = Module["_PL_instantiation_error"] = function() {
                return (_PL_instantiation_error = Module["_PL_instantiation_error"] = Module["asm"]["Ha"]).apply(null, arguments)
            };
            var _PL_uninstantiation_error = Module["_PL_uninstantiation_error"] = function() {
                return (_PL_uninstantiation_error = Module["_PL_uninstantiation_error"] = Module["asm"]["Ia"]).apply(null, arguments)
            };
            var _PL_representation_error = Module["_PL_representation_error"] = function() {
                return (_PL_representation_error = Module["_PL_representation_error"] = Module["asm"]["Ja"]).apply(null, arguments)
            };
            var _PL_type_error = Module["_PL_type_error"] = function() {
                return (_PL_type_error = Module["_PL_type_error"] = Module["asm"]["Ka"]).apply(null, arguments)
            };
            var _PL_domain_error = Module["_PL_domain_error"] = function() {
                return (_PL_domain_error = Module["_PL_domain_error"] = Module["asm"]["La"]).apply(null, arguments)
            };
            var _PL_existence_error = Module["_PL_existence_error"] = function() {
                return (_PL_existence_error = Module["_PL_existence_error"] = Module["asm"]["Ma"]).apply(null, arguments)
            };
            var _PL_permission_error = Module["_PL_permission_error"] = function() {
                return (_PL_permission_error = Module["_PL_permission_error"] = Module["asm"]["Na"]).apply(null, arguments)
            };
            var _PL_resource_error = Module["_PL_resource_error"] = function() {
                return (_PL_resource_error = Module["_PL_resource_error"] = Module["asm"]["Oa"]).apply(null, arguments)
            };
            var _PL_syntax_error = Module["_PL_syntax_error"] = function() {
                return (_PL_syntax_error = Module["_PL_syntax_error"] = Module["asm"]["Pa"]).apply(null, arguments)
            };
            var _PL_get_atom_ex = Module["_PL_get_atom_ex"] = function() {
                return (_PL_get_atom_ex = Module["_PL_get_atom_ex"] = Module["asm"]["Qa"]).apply(null, arguments)
            };
            var _PL_get_integer_ex = Module["_PL_get_integer_ex"] = function() {
                return (_PL_get_integer_ex = Module["_PL_get_integer_ex"] = Module["asm"]["Ra"]).apply(null, arguments)
            };
            var _PL_get_long_ex = Module["_PL_get_long_ex"] = function() {
                return (_PL_get_long_ex = Module["_PL_get_long_ex"] = Module["asm"]["Sa"]).apply(null, arguments)
            };
            var _PL_get_int64_ex = Module["_PL_get_int64_ex"] = function() {
                return (_PL_get_int64_ex = Module["_PL_get_int64_ex"] = Module["asm"]["Ta"]).apply(null, arguments)
            };
            var _PL_get_intptr_ex = Module["_PL_get_intptr_ex"] = function() {
                return (_PL_get_intptr_ex = Module["_PL_get_intptr_ex"] = Module["asm"]["Ua"]).apply(null, arguments)
            };
            var _PL_get_size_ex = Module["_PL_get_size_ex"] = function() {
                return (_PL_get_size_ex = Module["_PL_get_size_ex"] = Module["asm"]["Va"]).apply(null, arguments)
            };
            var _PL_get_bool_ex = Module["_PL_get_bool_ex"] = function() {
                return (_PL_get_bool_ex = Module["_PL_get_bool_ex"] = Module["asm"]["Wa"]).apply(null, arguments)
            };
            var _PL_get_float_ex = Module["_PL_get_float_ex"] = function() {
                return (_PL_get_float_ex = Module["_PL_get_float_ex"] = Module["asm"]["Xa"]).apply(null, arguments)
            };
            var _PL_get_char_ex = Module["_PL_get_char_ex"] = function() {
                return (_PL_get_char_ex = Module["_PL_get_char_ex"] = Module["asm"]["Ya"]).apply(null, arguments)
            };
            var _PL_get_pointer_ex = Module["_PL_get_pointer_ex"] = function() {
                return (_PL_get_pointer_ex = Module["_PL_get_pointer_ex"] = Module["asm"]["Za"]).apply(null, arguments)
            };
            var _PL_unify_list_ex = Module["_PL_unify_list_ex"] = function() {
                return (_PL_unify_list_ex = Module["_PL_unify_list_ex"] = Module["asm"]["_a"]).apply(null, arguments)
            };
            var _PL_unify_nil_ex = Module["_PL_unify_nil_ex"] = function() {
                return (_PL_unify_nil_ex = Module["_PL_unify_nil_ex"] = Module["asm"]["$a"]).apply(null, arguments)
            };
            var _PL_get_list_ex = Module["_PL_get_list_ex"] = function() {
                return (_PL_get_list_ex = Module["_PL_get_list_ex"] = Module["asm"]["ab"]).apply(null, arguments)
            };
            var _PL_get_nil_ex = Module["_PL_get_nil_ex"] = function() {
                return (_PL_get_nil_ex = Module["_PL_get_nil_ex"] = Module["asm"]["bb"]).apply(null, arguments)
            };
            var _PL_unify_bool_ex = Module["_PL_unify_bool_ex"] = function() {
                return (_PL_unify_bool_ex = Module["_PL_unify_bool_ex"] = Module["asm"]["cb"]).apply(null, arguments)
            };
            var _PL_is_ground = Module["_PL_is_ground"] = function() {
                return (_PL_is_ground = Module["_PL_is_ground"] = Module["asm"]["db"]).apply(null, arguments)
            };
            var _PL_is_acyclic = Module["_PL_is_acyclic"] = function() {
                return (_PL_is_acyclic = Module["_PL_is_acyclic"] = Module["asm"]["eb"]).apply(null, arguments)
            };
            var _PL_put_term_from_chars = Module["_PL_put_term_from_chars"] = function() {
                return (_PL_put_term_from_chars = Module["_PL_put_term_from_chars"] = Module["asm"]["fb"]).apply(null, arguments)
            };
            var _PL_chars_to_term = Module["_PL_chars_to_term"] = function() {
                return (_PL_chars_to_term = Module["_PL_chars_to_term"] = Module["asm"]["gb"]).apply(null, arguments)
            };
            var _PL_wchars_to_term = Module["_PL_wchars_to_term"] = function() {
                return (_PL_wchars_to_term = Module["_PL_wchars_to_term"] = Module["asm"]["hb"]).apply(null, arguments)
            };
            var _PL_record_external = Module["_PL_record_external"] = function() {
                return (_PL_record_external = Module["_PL_record_external"] = Module["asm"]["ib"]).apply(null, arguments)
            };
            var _PL_recorded_external = Module["_PL_recorded_external"] = function() {
                return (_PL_recorded_external = Module["_PL_recorded_external"] = Module["asm"]["jb"]).apply(null, arguments)
            };
            var _PL_erase_external = Module["_PL_erase_external"] = function() {
                return (_PL_erase_external = Module["_PL_erase_external"] = Module["asm"]["kb"]).apply(null, arguments)
            };
            var _PL_sigaction = Module["_PL_sigaction"] = function() {
                return (_PL_sigaction = Module["_PL_sigaction"] = Module["asm"]["lb"]).apply(null, arguments)
            };
            var _PL_get_signum_ex = Module["_PL_get_signum_ex"] = function() {
                return (_PL_get_signum_ex = Module["_PL_get_signum_ex"] = Module["asm"]["mb"]).apply(null, arguments)
            };
            var _PL_signal = Module["_PL_signal"] = function() {
                return (_PL_signal = Module["_PL_signal"] = Module["asm"]["nb"]).apply(null, arguments)
            };
            var _PL_handle_signals = Module["_PL_handle_signals"] = function() {
                return (_PL_handle_signals = Module["_PL_handle_signals"] = Module["asm"]["ob"]).apply(null, arguments)
            };
            var _PL_write_term = Module["_PL_write_term"] = function() {
                return (_PL_write_term = Module["_PL_write_term"] = Module["asm"]["pb"]).apply(null, arguments)
            };
            var _PL_cleanup_fork = Module["_PL_cleanup_fork"] = function() {
                return (_PL_cleanup_fork = Module["_PL_cleanup_fork"] = Module["asm"]["qb"]).apply(null, arguments)
            };
            var _PL_is_initialised = Module["_PL_is_initialised"] = function() {
                return (_PL_is_initialised = Module["_PL_is_initialised"] = Module["asm"]["rb"]).apply(null, arguments)
            };
            var _free = Module["_free"] = function() {
                return (_free = Module["_free"] = Module["asm"]["sb"]).apply(null, arguments)
            };
            var _PL_raise = Module["_PL_raise"] = function() {
                return (_PL_raise = Module["_PL_raise"] = Module["asm"]["tb"]).apply(null, arguments)
            };
            var _PL_new_atom = Module["_PL_new_atom"] = function() {
                return (_PL_new_atom = Module["_PL_new_atom"] = Module["asm"]["ub"]).apply(null, arguments)
            };
            var ___errno_location = Module["___errno_location"] = function() {
                return (___errno_location = Module["___errno_location"] = Module["asm"]["vb"]).apply(null, arguments)
            };
            var _PL_put_atom_chars = Module["_PL_put_atom_chars"] = function() {
                return (_PL_put_atom_chars = Module["_PL_put_atom_chars"] = Module["asm"]["wb"]).apply(null, arguments)
            };
            var _PL_throw = Module["_PL_throw"] = function() {
                return (_PL_throw = Module["_PL_throw"] = Module["asm"]["xb"]).apply(null, arguments)
            };
            var _PL_raise_exception = Module["_PL_raise_exception"] = function() {
                return (_PL_raise_exception = Module["_PL_raise_exception"] = Module["asm"]["yb"]).apply(null, arguments)
            };
            var _PL_clear_exception = Module["_PL_clear_exception"] = function() {
                return (_PL_clear_exception = Module["_PL_clear_exception"] = Module["asm"]["zb"]).apply(null, arguments)
            };
            var _PL_put_nil = Module["_PL_put_nil"] = function() {
                return (_PL_put_nil = Module["_PL_put_nil"] = Module["asm"]["Ab"]).apply(null, arguments)
            };
            var _PL_atom_nchars = Module["_PL_atom_nchars"] = function() {
                return (_PL_atom_nchars = Module["_PL_atom_nchars"] = Module["asm"]["Bb"]).apply(null, arguments)
            };
            var _PL_atom_wchars = Module["_PL_atom_wchars"] = function() {
                return (_PL_atom_wchars = Module["_PL_atom_wchars"] = Module["asm"]["Cb"]).apply(null, arguments)
            };
            var _PL_unify_nil = Module["_PL_unify_nil"] = function() {
                return (_PL_unify_nil = Module["_PL_unify_nil"] = Module["asm"]["Db"]).apply(null, arguments)
            };
            var _PL_cons_functor_v = Module["_PL_cons_functor_v"] = function() {
                return (_PL_cons_functor_v = Module["_PL_cons_functor_v"] = Module["asm"]["Eb"]).apply(null, arguments)
            };
            var _PL_get_nil = Module["_PL_get_nil"] = function() {
                return (_PL_get_nil = Module["_PL_get_nil"] = Module["asm"]["Fb"]).apply(null, arguments)
            };
            var _PL_atom_chars = Module["_PL_atom_chars"] = function() {
                return (_PL_atom_chars = Module["_PL_atom_chars"] = Module["asm"]["Gb"]).apply(null, arguments)
            };
            var _PL_is_list = Module["_PL_is_list"] = function() {
                return (_PL_is_list = Module["_PL_is_list"] = Module["asm"]["Hb"]).apply(null, arguments)
            };
            var _PL_cons_functor = Module["_PL_cons_functor"] = function() {
                return (_PL_cons_functor = Module["_PL_cons_functor"] = Module["asm"]["Ib"]).apply(null, arguments)
            };
            var _PL_warning = Module["_PL_warning"] = function() {
                return (_PL_warning = Module["_PL_warning"] = Module["asm"]["Jb"]).apply(null, arguments)
            };
            var _PL_is_integer = Module["_PL_is_integer"] = function() {
                return (_PL_is_integer = Module["_PL_is_integer"] = Module["asm"]["Kb"]).apply(null, arguments)
            };
            var _PL_unify_chars = Module["_PL_unify_chars"] = function() {
                return (_PL_unify_chars = Module["_PL_unify_chars"] = Module["asm"]["Mb"]).apply(null, arguments)
            };
            var _PL_unify_float = Module["_PL_unify_float"] = function() {
                return (_PL_unify_float = Module["_PL_unify_float"] = Module["asm"]["Nb"]).apply(null, arguments)
            };
            var _PL_get_nchars = Module["_PL_get_nchars"] = function() {
                return (_PL_get_nchars = Module["_PL_get_nchars"] = Module["asm"]["Ob"]).apply(null, arguments)
            };
            var _PL_get_wchars = Module["_PL_get_wchars"] = function() {
                return (_PL_get_wchars = Module["_PL_get_wchars"] = Module["asm"]["Pb"]).apply(null, arguments)
            };
            var _PL_call_predicate = Module["_PL_call_predicate"] = function() {
                return (_PL_call_predicate = Module["_PL_call_predicate"] = Module["asm"]["Qb"]).apply(null, arguments)
            };
            var _PL_is_number = Module["_PL_is_number"] = function() {
                return (_PL_is_number = Module["_PL_is_number"] = Module["asm"]["Rb"]).apply(null, arguments)
            };
            var _PL_is_string = Module["_PL_is_string"] = function() {
                return (_PL_is_string = Module["_PL_is_string"] = Module["asm"]["Sb"]).apply(null, arguments)
            };
            var _PL_is_pair = Module["_PL_is_pair"] = function() {
                return (_PL_is_pair = Module["_PL_is_pair"] = Module["asm"]["Tb"]).apply(null, arguments)
            };
            var _PL_predicate = Module["_PL_predicate"] = function() {
                return (_PL_predicate = Module["_PL_predicate"] = Module["asm"]["Ub"]).apply(null, arguments)
            };
            var _PL_is_float = Module["_PL_is_float"] = function() {
                return (_PL_is_float = Module["_PL_is_float"] = Module["asm"]["Vb"]).apply(null, arguments)
            };
            var _PL_is_compound = Module["_PL_is_compound"] = function() {
                return (_PL_is_compound = Module["_PL_is_compound"] = Module["asm"]["Wb"]).apply(null, arguments)
            };
            var _PL_is_callable = Module["_PL_is_callable"] = function() {
                return (_PL_is_callable = Module["_PL_is_callable"] = Module["asm"]["Xb"]).apply(null, arguments)
            };
            var _PL_unify_compound = Module["_PL_unify_compound"] = function() {
                return (_PL_unify_compound = Module["_PL_unify_compound"] = Module["asm"]["Yb"]).apply(null, arguments)
            };
            var _PL_compare = Module["_PL_compare"] = function() {
                return (_PL_compare = Module["_PL_compare"] = Module["asm"]["Zb"]).apply(null, arguments)
            };
            var _PL_unify_uint64 = Module["_PL_unify_uint64"] = function() {
                return (_PL_unify_uint64 = Module["_PL_unify_uint64"] = Module["asm"]["_b"]).apply(null, arguments)
            };
            var _PL_unify_atom_nchars = Module["_PL_unify_atom_nchars"] = function() {
                return (_PL_unify_atom_nchars = Module["_PL_unify_atom_nchars"] = Module["asm"]["$b"]).apply(null, arguments)
            };
            var _PL_unify_wchars = Module["_PL_unify_wchars"] = function() {
                return (_PL_unify_wchars = Module["_PL_unify_wchars"] = Module["asm"]["ac"]).apply(null, arguments)
            };
            var _PL_get_atom_chars = Module["_PL_get_atom_chars"] = function() {
                return (_PL_get_atom_chars = Module["_PL_get_atom_chars"] = Module["asm"]["bc"]).apply(null, arguments)
            };
            var _PL_unify_bool = Module["_PL_unify_bool"] = function() {
                return (_PL_unify_bool = Module["_PL_unify_bool"] = Module["asm"]["cc"]).apply(null, arguments)
            };
            var _PL_get_chars = Module["_PL_get_chars"] = function() {
                return (_PL_get_chars = Module["_PL_get_chars"] = Module["asm"]["dc"]).apply(null, arguments)
            };
            var _PL_skip_list = Module["_PL_skip_list"] = function() {
                return (_PL_skip_list = Module["_PL_skip_list"] = Module["asm"]["ec"]).apply(null, arguments)
            };
            var _PL_is_atom = Module["_PL_is_atom"] = function() {
                return (_PL_is_atom = Module["_PL_is_atom"] = Module["asm"]["fc"]).apply(null, arguments)
            };
            var _PL_is_variable = Module["_PL_is_variable"] = function() {
                return (_PL_is_variable = Module["_PL_is_variable"] = Module["asm"]["gc"]).apply(null, arguments)
            };
            var _PL_unify_atom = Module["_PL_unify_atom"] = function() {
                return (_PL_unify_atom = Module["_PL_unify_atom"] = Module["asm"]["hc"]).apply(null, arguments)
            };
            var _PL_new_term_refs = Module["_PL_new_term_refs"] = function() {
                return (_PL_new_term_refs = Module["_PL_new_term_refs"] = Module["asm"]["ic"]).apply(null, arguments)
            };
            var _PL_put_atom = Module["_PL_put_atom"] = function() {
                return (_PL_put_atom = Module["_PL_put_atom"] = Module["asm"]["jc"]).apply(null, arguments)
            };
            var _PL_new_term_ref = Module["_PL_new_term_ref"] = function() {
                return (_PL_new_term_ref = Module["_PL_new_term_ref"] = Module["asm"]["kc"]).apply(null, arguments)
            };
            var _PL_unify = Module["_PL_unify"] = function() {
                return (_PL_unify = Module["_PL_unify"] = Module["asm"]["lc"]).apply(null, arguments)
            };
            var _PL_get_bool = Module["_PL_get_bool"] = function() {
                return (_PL_get_bool = Module["_PL_get_bool"] = Module["asm"]["mc"]).apply(null, arguments)
            };
            var _PL_get_float = Module["_PL_get_float"] = function() {
                return (_PL_get_float = Module["_PL_get_float"] = Module["asm"]["nc"]).apply(null, arguments)
            };
            var _PL_get_module = Module["_PL_get_module"] = function() {
                return (_PL_get_module = Module["_PL_get_module"] = Module["asm"]["oc"]).apply(null, arguments)
            };
            var _PL_erase = Module["_PL_erase"] = function() {
                return (_PL_erase = Module["_PL_erase"] = Module["asm"]["pc"]).apply(null, arguments)
            };
            var _PL_unify_string_nchars = Module["_PL_unify_string_nchars"] = function() {
                return (_PL_unify_string_nchars = Module["_PL_unify_string_nchars"] = Module["asm"]["qc"]).apply(null, arguments)
            };
            var _PL_get_intptr = Module["_PL_get_intptr"] = function() {
                return (_PL_get_intptr = Module["_PL_get_intptr"] = Module["asm"]["rc"]).apply(null, arguments)
            };
            var _PL_pred = Module["_PL_pred"] = function() {
                return (_PL_pred = Module["_PL_pred"] = Module["asm"]["sc"]).apply(null, arguments)
            };
            var _PL_is_blob = Module["_PL_is_blob"] = function() {
                return (_PL_is_blob = Module["_PL_is_blob"] = Module["asm"]["tc"]).apply(null, arguments)
            };
            var _PL_put_bool = Module["_PL_put_bool"] = function() {
                return (_PL_put_bool = Module["_PL_put_bool"] = Module["asm"]["uc"]).apply(null, arguments)
            };
            var _PL_unify_atom_chars = Module["_PL_unify_atom_chars"] = function() {
                return (_PL_unify_atom_chars = Module["_PL_unify_atom_chars"] = Module["asm"]["vc"]).apply(null, arguments)
            };
            var _PL_put_float = Module["_PL_put_float"] = function() {
                return (_PL_put_float = Module["_PL_put_float"] = Module["asm"]["wc"]).apply(null, arguments)
            };
            var _PL_put_pointer = Module["_PL_put_pointer"] = function() {
                return (_PL_put_pointer = Module["_PL_put_pointer"] = Module["asm"]["xc"]).apply(null, arguments)
            };
            var _PL_unify_int64 = Module["_PL_unify_int64"] = function() {
                return (_PL_unify_int64 = Module["_PL_unify_int64"] = Module["asm"]["yc"]).apply(null, arguments)
            };
            var _PL_get_atom = Module["_PL_get_atom"] = function() {
                return (_PL_get_atom = Module["_PL_get_atom"] = Module["asm"]["zc"]).apply(null, arguments)
            };
            var _PL_copy_term_ref = Module["_PL_copy_term_ref"] = function() {
                return (_PL_copy_term_ref = Module["_PL_copy_term_ref"] = Module["asm"]["Ac"]).apply(null, arguments)
            };
            var _PL_unify_integer = Module["_PL_unify_integer"] = function() {
                return (_PL_unify_integer = Module["_PL_unify_integer"] = Module["asm"]["Bc"]).apply(null, arguments)
            };
            var _PL_put_int64 = Module["_PL_put_int64"] = function() {
                return (_PL_put_int64 = Module["_PL_put_int64"] = Module["asm"]["Cc"]).apply(null, arguments)
            };
            var _PL_set_prolog_flag = Module["_PL_set_prolog_flag"] = function() {
                return (_PL_set_prolog_flag = Module["_PL_set_prolog_flag"] = Module["asm"]["Dc"]).apply(null, arguments)
            };
            var _PL_get_file_name = Module["_PL_get_file_name"] = function() {
                return (_PL_get_file_name = Module["_PL_get_file_name"] = Module["asm"]["Ec"]).apply(null, arguments)
            };
            var _PL_unify_blob = Module["_PL_unify_blob"] = function() {
                return (_PL_unify_blob = Module["_PL_unify_blob"] = Module["asm"]["Fc"]).apply(null, arguments)
            };
            var _PL_get_blob = Module["_PL_get_blob"] = function() {
                return (_PL_get_blob = Module["_PL_get_blob"] = Module["asm"]["Gc"]).apply(null, arguments)
            };
            var _PL_blob_data = Module["_PL_blob_data"] = function() {
                return (_PL_blob_data = Module["_PL_blob_data"] = Module["asm"]["Hc"]).apply(null, arguments)
            };
            var _PL_new_module = Module["_PL_new_module"] = function() {
                return (_PL_new_module = Module["_PL_new_module"] = Module["asm"]["Ic"]).apply(null, arguments)
            };
            var _PL_put_string_chars = Module["_PL_put_string_chars"] = function() {
                return (_PL_put_string_chars = Module["_PL_put_string_chars"] = Module["asm"]["Jc"]).apply(null, arguments)
            };
            var _PL_set_resource_db_mem = Module["_PL_set_resource_db_mem"] = function() {
                return (_PL_set_resource_db_mem = Module["_PL_set_resource_db_mem"] = Module["asm"]["Kc"]).apply(null, arguments)
            };
            var _PL_on_halt = Module["_PL_on_halt"] = function() {
                return (_PL_on_halt = Module["_PL_on_halt"] = Module["asm"]["Lc"]).apply(null, arguments)
            };
            var _PL_exit_hook = Module["_PL_exit_hook"] = function() {
                return (_PL_exit_hook = Module["_PL_exit_hook"] = Module["asm"]["Mc"]).apply(null, arguments)
            };
            var _PL_cleanup = Module["_PL_cleanup"] = function() {
                return (_PL_cleanup = Module["_PL_cleanup"] = Module["asm"]["Nc"]).apply(null, arguments)
            };
            var _PL_unify_string_chars = Module["_PL_unify_string_chars"] = function() {
                return (_PL_unify_string_chars = Module["_PL_unify_string_chars"] = Module["asm"]["Oc"]).apply(null, arguments)
            };
            var _PL_put_variable = Module["_PL_put_variable"] = function() {
                return (_PL_put_variable = Module["_PL_put_variable"] = Module["asm"]["Pc"]).apply(null, arguments)
            };
            var _PL_is_atomic = Module["_PL_is_atomic"] = function() {
                return (_PL_is_atomic = Module["_PL_is_atomic"] = Module["asm"]["Qc"]).apply(null, arguments)
            };
            var _PL_recorded = Module["_PL_recorded"] = function() {
                return (_PL_recorded = Module["_PL_recorded"] = Module["asm"]["Rc"]).apply(null, arguments)
            };
            var _PL_record = Module["_PL_record"] = function() {
                return (_PL_record = Module["_PL_record"] = Module["asm"]["Sc"]).apply(null, arguments)
            };
            var _PL_put_functor = Module["_PL_put_functor"] = function() {
                return (_PL_put_functor = Module["_PL_put_functor"] = Module["asm"]["Tc"]).apply(null, arguments)
            };
            var _PL_strip_module = Module["_PL_strip_module"] = function() {
                return (_PL_strip_module = Module["_PL_strip_module"] = Module["asm"]["Uc"]).apply(null, arguments)
            };
            var _PL_unify_list = Module["_PL_unify_list"] = function() {
                return (_PL_unify_list = Module["_PL_unify_list"] = Module["asm"]["Vc"]).apply(null, arguments)
            };
            var _PL_register_foreign_in_module = Module["_PL_register_foreign_in_module"] = function() {
                return (_PL_register_foreign_in_module = Module["_PL_register_foreign_in_module"] = Module["asm"]["Wc"]).apply(null, arguments)
            };
            var _PL_foreign_control = Module["_PL_foreign_control"] = function() {
                return (_PL_foreign_control = Module["_PL_foreign_control"] = Module["asm"]["Xc"]).apply(null, arguments)
            };
            var _PL_foreign_context_address = Module["_PL_foreign_context_address"] = function() {
                return (_PL_foreign_context_address = Module["_PL_foreign_context_address"] = Module["asm"]["Yc"]).apply(null, arguments)
            };
            var _PL_reset_term_refs = Module["_PL_reset_term_refs"] = function() {
                return (_PL_reset_term_refs = Module["_PL_reset_term_refs"] = Module["asm"]["Zc"]).apply(null, arguments)
            };
            var _PL_new_atom_nchars = Module["_PL_new_atom_nchars"] = function() {
                return (_PL_new_atom_nchars = Module["_PL_new_atom_nchars"] = Module["asm"]["_c"]).apply(null, arguments)
            };
            var _PL_new_atom_mbchars = Module["_PL_new_atom_mbchars"] = function() {
                return (_PL_new_atom_mbchars = Module["_PL_new_atom_mbchars"] = Module["asm"]["$c"]).apply(null, arguments)
            };
            var _PL_new_functor = Module["_PL_new_functor"] = function() {
                return (_PL_new_functor = Module["_PL_new_functor"] = Module["asm"]["ad"]).apply(null, arguments)
            };
            var _PL_functor_name = Module["_PL_functor_name"] = function() {
                return (_PL_functor_name = Module["_PL_functor_name"] = Module["asm"]["bd"]).apply(null, arguments)
            };
            var _PL_functor_arity = Module["_PL_functor_arity"] = function() {
                return (_PL_functor_arity = Module["_PL_functor_arity"] = Module["asm"]["cd"]).apply(null, arguments)
            };
            var _PL_new_atom_wchars = Module["_PL_new_atom_wchars"] = function() {
                return (_PL_new_atom_wchars = Module["_PL_new_atom_wchars"] = Module["asm"]["dd"]).apply(null, arguments)
            };
            var _PL_unify_wchars_diff = Module["_PL_unify_wchars_diff"] = function() {
                return (_PL_unify_wchars_diff = Module["_PL_unify_wchars_diff"] = Module["asm"]["ed"]).apply(null, arguments)
            };
            var _PL_same_compound = Module["_PL_same_compound"] = function() {
                return (_PL_same_compound = Module["_PL_same_compound"] = Module["asm"]["fd"]).apply(null, arguments)
            };
            var _PL_cons_list = Module["_PL_cons_list"] = function() {
                return (_PL_cons_list = Module["_PL_cons_list"] = Module["asm"]["gd"]).apply(null, arguments)
            };
            var _PL_get_atom_nchars = Module["_PL_get_atom_nchars"] = function() {
                return (_PL_get_atom_nchars = Module["_PL_get_atom_nchars"] = Module["asm"]["hd"]).apply(null, arguments)
            };
            var _PL_get_list_nchars = Module["_PL_get_list_nchars"] = function() {
                return (_PL_get_list_nchars = Module["_PL_get_list_nchars"] = Module["asm"]["id"]).apply(null, arguments)
            };
            var _PL_get_list_chars = Module["_PL_get_list_chars"] = function() {
                return (_PL_get_list_chars = Module["_PL_get_list_chars"] = Module["asm"]["jd"]).apply(null, arguments)
            };
            var _PL_quote = Module["_PL_quote"] = function() {
                return (_PL_quote = Module["_PL_quote"] = Module["asm"]["kd"]).apply(null, arguments)
            };
            var _PL_get_integer = Module["_PL_get_integer"] = function() {
                return (_PL_get_integer = Module["_PL_get_integer"] = Module["asm"]["ld"]).apply(null, arguments)
            };
            var _PL_get_long = Module["_PL_get_long"] = function() {
                return (_PL_get_long = Module["_PL_get_long"] = Module["asm"]["md"]).apply(null, arguments)
            };
            var _PL_get_int64 = Module["_PL_get_int64"] = function() {
                return (_PL_get_int64 = Module["_PL_get_int64"] = Module["asm"]["nd"]).apply(null, arguments)
            };
            var _PL_get_pointer = Module["_PL_get_pointer"] = function() {
                return (_PL_get_pointer = Module["_PL_get_pointer"] = Module["asm"]["od"]).apply(null, arguments)
            };
            var _PL_get_name_arity = Module["_PL_get_name_arity"] = function() {
                return (_PL_get_name_arity = Module["_PL_get_name_arity"] = Module["asm"]["pd"]).apply(null, arguments)
            };
            var _PL_get_compound_name_arity = Module["_PL_get_compound_name_arity"] = function() {
                return (_PL_get_compound_name_arity = Module["_PL_get_compound_name_arity"] = Module["asm"]["qd"]).apply(null, arguments)
            };
            var _PL_get_functor = Module["_PL_get_functor"] = function() {
                return (_PL_get_functor = Module["_PL_get_functor"] = Module["asm"]["rd"]).apply(null, arguments)
            };
            var _PL_get_arg = Module["_PL_get_arg"] = function() {
                return (_PL_get_arg = Module["_PL_get_arg"] = Module["asm"]["sd"]).apply(null, arguments)
            };
            var _PL_get_list = Module["_PL_get_list"] = function() {
                return (_PL_get_list = Module["_PL_get_list"] = Module["asm"]["td"]).apply(null, arguments)
            };
            var _PL_get_head = Module["_PL_get_head"] = function() {
                return (_PL_get_head = Module["_PL_get_head"] = Module["asm"]["ud"]).apply(null, arguments)
            };
            var _PL_get_tail = Module["_PL_get_tail"] = function() {
                return (_PL_get_tail = Module["_PL_get_tail"] = Module["asm"]["vd"]).apply(null, arguments)
            };
            var _PL_is_functor = Module["_PL_is_functor"] = function() {
                return (_PL_is_functor = Module["_PL_is_functor"] = Module["asm"]["wd"]).apply(null, arguments)
            };
            var _PL_put_atom_nchars = Module["_PL_put_atom_nchars"] = function() {
                return (_PL_put_atom_nchars = Module["_PL_put_atom_nchars"] = Module["asm"]["xd"]).apply(null, arguments)
            };
            var _PL_put_string_nchars = Module["_PL_put_string_nchars"] = function() {
                return (_PL_put_string_nchars = Module["_PL_put_string_nchars"] = Module["asm"]["yd"]).apply(null, arguments)
            };
            var _PL_put_chars = Module["_PL_put_chars"] = function() {
                return (_PL_put_chars = Module["_PL_put_chars"] = Module["asm"]["zd"]).apply(null, arguments)
            };
            var _PL_put_list_ncodes = Module["_PL_put_list_ncodes"] = function() {
                return (_PL_put_list_ncodes = Module["_PL_put_list_ncodes"] = Module["asm"]["Ad"]).apply(null, arguments)
            };
            var _PL_put_list_nchars = Module["_PL_put_list_nchars"] = function() {
                return (_PL_put_list_nchars = Module["_PL_put_list_nchars"] = Module["asm"]["Bd"]).apply(null, arguments)
            };
            var _PL_put_list_chars = Module["_PL_put_list_chars"] = function() {
                return (_PL_put_list_chars = Module["_PL_put_list_chars"] = Module["asm"]["Cd"]).apply(null, arguments)
            };
            var _PL_put_integer = Module["_PL_put_integer"] = function() {
                return (_PL_put_integer = Module["_PL_put_integer"] = Module["asm"]["Dd"]).apply(null, arguments)
            };
            var _PL_put_list = Module["_PL_put_list"] = function() {
                return (_PL_put_list = Module["_PL_put_list"] = Module["asm"]["Ed"]).apply(null, arguments)
            };
            var _PL_put_term = Module["_PL_put_term"] = function() {
                return (_PL_put_term = Module["_PL_put_term"] = Module["asm"]["Fd"]).apply(null, arguments)
            };
            var _PL_unify_functor = Module["_PL_unify_functor"] = function() {
                return (_PL_unify_functor = Module["_PL_unify_functor"] = Module["asm"]["Gd"]).apply(null, arguments)
            };
            var _PL_unify_list_ncodes = Module["_PL_unify_list_ncodes"] = function() {
                return (_PL_unify_list_ncodes = Module["_PL_unify_list_ncodes"] = Module["asm"]["Hd"]).apply(null, arguments)
            };
            var _PL_unify_list_nchars = Module["_PL_unify_list_nchars"] = function() {
                return (_PL_unify_list_nchars = Module["_PL_unify_list_nchars"] = Module["asm"]["Id"]).apply(null, arguments)
            };
            var _PL_unify_list_chars = Module["_PL_unify_list_chars"] = function() {
                return (_PL_unify_list_chars = Module["_PL_unify_list_chars"] = Module["asm"]["Jd"]).apply(null, arguments)
            };
            var _PL_unify_pointer = Module["_PL_unify_pointer"] = function() {
                return (_PL_unify_pointer = Module["_PL_unify_pointer"] = Module["asm"]["Kd"]).apply(null, arguments)
            };
            var _PL_unify_arg = Module["_PL_unify_arg"] = function() {
                return (_PL_unify_arg = Module["_PL_unify_arg"] = Module["asm"]["Ld"]).apply(null, arguments)
            };
            var _PL_unify_term = Module["_PL_unify_term"] = function() {
                return (_PL_unify_term = Module["_PL_unify_term"] = Module["asm"]["Md"]).apply(null, arguments)
            };
            var _PL_put_blob = Module["_PL_put_blob"] = function() {
                return (_PL_put_blob = Module["_PL_put_blob"] = Module["asm"]["Nd"]).apply(null, arguments)
            };
            var _PL_put_dict = Module["_PL_put_dict"] = function() {
                return (_PL_put_dict = Module["_PL_put_dict"] = Module["asm"]["Od"]).apply(null, arguments)
            };
            var _PL_term_type = Module["_PL_term_type"] = function() {
                return (_PL_term_type = Module["_PL_term_type"] = Module["asm"]["Pd"]).apply(null, arguments)
            };
            var _PL_context = Module["_PL_context"] = function() {
                return (_PL_context = Module["_PL_context"] = Module["asm"]["Qd"]).apply(null, arguments)
            };
            var _PL_module_name = Module["_PL_module_name"] = function() {
                return (_PL_module_name = Module["_PL_module_name"] = Module["asm"]["Rd"]).apply(null, arguments)
            };
            var _PL_predicate_info = Module["_PL_predicate_info"] = function() {
                return (_PL_predicate_info = Module["_PL_predicate_info"] = Module["asm"]["Sd"]).apply(null, arguments)
            };
            var _PL_call = Module["_PL_call"] = function() {
                return (_PL_call = Module["_PL_call"] = Module["asm"]["Td"]).apply(null, arguments)
            };
            var _PL_foreign_context = Module["_PL_foreign_context"] = function() {
                return (_PL_foreign_context = Module["_PL_foreign_context"] = Module["asm"]["Ud"]).apply(null, arguments)
            };
            var _PL_foreign_context_predicate = Module["_PL_foreign_context_predicate"] = function() {
                return (_PL_foreign_context_predicate = Module["_PL_foreign_context_predicate"] = Module["asm"]["Vd"]).apply(null, arguments)
            };
            var _PL_register_extensions_in_module = Module["_PL_register_extensions_in_module"] = function() {
                return (_PL_register_extensions_in_module = Module["_PL_register_extensions_in_module"] = Module["asm"]["Wd"]).apply(null, arguments)
            };
            var _PL_register_extensions = Module["_PL_register_extensions"] = function() {
                return (_PL_register_extensions = Module["_PL_register_extensions"] = Module["asm"]["Xd"]).apply(null, arguments)
            };
            var _PL_register_foreign = Module["_PL_register_foreign"] = function() {
                return (_PL_register_foreign = Module["_PL_register_foreign"] = Module["asm"]["Yd"]).apply(null, arguments)
            };
            var _PL_abort_hook = Module["_PL_abort_hook"] = function() {
                return (_PL_abort_hook = Module["_PL_abort_hook"] = Module["asm"]["Zd"]).apply(null, arguments)
            };
            var _PL_abort_unhook = Module["_PL_abort_unhook"] = function() {
                return (_PL_abort_unhook = Module["_PL_abort_unhook"] = Module["asm"]["_d"]).apply(null, arguments)
            };
            var _PL_dispatch_hook = Module["_PL_dispatch_hook"] = function() {
                return (_PL_dispatch_hook = Module["_PL_dispatch_hook"] = Module["asm"]["$d"]).apply(null, arguments)
            };
            var _PL_duplicate_record = Module["_PL_duplicate_record"] = function() {
                return (_PL_duplicate_record = Module["_PL_duplicate_record"] = Module["asm"]["ae"]).apply(null, arguments)
            };
            var _PL_action = Module["_PL_action"] = function() {
                return (_PL_action = Module["_PL_action"] = Module["asm"]["be"]).apply(null, arguments)
            };
            var _PL_query = Module["_PL_query"] = function() {
                return (_PL_query = Module["_PL_query"] = Module["asm"]["ce"]).apply(null, arguments)
            };
            var __PL_streams = Module["__PL_streams"] = function() {
                return (__PL_streams = Module["__PL_streams"] = Module["asm"]["de"]).apply(null, arguments)
            };
            var _PL_get_file_nameW = Module["_PL_get_file_nameW"] = function() {
                return (_PL_get_file_nameW = Module["_PL_get_file_nameW"] = Module["asm"]["ee"]).apply(null, arguments)
            };
            var _WASM_ttymode = Module["_WASM_ttymode"] = function() {
                return (_WASM_ttymode = Module["_WASM_ttymode"] = Module["asm"]["fe"]).apply(null, arguments)
            };
            var _WASM_variable_id = Module["_WASM_variable_id"] = function() {
                return (_WASM_variable_id = Module["_WASM_variable_id"] = Module["asm"]["ge"]).apply(null, arguments)
            };
            var _WASM_yield_request = Module["_WASM_yield_request"] = function() {
                return (_WASM_yield_request = Module["_WASM_yield_request"] = Module["asm"]["he"]).apply(null, arguments)
            };
            var _WASM_set_yield_result = Module["_WASM_set_yield_result"] = function() {
                return (_WASM_set_yield_result = Module["_WASM_set_yield_result"] = Module["asm"]["ie"]).apply(null, arguments)
            };
            var _js_unify_obj = Module["_js_unify_obj"] = function() {
                return (_js_unify_obj = Module["_js_unify_obj"] = Module["asm"]["je"]).apply(null, arguments)
            };
            var _js_get_obj = Module["_js_get_obj"] = function() {
                return (_js_get_obj = Module["_js_get_obj"] = Module["asm"]["ke"]).apply(null, arguments)
            };
            var ___funcs_on_exit = Module["___funcs_on_exit"] = function() {
                return (___funcs_on_exit = Module["___funcs_on_exit"] = Module["asm"]["le"]).apply(null, arguments)
            };
            var _fflush = Module["_fflush"] = function() {
                return (_fflush = Module["_fflush"] = Module["asm"]["me"]).apply(null, arguments)
            };
            var _emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = function() {
                return (_emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = Module["asm"]["ne"]).apply(null, arguments)
            };
            var _setThrew = Module["_setThrew"] = function() {
                return (_setThrew = Module["_setThrew"] = Module["asm"]["oe"]).apply(null, arguments)
            };
            var stackSave = Module["stackSave"] = function() {
                return (stackSave = Module["stackSave"] = Module["asm"]["pe"]).apply(null, arguments)
            };
            var stackRestore = Module["stackRestore"] = function() {
                return (stackRestore = Module["stackRestore"] = Module["asm"]["qe"]).apply(null, arguments)
            };
            var stackAlloc = Module["stackAlloc"] = function() {
                return (stackAlloc = Module["stackAlloc"] = Module["asm"]["re"]).apply(null, arguments)
            };
            var dynCall_iiji = Module["dynCall_iiji"] = function() {
                return (dynCall_iiji = Module["dynCall_iiji"] = Module["asm"]["se"]).apply(null, arguments)
            };
            var dynCall_iij = Module["dynCall_iij"] = function() {
                return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["te"]).apply(null, arguments)
            };
            var dynCall_ij = Module["dynCall_ij"] = function() {
                return (dynCall_ij = Module["dynCall_ij"] = Module["asm"]["ue"]).apply(null, arguments)
            };

            function invoke_iii(index, a1, a2) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_vi(index, a1) {
                var sp = stackSave();
                try {
                    getWasmTableEntry(index)(a1)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_ii(index, a1) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_viii(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    getWasmTableEntry(index)(a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiii(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_vii(index, a1, a2) {
                var sp = stackSave();
                try {
                    getWasmTableEntry(index)(a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_v(index) {
                var sp = stackSave();
                try {
                    getWasmTableEntry(index)()
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_i(index) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)()
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiii(index, a1, a2, a3, a4) {
                var sp = stackSave();
                try {
                    return getWasmTableEntry(index)(a1, a2, a3, a4)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiji(index, a1, a2, a3, a4) {
                var sp = stackSave();
                try {
                    return dynCall_iiji(index, a1, a2, a3, a4)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iij(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    return dynCall_iij(index, a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_ij(index, a1, a2) {
                var sp = stackSave();
                try {
                    return dynCall_ij(index, a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0) throw e;
                    _setThrew(1, 0)
                }
            }
            Module["UTF8ToString"] = UTF8ToString;
            Module["stringToUTF8"] = stringToUTF8;
            Module["lengthBytesUTF8"] = lengthBytesUTF8;
            Module["addRunDependency"] = addRunDependency;
            Module["removeRunDependency"] = removeRunDependency;
            Module["FS_createPath"] = FS.createPath;
            Module["FS_createDataFile"] = FS.createDataFile;
            Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
            Module["FS_createLazyFile"] = FS.createLazyFile;
            Module["FS_createDevice"] = FS.createDevice;
            Module["FS_unlink"] = FS.unlink;
            Module["cwrap"] = cwrap;
            Module["setValue"] = setValue;
            Module["getValue"] = getValue;
            Module["intArrayFromString"] = intArrayFromString;
            Module["FS"] = FS;
            Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
            Module["allocate"] = allocate;
            var calledRun;
            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || arguments_;
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    return
                }

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }
                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function() {
                        setTimeout(function() {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();

            function Prolog(module, args) {
                this.module = module;
                this.args = args;
                this.bindings = {};
                this._bind();
                this.objects = {};
                this.next_object_id = 0;
                this._initialise();
                this.PL_VARIABLE = 1;
                this.PL_ATOM = 2;
                this.PL_INTEGER = 3;
                this.PL_RATIONAL = 4;
                this.PL_FLOAT = 5;
                this.PL_STRING = 6;
                this.PL_TERM = 7;
                this.PL_NIL = 8;
                this.PL_BLOB = 9;
                this.PL_LIST_PAIR = 10;
                this.PL_FUNCTOR = 11;
                this.PL_LIST = 12;
                this.PL_CHARS = 13;
                this.PL_POINTER = 14;
                this.PL_CODE_LIST = 15;
                this.PL_CHAR_LIST = 16;
                this.PL_BOOL = 17;
                this.PL_FUNCTOR_CHARS = 18;
                this._PL_PREDICATE_INDICATOR = 19;
                this.PL_SHORT = 20;
                this.PL_INT = 21;
                this.PL_LONG = 22;
                this.PL_DOUBLE = 23;
                this.PL_NCHARS = 24;
                this.PL_UTF8_CHARS = 25;
                this.PL_UTF8_STRING = 26;
                this.PL_INT64 = 27;
                this.PL_NUTF8_CHARS = 28;
                this.PL_NUTF8_CODES = 29;
                this.PL_NUTF8_STRING = 30;
                this.PL_NWCHARS = 31;
                this.PL_NWCODES = 32;
                this.PL_NWSTRING = 33;
                this.PL_MBCHARS = 34;
                this.PL_MBCODES = 35;
                this.PL_MBSTRING = 36;
                this.PL_INTPTR = 37;
                this.PL_CHAR = 38;
                this.PL_CODE = 39;
                this.PL_BYTE = 40;
                this.PL_PARTIAL_LIST = 41;
                this.PL_CYCLIC_TERM = 42;
                this.PL_NOT_A_LIST = 43;
                this.PL_DICT = 44;
                this.REP_ISO_LATIN_1 = 0;
                this.REP_UTF8 = 1048576;
                this.REP_MB = 2097152;
                this.REP_FN = this.REP_UTF8;
                this.CVT_ATOM = 1;
                this.CVT_STRING = 2;
                this.CVT_LIST = 4;
                this.CVT_INTEGER = 8;
                this.CVT_RATIONAL = 16;
                this.CVT_FLOAT = 32;
                this.CVT_VARIABLE = 64;
                this.CVT_NUMBER = this.CVT_INTEGER | this.CVT_RATIONAL | this.CVT_FLOAT;
                this.CVT_ATOMIC = this.CVT_NUMBER | this.CVT_ATOM | this.CVT_STRING;
                this.CVT_WRITE = 128;
                this.CVT_WRITE_CANONICAL = 256;
                this.CVT_WRITEQ = 512;
                this.CVT_ALL = this.CVT_ATOMIC | this.CVT_LIST;
                this.CVT_MASK = 4095;
                this.CVT_EXCEPTION = 4096;
                this.CVT_VARNOFAIL = 8192;
                this.BUF_DISCARDABLE = 0;
                this.BUF_STACK = 65536;
                this.BUF_MALLOC = 131072;
                this.BUF_ALLOW_STACK = 262144;
                this.PL_Q_NORMAL = 2;
                this.PL_Q_NODEBUG = 4;
                this.PL_Q_CATCH_EXCEPTION = 8;
                this.PL_Q_PASS_EXCEPTION = 16;
                this.PL_Q_ALLOW_YIELD = 32;
                this.PL_Q_EXT_STATUS = 64;
                this.PL_S_EXCEPTION = -1;
                this.PL_S_FALSE = 0;
                this.PL_S_TRUE = 1;
                this.PL_S_LAST = 2;
                this.PL_S_YIELD = 255;
                this.PL_WRT_QUOTED = 1;
                this.PL_WRT_NEWLINE = 8192
            }
            Prolog.prototype._bind = function() {
                this.bindings._PL_streams = this.module.cwrap("_PL_streams", "number", []);
                this.bindings.PL_atom_chars = this.module.cwrap("PL_atom_chars", "number", ["number"]);
                this.bindings.PL_functor_arity = this.module.cwrap("PL_functor_arity", "number", ["number"]);
                this.bindings.PL_functor_name = this.module.cwrap("PL_functor_name", "number", ["number"]);
                this.bindings.PL_get_functor = this.module.cwrap("PL_get_functor", "number", ["number", "number"]);
                this.bindings.PL_get_chars = this.module.cwrap("PL_get_chars", "number", ["number", "number", "number"]);
                this.bindings.PL_get_arg = this.module.cwrap("PL_get_arg", "number", ["number", "number", "number"]);
                this.bindings.PL_get_integer = this.module.cwrap("PL_get_integer", "number", ["number", "number"]);
                this.bindings.PL_get_int64 = this.module.cwrap("PL_get_int64", "number", ["number", "number"]);
                this.bindings.PL_get_float = this.module.cwrap("PL_get_float", "number", ["number", "number"]);
                this.bindings.PL_put_chars = this.module.cwrap("PL_put_chars", "number", ["number", "number", "number", "number"]);
                this.bindings.PL_put_atom = this.module.cwrap("PL_put_atom", "number", ["number"]);
                this.bindings.PL_put_variable = this.module.cwrap("PL_put_variable", "number", ["number"]);
                this.bindings.PL_unify = this.module.cwrap("PL_unify", "number", ["number", "number"]);
                this.bindings.PL_is_string = this.module.cwrap("PL_is_string", "number", ["number"]);
                this.bindings.PL_is_variable = this.module.cwrap("PL_is_variable", "number", ["number"]);
                this.bindings.PL_term_type = this.module.cwrap("PL_term_type", "number", ["number"]);
                this.bindings.PL_get_list = this.module.cwrap("PL_get_list", "number", ["number", "number", "number"]);
                this.bindings.PL_get_nil = this.module.cwrap("PL_get_nil", "number", ["number"]);
                this.bindings.PL_get_name_arity = this.module.cwrap("PL_get_name_arity", "number", ["number", "number", "number"]);
                this.bindings.PL_initialise = this.module.cwrap("PL_initialise", "number", ["number", "number"]);
                this.bindings.PL_new_atom = this.module.cwrap("PL_new_atom", "number", ["string"]);
                this.bindings.PL_register_atom = this.module.cwrap("PL_register_atom", null, ["number"]);
                this.bindings.PL_unregister_atom = this.module.cwrap("PL_unregister_atom", null, ["number"]);
                this.bindings.PL_new_module = this.module.cwrap("PL_new_module", "number", ["number"]);
                this.bindings.PL_new_functor = this.module.cwrap("PL_new_functor", "number", ["number", "number"]);
                this.bindings.PL_new_term_ref = this.module.cwrap("PL_new_term_ref", "number", []);
                this.bindings.PL_new_term_refs = this.module.cwrap("PL_new_term_refs", "number", ["number"]);
                this.bindings.PL_copy_term_ref = this.module.cwrap("PL_copy_term_ref", "number", ["number"]);
                this.bindings.PL_reset_term_refs = this.module.cwrap("PL_reset_term_refs", null, ["number"]);
                this.bindings.PL_put_functor = this.module.cwrap("PL_put_functor", "number", ["number", "number"]);
                this.bindings.PL_put_integer = this.module.cwrap("PL_put_integer", "number", ["number", "number"]);
                this.bindings.PL_put_float = this.module.cwrap("PL_put_float", "number", ["number", "number"]);
                this.bindings.PL_put_nil = this.module.cwrap("PL_put_nil", "number", []);
                this.bindings.PL_cons_functor_v = this.module.cwrap("PL_cons_functor_v", "number", ["number", "number", "number"]);
                this.bindings.PL_cons_list = this.module.cwrap("PL_cons_list", "number", ["number", "number", "number"]);
                this.bindings.PL_put_dict = this.module.cwrap("PL_put_dict", "number", ["number", "number", "number", "number", "number"]);
                this.bindings.PL_put_term_from_chars = this.module.cwrap("PL_put_term_from_chars", "number", ["number", "number", "number", "string"]);
                this.bindings.PL_put_term = this.module.cwrap("PL_put_term", "number", ["number", "number"]);
                this.bindings.PL_write_term = this.module.cwrap("PL_write_term", "number", ["number", "number", "number", "number"]);
                this.bindings.PL_call = this.module.cwrap("PL_call", "number", ["number", "number"]);
                this.bindings.PL_unify_arg = this.module.cwrap("PL_unify_arg", "number", ["number", "number", "number"]);
                this.bindings.PL_open_foreign_frame = this.module.cwrap("PL_open_foreign_frame", "number", []);
                this.bindings.PL_close_foreign_frame = this.module.cwrap("PL_close_foreign_frame", "number", ["number"]);
                this.bindings.PL_discard_foreign_frame = this.module.cwrap("PL_close_foreign_frame", "number", ["number"]);
                this.bindings.PL_predicate = this.module.cwrap("PL_predicate", "number", ["number", "number", "number"]);
                this.bindings.PL_open_query = this.module.cwrap("PL_open_query", "number", ["number", "number", "number", "number"]);
                this.bindings.PL_next_solution = this.module.cwrap("PL_next_solution", "number", ["number"]);
                this.bindings.PL_close_query = this.module.cwrap("PL_close_query", "number", ["number"]);
                this.bindings.PL_cut_query = this.module.cwrap("PL_cut_query", "number", ["number"]);
                this.bindings.PL_exception = this.module.cwrap("PL_exception", "number", ["number"]);
                this.bindings.WASM_ttymode = this.module.cwrap("WASM_ttymode", "number", []);
                this.bindings.WASM_yield_request = this.module.cwrap("WASM_yield_request", "number", []);
                this.bindings.WASM_set_yield_result = this.module.cwrap("WASM_set_yield_result", "number", ["number"]);
                this.bindings.WASM_variable_id = this.module.cwrap("WASM_variable_id", "number", ["number"]);
                this.bindings.js_unify_obj = this.module.cwrap("js_unify_obj", "number", ["number", "number"]);
                this.bindings.js_get_obj = this.module.cwrap("js_get_obj", "number", ["number"])
            };
            Prolog.prototype._initialise = function() {
                this.functor_arg_names_ = {};
                let argv0 = this.args || [];
                argv0.unshift("swipl");
                let argv = argv0.map(function(arg) {
                    return this.module.allocate(this.module.intArrayFromString(arg), "i8", this.module.ALLOC_NORMAL)
                }, this);
                var ptr = this.module._malloc(argv.length * 4);
                argv.forEach(function(arg, i) {
                    this.module.setValue(ptr + i * 4, arg, "*")
                }, this);
                if (!this.bindings.PL_initialise(argv.length, ptr)) {
                    throw new Error("SWI-Prolog initialisation failed.")
                }
                this.call("set_prolog_flag(color_term, false).")
            };
            Prolog.prototype.call = function(goal, opts) {
                opts = opts || {};
                if (typeof goal === "string") {
                    return this.with_frame(function() {
                        const term = this.new_term_ref();
                        if (!this.chars_to_term(goal, term)) throw new Error("Query has a syntax error: " + query);
                        if (!opts.async) {
                            const module = opts.module ? this.new_module(opts.module) : 0;
                            return !!this.bindings.PL_call(term, module)
                        } else {
                            return this.call_yieldable(term, opts.module)
                        }
                    })
                }
            };
            Prolog.prototype.with_frame = function(f, persist) {
                const fid = this.bindings.PL_open_foreign_frame();
                if (fid) {
                    const rc = f.call(this);
                    if (persist === false) this.bindings.PL_discard_foreign_frame(fid);
                    else this.bindings.PL_close_foreign_frame(fid);
                    return rc
                }
                return false
            };
            Prolog.prototype.string_to_c = function(string) {
                const len = this.module.lengthBytesUTF8(string);
                const ptr = this.module._malloc(len + 1);
                this.module.stringToUTF8(string, ptr, len + 1);
                return {
                    ptr: ptr,
                    length: len
                }
            };
            Prolog.prototype.predicate = function(name, arity, module) {
                if (arity === undefined) {
                    let ar = /^([^:]+):(.*)\/([0-9]+)$/.exec(name);
                    if (ar) {
                        module = ar[1];
                        name = ar[2];
                        arity = parseInt(ar[3])
                    } else {
                        ar = /(.*)\/([0-9]+)$/.exec(name);
                        if (ar) {
                            name = ar[1];
                            arity = parseInt(ar[2])
                        }
                    }
                    if (arity === undefined) throw `Prolog.predicate: illegal specification: ${name}`
                }
                const c_name = allocateUTF8(name);
                const c_module = allocateUTF8(module || "user");
                const pred = this.bindings.PL_predicate(c_name, arity, c_module);
                this.module._free(c_name);
                this.module._free(c_module);
                return pred
            };
            Prolog.prototype.new_module = function(name) {
                const c_atom = this.new_atom(name);
                const module = this.bindings.PL_new_module(c_atom);
                this.unregister_atom(c_atom);
                return module
            };
            Prolog.prototype.consult = function(...args) {
                const prolog = this;

                function consult_one(url) {
                    let file = "/tmp/" + url.replace(/\//, "+");
                    return fetch(url).then(response => response.text()).then(text => {
                        console.log(`Downloaded ${url} to ${file}`);
                        Module.FS.writeFile(file, text);
                        prolog.call(`consult('${file}')`)
                    })
                }
                if (args.length == 1) return consult_one(args[0]);
                else return Promise.all(args.map(url => consult_one(url)))
            };
            Prolog.prototype.message_to_string = function(term) {
                return this.with_frame(() => {
                    const av = this.new_term_ref(2);
                    this.bindings.PL_put_term(av + 0, term);
                    const flags = this.PL_Q_NORMAL;
                    const pred = this.predicate("message_to_string/2");
                    const qid = this.bindings.PL_open_query(0, flags, pred, av);
                    let msg;
                    if (this.bindings.PL_next_solution(qid)) msg = this.get_chars(av + 1);
                    else msg = "Unknown Prolog exception";
                    this.bindings.PL_close_query(qid);
                    return msg
                }, false)
            };
            class Query {
                constructor(prolog, module, flags, pred, argv, map) {
                    module = module ? prolog.new_module(module) : 0;
                    if (typeof pred === "string") pred = prolog.predicate(pred);
                    flags |= prolog.PL_Q_EXT_STATUS;
                    if (!(flags & (prolog.PL_Q_CATCH_EXCEPTION | prolog.PL_Q_PASS_EXCEPTION | prolog.PL_Q_NORMAL))) flags |= prolog.PL_Q_CATCH_EXCEPTION;
                    this.flags = flags;
                    this.prolog = prolog;
                    this.map = map;
                    this.qid = prolog.bindings.PL_open_query(module, flags, pred, argv);
                    this.open = true;
                    this.argv = argv
                } [Symbol.iterator]() {
                    return this
                }
                next() {
                    if (!this.open) return {
                        done: true
                    };
                    const prolog = this.prolog;
                    const argv = this.argv;
                    switch (prolog.bindings.PL_next_solution(this.qid)) {
                        case prolog.PL_S_EXCEPTION: {
                            if (this.flags & prolog.PL_Q_NORMAL) {
                                this.close();
                                return {
                                    done: true,
                                    error: true
                                }
                            } else {
                                const msg = prolog.message_to_string(prolog.bindings.PL_exception(this.qid));
                                console.log(msg);
                                this.close();
                                return {
                                    done: true,
                                    error: true,
                                    message: msg
                                }
                            }
                        }
                        case prolog.PL_S_FALSE:
                            this.close();
                            return {
                                done: true
                            };
                        case prolog.PL_S_LAST:
                            this.close();
                        case prolog.PL_S_TRUE:
                            return {
                                done: false, value: this.map ? this.map.call(this, argv) : argv
                            };
                        case prolog.PL_S_YIELD: {
                            let request = prolog.yield_request();
                            if (request.charAt(0) == "{") request = JSON.parse(request);
                            return {
                                done: false,
                                value: null,
                                yield: request,
                                resume: value => {
                                    prolog.set_yield_result(value);
                                    return this.next()
                                }
                            }
                        }
                    }
                }
                once() {
                    const rc = this.next();
                    this.close();
                    return rc.value ? rc.value : rc
                }
                close() {
                    if (this.open) {
                        this.prolog.bindings.PL_cut_query(this.qid);
                        if (this.frame) this.prolog.bindings.PL_discard_foreign_frame(this.frame);
                        this.open = false
                    }
                }
            }
            Prolog.prototype.query = function(module, flags, pred, argv, map) {
                if (typeof argv === "number") {
                    return new Query(this, module, flags, pred, argv, map)
                } else if (typeof module === "string" && pred === undefined) {
                    const goal = module;
                    const fid = this.bindings.PL_open_foreign_frame();
                    const av = this.new_term_ref(3);
                    const input = flags || {};
                    this.frame = fid;
                    this.put_chars(av + 0, goal);
                    this.toProlog(input, av + 1);
                    return new Query(this, 0, this.PL_Q_NORMAL, "wasm_call_string/3", av, a => this.toJSON(a + 2))
                }
            };
            Prolog.prototype.stream = function(name) {
                const iob = this.bindings._PL_streams();
                let offset = undefined;
                switch (name) {
                    case "user_input":
                        offset = 0;
                        break;
                    case "user_output":
                        offset = 1;
                        break;
                    case "user_error":
                        offset = 2;
                        break;
                    default:
                        throw `Unknown stream ${name}`
                }
                return this.module.getValue(iob + offset * 4, "i32")
            };
            Prolog.prototype.write = function(term, opts) {
                opts = opts || {};
                const precedence = opts.precedence || 1200;
                const flags = opts.flags == undefined ? this.PL_WRT_QUOTED | this.PL_WRT_NEWLINE : flags;
                let s = undefined;
                if (opts.stream) {
                    if (typeof stream === "string") s = this.stream(opts.stream)
                } else {
                    s = this.stream("user_output")
                }
                return this.bindings.PL_write_term(s, term, precedence, flags)
            };
            Prolog.prototype.functor_arity = function(functor) {
                return this.bindings.PL_functor_arity(functor)
            };
            Prolog.prototype.functor_name = function(functor) {
                return this.bindings.PL_functor_name(functor)
            };
            Prolog.prototype.get_functor = function(term) {
                const ptr = this.module._malloc(4);
                let result;
                if (this.bindings.PL_get_functor(term, ptr)) result = this.module.getValue(ptr, "i32");
                else result = null;
                this.module._free(ptr);
                return result
            };
            Prolog.prototype.get_integer = function(term) {
                const ptr = this.module._malloc(8);
                let rc;
                if (this.bindings.PL_get_int64(term, ptr)) {
                    rc = this.module.getValue(ptr, "i64")
                } else {
                    rc = null
                }
                this.module._free(ptr);
                return rc
            };
            Prolog.prototype.get_float = function(term) {
                const ptr = this.module._malloc(8);
                let rc;
                if (this.bindings.PL_get_float(term, ptr)) {
                    rc = this.module.getValue(ptr, "double")
                } else {
                    rc = null
                }
                this.module._free(ptr);
                return rc
            };
            Prolog.prototype.put_chars = function(term, string, flags) {
                flags = flags || this.PL_STRING;
                flags |= this.REP_UTF8;
                const c = this.string_to_c(string);
                const ret = !!this.bindings.PL_put_chars(term, flags, c.length, c.ptr);
                this.module._free(c.ptr);
                return ret
            };
            Prolog.prototype.unify = function(term1, term2) {
                return !!this.bindings.PL_unify(term1, term2)
            };
            Prolog.prototype.is_string = function(term) {
                return !!this.bindings.PL_is_string(term)
            };
            Prolog.prototype.is_variable = function(term) {
                return !!this.bindings.PL_is_variable(term)
            };
            Prolog.prototype.atom_chars = function(atom) {
                const t = this.new_term_ref();
                this.bindings.PL_put_atom(t, atom);
                const str = this.get_chars(t, this.CVT_ATOM);
                this.bindings.PL_reset_term_refs(t);
                return str
            };
            Prolog.prototype.ttymode = function() {
                return this.module.UTF8ToString(this.bindings.WASM_ttymode())
            };
            Prolog.prototype.yield_request = function() {
                return this.module.UTF8ToString(this.bindings.WASM_yield_request())
            };
            Prolog.prototype.set_yield_result = function(string) {
                const c_str = allocateUTF8(string);
                this.bindings.WASM_set_yield_result(c_str);
                this.module._free(c_str)
            };
            let lastyieldat = 0;
            Prolog.prototype.call_yieldable = function(term, module) {
                var pred_call1;
                const flags = this.PL_Q_NORMAL | this.PL_Q_ALLOW_YIELD;
                if (!pred_call1) pred_call1 = this.predicate("call", 1, "system");
                const q = this.query(module, flags, pred_call1, term);

                function next(prolog) {
                    while (true) {
                        let rc = q.next();
                        if (rc.yield !== undefined) {
                            let request = rc.yield;
                            if (request == "beat") {
                                const now = Date.now();
                                if (now - lastyieldat < 20) {
                                    prolog.set_yield_result("true");
                                    continue
                                }
                                lastyieldat = now
                            } else {
                                if (request.command == "sleep") {
                                    let result = {
                                        yield: "builtin",
                                        request: request,
                                        query: q,
                                        resume: cont => {
                                            if (typeof cont === "string") {
                                                prolog.set_yield_result(cont);
                                                return next(prolog)
                                            } else {
                                                result.cont = cont;
                                                result.timer = setTimeout(() => {
                                                    prolog.set_yield_result("true");
                                                    cont.call(prolog, next(prolog))
                                                }, request.time * 1e3)
                                            }
                                        },
                                        abort: () => {
                                            if (result.timer) {
                                                clearTimeout(result.timer);
                                                prolog.set_yield_result("wasm_abort");
                                                result.cont.call(prolog, next(prolog))
                                            }
                                        }
                                    };
                                    return result
                                }
                            }
                        }
                        return rc
                    }
                }
                return next(this)
            };
            Prolog.prototype.set_arg_names = function(name, args) {
                if (!this.functor_arg_names_[name]) this.functor_arg_names_[name] = {};
                this.functor_arg_names_[name][args.length] = args
            };
            Prolog.prototype.arg_names = function(name, arity) {
                if (this.functor_arg_names_[name]) return this.functor_arg_names_[name][arity]
            };

            function toJSON(prolog, term, options) {
                switch (prolog.bindings.PL_term_type(term)) {
                    case prolog.PL_VARIABLE:
                        return {
                            $v: "v", v: prolog.bindings.WASM_variable_id(term)
                        };
                    case prolog.PL_STRING:
                        if (options.string !== "string") return {
                            $t: "s",
                            v: prolog.get_chars(term)
                        };
                    case prolog.PL_ATOM:
                        return prolog.get_chars(term);
                    case prolog.PL_NIL:
                        return [];
                    case prolog.PL_BLOB: {
                        const id = prolog.bindings.js_get_obj(term);
                        if (id != -1) return prolog.objects[id];
                        return {
                            "$t": "b"
                        }
                    }
                    case prolog.PL_INTEGER:
                        return prolog.get_integer(term);
                    case prolog.PL_RATIONAL: {
                        let s = prolog.get_chars(term, this.CVT_RATIONAL);
                        let a = s.split("r");
                        return {
                            "$t": "r",
                            v: {
                                n: parseInt(a[0]),
                                d: parseInt(a[1])
                            },
                            s: s
                        }
                    }
                    case prolog.PL_FLOAT:
                        return prolog.get_float(term);
                    case prolog.PL_TERM: {
                        const f = prolog.get_functor(term);
                        const name = prolog.atom_chars(prolog.functor_name(f));
                        const arity = prolog.functor_arity(f);
                        const map = prolog.arg_names(name, arity);
                        const a = prolog.new_term_ref();
                        if (map) {
                            let result = {
                                $tag: name
                            };
                            for (var i = 0; i < arity; i++) {
                                prolog.get_arg(i + 1, term, a);
                                result[map[i]] = toJSON(prolog, a, options)
                            }
                            return result
                        } else {
                            const args = [];
                            let result = {
                                $t: "t"
                            };
                            for (var i = 1; i <= arity; i++) {
                                prolog.get_arg(i, term, a);
                                args.push(toJSON(prolog, a, options))
                            }
                            result[name] = args;
                            return result
                        }
                    }
                    case prolog.PL_LIST_PAIR: {
                        let result = [];
                        const h = prolog.bindings.PL_new_term_ref();
                        const t = prolog.bindings.PL_copy_term_ref(term);
                        while (prolog.bindings.PL_get_list(t, h, t)) {
                            result.push(toJSON(prolog, h, options))
                        }
                        if (prolog.bindings.PL_get_nil(t)) return result;
                        return {
                            "$t": "partial",
                            v: result,
                            t: toJSON(prolog, t, options)
                        }
                    }
                    case prolog.PL_DICT: {
                        let result = {};
                        let a = prolog.new_term_ref();
                        prolog.get_arg(1, term, a);
                        if (!prolog.is_variable(a)) result["$tag"] = toJSON(prolog, a, options);
                        for (var i = 2;; i += 2) {
                            if (prolog.get_arg(i + 1, term, a)) {
                                let key = toJSON(prolog, a, options);
                                prolog.get_arg(i, term, a);
                                result[key] = toJSON(prolog, a, options)
                            } else break
                        }
                        return result
                    }
                    default:
                        return undefined
                }
            }
            Prolog.prototype.toJSON = function(term, options) {
                options = options || {};
                return toJSON(this, term, options)
            };

            function toProlog(prolog, data, term, ctx) {
                term = term || prolog.new_term_ref();
                let rc;
                switch (typeof data) {
                    case "number":
                        if (Number.isInteger(data)) rc = prolog.bindings.PL_put_integer(term, data);
                        else rc = prolog.bindings.PL_put_float(term, data);
                        break;
                    case "string":
                        rc = prolog.put_chars(term, data, prolog.PL_ATOM);
                        break;
                    case "boolean":
                        rc = prolog.put_chars(term, data ? "true" : "false", prolog.PL_ATOM);
                        break;
                    case "undefined":
                        rc = prolog.put_chars(term, "undefined", prolog.PL_ATOM);
                        break;
                    case "object":
                        if (data === null) {
                            rc = prolog.put_chars(term, "null", prolog.PL_ATOM)
                        } else if (Array.isArray(data)) {
                            let h = prolog.new_term_ref();
                            prolog.bindings.PL_put_nil(term);
                            for (var i = data.length - 1; i >= 0; i--) {
                                toProlog(prolog, data[i], h, ctx);
                                prolog.bindings.PL_cons_list(term, h, term)
                            }
                        } else if (data.$t) {
                            switch (data.$t) {
                                case "s":
                                    rc = prolog.put_chars(term, data.v, prolog.PL_STRING);
                                    break;
                                case "t": {
                                    const keys = Object.keys(data);
                                    let args;
                                    let name;
                                    for (var i = 0; i < keys.length; i++) {
                                        if (Array.isArray(data[keys[i]])) {
                                            if (args === undefined) {
                                                name = keys[i];
                                                args = data[name]
                                            } else console.log('Object with .$t:"t" is ambiguous', data)
                                        }
                                    }
                                    if (args !== undefined) {
                                        const av = prolog.new_term_ref(args.length);
                                        const f = prolog.new_functor(prolog.new_atom(name), args.length);
                                        for (var i = 0; i < args.length; i++) toProlog(prolog, args[i], av + i, ctx);
                                        rc = prolog.bindings.PL_cons_functor_v(term, f, av)
                                    }
                                    break
                                }
                                case "v": {
                                    rc = prolog.bindings.PL_put_variable(term);
                                    if (data.v) {
                                        if (!ctx.vars) ctx.vars = {};
                                        if (ctx.vars[data.v]) {
                                            rc = prolog.bindings.PL_put_variable(term) && prolog.unify(term, ctx.vars[data.v])
                                        } else {
                                            ctx.vars[data.v] = prolog.bindings.PL_copy_term_ref(term)
                                        }
                                    }
                                    break
                                }
                            }
                        } else if (data.nodeType !== undefined) {
                            let id = data.prologId;
                            if (id === undefined) {
                                id = prolog.next_object_id + 1;
                                rc = prolog.bindings.js_unify_obj(term, id);
                                if (rc) {
                                    data.prologId = id;
                                    prolog.objects[id] = data;
                                    prolog.next_object_id = id
                                }
                            } else {
                                rc = prolog.bindings.js_unify_obj(term, id)
                            }
                        } else {
                            const keys = Object.keys(data);
                            const len = keys.length;
                            const av = prolog.new_term_ref(len);
                            const atoms = prolog.module._malloc(4 * len);
                            const tag = prolog.new_atom("js");
                            for (var i = 0; i < len; i++) {
                                toProlog(prolog, data[keys[i]], av + i, ctx);
                                prolog.module.setValue(atoms + 4 * i, prolog.new_atom(keys[i]), "i32")
                            }
                            rc = prolog.bindings.PL_put_dict(term, tag, len, atoms, av);
                            prolog.module._free(atoms)
                        }
                        break;
                    default:
                        return null
                }
                return rc ? term : null
            }
            Prolog.prototype.toProlog = function(data, term, ctx) {
                ctx = ctx || {};
                return toProlog(this, data, term, ctx)
            };
            Prolog.prototype.chars_to_term = function(string, t) {
                return this.bindings.PL_put_term_from_chars(t, this.REP_UTF8, -1, string)
            };
            Prolog.prototype.get_chars = function(term, flags) {
                const ptr = this.module._malloc(4);
                let rc;
                flags = flags || this.CVT_ALL | this.CVT_WRITEQ;
                flags |= this.CVT_EXCEPTION | this.REP_UTF8;
                if (this.bindings.PL_get_chars(term, ptr, flags)) {
                    rc = this.module.UTF8ToString(this.module.getValue(ptr, "i32"))
                } else {
                    rc = null
                }
                this.module._free(ptr);
                return rc
            };
            Prolog.prototype.get_arg = function(index, term, arg) {
                return this.bindings.PL_get_arg(index, term, arg)
            };
            Prolog.prototype.new_atom = function(string) {
                return this.bindings.PL_new_atom(string)
            };
            Prolog.prototype.register_atom = function(atom) {
                this.bindings.PL_register_atom(atom);
                return atom
            };
            Prolog.prototype.unregister_atom = function(atom) {
                this.bindings.PL_unregister_atom(atom)
            };
            Prolog.prototype.new_functor = function(atom, arity) {
                return this.bindings.PL_new_functor(atom, arity)
            };
            Prolog.prototype.new_term_ref = function(count) {
                return count === undefined ? this.bindings.PL_new_term_ref() : this.bindings.PL_new_term_refs(count)
            };
            Prolog.prototype.put_functor = function(term, functor) {
                return this.bindings.PL_put_functor(term, functor)
            };
            Prolog.prototype.unify_arg = function(index, term, arg) {
                return this.bindings.PL_unify_arg(index, term, arg)
            };
            Module.onRuntimeInitialized = function() {
                Module.prolog = new Prolog(Module, Module.arguments)
            };

            function prolog_js_call(request, result) {
                const prolog = Module.prolog;

                function eval_chain(ar, obj) {
                    obj = obj || window;

                    function eval_one(obj, fname, args) {
                        if (args.length == 1) {
                            switch (fname) {
                                case "-":
                                    return -args[0];
                                case "!":
                                    return !args[0]
                            }
                        } else if (args.length == 2) {
                            switch (fname) {
                                case "+":
                                    return args[0] + args[1];
                                case "-":
                                    return args[0] - args[1];
                                case "*":
                                    return args[0] * args[1];
                                case "/":
                                    return args[0] / args[1];
                                case "&":
                                    return args[0] & args[1];
                                case "|":
                                    return args[0] | args[1]
                            }
                        }
                        const func = obj[fname];
                        if (func) return func.apply(obj, args);
                        else console.log("ERROR: Function", fname, "is not defined on", obj)
                    }
                    for (let i = 0; i < ar.length; i++) {
                        const next = ar[i];
                        if (typeof next === "string") {
                            obj = obj[next]
                        } else if (next.v !== undefined) {
                            obj = next.v
                        } else {
                            const args = next.args.map(v => eval_chain(v));
                            obj = eval_one(obj, next.f, args)
                        }
                    }
                    return obj
                }
                return prolog.with_frame(() => {
                    const ar = prolog.toJSON(request, {
                        string: "string"
                    });
                    let obj;
                    if (ar.setter) {
                        const target = eval_chain(ar.target);
                        const value = eval_chain(ar.value);
                        target[ar.setter] = value;
                        obj = true
                    } else {
                        obj = eval_chain(ar)
                    }
                    return prolog.bindings.PL_unify(result, prolog.toProlog(obj))
                }, false)
            }

            function release_registered_object(id) {
                const prolog = Module.prolog;
                const obj = prolog.object[id];
                delete obj.prologId;
                delete prolog.object[id]
            }
            window.js_add_script = function(text, opts) {
                opts = opts || {};
                let node;
                if (opts.id) {
                    if (node = document.getElementById(opts.id)) {
                        node.textContent = text
                    } else {
                        node = document.createElement("script");
                        node.id = opts.id;
                        node.textContent = text;
                        document.body.appendChild(node)
                    }
                } else {
                    node = document.createElement("script");
                    node.textContent = text;
                    document.body.appendChild(node)
                }
            };


            return SWIPL.ready
        }
    );
})();
if (typeof exports === 'object' && typeof module === 'object')
    module.exports = SWIPL;
else if (typeof define === 'function' && define['amd'])
    define([], function() {
        return SWIPL;
    });
else if (typeof exports === 'object')
    exports["SWIPL"] = SWIPL;