import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ne";

interface SettingsContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.featured": "Featured",
    "nav.howto": "How-To",
    "nav.orders": "Your Orders",
    "nav.signin": "Sign In",
    "nav.search": "Search Products",

    // Settings panel
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.darkMode": "Dark Mode",
    "settings.lang.en": "English",
    "settings.lang.ne": "नेपाली",
    "settings.profile.guest": "Guest User",
    "settings.profile.notLoggedIn": "Not logged in",
    "settings.profile.viewProfile": "View Profile",
    "settings.profile.logout": "Logout",

    // Search
    "search.placeholder": "Search products, categories…",
    "search.hint": "Start typing to search products…",
    "search.empty": "No products found for",

    // Home page
    "home.badge": "100% Pure & Natural",
    "home.headline1": "Purity You Can",
    "home.headline1b": "Trust",
    "home.headline2": "Nature You Can",
    "home.headline2b": "Taste",
    "home.subheadline": "Ethically sourced, sustainably grown, and delivered fresh to your door.",
    "home.cta": "Explore Collection",
    "home.customers": "Happy Customers",
    "home.organic": "100% Organic",
    "home.certified": "Certified",
    "home.purityVerified": "Purity Verified",
    "home.feat.certified": "Certified Organic",
    "home.feat.certifiedDesc": "100% natural products, independently verified and free from synthetics.",
    "home.feat.farm": "Farm to Table",
    "home.feat.farmDesc": "Sourced directly from local farmers, ensuring maximum freshness.",
    "home.feat.eco": "Eco-Sustainable",
    "home.feat.ecoDesc": "Packaged in 100% biodegradable materials to protect our earth.",
    "home.search": "Search products…",
    "home.noProducts": "No products found.",
    "home.newsletter.title": "Join the Organic Movement",
    "home.newsletter.desc": "Subscribe for exclusive access to seasonal harvests, healthy living guides, and member-only benefits.",
    "home.newsletter.placeholder": "Enter your email address",
    "home.newsletter.btn": "Subscribe Now",
    "home.loading": "Loading products…",
    "home.error.title": "Connection Error",
    "home.error.retry": "Try Again",
    "home.liveTracking": "Live Tracking",
    "home.featured": "Featured",

    // Featured Products page
    "featured.back": "Back to Home",
    "featured.badge": "Premium Curations",
    "featured.title": "Our",
    "featured.titleItalic": "Signature",
    "featured.titleEnd": "Offers",
    "featured.subtitle": "A handpicked selection of our highest-rated organics and exclusive seasonal discounts.",
    "featured.loading": "Curating the finest items for you...",
    "featured.error": "Unable to load features.",
    "featured.empty": "No featured products available at this time. Check back soon for seasonal specials!",
    "featured.organic": "Organic",
    "featured.feedback": "Feedback",
    "featured.feedbackPlaceholder": "What do you think?",
    "featured.loveFirst": "Be the first to love this",
    "featured.loved": "members loved this",
    "featured.fanFavorite": "Fan Favorite",
  },
  ne: {
    // Nav
    "nav.featured": "विशेष",
    "nav.howto": "कसरी बनाउने",
    "nav.orders": "तपाईंका अर्डरहरू",
    "nav.signin": "साइन इन",
    "nav.search": "उत्पादन खोज्नुहोस्",

    // Settings panel
    "settings.title": "सेटिङहरू",
    "settings.language": "भाषा",
    "settings.darkMode": "डार्क मोड",
    "settings.lang.en": "English",
    "settings.lang.ne": "नेपाली",
    "settings.profile.guest": "अतिथि प्रयोगकर्ता",
    "settings.profile.notLoggedIn": "लगइन गरिएको छैन",
    "settings.profile.viewProfile": "प्रोफाइल हेर्नुहोस्",
    "settings.profile.logout": "लगआउट",

    // Search
    "search.placeholder": "उत्पादन, श्रेणीहरू खोज्नुहोस्…",
    "search.hint": "उत्पादन खोज्न टाइप गर्न सुरु गर्नुहोस्…",
    "search.empty": "यसको लागि कुनै उत्पादन फेला परेन",

    // Home page
    "home.badge": "१००% शुद्ध र प्राकृतिक",
    "home.headline1": "शुद्धता जुन तपाईंले",
    "home.headline1b": "विश्वास",
    "home.headline2": "प्रकृति जुन तपाईंले",
    "home.headline2b": "स्वाद",
    "home.subheadline": "नैतिक रूपमा स्रोत गरिएको, दिगो रूपमा उगाइएको, र ताजा तपाईंको ढोकामा पुर्‍याइएको।",
    "home.cta": "संग्रह हेर्नुहोस्",
    "home.customers": "खुशी ग्राहकहरू",
    "home.organic": "१००% जैविक",
    "home.certified": "प्रमाणित",
    "home.purityVerified": "शुद्धता प्रमाणित",
    "home.feat.certified": "प्रमाणित जैविक",
    "home.feat.certifiedDesc": "१००% प्राकृतिक उत्पादनहरू, स्वतन्त्र रूपमा प्रमाणित र सिंथेटिकबाट मुक्त।",
    "home.feat.farm": "खेतबाट टेबलमा",
    "home.feat.farmDesc": "स्थानीय किसानहरूबाट सीधै स्रोत गरिएको, अधिकतम ताजापन सुनिश्चित गर्दै।",
    "home.feat.eco": "पारिस्थितिक-दिगो",
    "home.feat.ecoDesc": "हाम्रो पृथ्वी रक्षा गर्न १००% जैव-विघटनयोग्य सामग्रीमा प्याकेज गरिएको।",
    "home.search": "उत्पादन खोज्नुहोस्…",
    "home.noProducts": "कुनै उत्पादन फेला परेन।",
    "home.newsletter.title": "जैविक आन्दोलनमा सामेल हुनुहोस्",
    "home.newsletter.desc": "मौसमी फसल, स्वस्थ जीवन मार्गदर्शन, र सदस्य-मात्र लाभहरूमा विशेष पहुँचको लागि सदस्यता लिनुहोस्।",
    "home.newsletter.placeholder": "आफ्नो इमेल ठेगाना प्रविष्ट गर्नुहोस्",
    "home.newsletter.btn": "अभिदान गर्नुहोस्",
    "home.loading": "उत्पादनहरू लोड हुँदै…",
    "home.error.title": "जडान त्रुटि",
    "home.error.retry": "फेरि प्रयास गर्नुहोस्",
    "home.liveTracking": "लाइभ ट्र्याकिङ",
    "home.featured": "विशेष",

    // Featured Products page
    "featured.back": "गृह पृष्ठमा फर्कनुहोस्",
    "featured.badge": "प्रिमियम चयनहरू",
    "featured.title": "हाम्रो",
    "featured.titleItalic": "हस्ताक्षर",
    "featured.titleEnd": "अफरहरू",
    "featured.subtitle": "हाम्रो सर्वोच्च मूल्याङ्कन गरिएका जैविक र विशेष मौसमी छुटहरूको हातले छानिएको संग्रह।",
    "featured.loading": "तपाईंका लागि उत्कृष्ट वस्तुहरू क्युरेट गर्दै...",
    "featured.error": "विशेषताहरू लोड गर्न असमर्थ।",
    "featured.empty": "हाल कुनै विशेष उत्पादनहरू उपलब्ध छैनन्। मौसमी विशेषहरूको लागि फेरि जाँच गर्नुहोस्!",
    "featured.organic": "जैविक",
    "featured.feedback": "प्रतिक्रिया",
    "featured.feedbackPlaceholder": "तपाईंलाई के लाग्छ?",
    "featured.loveFirst": "यसलाई पहिलो माया गर्नुहोस्",
    "featured.loved": "सदस्यहरूले यसलाई मन पराए",
    "featured.fanFavorite": "प्रशंसक मनपर्ने",
  },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const t = (key: string) => translations[language][key] ?? key;

  return (
    <SettingsContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
