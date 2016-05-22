"use strict";

/**
 * Created by kib357 on 18/11/15.
 */

module.exports = {
    "storeSingle": {
        "display": "single",
        "navOrder": 0,
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            "defaultProp": {
                "type": "string",
                "display": "textInput",
                "formOrder": 10
            },
            "file": {
                "type": "file",
                "label": "Settings file",
                "store": "files",
                "formOrder": 20,
                "style": { "width": "100%" }
            },
            "defaultPropAuto": {
                "type": "string",
                "display": "autocomplete",
                "options": [{ "value": "Москва", "label": "Москва" }, { "value": "Питер", "label": "Питер" }, { "value": "Тюмень", "label": "Тюмень" }, { "value": "Осёл", "label": "Осёл" }, { "value": "Москва", "label": "Москва" }, { "value": "Питер", "label": "Питер" }, { "value": "Тюмень", "label": "Тюмень" }, { "value": "Осёл", "label": "Осёл" }, { "value": "Москва", "label": "Москва" }, { "value": "Питер", "label": "Питер" }, { "value": "Тюмень", "label": "Тюмень" }, { "value": "Осёл", "label": "Осёл" }, { "value": "Москва", "label": "Москва" }, { "value": "Питер", "label": "Питер" }, { "value": "Тюмень", "label": "Тюмень" }, { "value": "Осёл", "label": "Осёл" }],
                "formOrder": 30
            }
        },
        "actions": [],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Single view"
        }
    }
};