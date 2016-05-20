/**
 * Created by kib357 on 18/11/15.
 */

module.exports = {
    "storeList": {
        "display": "list",
        "navOrder": 0,
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "formTabs": ["Validation"],
        "formGroupsOrder": ["Required", "Min/max", "Min/max length", "Pattern", ""],
        "props": {
            "defaultProp": {
                "type": "string",
                "display": "textInput",
                "label": "Property label"
            },
            "actionProp": {
                "type": "action",
                "actions": [
                    {
                        "_id": "form",
                        "icon": "material-icons md-18 m-r-4 text format_paint",
                        "className": "btn-accent"
                    },
                    "notify"
                ]
                //"label": "Property label"
            },
            "requiredProp": {
                "type": "string",
                "display": "textInput",
                "label": "Required field",
                "formTab": "Validation",
                "formGroup": "Required",
                "required": true
            },
            "requiredPickerProp": {
                "type": "string",
                "display": "colorPicker",
                "label": "Required picker",
                "formTab": "Validation",
                "formGroup": "Required",
                "required": true
            },
            "minProp": {
                "type": "int",
                "display": "numberInput",
                "label": "Min 0",
                "min": 0,
                "formTab": "Validation",
                "formGroup": "Min/max",
            },
            "maxProp": {
                "type": "date",
                "display": "datePicker",
                "label": "Max now",
                "max": {
                    "expression": "new Date()",
                    "message": "пиши меньше {{$validatorValue}}, ебачие уши!!!!"
                },
                "formTab": "Validation",
                "formGroup": "Min/max",
            },
            "lengthProp": {
                "type": "string",
                "display": "textInput",
                "label": "Min length 10 max 60",
                "minLength": 10,
                "maxLength": 60,
                "formTab": "Validation",
                "formGroup": "Min/max length",
            },
            "minLengthProp": {
                "type": "string",
                "display": "textInput",
                "label": "Min length 10",
                "minLength": 10,
                "formTab": "Validation",
                "formGroup": "Min/max length",
            },
            "objectListProp": {
                "type": "objectList",
                "label": "Objects list",
                "singularLocal": "Object",
                "required": true,
                "formTab": "Validation",
                "default": [
                    {
                        "phoneNumber": "",
                        "managerName": "",
                        "enabled": true
                    }
                ],
                "props": {
                    "phoneNumber": {
                        "type": "string",
                        "display": "masked",
                        "label": "Phone",
                        "mask": "| (|||) |||-||-||",
                        "formOrder": 1,
                        "required": true
                    },
                    "managerName": {
                        "type": "string",
                        "display": "textInput",
                        "displayWidth": 20,
                        "formOrder": 2,
                        "label": "Name",
                        "placeHolder": "{{$i18n.managerNamePlaceholder}}"
                    },
                    "enabled": {
                        "type": "bool",
                        "label": "Enabled",
                        "display": "checkbox",
                        "displayWidth": 10,
                        "formOrder": 3,
                        "default": true
                    }
                }
            },
        },
        "storeActions": [
            {
                "_id": "create",
                "label": "create 10",
                "script": function ($db, $data) {
                    for (var i = 0; i < ($data.count || 10); i++) {
                        $db.insertSync({"name": "Item " + i});
                    }
                },
                "type": "form",
                "props": {
                    "count": {
                        "type": "int",
                        "display": "textInput"
                    }
                }
            },
            {

                "_id": "clear",
                "label": "Clear items",
                "script": function ($db) {
                    var keys = $db.getAllKeys();
                    for (var i = 0; i < keys.length; i++) {
                        $db.deleteSync(keys[i]);
                    }
                }
            },
            {
                "_id": "import",
                "label": "Import data",
                "script": function ($db, $data) {
                    return 'oooops';
                },
                "type": "form",
                "props": {
                    "file": {
                        "type": "file",
                        "label": " ",
                        "store": "files",
                    }
                }
            },
        ],
        "actions": [
            {
                "_id": "notify",
                "label": "Notification with form",
                "hideInHeader": true,
                "multi": false,
                "script": function ($object, $setObject) {
                    var n = {
                        "message": "Notification with form",
                        "event": "message"
                    };
                    var e = $db.NotifySync([$user._id], 'notifications', n);
                    if (e != null) {
                        console.error("Error when notify", e);
                    }
                }
            },
            {
                "_id": "form",
                "label": "Action with form",
                "type": "form",
                "formLabel": "Payment",
                "okLabel": "ok label",
                "cancelLabel": "cancel label",
                "script": function ($db, $item, $data) {
                },
                "props": {
                    "bankName": {
                        "type": "string",
                        "label": "Bank name",
                        "display": "textInput",
                        "required": true,
                        "formOrder": 10
                    },
                    "accountOwner": {
                        "label": "Account owner",
                        "display": "textInput",
                        "required": true,
                        "formOrder": 20
                    },
                    "iban": {
                        "label": "Bank id",
                        "display": "textInput",
                        "required": true,
                        "formOrder": 30
                    },
                    "accountOwnerId": {
                        "label": "Account owner id",
                        "display": "textInput",
                        "required": true,
                        "formOrder": 40
                    },
                    "eut": {
                        "label": "Eut",
                        "display": "textInput",
                        "readOnly": true,
                        "formOrder": 50
                    },
                    "amount": {
                        "type": "float",
                        "label": "Amount",
                        "min": 50,
                        "display": "numberInput",
                        "required": true,
                        "formOrder": 60
                    },
                }
            }
        ],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [
            {
                "uri": "hook",
                "method": "GET",
                "script": function($request, $response) {
                    var ctx = {
                        "name": "123",
                        "nameHeader": "Item name",
                        "quantityHeader": "Quantity",
                        "items": [
                            {
                                "name": "Pen",
                                "quantity": 2,
                            },
                            {
                                "name": "Pencil",
                                "quantity": 1,
                            },
                            {
                                "name": "Condom",
                                "quantity": 12,
                            },
                            {
                                "name": "Beer",
                                "quantity": 24,
                            }
                        ]
                    }

                    var err = $response.excel("./assets/template.xlsx", ctx, "report.xlsx");
                    console.error("Error:", err);
                }
            }
        ],
        "tasks": [],
        "i18n": {
            "storeLabel": "List view"
        }
    }
};