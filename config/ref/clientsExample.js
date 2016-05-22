/**
 * Created by kib357 on 09/12/15.
 */

module.exports = {
    "clientsExample": {
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
            "targets": {
                "type": "virtualRefList",
                "store": "ordersExample",
                "foreignKey": "clients",
                "label": "Orders"
            }
        },
        "actions": [],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {},
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Clients example"
        }
    }
};