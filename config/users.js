module.exports = {
    "users": {
        "type": "directory",
        "navGroup": "config",
        "label": "{{$i18n.label}}",
        "headerProperty": "login",
        "access": [
            { "role": "root", "permissions": "vcrud" },
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
                "display": "none",
            },
            "isActive": {
                "type": "bool",
                "display": "none",
                "label": "Активен",
                "default": true,
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "facebookId": {
                "type": "string",
                "display": "none",
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
                "label": "{{$i18n.loginLabel}}",
                "maxLength": 50,
                "formOrder": 10,
                "disabled": true,
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                    {
                        "role": "all",
                        "permissions": "r",
                        "condition": {
                            "_id": {
                                "$expression": "$user._id",
                            },
                        },
                    },
                ],
            },
            "email": {
                "type": "string",
                "display": "textInput",
                "pattern": "^\\S+@\\S+\\.\\S+$",
                "label": "{{$i18n.emailLabel}}",
                "maxLength": 50,
                "formOrder": 20,
                "disabled": true,
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                    {
                        "role": "all",
                        "permissions": "r",
                        "condition": {
                            "_id": {
                                "$expression": "$user._id",
                            },
                        },
                    },
                ],
            },
            "password": {
                "type": "password",
                "display": "none",
            },
            "noPassword": {
                "type": "bool",
                "display": "none",
            },
            "lang": {
                "type": "string",
                "display": "select",
                "label": "Language",
                "formOrder": 30,
                "default": "en",
                "options": [
                    { "label": "English", "value": "en" },
                    { "label": "Русский", "value": "ru" },
                ],
            },
            "workspace": {
                "type": "string",
                "display": "none",
                "label": "Interface",
                "formOrder": 40,
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
                "formOrder": 100,
                "style": { "display": "block" },
                "hidden": "$item._id === '00000000-0000-0000-0000-000000000000'",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
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
            "_activationExpires": {
                "type": "date",
                "display": "none",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "_passwordResetToken": {
                "type": "string",
                "display": "none",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "_passwordResetExpires": {
                "type": "date",
                "display": "none",
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                ],
            },
            "profileId": {
                "type": "ref",
                "display": "searchBox",
                "label": "{{$i18n.profileIdLabel}}",
                "store": "profiles",
                "oppositeProp": "_ownerId",
                "searchBy": ["login"],
                "formOrder": 0,
                "disabled": true,
                "access": [
                    {
                        "role": "root",
                        "permissions": "crud",
                    },
                    {
                        "role": "all",
                        "permissions": "r",
                        "condition": {
                            "_id": {
                                "$expression": "$user._id",
                            },
                        },
                    },
                ],
            },
        },
        "objectLifeCycle": {
            "willCreate": function ($db, $item) {

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
                "uri": "activation/:token",
                "method": "GET",
                "script": function ($db, $request) {
                    let fs = require("fs");
                    let handlebars = require("handlebars");
                    let user;
                    return $db.get({ _activationToken: $request.params["token"] }, "users").then(_user => {
                        user = _user;
                        return $db.set({ _id: user._id, _activationToken: null, _activationExpires: null, isActive: true }, "users");
                    }).then(() => {
                        return fs.readLib("templates/activation-success.html");
                    }).then(template => {
                        let body = handlebars.compile(template)({ user: user });
                        return {
                            "type": "html",
                            "data": body,
                        };
                    }).catch(err => {
                        console.debug(`[user activation] user not found with token: ${$request.params["token"]}`, err);
                        return fs.readLib("templates/activation-error.html");
                    }).then(template => {
                        if (typeof template === "object") {
                            return template;
                        }
                        let body = handlebars.compile(template)({});
                        return {
                            "type": "html",
                            "data": body,
                        };
                    }).catch(err => {
                        console.debug(`[user activation] error processing activation with token: ${$request.params["token"]}`, err);
                        return {
                            "type": "html",
                            "data": "activation error",
                        };
                    });
                },
            },
        ],
        "tasks": [
            {
                "schedule": "*/30  *   *   *   *",
                "script": function ($db) {
                    // unactivated users
                    $db.find({
                        query: {
                            _activationExpires: { "$lte": new Date() },
                            isActive: false,
                        },
                        take: 100,
                    }, "users").then(res => {
                        if (res.items.length > 0) {
                            console.debug(`[users][tasks][delete unactivated users] found ${res.items.length} unactivated users`);
                            let promises = [];
                            for (let user of res.items) {
                                promises.push($db.delete(user._id, "users", { drop: true }));
                            }
                            return Promise.all(promises);
                        }
                    }).catch(err => {
                        console.error("[users][tasks] can't process unactivated users");
                    }).then(() => {
                        // rotten password reset tokens
                        return $db.find({
                            query: {
                                _passwordResetExpires: { "$lte": new Date() },
                            },
                            take: 100,
                        }, "users");
                    }).then(res => {
                        if (res.items.length > 0) {
                            console.debug(`[users][tasks][rotten password reset requests] found ${res.items.length} rotten requests`);
                            let promises = [];
                            for (let user of res.items) {
                                promises.push($db.set({ _id: user._id, _passwordResetExpires: null, _passwordResetToken: null }, "users"));
                            }
                            return Promise.all(promises);
                        }
                    }).catch(err => {
                        console.error("[users][tasks] can't process rotten password reset requests");
                    });
                },
            },
        ],
        "i18n": {
            "ru": {
                "label": "Пользователи",
                "activeLabel": "Включен",
                "inactiveLabel": "Отключен",
                "loginLabel": "Имя для входа",
                "emailLabel": "Email",
                "profileIdLabel": "Данные профиля",
                "createdAt": "Зарегистрирован: ",
            },
            "en": {
                "label": "Users",
                "activeLabel": "Enabled",
                "inactiveLabel": "Disabled",
                "loginLabel": "Login",
                "emailLabel": "Email",
                "profileIdLabel": "Profile data",
                "createdAt": "Registered: ",
            },
        },
    },
};
