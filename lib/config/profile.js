"use strict";

module.exports = {
    "profile": {
        "display": "single",
        "navGroup": "profile",
        "label": "{{$i18n.storeLabel}}",
        "formTabs": [{ "_id": "info", "label": "{{$i18n.infoTabLabel}}" }, { "_id": "security", "label": "{{$i18n.securityTabLabel}}" }],
        "labels": [],
        "access": [{
            "role": "11111111-1111-1111-1111-111111111111",
            "permissions": "|ru"
        }],
        "props": {
            "lastName": {
                "display": "textInput",
                "label": "{{$i18n.lastNameLabel}}",
                "formTab": "info",
                "formOrder": 10,
                "maxLength": 50
            },
            "name": {
                "display": "textInput",
                "label": "{{$i18n.nameLabel}}",
                "formTab": "info",
                "formOrder": 20,
                "required": true,
                "maxLength": 50
            },
            "securityActions": {
                "type": "action",
                "formTab": "security",
                "actions": [{ "_id": "changePassword", "className": "btn btn-accent" }]
            }
        },
        "actions": [{
            "_id": "changePassword",
            "label": "{{$i18n.changePasswordAction}}",
            "multi": false,
            "script": function ($item, $user, $data) {
                var i18n = require("i18n");
                if (!$data.newPassword || !$data.oldPassword) {
                    return "Invalid args";
                }

                if (!$db.checkPasswordSync($user._id, $data.oldPassword)) {
                    return i18n.get("profile.invalidPasswordError", $user.lang);
                }
                var e = $db.setSync({ "_id": $user._id, "password": $data.newPassword }, "users");
                if (e) {
                    return e;
                }
                $db.notifySync([$user._id], "securityNotifications", { "message": i18n.get("profile.passwordChangedMessage", $user.lang) });
            },
            "type": "form",
            "props": {
                "oldPassword": {
                    "type": "string",
                    "display": "password",
                    "label": "{{$i18n.oldPasswordLabel}}",
                    "formOrder": 0,
                    "required": true
                },
                "newPassword": {
                    "type": "string",
                    "display": "password",
                    "label": "{{$i18n.newPasswordLabel}}",
                    "formOrder": 1,
                    "required": true
                }
            }
        }],
        "objectLifeCycle": {
            "didSave": function ($db, $item, $user) {
                $db.set({ "_id": $user._id, "name": (($item.lastName || "") + " " + $item.name).trim() }, "users");
            }
        },
        "storeLifeCycle": {},
        "filters": {},
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
            "passwordChangedMessage": "Пароль изменён"
        }
    }
};