import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'en' | 'es' | 'hi' | 'te' | 'ta' | 'fr'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Homepage
    'home.hero.title': 'Direct Market Access',
    'home.hero.subtitle': 'Connecting Farmers Directly with Buyers',
    'home.hero.description': 'Eliminate middlemen, maximize profits, and access fresh produce directly from local farmers.',
    'home.hero.cta.farmer': 'Join as Farmer',
    'home.hero.cta.buyer': 'Join as Buyer',
    
    // Mission
    'mission.title': 'Our Mission',
    'mission.description': 'We believe in empowering farmers by providing them direct access to buyers, ensuring fair prices and fresher produce for everyone.',
    
    // Features
    'features.title': 'Why Choose Direct Market Access?',
    'features.direct.title': 'Direct Connection',
    'features.direct.description': 'Connect directly with farmers and buyers, eliminating unnecessary middlemen.',
    'features.fair.title': 'Fair Pricing',
    'features.fair.description': 'Farmers get better prices, buyers get competitive rates.',
    'features.fresh.title': 'Fresh Produce',
    'features.fresh.description': 'Get the freshest produce directly from the source.',
    'features.secure.title': 'Secure Payments',
    'features.secure.description': 'Escrow-based payments ensure safe transactions for all parties.',
    
    // Authentication
    'auth.login.title': 'Login to Your Account',
    'auth.signup.title': 'Create Your Account',
    'auth.email': 'Email Address',
    'auth.phone': 'Phone Number',
    'auth.fullName': 'Full Name',
    'auth.role': 'I am a',
    'auth.role.farmer': 'Farmer',
    'auth.role.buyer': 'Buyer',
    'auth.sendOTP': 'Send OTP',
    'auth.verifyOTP': 'Verify OTP',
    'auth.otp': 'Enter OTP',
    'auth.resendOTP': 'Resend OTP',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.category': 'Category',
    'common.status': 'Status',
    'common.actions': 'Actions'
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Acerca',
    'nav.contact': 'Contacto',
    'nav.login': 'Iniciar Sesión',
    'nav.dashboard': 'Panel',
    'nav.logout': 'Cerrar Sesión',
    
    // Homepage
    'home.hero.title': 'Acceso Directo al Mercado',
    'home.hero.subtitle': 'Conectando Agricultores Directamente con Compradores',
    'home.hero.description': 'Elimina intermediarios, maximiza ganancias y accede a productos frescos directamente de agricultores locales.',
    'home.hero.cta.farmer': 'Únete como Agricultor',
    'home.hero.cta.buyer': 'Únete como Comprador',
    
    // Mission
    'mission.title': 'Nuestra Misión',
    'mission.description': 'Creemos en empoderar a los agricultores proporcionándoles acceso directo a compradores, asegurando precios justos y productos más frescos para todos.',
    
    // Features
    'features.title': '¿Por qué elegir Acceso Directo al Mercado?',
    'features.direct.title': 'Conexión Directa',
    'features.direct.description': 'Conéctate directamente con agricultores y compradores, eliminando intermediarios innecesarios.',
    'features.fair.title': 'Precio Justo',
    'features.fair.description': 'Los agricultores obtienen mejores precios, los compradores obtienen tarifas competitivas.',
    'features.fresh.title': 'Productos Frescos',
    'features.fresh.description': 'Obtén los productos más frescos directamente de la fuente.',
    'features.secure.title': 'Pagos Seguros',
    'features.secure.description': 'Los pagos basados en depósito en garantía aseguran transacciones seguras para todas las partes.',
    
    // Authentication
    'auth.login.title': 'Iniciar Sesión en Tu Cuenta',
    'auth.signup.title': 'Crear Tu Cuenta',
    'auth.email': 'Correo Electrónico',
    'auth.phone': 'Número de Teléfono',
    'auth.fullName': 'Nombre Completo',
    'auth.role': 'Soy un',
    'auth.role.farmer': 'Agricultor',
    'auth.role.buyer': 'Comprador',
    'auth.sendOTP': 'Enviar OTP',
    'auth.verifyOTP': 'Verificar OTP',
    'auth.otp': 'Ingrese OTP',
    'auth.resendOTP': 'Reenviar OTP',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.price': 'Precio',
    'common.quantity': 'Cantidad',
    'common.category': 'Categoría',
    'common.status': 'Estado',
    'common.actions': 'Acciones'
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉगिन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.logout': 'लॉगआउट',
    
    // Homepage
    'home.hero.title': 'प्रत्यक्ष बाजार पहुंच',
    'home.hero.subtitle': 'किसानों को सीधे खरीदारों से जोड़ना',
    'home.hero.description': 'बिचौलियों को हटाएं, मुनाफा बढ़ाएं, और स्थानीय किसानों से सीधे ताजी उपज तक पहुंच प्राप्त करें।',
    'home.hero.cta.farmer': 'किसान के रूप में जुड़ें',
    'home.hero.cta.buyer': 'खरीदार के रूप में जुड़ें',
    
    // Mission
    'mission.title': 'हमारा मिशन',
    'mission.description': 'हम किसानों को खरीदारों तक सीधी पहुंच प्रदान करके सशक्त बनाने में विश्वास करते हैं, सभी के लिए उचित मूल्य और ताजी उपज सुनिश्चित करते हैं।',
    
    // Features
    'features.title': 'प्रत्यक्ष बाजार पहुंच क्यों चुनें?',
    'features.direct.title': 'प्रत्यक्ष संपर्क',
    'features.direct.description': 'अनावश्यक बिचौलियों को हटाकर किसानों और खरीदारों से सीधे जुड़ें।',
    'features.fair.title': 'उचित मूल्य',
    'features.fair.description': 'किसानों को बेहतर मूल्य मिलता है, खरीदारों को प्रतिस्पर्धी दरें मिलती हैं।',
    'features.fresh.title': 'ताजी उपज',
    'features.fresh.description': 'स्रोत से सीधे सबसे ताजी उपज प्राप्त करें।',
    'features.secure.title': 'सुरक्षित भुगतान',
    'features.secure.description': 'एस्क्रो-आधारित भुगतान सभी पक्षों के लिए सुरक्षित लेनदेन सुनिश्चित करता है।',
    
    // Authentication
    'auth.login.title': 'अपने खाते में लॉगिन करें',
    'auth.signup.title': 'अपना खाता बनाएं',
    'auth.email': 'ईमेल पता',
    'auth.phone': 'फोन नंबर',
    'auth.fullName': 'पूरा नाम',
    'auth.role': 'मैं हूं',
    'auth.role.farmer': 'किसान',
    'auth.role.buyer': 'खरीदार',
    'auth.sendOTP': 'OTP भेजें',
    'auth.verifyOTP': 'OTP सत्यापित करें',
    'auth.otp': 'OTP दर्ज करें',
    'auth.resendOTP': 'OTP पुनः भेजें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.price': 'मूल्य',
    'common.quantity': 'मात्रा',
    'common.category': 'श्रेणी',
    'common.status': 'स्थिति',
    'common.actions': 'कार्य'
  },
  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.about': 'మా గురించి',
    'nav.contact': 'సంప్రదింపులు',
    'nav.login': 'లాగిన్',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.logout': 'లాగ్అవుట్',
    
    // Homepage
    'home.hero.title': 'ప్రత్యక్ష మార్కెట్ యాక్సెస్',
    'home.hero.subtitle': 'రైతులను నేరుగా కొనుగోలుదారులతో కలుపుట',
    'home.hero.description': 'మధ్యవర్తులను తొలగించండి, లాభాలను పెంచండి మరియు స్థానిక రైతుల నుండి నేరుగా తాజా ఉత్పాదనలను పొందండి.',
    'home.hero.cta.farmer': 'రైతుగా చేరండి',
    'home.hero.cta.buyer': 'కొనుగోలుదారుగా చేరండి',
    
    // Mission
    'mission.title': 'మా లక్ష్యం',
    'mission.description': 'రైతులకు కొనుగోలుదారుల వరకు ప్రత్యక్ష ప్రవేశాన్ని అందించడం ద్వారా వారిని శక్తివంతం చేయడంలో మేము నమ్ముతాము, అందరికీ న్యాయమైన ధరలు మరియు తాజా ఉత్పాదనలను నిర్ధారిస్తాము.',
    
    // Features
    'features.title': 'ప్రత్యక్ష మార్కెట్ యాక్సెస్ ఎందుకు ఎంచుకోవాలి?',
    'features.direct.title': 'ప్రత్యక్ష కనెక్షన్',
    'features.direct.description': 'అనవసరమైన మధ్యవర్తులను తొలగించి రైతులు మరియు కొనుగోలుదారులతో నేరుగా కనెక్ట్ అవ్వండి.',
    'features.fair.title': 'న్యాయమైన ధర',
    'features.fair.description': 'రైతులకు మంచి ధరలు లభిస్తాయి, కొనుగోలుదారులకు పోటీ రేట్లు లభిస్తాయి.',
    'features.fresh.title': 'తాజా ఉత్పాదనలు',
    'features.fresh.description': 'మూలం నుండి నేరుగా అత్యంత తాజా ఉత్పాదనలను పొందండి.',
    'features.secure.title': 'సురక్షిత చెల్లింపులు',
    'features.secure.description': 'ఎస్క్రో-ఆధారిత చెల్లింపులు అన్ని పార్టీలకు సురక్షిత లావాదేవీలను నిర్ధారిస్తాయి.',
    
    // Authentication
    'auth.login.title': 'మీ ఖాతాలోకి లాగిన్ చేయండి',
    'auth.signup.title': 'మీ ఖాతాను సృష్టించండి',
    'auth.email': 'ఇమెయిల్ చిరునామా',
    'auth.phone': 'ఫోన్ నంబర్',
    'auth.fullName': 'పూర్తి పేరు',
    'auth.role': 'నేను',
    'auth.role.farmer': 'రైతు',
    'auth.role.buyer': 'కొనుగోలుదారు',
    'auth.sendOTP': 'OTP పంపండి',
    'auth.verifyOTP': 'OTP ధృవీకరించండి',
    'auth.otp': 'OTP నమోదు చేయండి',
    'auth.resendOTP': 'OTP మళ్లీ పంపండి',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.save': 'సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.delete': 'తొలగించండి',
    'common.edit': 'సవరించండి',
    'common.view': 'చూడండి',
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.price': 'ధర',
    'common.quantity': 'పరిమాణం',
    'common.category': 'వర్గం',
    'common.status': 'స్థితి',
    'common.actions': 'చర్యలు'
  },
  ta: {
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.contact': 'தொடர்பு',
    'nav.login': 'உள்நுழைவு',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.logout': 'வெளியேறு',
    
    // Homepage
    'home.hero.title': 'நேரடி சந்தை அணுகல்',
    'home.hero.subtitle': 'விவசாயிகளை நேரடியாக வாங்குபவர்களுடன் இணைத்தல்',
    'home.hero.description': 'இடைத்தரகர்களை நீக்கி, லாபத்தை அதிகரித்து, உள்ளூர் விவசாயிகளிடமிருந்து நேரடியாக புதிய விளைபொருட்களை அணுகுங்கள்.',
    'home.hero.cta.farmer': 'விவசாயியாக சேருங்கள்',
    'home.hero.cta.buyer': 'வாங்குபவராக சேருங்கள்',
    
    // Mission
    'mission.title': 'எங்கள் நோக்கம்',
    'mission.description': 'விவசாயிகளுக்கு வாங்குபவர்களுக்கு நேரடி அணுகலை வழங்குவதன் மூலம் அவர்களை வலுப்படுத்துவதில் நாங்கள் நம்புகிறோம், அனைவருக்கும் நியாயமான விலைகள் மற்றும் புதிய விளைபொருட்களை உறுதி செய்கிறோம்.',
    
    // Features
    'features.title': 'நேரடி சந்தை அணுகலை ஏன் தேர்வு செய்ய வேண்டும்?',
    'features.direct.title': 'நேரடி இணைப்பு',
    'features.direct.description': 'தேவையற்ற இடைத்தரகர்களை நீக்கி விவசாயிகள் மற்றும் வாங்குபவர்களுடன் நேரடியாக இணைக்கவும்.',
    'features.fair.title': 'நியாயமான விலை',
    'features.fair.description': 'விவசாயிகளுக்கு சிறந்த விலைகள் கிடைக்கின்றன, வாங்குபவர்களுக்கு போட்டி விலைகள் கிடைக்கின்றன.',
    'features.fresh.title': 'புதிய விளைபொருட்கள்',
    'features.fresh.description': 'மூலத்திலிருந்து நேரடியாக மிகவும் புதிய விளைபொருட்களைப் பெறுங்கள்.',
    'features.secure.title': 'பாதுகாப்பான பணம் செலுத்துதல்',
    'features.secure.description': 'எஸ்க்ரோ அடிப்படையிலான பணம் செலுத்துதல் அனைத்து தரப்பினருக்கும் பாதுகாப்பான பரிவர்த்தனைகளை உறுதி செய்கிறது.',
    
    // Authentication
    'auth.login.title': 'உங்கள் கணக்கில் உள்நுழையவும்',
    'auth.signup.title': 'உங்கள் கணக்கை உருவாக்கவும்',
    'auth.email': 'மின்னஞ்சல் முகவரி',
    'auth.phone': 'தொலைபேசி எண்',
    'auth.fullName': 'முழு பெயர்',
    'auth.role': 'நான்',
    'auth.role.farmer': 'விவசாயி',
    'auth.role.buyer': 'வாங்குபவர்',
    'auth.sendOTP': 'OTP அனுப்பவும்',
    'auth.verifyOTP': 'OTP சரிபார்க்கவும்',
    'auth.otp': 'OTP உள்ளிடவும்',
    'auth.resendOTP': 'OTP மீண்டும் அனுப்பவும்',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமிக்கவும்',
    'common.cancel': 'ரத்து செய்யவும்',
    'common.delete': 'நீக்கவும்',
    'common.edit': 'திருத்தவும்',
    'common.view': 'பார்க்கவும்',
    'common.search': 'தேடவும்',
    'common.filter': 'வடிகட்டி',
    'common.price': 'விலை',
    'common.quantity': 'அளவு',
    'common.category': 'வகை',
    'common.status': 'நிலை',
    'common.actions': 'செயல்கள்'
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.dashboard': 'Tableau de bord',
    'nav.logout': 'Déconnexion',
    
    // Homepage
    'home.hero.title': 'Accès Direct au Marché',
    'home.hero.subtitle': 'Connecter les Agriculteurs Directement aux Acheteurs',
    'home.hero.description': 'Éliminez les intermédiaires, maximisez les profits et accédez aux produits frais directement des agriculteurs locaux.',
    'home.hero.cta.farmer': 'Rejoindre en tant qu\'Agriculteur',
    'home.hero.cta.buyer': 'Rejoindre en tant qu\'Acheteur',
    
    // Mission
    'mission.title': 'Notre Mission',
    'mission.description': 'Nous croyons en l\'autonomisation des agriculteurs en leur fournissant un accès direct aux acheteurs, garantissant des prix équitables et des produits plus frais pour tous.',
    
    // Features
    'features.title': 'Pourquoi choisir l\'Accès Direct au Marché?',
    'features.direct.title': 'Connexion Directe',
    'features.direct.description': 'Connectez-vous directement avec les agriculteurs et les acheteurs, éliminant les intermédiaires inutiles.',
    'features.fair.title': 'Prix Équitable',
    'features.fair.description': 'Les agriculteurs obtiennent de meilleurs prix, les acheteurs obtiennent des tarifs compétitifs.',
    'features.fresh.title': 'Produits Frais',
    'features.fresh.description': 'Obtenez les produits les plus frais directement de la source.',
    'features.secure.title': 'Paiements Sécurisés',
    'features.secure.description': 'Les paiements basés sur l\'entiercement garantissent des transactions sûres pour toutes les parties.',
    
    // Authentication
    'auth.login.title': 'Connectez-vous à votre compte',
    'auth.signup.title': 'Créez votre compte',
    'auth.email': 'Adresse e-mail',
    'auth.phone': 'Numéro de téléphone',
    'auth.fullName': 'Nom complet',
    'auth.role': 'Je suis un',
    'auth.role.farmer': 'Agriculteur',
    'auth.role.buyer': 'Acheteur',
    'auth.sendOTP': 'Envoyer OTP',
    'auth.verifyOTP': 'Vérifier OTP',
    'auth.otp': 'Entrer OTP',
    'auth.resendOTP': 'Renvoyer OTP',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.price': 'Prix',
    'common.quantity': 'Quantité',
    'common.category': 'Catégorie',
    'common.status': 'Statut',
    'common.actions': 'Actions'
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      t: (key: string) => {
        const { language } = get()
        return translations[language][key as keyof typeof translations.en] || key
      }
    }),
    {
      name: 'language-storage'
    }
  )
)