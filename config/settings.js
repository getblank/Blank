module.exports = {
    _serverSettings: {
        type: "map",
        entries: {
            registerTokenExpiration: "0:60",
            passwordResetTokenExpiration: "0:10",
        },
        storeActions: [
            {
                _id: "restdoc",
                script: function ($data) {
                    const fs = require("fs");
                    const hs = require("handlebars");
                    hs.registerHelper("toJSON", function (object) {
                        return new hs.SafeString(JSON.stringify(object));
                    });
                    let src, partial;

                    return fs.readLib("templates/rest-api-template.html")
                        .then(res => {
                            src = res;
                            return fs.readLib("templates/rest-api-list-partial.html");
                        })
                        .then(res => {
                            partial = res;
                            const template = hs.compile(src);
                            hs.registerPartial("propsList", partial);
                            return template({ config: $data });
                        });
                },
            },
        ],
    },
    _commonSettings: {
        type: "map",
        access: [
            {
                role: "guest",
                permissions: "crud",
            },
            {
                role: "all",
                permissions: "crud",
            },
        ],
        entries: {
            title: "Default title",
            locales: ["en", "ru"],
            defaultLocale: "en",
            userActivation: false,
            meta: [
                { name: "description", content: "Application description" },
                { name: "author", content: "Application author" },
            ],
            links: [
                { rel: "canonical", href: "http://mysite.com/example" },
            ],
            lessVars: {
                //"@baseColor": "#FF0044"
            },
            signInProps: {
                login: {
                    type: "string",
                    display: "textInput",
                    label: "{{$i18n.$settings.common.email}}",
                    required: true,
                    formOrder: 1,
                },
                password: {
                    type: "string",
                    display: "password",
                    label: "{{$i18n.$settings.common.password}}",
                    required: true,
                    formOrder: 2,
                },
            },
            resetPasswordDisabled: false,
            signUpDisabled: false,
            resetPasswordProps: {
                password: {
                    type: "string",
                    display: "password",
                    label: "{{$i18n.$settings.resetPassword.newPassword}}",
                    required: true,
                    formOrder: 2,
                },
            },
            resetPasswordRequestProps: {
                email: {
                    type: "string",
                    display: "textInput",
                    label: "{{$i18n.$settings.common.email}}",
                    required: true,
                    pattern: { expression: "^\\S+@\\S+\\.\\S+$", message: "{{$i18n.$settings.signUp.invalidEmail}}" },
                },
            },
            signUpProps: {
                email: {
                    type: "string",
                    display: "newUsernameInput",
                    pattern: { expression: "^\\S+@\\S+\\.\\S+$", message: "{{$i18n.$settings.signUp.invalidEmail}}" },
                    label: "{{$i18n.$settings.common.email}}",
                    required: true,
                    formOrder: 1,
                },
                password: {
                    type: "string",
                    display: "password",
                    label: "{{$i18n.$settings.common.password}}",
                    required: true,
                    formOrder: 2,
                },
                eula: {
                    type: "bool",
                    display: "checkbox",
                    label: "{{{$i18n.$settings.signUp.eulaCheck}}}",
                    required: true,
                    formOrder: 4,
                },
            },
        },
        i18n: {
            ru: {
                install: {
                    hello: "Привет. Скоро начнем.",
                    license: "Лицензионное соглашение",
                    createRoot: "Создание аккаунта администратора",
                    accept: "Принять",
                    next: "Далее",
                },
                signIn: {
                    action: "Войти",
                    title: "Вход",
                    error: "Неверное имя пользователя или пароль",
                    userNotFound: "Пользователь не найден",
                    invalidPassword: "Неверный пароль",
                    restoreLinkSent: "Письмо со ссылкой для сброса пароля отправлено. Если был указан корректный адрес, вы получите письмо в течение 10 минут",
                    invalidUserData: "Проблемы с учетной записью, пожалуйста, обратитесь к системному администратору",
                },
                signOut: {
                    action: "Выйти",
                },
                sendResetLink: {
                    title: "Восстановление пароля",
                    link: "Я забыл пароль",
                    action: "Отправить ссылку",
                    emailSubject: "Восстановление пароля",
                },
                signUp: {
                    title: "Регистрация",
                    action: "Зарегистрироваться",
                    loginInUse: "E-mail занят",
                    success: "Регистрация прошла успешно. Вы можете войти, используя свои e-mail и пароль.",
                    successNeedActivation: "На указанный вами адрес отправлено письмо для активации аккаунта.",
                    eulaCheck: "Я принимаю условия лицензионного соглашения",
                    subscribeCheck: "Я согласен получать рассылку",
                    activationEmailSubject: "Активация аккаунта",
                    invalidEmail: "Неправильный адрес email",
                    registrationSuccessEmailSubject: "Поздравляем с регистрацией",
                },
                resetPassword: {
                    title: "Изменение пароля",
                    oldPassword: "Текущий пароль",
                    newPassword: "Новый пароль",
                    action: "Сменить пароль",
                    successEmailSubject: "Пароль успешно изменён",
                },
                profile: {
                    link: "Профиль",
                    title: "Профиль",
                    changeLogin: "Изменение имени пользователя",
                    newLogin: "Новое имя пользователя",
                    saved: "Данные профиля сохранены",
                    passwordSaved: "Пароль изменен",
                },
                filters: {
                    title: "Фильтр",
                    clear: "Сбросить",
                    all: "Все",
                    search: "Поиск",
                    enterSearchText: "Поиск",
                    load: "Загрузить",
                    save: "Сохранить",
                },
                form: {
                    save: "Сохранить",
                    cancel: "Отменить",
                    delete: "Удалить",
                    newObject: "Новый объект",
                    addToObjectList: "Добавить",
                    e404: "Ой, а такого объекта у нас нет...",
                    e404prompt: "Можно выбрать что-нибудь другое из списка или добавить новую запись",
                    selected: "Выбранные",
                    all: "Все",
                    emptyPreview: "Выберите объект для отображения...",
                    filterNotMatch: "Выбранный объект не попадает под условия фильтра",
                    deleted: "Объект удален",
                    moved: "Объект перемещен в другую папку",
                    openMoved: "Показать",
                    notSaved: "Не сохранено – ",
                    pickFile: "Выберите файл",
                    dropFile: "или перетащите сюда",
                },
                notifications: {
                    empty: "Уведомлений нет",
                    previously: "Ранее",
                },
                comments: {
                    label: "Комментарии",
                    placeholder: "Написать...",
                },
                common: {
                    userName: "Имя пользователя",
                    email: "Адрес электронной почты",
                    password: "Пароль",
                    cancel: "Отменить",
                    language: "Язык",
                    saved: "изменения сохранены",
                    loadingData: "загрузка данных",
                    datePattern: "ДД.ММ.ГГГГ",
                    dateTimePattern: "ДД.ММ.ГГГГ ЧЧ:ММ",
                    apply: "Применить",
                    today: "Сегодня",
                    yesterday: "Вчера",
                    week: "Неделя",
                    month: "Месяц",
                    actionError: "Что-то пошло не так: ",
                    recordsOnPage: "Строк на странице: ",
                },
                lists: {
                    empty: "Похоже, тут ничего нет...",
                    notFound: "Ничего не найдено",
                    new: "Добавление записи",
                },
                errors: {
                    requiredField: "Обязательное поле",
                    invalidPattern: "Неверный формат",
                    emailInvalid: "Некорректный e-mail",
                    emailUsed: "E-mail занят",
                    save: "Ошибка при сохранении изменений",
                    common: "Произошла ошибка:",
                    action: "Ошибка",
                    delete: "Ошибка при удалении",
                    INVALID_OLD_PASSWORD: "Старый пароль не правильный",
                    PASSWORD_NOT_MATCHED: "Неверный пароль",
                    EMAIL_NOT_FOUND: "E-mail адрес не найден",
                    sessionExpired: "Время жизни сессии истекло, либо она была удалена",
                },
            },
            en: {
                install: {
                    hello: "Hi, let's start now",
                    license: "License agreement",
                    createRoot: "Create root account",
                    accept: "Accept",
                    next: "Next",
                },
                signIn: {
                    action: "Sign in",
                    title: "Sign in",
                    error: "Login or password incorrect",
                    userNotFound: "User not found",
                    invalidPassword: "Invalid password",
                    restoreLinkSent: "Email with recent link sent. If you provide correct address, you will receive it within 10 minutes",
                    invalidUserData: "Invalid user data, please contact system administrator",
                },
                signOut: {
                    action: "Sign out",
                },
                sendResetLink: {
                    title: "Password restore",
                    link: "I forgot password",
                    action: "Send link",
                    emailSubject: "Password restore",
                },
                signUp: {
                    title: "Registration",
                    action: "Register",
                    loginInUse: "E-mail already in use",
                    success: "Successful registration. You can sign in now using your e-mail and password.",
                    successNeedActivation: "An activation email has been sent to the email address provided.",
                    eulaCheck: "I accept the terms in the license agreement",
                    subscribeCheck: "I want to receive information e-mails",
                    activationEmailSubject: "Account activation",
                    invalidEmail: "Invalid email",
                    registrationSuccessEmailSubject: "Congratulations with registration",
                },
                resetPassword: {
                    title: "Password change",
                    oldPassword: "Current password",
                    newPassword: "New password",
                    action: "change",
                    successEmailSubject: "Password was changed",
                },
                profile: {
                    link: "Profile",
                    title: "Profile",
                    changeLogin: "Login change",
                    newLogin: "New login",
                    saved: "Profile info did save",
                    passwordSaved: "Password did change",
                },
                filters: {
                    title: "Filter",
                    clear: "reset",
                    all: "All",
                    search: "Search",
                    enterSearchText: "Search",
                    load: "Load",
                    save: "Save",
                },
                form: {
                    save: "Save",
                    cancel: "Cancel",
                    delete: "Delete",
                    newObject: "New object",
                    addToObjectList: "Add",
                    e404: "There is no such object",
                    e404prompt: "Please create one or select from list",
                    selected: "Selected",
                    all: "All",
                    emptyPreview: "Please select element from list...",
                    filterNotMatch: "Selected object does not match filter conditions",
                    deleted: "Item deleted",
                    moved: "Item moved to another folder",
                    openMoved: "Show",
                    notSaved: "Not saved – ",
                    pickFile: "Choose file",
                    dropFile: "or drop here",
                },
                notifications: {
                    empty: "No notifications",
                    previously: "Previously",
                },
                comments: {
                    label: "Comments",
                    placeholder: "Write...",
                },
                common: {
                    userName: "Login",
                    email: "E-mail address",
                    password: "Password",
                    cancel: "Cancel",
                    language: "Language",
                    saved: "changes saved",
                    loadingData: "loading data",
                    datePattern: "DD.MM.YYYY",
                    dateTimePattern: "DD.MM.YYYY HH:MM",
                    apply: "Apply",
                    today: "Today",
                    yesterday: "Yesterday",
                    week: "Week",
                    month: "Month",
                    actionError: "Something went wrong: ",
                    recordsOnPage: "Records on page: ",
                },
                lists: {
                    empty: "Looks like there is nothing here...",
                    notFound: "Nothing found",
                    new: "Creating item",
                },
                errors: {
                    requiredField: "Required field",
                    invalidPattern: "Incorrect format",
                    emailInvalid: "Invalid e-mail",
                    emailUsed: "E-mail in use",
                    save: "Error while saving changes",
                    common: "Something went wrong...",
                    action: "Sorry, but we unable to process your request",
                    delete: "Delete error",
                    INVALID_OLD_PASSWORD: "Invalid old password",
                    PASSWORD_NOT_MATCHED: "Invalid password",
                    EMAIL_NOT_FOUND: "E-mail address not found",
                    sessionExpired: "Session deleted or expired",
                },
            },
        },
    },
};
