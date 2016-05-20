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
                "default": "New script"
            },
            "code": {
                "type": "string",
                "display": "codeEditor",
                "formOrder": 10
            },
            "run": {
                "type": "action",
                "actions": [{ "_id": "run" }],
                "formOrder": 20
            },
            "response": {
                "type": "string",
                "display": "code",
                "formOrder": 30
            }
        },
        "actions": [{
            "_id": "run",
            "label": "Выполнить",
            "script": function ($db, $item) {
                var f = new Function("$db", "$item", "require", $item.code);
                var res = f($db, $item, require);
                if (typeof res !== "string") {
                    res = JSON.stringify(res, "", "  ");
                }
                $db.setSync({ "_id": $item._id, "response": res + "" }, "run");
            }
        }],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Run JS"
        },
        "access": [{
            "role": "root",
            "permissions": "crud"
        }]
    }
};