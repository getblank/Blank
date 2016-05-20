"use strict";

module.exports = {
    "systemHealth": {
        "display": "table",
        "navOrder": 200,
        "navGroup": "config",
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            "dateTime": {
                "type": "date",
                "label": "DateTime",
                "display": "text"
            },
            "type": {
                "type": "int",
                "display": "none",
                "label": "",
                "formOrder": 0,
                "options": [{ "label": "Realtime", "value": "0" }, { "label": "Minutly", "value": "1" }, { "label": "Hourly", "value": "2" }, { "label": "Dayly", "value": "3" }, { "label": "Monthly", "value": "4" }]
            },
            "totalMemory": {
                "type": "int",
                "display": "text",
                "label": "Memory Total",
                "formOrder": 10
            },
            "availableMemory": {
                "type": "int",
                "display": "text",
                "label": "Memory Available",
                "formOrder": 20
            },
            "usedMemory": {
                "type": "int",
                "display": "text",
                "label": "Memory Used",
                "formOrder": 30
            },
            "usedPercentMemory": {
                "type": "float",
                "display": "text",
                "label": "Memory Used Percent",
                "formOrder": 32
            },
            "alloc": {
                "type": "int",
                "display": "text",
                "label": "Bytes allocated",
                "formOrder": 36
            },
            "sys": {
                "type": "int",
                "display": "text",
                "label": "Bytes obtained from system",
                "formOrder": 36
            },
            "cpu": {
                "type": "objectList",
                "label": "CPU Usage",
                "formOrder": 20,
                "props": {
                    "coreNo": {
                        "type": "int",
                        "display": "text",
                        "label": "Core #",
                        "formOrder": 10
                    },
                    "usage": {
                        "type": "float",
                        "display": "text",
                        "label": "Usage",
                        "formOrder": 20
                    }
                }
            },
            "disk": {
                "type": "objectList",
                "label": "Disk Usage",
                "formOrder": 30,
                "props": {
                    "path": {
                        "type": "string",
                        "display": "text",
                        "label": "Path",
                        "formOrder": 10
                    },
                    "fsType": {
                        "type": "string",
                        "display": "text",
                        "label": "FS Type",
                        "formOrder": 20
                    },
                    "total": {
                        "type": "int",
                        "display": "text",
                        "label": "Total",
                        "formOrder": 30
                    },
                    "free": {
                        "type": "int",
                        "display": "text",
                        "label": "Free",
                        "formOrder": 40
                    },
                    "used": {
                        "type": "int",
                        "display": "text",
                        "label": "Used",
                        "formOrder": 50
                    },
                    "usedPercent": {
                        "type": "float",
                        "display": "text",
                        "label": "Used Percent",
                        "formOrder": 50
                    }
                }
            },
            "workers": {
                "type": "objectList",
                "label": "V8 workers health",
                "formOrder": 40,
                "props": {
                    "workerNo": {
                        "type": "int",
                        "display": "text",
                        "label": "Worker #",
                        "formOrder": 10
                    },
                    "totalHeapSize": {
                        "type": "int",
                        "display": "text",
                        "label": "Total Heap Size",
                        "formOrder": 20
                    },
                    "totalHeapSizeExecutable": {
                        "type": "int",
                        "display": "text",
                        "label": "Total Heap Size Executable",
                        "formOrder": 30
                    },
                    "totalPhysicalSize": {
                        "type": "int",
                        "display": "text",
                        "label": "Total Physical Size",
                        "formOrder": 40
                    },
                    "totalAvailableSize": {
                        "type": "int",
                        "display": "text",
                        "label": "Total Available Size",
                        "formOrder": 50
                    },
                    "usedHeapSize": {
                        "type": "int",
                        "display": "text",
                        "label": "Used Heap Size",
                        "formOrder": 60
                    },
                    "heapSizeLimit": {
                        "type": "int",
                        "display": "text",
                        "label": "Heap Size Limit",
                        "formOrder": 70
                    },
                    "mallocedMemory": {
                        "type": "int",
                        "display": "text",
                        "label": "mallocedMemory",
                        "formOrder": 80
                    },
                    "doesZapGarbage": {
                        "type": "int",
                        "display": "text",
                        "label": "Does Zap Garbage",
                        "formOrder": 90
                    }
                }
            }
        },
        "tableColumns": [{ "prop": "dateTime", "tableLink": true }, "totalMemory", "availableMemory", "usedMemory", "usedPercentMemory", "alloc", "sys"],

        "storeActions": [{
            "_id": "deleteAll",
            "label": "Delete all records",
            "type": "form",
            "formLabel": "Please confirm action!",
            "props": {
                "confirm": {
                    "label": " ",
                    "display": "textInput"
                },
                "foo": {
                    "display": "text",
                    "label": " ",
                    "readOnly": true,
                    "default": "Enter text \"Yes, delete all!\"",
                    "style": {
                        "userSelect": "none",
                        "MozUserSelect": "none",
                        "WebkitUserSelect": "none"
                    }
                }
            },
            "script": function ($db, $data) {
                if ($data.confirm !== "Yes, delete all!") {
                    return "Not confirmed";
                }
                return $db.deleteAllSync('systemHealth');
            },
            "access": [{
                "role": "root",
                "permissions": "rud"
            }]
        }],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "access": [{
            "role": "root",
            "permissions": "rud"
        }],
        // "tasks": [
        //     {
        //         "schedule": "0  *   *   *   *   *",
        //         "script": function ($db) {
        //             var sum = function (type) {
        //                 $db.find({ query: { "type": type }, take: 1000 }, "systemHealth", (e, stat) => {
        //                     if (e) {
        //                         return console.error("Can't get stat")
        //                     }
        //                     if (stat.fullCount === 0) {
        //                         return
        //                     }
        //                     console.info(`Will reduce ${stat.fullCount} items`);
        //                     let statSum = {
        //                         "dateTime": new Date(),
        //                         "type": type + 1,
        //                     };
        //                     let cpus = {};
        //                     let disks = {};
        //                     let workers = {};
        //                     let totalMemory = 0;
        //                     let availableMemory = 0;
        //                     let usedMemory = 0;
        //                     let usedPercentMemory = 0;
        //                     for (let item of stat.items) {
        //                         totalMemory += item.totalMemory ? item.totalMemory : 0;
        //                         availableMemory += item.availableMemory ? item.availableMemory : 0;
        //                         usedMemory += item.usedMemory ? item.usedMemory : 0;
        //                         usedPercentMemory += item.usedPercentMemory ? item.usedPercentMemory : 0;

        //                         if (Array.isArray(item.cpu)) {
        //                             for (let cpu of item.cpu) {
        //                                 let core = cpus[cpu.coreNo] || {
        //                                     coreNo: cpu.coreNo,
        //                                     usage: 0
        //                                 };
        //                                 core.usage += cpu.usage ? cpu.usage : 0;
        //                                 cpus[cpu.coreNo] = core;
        //                             }
        //                         }

        //                         if (Array.isArray(item.disk)) {
        //                             for (let diskUsage of item.disk) {
        //                                 let disk = disks[diskUsage.path] || {
        //                                     path: diskUsage.path,
        //                                     fsType: diskUsage.fsType,
        //                                     total: diskUsage.total,
        //                                     free: 0,
        //                                     used: 0,
        //                                     usedPercent: 0,
        //                                 };
        //                                 disk.free += disk.free ? disk.free : 0;
        //                                 disk.used += disk.used ? disk.used : 0;
        //                                 disk.usedPercent += disk.usedPercent ? disk.usedPercent : 0;
        //                                 disks[diskUsage.path] = disk;
        //                             }
        //                         }

        //                         if (Array.isArray(item.workers)) {
        //                             for (let workerUsage of item.workers) {
        //                                 let worker = workers[workerUsage.workerNo] || {
        //                                     workerNo: workerUsage.workerNo,
        //                                     totalHeapSize: 0,
        //                                     totalHeapSizeExecutable: 0,
        //                                     totalPhysicalSize: 0,
        //                                     totalAvailableSize: 0,
        //                                     usedHeapSize: 0,
        //                                     heapSizeLimit: 0,
        //                                     mallocedMemory: 0,
        //                                     doesZapGarbage: 0,
        //                                 };
        //                                 worker.totalHeapSize += workerUsage.totalHeapSize ? workerUsage.totalHeapSize : 0;
        //                                 worker.totalHeapSizeExecutable += workerUsage.totalHeapSizeExecutable ? workerUsage.totalHeapSizeExecutable : 0;
        //                                 worker.totalPhysicalSize += workerUsage.totalPhysicalSize ? workerUsage.totalPhysicalSize : 0;
        //                                 worker.totalAvailableSize += workerUsage.totalAvailableSize ? workerUsage.totalAvailableSize : 0;
        //                                 worker.usedHeapSize += workerUsage.usedHeapSize ? workerUsage.usedHeapSize : 0;
        //                                 worker.heapSizeLimit += workerUsage.heapSizeLimit ? workerUsage.heapSizeLimit : 0;
        //                                 worker.mallocedMemory += workerUsage.mallocedMemory ? workerUsage.mallocedMemory : 0;
        //                                 worker.doesZapGarbage += workerUsage.doesZapGarbage ? workerUsage.doesZapGarbage : 0;
        //                                 workers[workerUsage.workerNo] = worker;
        //                             }
        //                         }
        //                     }
        //                     statSum.totalMemory = totalMemory / stat.fullCount;
        //                     statSum.availableMemory = availableMemory / stat.fullCount;
        //                     statSum.usedMemory = usedMemory / stat.fullCount;
        //                     statSum.usedPercentMemory = usedPercentMemory / stat.fullCount;

        //                     let sum = [];
        //                     for (let key in cpus) {
        //                         let cpu = cpus[key];
        //                         cpu.usage = cpu.usage / stat.fullCount;
        //                         sum.push(cpu);
        //                     }
        //                     statSum.cpu = sum;

        //                     sum = [];
        //                     for (let key in disks) {
        //                         let disk = disks[key];
        //                         disk.free = disk.free / stat.fullCount;
        //                         disk.used = disk.used / stat.fullCount;
        //                         disk.usedPercent = disk.usedPercent / stat.fullCount;
        //                         sum.push(disk);
        //                     }
        //                     statSum.disk = sum;

        //                     sum = [];
        //                     for (let key in workers) {
        //                         let worker = workers[key];
        //                         worker.totalHeapSize = worker.totalHeapSize / stat.fullCount;
        //                         worker.totalHeapSizeExecutable = worker.totalHeapSizeExecutable / stat.fullCount;
        //                         worker.totalPhysicalSize = worker.totalPhysicalSize / stat.fullCount;
        //                         worker.totalAvailableSize = worker.totalAvailableSize / stat.fullCount;
        //                         worker.usedHeapSize = worker.usedHeapSize / stat.fullCount;
        //                         worker.heapSizeLimit = worker.heapSizeLimit / stat.fullCount;
        //                         worker.mallocedMemory = worker.mallocedMemory / stat.fullCount;
        //                         worker.doesZapGarbage = worker.doesZapGarbage / stat.fullCount;
        //                         sum.push(worker);
        //                     }
        //                     statSum.workers = sum;

        //                     $db.set(statSum, "systemHealth", { createId: true }, (e, res) => {
        //                         if (e) {
        //                             return console.error("Can't save sum statistic", e);
        //                         }
        //                         for (let item of stat.items) {
        //                             $db.deleteDocument(item._id, "systemHealth", e => {
        //                                 if (e) {
        //                                     return console.error(`Can't delete rotten systemHealth item ${item._id}. Error: ${e}`);
        //                                 }
        //                             });
        //                         }
        //                     });
        //                 });
        //             }
        //             sum(0);
        //             var now = new Date();
        //             if (now.getMinutes() === 0) {
        //                 sum(1);
        //             }
        //             if (now.getHours() === 0) {
        //                 sum(2);
        //             }
        //             if (now.getDate() === 1) {
        //                 sum(3);
        //             }
        //         }
        //     }
        // ],
        "i18n": {
            "storeLabel": "System Health"
        }
    }
};