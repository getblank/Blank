module.exports = {
    "dba": {
        "type": "single",
        "navGroup": "config",
        "navOrder": 110,
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            "key": {
                "type": "string",
                "label": "API Key",
                "display": "code",
                "hidden": "!$item.key"
            }
        },
        "access": [{
            "role": "root",
            "permissions": "crud"
        }],
        "actions": [{
            "_id": "download",
            "type": "http",
            "label": "{{$i18n.download}}",
            "script": function ($request, $response, $db) {
                var tmpFile = $db.newId();
                $db.backupSync(tmpFile);
                $response.file(tmpFile, new Date().toISOString() + ".db");
                require("fs").unlink(tmpFile, function (e) {
                    if (e) {
                        console.error("Can't remove file", tmpFile, e);
                    }
                });
            }
        }, {
            "_id": "setKey",
            "label": "{{$i18n.generateKey}}",
            "script": function ($db, $item) {
                return $db.setSync({ "_id": "dba", "key": $db.newId() }, "dba");
            }
        }],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [{
            "uri": "backup/:key",
            "method": "GET",
            "script": function ($request, $response, $db) {
                var key = $request.params["key"];
                if (!key || key === "") {
                    return $response.html(403, "No key provided");
                }
                var dba = $db.getSync("dba", "dba");
                if (!dba || dba.key !== key) {
                    return $response.html(403, "Access denied");
                }
                var tmpFile = $db.newId();
                $db.backupSync(tmpFile);
                $response.file(tmpFile, new Date().toISOString() + ".db");
                require("fs").unlink(tmpFile, function (e) {
                    if (e) {
                        console.error("Can't remove file", tmpFile, e);
                    }
                });
            }
        }],
        "tasks": [],
        "i18n": {
            "en": {
                "storeLabel": "DB administration",
                "generateKey": "Generate API Key",
                "download": "Download DB"
            },
            "ru": {
                "storeLabel": "Администрирование БД",
                "generateKey": "Сгенерировать API ключ",
                "download": "Скачать базу"
            }
        }
    }
};