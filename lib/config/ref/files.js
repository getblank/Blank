"use strict";

/**
 * Created by ivahaev on 04/02/16.
 */

module.exports = {
    "files": {
        "type": "file",
        "display": "none",
        "props": {
            "name": {
                "label": "name",
                "required": true
            }
        },
        "actions": [],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Файлы"
        },
        "access": [{
            "role": "root",
            "permissions": "crud"
        }]
    }
};