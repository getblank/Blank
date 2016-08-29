/**
 * Created by kib357 on 18/02/16.
 */

module.exports = {
    "syslog": {
        "display": "table",
        "navOrder": 90,
        "navGroup": "config",
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "orderBy": "-createdAt",
        "tableColumns": [
            "createdAt",
            "actionSource",
            "userName",
            "store",
            "itemId",
            "action",
            "actionData",
        ],
        "props": {
            "createdAt": {
                "label": "DateTime",
            },
            "store": {
                "type": "string",
                "label": "Store",
                "display": "text",
            },
            "userId": {
                "type": "ref",
                "store": "users",
                "populateIn": "user",
                "display": "none",
                "readOnly": true,
            },
            "userName": {
                "type": "virtual",
                "label": "User",
                "load": function ($item) {
                    return $item.user ? $item.user.name : "";
                },
            },
            "itemId": {
                "type": "string",
                "label": "Item Id",
                "display": "none",
            },
            "actionSource": {
                "display": "select",
                "options": [
                    { "value": "JS", "label": "JavaScript API" },
                    { "value": "WAMP", "label": "WAMP API" },
                    { "value": "HTTP", "label": "HTTP API" },
                    { "value": "System", "label": "System" },
                ],
            },
            "action": {
                "type": "string",
                "label": "Action",
                "display": "text",
            },
            "actionData": {
                "type": "string",
                "label": "Action data",
                "display": "text",
            },
        },
        "actions": [],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "access": [
            {
                "role": "root",
                "permissions": "vcrud",
            },
        ],
        "i18n": {
            "ru": {
                "storeLabel": "Журнал операций",
            },
            "en": {
                "storeLabel": "Actions history",
            },
        },
    },
};