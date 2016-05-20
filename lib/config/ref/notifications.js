/**
 * Created by kib357 on 18/11/15.
 */

module.exports = {
    "notifications": {
        "type": "notification",
        "actions": [{
            "_id": "notificationAction",
            "type": "form",
            "label": "Reply",
            "script": function ($db, $data) {
                console.log($data.testString);
                var err = $db.delSync($item._id, "notifications");
            },
            "conditions": [{
                "property": "event",
                "value": "message",
                "operator": "="
            }],
            "props": {
                "testString": {
                    "type": "string",
                    "display": "textInput",
                    "label": "Answer text",
                    "required": true,
                    "formOrder": 1,
                    "default": "{{$user.login}}"
                }
            }
        }]
    }
};