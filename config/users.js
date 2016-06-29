module.exports = {
    "users": {
        "type": "directory",
        "navGroup": "config",
        "label": "{{$i18n.label}}",
        "i18n": {
            "ru": {
                "label": "Пользователи",
                "activeLabel": "Включен",
                "inactiveLabel": "Отключен",
                "createdAt": "Зарегистрирован: ",
            },
            "en": {
                "label": "Users",
                "activeLabel": "Enabled",
                "inactiveLabel": "Disabled",
                "createdAt": "Registered: ",
            },
        },
        "access": [
            { "role": "root", "permissions": "crud" },
        ],
        "actions": [
            {
                "_id": "activate",
                "label": "Enable",
                "multi": false,
                "script": function ($db, $item) {
                    return $db.set({ "_id": $item._id, "isActive": true, "activationToken": "" }, "users");
                },
                "hidden": "$item.isActive || $item._id === '00000000-0000-0000-0000-000000000000'",
            },
            {
                "_id": "deactivate",
                "label": "Disable",
                "icon": "material-icons text md-16 block",
                "multi": false,
                "script": function ($db, $item) {
                    return $db.set({ "_id": $item._id, "isActive": false }, "users");
                },
                "hidden": "!$item.isActive || $item._id === '00000000-0000-0000-0000-000000000000'",
            },
            {
                "_id": "changePassword",
                "label": "Change password",
                "multi": false,
                "script": function ($db, $data, $item) {
                    if (!$data.newPassword) {
                        throw new UserError("Please provide new password");
                    }
                    return $db.set({ "_id": $item._id, "password": $data.newPassword }, "users");
                },
                "type": "form",
                "props": {
                    "newPassword": {
                        "type": "string",
                        "display": "textInput",
                        "label": "New password",
                        "required": true,
                    },
                },
            },
        ],
        "labels": [
            {
                "hideInForm": true,
                "icon": "fa fa-power-off",
                "color": "{{#if $item.isActive}}#43A047{{else}}#ddd{{/if}}",
                "showInList": 1,
            },
            {
                "text": "{{#if $item.isActive}}{{$i18n.activeLabel}}{{else}}{{$i18n.inactiveLabel}}{{/if}}",
                "color": "{{#if $item.isActive}}#00E676{{else}}#E0E0E0{{/if}}",
            },
            {
                "text": "{{$i18n.createdAt}} {{moment $item.createdAt format=\"D MMMM, dd, HH:mm\"}}",
                "hideInForm": true,
                "showInList": 2,
                "hidden": "!$item.createdAt",
            },
        ],
        "props": {
            "name": {
                "type": "string",
                "placeholder": "Username",
            },
            "isActive": {
                "type": "bool",
                "display": "none",
                "label": "Активен",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "login": {
                "type": "string",
                "display": "textInput",
                "label": "Login",
                "maxLength": 50,
                "formOrder": 1,
            },
            "password": {
                "type": "password",
                // "type": "string",
                "display": "none",
            },
            "workspace": {
                "type": "string",
                "display": "none",
                "label": "Interface",
                "formOrder": 3,
                "options": [],
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "roles": {
                "type": "refList",
                "store": "_roles",
                "display": "checkList",
                "label": "Roles",
                "formOrder": 10,
                "style": { "display": "block" },
                "hidden": "$item._id === '00000000-0000-0000-0000-000000000000'",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "lang": {
                "type": "string",
                "display": "select",
                "label": "Language",
                "formOrder": 3,
                "default": "en",
                "options": [
                    { "label": "English", "value": "en" },
                    { "label": "Русский", "value": "ru" },
                ],
            },
            "_activationToken": {
                "type": "string",
                "display": "none",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
        },
        "objectLifeCycle": {
            "willCreate": function ($db, $item) {
                if (!$item.name) {
                    return $db.nextSequenceString("users").then(sequence => { $item.name = sequence });
                }
            },
            "willRemove": function ($db, $item) {
                if ($item._id === "00000000-0000-0000-0000-000000000000") {
                    throw new UserError("Cannot delete root user");
                }
            },
        },
        "storeLifeCycle": {
            "didStart": function ($db) {
                sync.once("$$usersDidStart", () => {
                    $db.waitForConnection().then(() => {
                        console.log("Checking root user in DB...");
                        $db.get("00000000-0000-0000-0000-000000000000", "users", (e, d) => {
                            if (d == null || d._deleted) {
                                console.log("Root user not exists, creating...");
                                $db.set({
                                    "_id": "00000000-0000-0000-0000-000000000000",
                                    "roles": ["root"],
                                    "login": "root",
                                    "password": "toor",
                                }, "users", (e, d) => {
                                    if (e != null) {
                                        console.error("Error while creating root user:", e);
                                    } else {
                                        console.log("Root user created");
                                    }
                                });
                            } else {
                                console.log("Root user OK");
                            }
                        });
                    });
                });
            },
        },
        "httpHooks": [
            {
                "uri": "activation",
                "method": "GET",
                "script": function ($db, $request, $response) {
                    $response.redirect(303, "/");
                },
            },
        ],
    },
};
