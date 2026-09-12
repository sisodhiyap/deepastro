import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Security Gate
    'security.title': 'SECURITY VERIFICATION',
    'security.subtitle': 'Enter cosmic authorization key to unlock DeepAstro 6.0',
    'security.codePrompt': 'Enter Access Code',
    'security.codePlaceholder': 'Enter access authorization code',
    'security.unlockBtn': 'Unlock System →',
    'security.error': 'Invalid access authorization code. Please verify credentials.',
    'security.badge': '256-BIT ENCRYPTION ACTIVE',
    'security.disclaimer': 'Authorized Personnel & Invited Cosmic Seekers Only',
    
    // Auth Left Hero
    'hero.tagline': 'ANCIENT WISDOM. A BRIGHTER TOMORROW.',
    'hero.quote': '"Stars don\'t just tell stories, they reveal possibilities."',
    'hero.author': '— DEEPASTRO',
    'hero.align': 'Align',
    'hero.understand': 'Understand',
    'hero.evolve': 'Evolve',
    'hero.subtext1': 'ASTROLOGY',
    'hero.subtext2': 'AI INSIGHTS',
    'hero.subtext3': 'A BRIGHTER YOU',
    'hero.feature1': 'Personalized Insights',
    'hero.feature2': 'AI-Powered Guidance',
    'hero.feature3': 'Life Path Visualization',
    'hero.feature4': 'Ancient Wisdom + Modern Technology',

    // Auth Right Form
    'auth.welcome': 'Welcome to DeepAstro',
    'auth.signinToContinue': 'Sign in to continue your cosmic journey',
    'auth.userAccess': 'User Access',
    'auth.adminAccess': 'Admin Access',
    'auth.adminPortal': 'Admin Portal',
    'auth.adminSubtitle': 'Secure access to DeepAstro Intelligence Command',
    'auth.email': 'Email address',
    'auth.emailPlaceholder': 'Enter your email address',
    'auth.adminIdPlaceholder': 'Enter admin identifier / email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.securityKey': 'Security Authorization Code',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.signIn': 'Sign In →',
    'auth.signingIn': 'Signing in...',
    'auth.or': 'OR',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.notMember': 'Not a member yet?',
    'auth.createAccount': 'Create Account',
    'auth.alreadyMember': 'Already have an account?',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.resetPassword': 'Reset your password',
    'auth.resetDesc': 'Enter your registered email to receive reset instructions.',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.footerUniverse': 'THE UNIVERSE KNOWS YOU BETTER',
    
    // Errors
    'error.invalidCredentials': 'We couldn\'t sign you in. Please check your credentials and try again.',
    'error.accessCodeRequired': 'Please enter the valid access authorization code',
    'error.googleFailed': 'Google sign-in couldn\'t be completed. Please try again.',
    'error.adminUnauthorized': 'This account does not possess verified administrator credentials.',
  },
  hi: {
    // Security Gate
    'security.title': 'सुरक्षा प्रमाणीकरण',
    'security.subtitle': 'डीपएस्ट्रो 6.0 को अनलॉक करने के लिए कॉस्मिक सुरक्षा कोड दर्ज करें',
    'security.codePrompt': 'एक्सेस कोड दर्ज करें',
    'security.codePlaceholder': 'सुरक्षा प्राधिकरण कोड दर्ज करें',
    'security.unlockBtn': 'सिस्टम अनलॉक करें →',
    'security.error': 'अमान्य सुरक्षा कोड। कृपया अधिकृत क्रेडेंशियल सत्यापित करें।',
    'security.badge': '256-बिट एन्क्रिप्शन सक्रिय',
    'security.disclaimer': 'केवल अधिकृत उपयोगकर्ताओं और आमंत्रित साधकों के लिए',

    // Auth Left Hero
    'hero.tagline': 'प्राचीन ज्ञान। एक उज्जवल कल।',
    'hero.quote': '"सितारे केवल कहानियां नहीं सुनाते, वे अनंत संभावनाएं प्रकट करते हैं।"',
    'hero.author': '— डीपएस्ट्रो',
    'hero.align': 'संरेखित करें',
    'hero.understand': 'समझें',
    'hero.evolve': 'विकसित हों',
    'hero.subtext1': 'वैदिक ज्योतिष',
    'hero.subtext2': 'एआई अंतर्दृष्टि',
    'hero.subtext3': 'एक उज्जवल आप',
    'hero.feature1': 'व्यक्तिगत अंतर्दृष्टि',
    'hero.feature2': 'एआई-संचालित मार्गदर्शन',
    'hero.feature3': 'जीवन पथ का विज़ुअलाइज़ेशन',
    'hero.feature4': 'प्राचीन ज्ञान + आधुनिक तकनीक',

    // Auth Right Form
    'auth.welcome': 'डीपएस्ट्रो में आपका स्वागत है',
    'auth.signinToContinue': 'अपनी ब्रह्मांडीय यात्रा जारी रखने के लिए साइन इन करें',
    'auth.userAccess': 'उपयोगकर्ता एक्सेस',
    'auth.adminAccess': 'एडमिन एक्सेस',
    'auth.adminPortal': 'एडमिन पोर्टल',
    'auth.adminSubtitle': 'डीपएस्ट्रो इंटेलिजेंस तक सुरक्षित और नियंत्रित पहुंच',
    'auth.email': 'ईमेल पता',
    'auth.emailPlaceholder': 'अपना ईमेल पता दर्ज करें',
    'auth.adminIdPlaceholder': 'एडमिन आईडी / ईमेल दर्ज करें',
    'auth.password': 'पासवर्ड',
    'auth.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
    'auth.securityKey': 'सुरक्षा प्राधिकरण कोड',
    'auth.rememberMe': 'मुझे याद रखें',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.signIn': 'साइन इन करें →',
    'auth.signingIn': 'साइन इन हो रहा है...',
    'auth.or': 'या',
    'auth.continueWithGoogle': 'गूगल से जारी रखें',
    'auth.notMember': 'क्या आप सदस्य नहीं हैं?',
    'auth.createAccount': 'खाता बनाएं',
    'auth.alreadyMember': 'पहले से खाता है?',
    'auth.backToSignIn': 'साइन इन पर वापस जाएं',
    'auth.resetPassword': 'अपना पासवर्ड रीसेट करें',
    'auth.resetDesc': 'रीसेट निर्देश प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें।',
    'auth.sendResetLink': 'रीसेट लिंक भेजें',
    'auth.footerUniverse': 'ब्रह्मांड आपको सबसे बेहतर जानता है',

    // Errors
    'error.invalidCredentials': 'साइन इन नहीं हो सका। कृपया अपनी जानकारी जांचें और पुनः प्रयास करें।',
    'error.accessCodeRequired': 'कृपया मान्य सुरक्षा प्राधिकरण कोड दर्ज करें',
    'error.googleFailed': 'गूगल साइन इन पूरा नहीं हो सका। पुनः प्रयास करें।',
    'error.adminUnauthorized': 'इस खाते के पास प्रशासक अधिकार नहीं हैं।',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepastro_language') as Language;
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('deepastro_language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
