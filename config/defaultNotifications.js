module.exports = {
    "_defaultNotifications": {
        "type": "notification",
        "access": [
            {
                "role": "root",
                "permissions": "|rud",
            },
            {
                "role": "all",
                "permissions": "|rud",
            },
        ],
        "props": {
            "_id": {
                "type": "string",
                "display": "none",
                "readOnly": true,
            },
            "event": {
                "type": "string",
                "display": "none",
            },
            "level": {
                "type": "string",
                "display": "none",
            },
            "message": {
                "type": "string",
                "display": "none",
            },
            "details": {
                "type": "string",
                "display": "none",
            },
            "ttl": {
                "type": "int",
                "display": "none",
                "min": 0,
            },
            "relatedObjects": {
                "type": "objectList",
                "display": "none",
                "props": {
                    "_id": {
                        "type": "string",
                        "display": "none",
                    },
                    "name": {
                        "type": "string",
                        "display": "none",
                    },
                    "mode": {
                        "type": "string",
                        "display": "none",
                    },
                    "store": {
                        "type": "string",
                        "display": "none",
                    },
                },
            },
        },
    },
};
