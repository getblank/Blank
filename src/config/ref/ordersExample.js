/**
 * Created by kib357 on 09/12/15.
 */

module.exports = {
    "ordersExample": {
        "display": "list",
        "navOrder": 0,
        "navGroup": "exampleGroup",
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "props": {
            "defaultProp": {
                "type": "string",
                "display": "textInput"
            },
            "clients": {
                "type": "refList",
                "label": "Clients",
                "display": "searchBox",
                "store": "clientsExample",
                "multi": true
            }
        },
        "actions": [],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Orders example"
        }
    }
};