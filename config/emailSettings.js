module.exports = {
    emailSettings: {
        type: "single",
        navGroup: "config",
        navOrder: 10,
        i18n: {
            ru: {
                singularLocal: "Настройки отправки почты",
                singularAccusativeLocal: "Настройки отправки почты",
                pluralLocal: "Настройки отправки почты",
                pluralGenitiveLocal: "Настройки отправки почты",
            },
            en: {
                singularLocal: "Email transport settings",
                singularAccusativeLocal: "Email transport settings",
                pluralLocal: "Email transport settings",
                pluralGenitiveLocal: "Email transport settings",
            },
            tr: {
                singularLocal: "Email transport settings",
                singularAccusativeLocal: "Email transport settings",
                pluralLocal: "Email transport settings",
                pluralGenitiveLocal: "Email transport settings",
            },
        },
        access: [
            { role: "root", permissions: "vcrux" },
        ],
        label: "{{$i18n.pluralLocal}}",
        actions: [
            {
                _id: "test",
                multi: false,
                label: "Test",
                script: function ($user, $db, $data) {
                    var email = require("email");
                    var msg = {
                        to: $data.email,
                        subject: "TEST",
                        body: $data.body,
                    };
                    console.debug(msg);
                    var e = email.send(msg, function (e) {
                        if (e != null) {
                            console.error(e);
                        }
                    });
                    if (e != null) {
                        return { error: e };
                    }
                    return { result: "SUCCESS" };
                },
                type: "form",
                props: {
                    email: {
                        display: "textInput",
                        required: true,
                        label: "To",
                        formOrder: 10,
                    },
                    subject: {
                        display: "textInput",
                        required: true,
                        label: "Subject",
                        formOrder: 20,
                    },
                    body: {
                        display: "textInput",
                        required: true,
                        label: "Body",
                        formOrder: 30,
                    },
                },
            },
        ],
        props: {
            host: {
                type: "string",
                display: "textInput",
                label: "Host",
                formOrder: 10,
                required: true,
            },
            port: {
                type: "int",
                display: "numberInput",
                label: "Port",
                formOrder: 20,
                required: true,
            },
            username: {
                type: "string",
                display: "textInput",
                label: "Username",
                formOrder: 30,
                required: true,
            },
            password: {
                type: "string",
                display: "password",
                label: "Password",
                formOrder: 40,
                required: true,
            },
            from: {
                type: "string",
                display: "textInput",
                label: "From",
                formOrder: 50,
            },
            testMode: {
                type: "bool",
                display: "checkbox",
                label: "Test Mode",
                formOrder: 60,
                default: false,
            },
            to: {
                type: "string",
                display: "textInput",
                label: "(Test) To",
                formOrder: 70,
                hidden: "!$item.testMode",
                required: "$item.testMode",
            },
        },
    },
    _defaultProcess: {
        type: "process",
        props: {
            _state: {
                type: "string",
                display: "none",
                configurable: true,
            },
            _result: {
                type: "string",
                display: "none",
                configurable: true,
            },
        },
    },
};
