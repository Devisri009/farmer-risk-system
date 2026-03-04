import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "app_name": "FarmVista",
            "home": "Home",
            "post_crop": "Post Crop",
            "my_batches": "My Batches",
            "climate_alerts": "Climate Alerts",
            "assistant": "Assistant",
            "settings": "Settings",
            "logout": "Logout",
            "login": "Login",
            "register": "Register",
            "get_started": "Get Started",
        }
    },
    ta: {
        translation: {
            "app_name": "ஃபார்ம்விஸ்டா (FarmVista)",
            "home": "முகப்பு",
            "post_crop": "பயிர் பதிவிடு",
            "my_batches": "என் தொகுப்புகள்",
            "climate_alerts": "பருவநிலை எச்சரிக்கைகள்",
            "assistant": "உதவியாளர்",
            "settings": "அமைப்புகள்",
            "logout": "வெளியேறு",
            "login": "உள்நுழை",
            "register": "பதிவு செய்",
            "get_started": "தொடங்கவும்",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
