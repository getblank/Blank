"use strict";

module.exports = {
    "profileList": {
        "type": "proxy",
        "baseStore": "profile",
        "display": "list",
        "navGroup": "config",
        "displayOrder": 0,
        "label": "{{$i18n.storeLabel}}",
        "labels": [{
            "text": "{{$item.email}}",
            "hideInForm": true,
            "showInList": 1
        }],
        "props": {},
        "actions": [],
        "filters": {
            "userFilter": {
                "label": "User",
                "display": "searchBox",
                "store": "users",
                "searchBy": ["name", "email", "clientId"],
                "multi": true,
                "conditions": [{
                    "property": "_ownerId",
                    "operator": "="
                }],
                "filterBy": "_id"
            }
        },
        "i18n": {
            "storeLabel": "userList"
        },
        "access": [{
            "role": "root",
            "permissions": "crud"
        }]
    }
};