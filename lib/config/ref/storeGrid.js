/**
 * Created by kib357 on 18/11/15.
 */

module.exports = {
    "gridStore": {
        "display": "grid",
        "navOrder": 0,
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            //Улицы и дороги
            "forwardRouteDesc": {
                "type": "objectList",
                "formTab": "main",
                "formGroup": "Улицы и автомобильные дороги",
                "formOrder": -10,
                "label": "В прямом направлении",
                "props": {
                    "number": {
                        "type": "virtual/client",
                        "display": "text",
                        "label": "№",
                        "formOrder": 0,
                        "style": { "flex": "0 0 15px", "marginRight": "7px", "paddingTop": "2px" },
                        "load": function ($index) {
                            return $index + 1;
                        }
                    },
                    "itemName": {
                        "type": "string",
                        "display": "textInput",
                        "label": "Наименование",
                        "formOrder": 10
                    },
                    "location": {
                        "type": "string",
                        "display": "textInput",
                        "label": "Местонахождение",
                        "formOrder": 20
                    }
                }
            },
            "defaultProp": {
                "type": "string",
                "display": "textInput"
            },
            "comments": {
                "type": "comments",
                "formOrder": 5,
                "hidden": [{
                    "property": "$state",
                    "operator": "==",
                    "value": "new"
                }]
            }
        },
        "storeActions": [{
            "_id": "import",
            "label": "Import data",
            "script": function ($db, $data) {
                //return 'Ololo: ' + JSON.stringify($data.file);
            },
            "type": "form",
            "props": {
                "aaa": {
                    "type": "string",
                    "display": "textInput",
                    "label": "Ololo"
                },
                "file": {
                    "type": "file",
                    "label": " ",
                    "store": "files"
                }
            }
        }],
        "actions": [{
            "_id": "notify",
            "label": "Send notification",
            "multi": false,
            "type": "http",
            "script": function ($db, $item) {
                var n = {
                    "message": "Hello",
                    "details": "I`m new notification from action",
                    "relatedObjects": [{
                        "name": $item.name,
                        "_id": $item._id,
                        "mode": "link",
                        "store": "gridStore"
                    }]
                };
                var e = $db.notifySync([$user._id], 'notifications', n);
                if (e != null) {
                    console.error("Error when notify", e);
                }
            }
        }],
        "objectLifeCycle": {
            "willSave": function () {
                console.log("Will save!");
            }
        },
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [{
            "uri": "hook",
            "method": "POST",
            "script": function () {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!&&&&&&&&&&&&&&&&&&&??????????????????????????????????");
                // $response.json(200, {"huy": "nahuy"})
            }
        }],
        "tasks": [],
        "i18n": {
            "storeLabel": "Grid view"
        }
    }
};