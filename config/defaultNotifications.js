module.exports = {
    _defaultNotifications: {
        type: "notification",
        access: [
            { role: "all", permissions: "rdv", condition: { _ownerId: { $expression: "$user._id" } } },
            { role: "root", permissions: "rdv", condition: { _ownerId: { $expression: "$user._id" } } },
        ],
        props: {
            _id: {
                type: "string",
                display: "none",
                readOnly: true,
            },
            event: {
                type: "string",
                display: "none",
            },
            level: {
                type: "string",
                display: "none",
            },
            message: {
                type: "string",
                display: "none",
            },
            details: {
                type: "string",
                display: "none",
            },
            expireAt: {
                type: "date",
                display: "none",
            },
            relatedObjects: {
                type: "objectList",
                display: "none",
                props: {
                    _id: {
                        type: "string",
                        display: "none",
                    },
                    name: {
                        type: "string",
                        display: "none",
                    },
                    mode: {
                        type: "string",
                        display: "none",
                    },
                    store: {
                        type: "string",
                        display: "none",
                    },
                },
            },
        },
    },
};
