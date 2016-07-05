module.exports = {
    "securityNotifications": {
        "type": "notification",
        "access": [
            {
                "role": "root",
                "permissions": "rud",
                "condition": { "_ownerId": { "$expression": "$user._id" } },
            },
            {
                "role": "all",
                "permissions": "rud",
                "condition": { "_ownerId": { "$expression": "$user._id" } },
            },
        ],
    },
};
