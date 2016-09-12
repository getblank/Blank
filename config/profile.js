module.exports = {
    "profiles": {
        "baseStore": "profile",
        "access": [
            { "role": "root", "permissions": "vrux" },
        ],
        "display": "list",
        "navGroup": "config",
        "navOrder": 1000,
        "headerTemplate": "{{#if $item.login}}{{$item.login}}{{else}}{{$item._ownerId}}{{/if}}",
        "actions": [],
        "i18n": {
            "storeLabel": "Профили",
        },
    },
    "profile": {
        "access": [
            { "role": "root", "permissions": "vrux" },
            {
                "role": "all",
                "permissions": "vrux",
                "condition": {
                    "_ownerId": {
                        "$expression": "$user._id",
                    },
                },
            },
        ],
        "display": "single",
        "navGroup": "profile",
        "label": "{{$i18n.storeLabel}}",
        "formTabs": [
            { "_id": "info", "label": "{{$i18n.infoTabLabel}}" },
            { "_id": "security", "label": "{{$i18n.securityTabLabel}}" },
        ],
        "labels": [],
        "props": {
            "login": {
                "type": "string",
                "display": "textInput",
                "label": "{{$i18n.$stores.users.loginLabel}}",
                "formOrder": 0,
            },
            "lastName": {
                "display": "textInput",
                "label": "{{$i18n.lastNameLabel}}",
                "formTab": "info",
                "formOrder": 10,
                "maxLength": 50,
            },
            "name": {
                "display": "textInput",
                "label": "{{$i18n.nameLabel}}",
                "formTab": "info",
                "formOrder": 20,
                "maxLength": 50,
            },
            "sessions": {
                "type": "objectList",
                "label": "{{$i18n.sessionsLabel}}",
                "formTab": "info",
                "formOrder": 1000,
                "props": {
                    "apiKey": {
                        "type": "string",
                        "display": "text",
                        "label": "ID",
                        "formOrder": 0,
                    },
                    "connections": {
                        "type": "int",
                        "display": "text",
                        "label": "Active connections",
                        "formOrder": 10,
                    },
                },
                "disabled": true,
            },
            "_ownerId": {
                "type": "ref",
                "display": "searchBox",
                "label": "{{$i18n._ownerIdLabel}}",
                "store": "users",
                "oppositeProp": "profileId",
                "searchBy": ["login"],
                "formTab": "info",
                "formOrder": 500,
                "disabled": true,
                "hidden": "($user.roles || []).indexOf('root') < 0",
                "access": [{ "role": "all", "permissions": "r" }],
            },
            "securityActions": {
                "type": "action",
                "formTab": "security",
                "actions": [
                    { "_id": "changePassword", "className": "btn btn-accent" },
                ],
            },
        },
        "actions": [
            {
                "_id": "changePassword",
                "label": "{{$i18n.changePasswordAction}}",
                "multi": false,
                "script": function ($db, $item, $user, $data) {
                    let i18n = require("i18n");
                    if (!$data.newPassword || (!$data.oldPassword && !$user.noPassword)) {
                        return "Invalid args";
                    }
                    let user;
                    return $db.get($item._ownerId, "users").then((_user) => {
                        if (_user._deleted) {
                            throw new Error();
                        }
                        user = _user;
                        if ($user.noPassword) {
                            return;
                        }
                        if (user.password == null) {
                            throw new Error();
                        }
                        let hash = require("hash");
                        return hash.calc($data.oldPassword, user.password.salt);
                    }).then((d) => {
                        if (!$user.noPassword && d !== user.password.key) {
                            throw new UserError(i18n.get("profile.invalidPasswordError", $user.lang));
                        }
                        return $db.set({ "_id": $item._ownerId, "password": $data.newPassword, noPassword: null }, "users");
                    }).then(d => {
                        $db.notify([$user._id], "securityNotifications", {
                            "message": i18n.get("profile.passwordChangedMessage", $user.lang),
                        });
                    });
                },
                "type": "form",
                "props": {
                    "oldPassword": {
                        "type": "string",
                        "display": "password",
                        "label": "{{$i18n.oldPasswordLabel}}",
                        "formOrder": 0,
                        "required": "!$user.noPassword",
                        "hidden": "$user.noPassword",
                    },
                    "newPassword": {
                        "type": "string",
                        "display": "password",
                        "label": "{{$i18n.newPasswordLabel}}",
                        "formOrder": 1,
                        "required": true,
                    },
                },
            },
        ],
        "objectLifeCycle": {},
        "storeLifeCycle": {
            "didStart": function () {
                let r = 0;
                let updateUserSessions = (session) => {
                    let _r = ++r;
                    var locker = "sessions-update-" + session.apiKey + "-__v:" + session.__v;
                    console.log("Session locker:", locker);
                    sync.once(locker, () => {
                        let userSessions = sessions.get().filter(s => s.userId === session.userId).map((s) => {
                            return {
                                "apiKey": s.apiKey,
                                "connections": (s.connections || []).length,
                            };
                        });
                        console.log("Sessions update for user", session.userId, "Sessions:", JSON.stringify(userSessions));
                        $db.get({ "_ownerId": session.userId }, "profile").then((p) => {
                            if (_r === r) {
                                console.log("Updating profile sessions");
                                $db.set({ "_id": p._id, "sessions": userSessions },
                                    "profile",
                                    { "noValidate": true },
                                    (e, r) => {
                                        console.log("Update error:", e);
                                    });
                            }
                        }).catch(() => {
                            if (_r === r) {
                                console.log("Profile not found, creating...");
                                $db.get(session.userId, "users").then(u => {
                                    if (u == null) { throw new Error("user not found") }
                                    return $db.insert(
                                        { "_ownerId": session.userId, "sessions": userSessions, "login": u.login },
                                        "profile",
                                        { "noValidate": true },
                                        (e, r) => {
                                            console.log("Create error:", e);
                                        });
                                }).catch(e => console.log("Error while creating profile for user:", session.userId));
                            }
                        });
                    });
                };
                sessions.on("create", updateUserSessions);
                sessions.on("update", updateUserSessions);
                sessions.on("delete", updateUserSessions);
            },
        },
        "filters": {
            "userFilter": {
                "label": "User",
                "display": "searchBox",
                "store": "users",
                "searchBy": ["name", "email", "clientId"],
                "multi": true,
                "query": {
                    "_ownerId": "$value",
                },
                "filterBy": "_id",
            },
        },
        "httpHooks": [],
        "tasks": [],
        "i18n": {
            "storeLabel": "Профиль",
            "infoTabLabel": "Информация",
            "securityTabLabel": "Безопасность",
            "nameLabel": "Имя",
            "lastNameLabel": "Фамилия",
            "sessionsLabel": "Сессии",
            "changePasswordAction": "Сменить пароль",
            "oldPasswordLabel": "Текущий пароль",
            "newPasswordLabel": "Новый пароль",
            "invalidPasswordError": "Текущий пароль не совпадает",
            "passwordChangedMessage": "Пароль изменён",
            "_ownerIdLabel": "Учетная запись",
        },
    },
};