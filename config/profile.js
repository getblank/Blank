module.exports = {
    "profile": {
        "display": "single",
        "navGroup": "profile",
        "label": "{{$i18n.storeLabel}}",
        "formTabs": [
            { "_id": "info", "label": "{{$i18n.infoTabLabel}}" },
            { "_id": "security", "label": "{{$i18n.securityTabLabel}}" },
        ],
        "labels": [],
        "access": [
            { "role": "root", "permissions": "ru" },
            {
                "role": "all",
                "permissions": "ru",
                "condition": {
                    "_ownerId": {
                        "$expression": "$user._id",
                    },
                },
            },
        ],
        "props": {
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
                "required": true,
                "maxLength": 50,
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
                    if (!$data.newPassword || !$data.oldPassword) {
                        return "Invalid args";
                    }
                    let user;
                    return $db.get($item._ownerId, "users").then((_user) => {
                        user = _user;
                        if (user._deleted || user.password == null) {
                            throw new Error();
                        }
                        let hash = require("hash");
                        return hash.calc($data.oldPassword, user.password.salt);
                    }).then((d) => {
                        if (d !== user.password.key) {
                            throw new UserError(i18n.get("profile.invalidPasswordError", $user.lang));
                        }
                        return $db.set({ "_id": $item._ownerId, "password": $data.newPassword }, "users");
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
                        "required": true,
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
        "objectLifeCycle": {
            "didSave": function ($db, $item, $user) {
                $db.set({ "_id": $user._id, "name": (($item.lastName || "") + " " + $item.name).trim() }, "users");
            },
        },
        "storeLifeCycle": {},
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
            "changePasswordAction": "Сменить пароль",
            "oldPasswordLabel": "Текущий пароль",
            "newPasswordLabel": "Новый пароль",
            "invalidPasswordError": "Текущий пароль не совпадает",
            "passwordChangedMessage": "Пароль изменён",
        },
    },
};