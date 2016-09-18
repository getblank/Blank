/**
 * Created by kib357 on 18/02/16.
 */

module.exports = {
    "run": {
        "display": "list",
        "navOrder": 100,
        "navGroup": "config",
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            "name": {
                "type": "string",
                "label": "Script name",
                "default": "New script",
            },
            "code": {
                "type": "string",
                "display": "codeEditor",
                "formOrder": 10,
            },
            "run": {
                "type": "action",
                "actions": [
                    { "_id": "run" },
                ],
                "formOrder": 20,
            },
            "response": {
                "type": "string",
                "display": "code",
                "formOrder": 30,
            },
        },
        "actions": [
            {
                "_id": "run",
                "label": "Выполнить",
                "disableItemReadyCheck": true,
                "clientPreScript": function ($item) {
                    return {
                        "code": $item.code,
                    };
                },
                "script": function ($db, $data, $item) {
                    var f = new Function("$db", "$item", "require", $data.code);
                    var res = f($db, $item, require);
                    if (res instanceof Promise) {
                        return res.then(promiseRes => {
                            if (typeof promiseRes !== "string") {
                                promiseRes = JSON.stringify(promiseRes, "", "  ");
                            }
                            return $db.set("run", { "_id": $item._id, "response": promiseRes + "" });
                        }).catch(promiseErr => {
                            if (typeof promiseErr !== "string") {
                                promiseErr = JSON.stringify(promiseErr, "", "  ");
                            }
                            return $db.set("run", { "_id": $item._id, "response": "ERROR: " + promiseErr });
                        });
                    }
                    if (typeof res !== "string") {
                        res = JSON.stringify(res, "", "  ");
                    }
                    return $db.set("run", { "_id": $item._id, "response": res + "" });
                },
            },
        ],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Run JS",
        },
        "access": [
            { "role": "root", "permissions": "vcrudx" },
        ],
    },
};
