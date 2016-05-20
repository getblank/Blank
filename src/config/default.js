module.exports = {
    "_default": {
        "type": "directory",
        "filters": {
            "_default": {
                "conditions": [
                    {
                        "property": "name",
                        "operator": "contains"
                    }
                ]
            }
        },
        "props": {
            "_id": {
                "type": "string",
                "required": true,
                "display": "none",
                "readOnly": true
            },
            "name": {
                "type": "string",
                "display": "headerInput",
                "configurable": true
            },
            "_deleted": {
                "type": "bool",
                "display": "none",
                "configurable": false
            },
            "_ownerId": {
                "type": "ref",
                "store": "users",
                "display": "none",
                "required": true,
                "configurable": true
            },
            "createdBy": {
                "type": "ref",
                "store": "users",
                "display": "none",
                "configurable": false
            },
            "updatedBy": {
                "type": "ref",
                "store": "users",
                "display": "none",
                "configurable": false
            },
            "deletedBy": {
                "type": "ref",
                "store": "users",
                "display": "none",
                "configurable": false
            },
            "createdAt": {
                "type": "date",
                "display": "none",
                "configurable": true
            },
            "updatedAt": {
                "type": "date",
                "display": "none",
                "configurable": false
            },
            "deletedAt": {
                "type": "date",
                "display": "none",
                "configurable": false
            }
        }
    },
    "_defaultProcess": {
        "type": "process",
        "filters": {
            "_state": {
                "conditions": [
                    {
                        "property": "_state",
                        "operator": "="
                    }
                ]
            }
        },
        "props": {
            "_state": {
                "type": "string",
                "display": "none",
                "configurable": true
            },
            "_result": {
                "type": "string",
                "display": "none",
                "configurable": true
            }
        }
    },
    "_defaultSingle": {
        "type": "single",
        "props": {
            "name": {
                "type": "string",
                "display": "none",
                "configurable": false
            }
        }
    }
};
