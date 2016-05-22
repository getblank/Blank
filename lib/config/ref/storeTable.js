"use strict";

/**
 * Created by kib357 on 18/11/15.
 */

module.exports = {
    "tableStore": {
        "display": "table",
        "navOrder": 0,
        "label": "{{$i18n.storeLabel}}",
        "labels": [],
        "tableColumns": ['defaultProp', 'createdAt'],
        "props": {
            "defaultProp": {
                "type": "string",
                "display": "textInput"
            },
            "createdAt": {
                "type": "date",
                "display": "text"
            }
        },
        "actions": [],
        "storeActions": [{
            "_id": "test",
            "label": "Test http",
            "script": function ($db) {
                console.log("111");
                console.log(JSON.stringify($request.Query));
                console.log("222");
                return $response.HTML(200, "olololo");
            },
            "type": "http"
        }],
        "objectLifeCycle": {},
        "storeLifeCycle": {},
        "filters": {
            "dateFilter": {
                "label": "Date range",
                "display": "dateRange",
                "conditions": [{
                    "property": "createdAt",
                    "operator": "contains"
                }]
            }
        },
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Table view"
        }
    }
};