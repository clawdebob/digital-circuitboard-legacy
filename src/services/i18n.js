import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from '../locale/en.locale';
import ruTranslation from '../locale/ru.locale';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: enTranslation
    },
    ru: {
        translation: ruTranslation
    }
};

const browserLanguage = navigator.language;
const language = browserLanguage.match(/ru/gmi) ? 'ru' : 'en';

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: language,

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
