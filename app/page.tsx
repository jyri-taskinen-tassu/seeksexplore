"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Language = "en" | "fi";

const translations = {
  en: {
    nav: {
      experiences: "Experiences",
      destinations: "Destinations",
      howItWorks: "How it works",
      forProviders: "For providers",
      contact: "Contact",
    },
    hero: {
      headline: "Experiences that fit you. Anywhere you go.",
      subheadline: "Discover handpicked activities, local adventures and hidden gems tailored to your interests.",
      ctaPrimary: "Explore Experiences",
      ctaSecondary: "Plan your trip",
      search: {
        location: "Where?",
        activity: "What?",
        date: "When?",
        people: "How many?",
        searchButton: "Search",
      },
    },
    categories: {
      title: "Popular Categories",
      nature: "Nature & Outdoor",
      adventures: "Adventures",
      wellness: "Wellness & Sauna",
      culture: "Local Culture",
      food: "Food & Tastings",
      guided: "Guided Experiences",
    },
    experiences: {
      title: "Featured Experiences",
      viewExperience: "View experience",
      duration: "Duration",
      rating: "rating",
      reviews: "reviews",
      startingFrom: "From",
    },
    destinations: {
      title: "Explore Destinations",
    },
    aiAssistant: {
      title: "AI Travel Assistant",
      subtitle: "Get personalized recommendations for your perfect adventure",
      prompt: "I want a relaxing winter day in Lapland for two people.",
      suggestion1: "Traditional Finnish Sauna Experience",
      suggestion2: "Snowshoe Walk in the Forest",
      suggestion3: "Northern Lights Tour",
      tryIt: "Try it now",
    },
    didYouKnow: {
      title: "Did you know?",
      subtitle: "About Lapland",
      fact1: "Winter temperatures",
      fact1Content: "Average -10°C to -20°C, can drop to -30°C",
      fact2: "What to wear",
      fact2Content: "Layered clothing, thermal base, waterproof outer layer",
      fact3: "Northern Lights season",
      fact3Content: "Best viewing from September to March",
    },
    howItWorks: {
      title: "How it works",
      step1: {
        title: "Discover experiences",
        description: "Browse curated activities and adventures that match your interests.",
      },
      step2: {
        title: "Choose what fits you",
        description: "Filter by location, activity type, duration, and read authentic reviews.",
      },
      step3: {
        title: "Book your adventure",
        description: "Secure booking with instant confirmation. Cancel up to 24h before.",
      },
    },
    providers: {
      title: "Trusted by leading experience providers",
    },
    footer: {
      about: "About",
      forProviders: "For providers",
      faq: "FAQ",
      contact: "Contact",
      privacy: "Privacy Policy",
      copyright: "All rights reserved.",
    },
    contactForm: {
      title: "Get in touch",
      subtitle: "Have questions? We're here to help.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      sendMessage: "Send message",
      sending: "Sending...",
      success: "Message sent successfully! We'll get back to you soon.",
      error: "Failed to send message. Please try again.",
      privacyConsent: "I agree to the privacy policy",
      privacyLink: "Privacy Policy",
      required: "Required",
      emailPlaceholder: "your@email.com",
      phonePlaceholder: "+358 50 123 4567",
    },
  },
  fi: {
    nav: {
      experiences: "Elämykset",
      destinations: "Kohteet",
      howItWorks: "Miten se toimii",
      forProviders: "Tarjoajille",
      contact: "Ota yhteyttä",
    },
    hero: {
      headline: "Elämyksiä, jotka sopivat sinulle. Missä tahansa menetkin.",
      subheadline: "Löydä käsinkäännettyjä aktiviteetteja, paikallisia seikkailuja ja piilossa olevia helmiä, jotka räätälöidään mielenkiintojesi mukaan.",
      ctaPrimary: "Selaa elämyksiä",
      ctaSecondary: "Suunnittele matkasi",
      search: {
        location: "Minne?",
        activity: "Mitä?",
        date: "Milloin?",
        people: "Kuinka monta?",
        searchButton: "Hae",
      },
    },
    categories: {
      title: "Suositut kategoriat",
      nature: "Luonto & Ulkoilu",
      adventures: "Seikkailut",
      wellness: "Hyvinvointi & Sauna",
      culture: "Paikallinen kulttuuri",
      food: "Ruoka & Maistelut",
      guided: "Ohjatut elämykset",
    },
    experiences: {
      title: "Suositellut elämykset",
      viewExperience: "Katso elämys",
      duration: "Kesto",
      rating: "arvosana",
      reviews: "arvostelua",
      startingFrom: "Alkaen",
    },
    destinations: {
      title: "Tutustu kohteisiin",
    },
    aiAssistant: {
      title: "AI Matka-assistentti",
      subtitle: "Saa henkilökohtaisia suosituksia täydelliseen seikkailuusi",
      prompt: "Haluan rentouttavan talvipäivän Lapissa kahdelle henkilölle.",
      suggestion1: "Perinteinen suomalainen saunakokemus",
      suggestion2: "Lumikenkäkävely metsässä",
      suggestion3: "Revontuliretki",
      tryIt: "Kokeile nyt",
    },
    didYouKnow: {
      title: "Tiesitkö?",
      subtitle: "Lapista",
      fact1: "Talvilämpötilat",
      fact1Content: "Keskimäärin -10°C - -20°C, voi laskea -30°C:een",
      fact2: "Mitä pukea",
      fact2Content: "Kerrospukeutuminen, lämpöalus, vedenpitävä ulkokerros",
      fact3: "Revontulien kausi",
      fact3Content: "Paras näkyvyys syyskuusta maaliskuuhun",
    },
    howItWorks: {
      title: "Miten se toimii",
      step1: {
        title: "Löydä elämyksiä",
        description: "Selaa käsinkäännettyjä aktiviteetteja ja seikkailuja, jotka sopivat mielenkiintoihisi.",
      },
      step2: {
        title: "Valitse sinulle sopiva",
        description: "Suodata sijainnin, aktiviteettityypin, keston mukaan ja lue aitoja arvosteluja.",
      },
      step3: {
        title: "Varaa seikkailusi",
        description: "Turvallinen varaus välittömällä vahvistuksella. Peruuta 24h ennen.",
      },
    },
    providers: {
      title: "Luotettavat johtavat elämyspalveluntarjoajat",
    },
    footer: {
      about: "Tietoja",
      forProviders: "Tarjoajille",
      faq: "UKK",
      contact: "Ota yhteyttä",
      privacy: "Tietosuojaseloste",
      copyright: "Kaikki oikeudet pidätetään.",
    },
    contactForm: {
      title: "Ota yhteyttä",
      subtitle: "Onko kysymyksiä? Olemme täällä auttamassa.",
      name: "Nimi",
      email: "Sähköposti",
      phone: "Puhelin",
      message: "Viesti",
      sendMessage: "Lähetä viesti",
      sending: "Lähetetään...",
      success: "Viesti lähetetty onnistuneesti! Otamme yhteyttä pian.",
      error: "Viestin lähetys epäonnistui. Yritä uudelleen.",
      privacyConsent: "Hyväksyn tietosuojaselosteen",
      privacyLink: "Tietosuojaseloste",
      required: "Pakollinen",
      emailPlaceholder: "sähköposti@esimerkki.com",
      phonePlaceholder: "+358 50 123 4567",
    },
  },
};

export const experiences = [
  {
    id: 1,
    title: "Arctic Snowshoe Adventure",
    location: "Rovaniemi",
    duration: "4 hours",
    rating: 4.9,
    reviews: 127,
    price: 89,
    image: "https://images.unsplash.com/photo-1551524164-6cf77f5e1d66?w=800&h=600&fit=crop",
    description: {
      en: "Experience the magic of Lapland's winter wilderness on a guided snowshoe adventure. Walk through pristine snow-covered forests, learn about local wildlife, and enjoy hot drinks by a campfire. Perfect for nature lovers and adventure seekers.",
      fi: "Koe Lapin talvimetsän taikaa opastetulla lumikenkäseikkailulla. Kävele koskemattomien lumipeitteisten metsien läpi, opi paikallisesta luonnosta ja nauti kuumia juomia nuotiolla. Täydellinen luonnonystäville ja seikkailunhaluisille.",
    },
    highlights: {
      en: ["Guided snowshoe trekking", "Wildlife spotting", "Campfire with hot drinks", "Small groups (max 8)", "All equipment included"],
      fi: ["Ohjattu lumikenkäretki", "Eläinten tarkkailu", "Nuotio kuumilla juomilla", "Pienet ryhmät (max 8)", "Kaikki varusteet sisältyvät"],
    },
    category: "adventures",
  },
  {
    id: 2,
    title: "Helsinki Archipelago Kayaking Tour",
    location: "Helsinki",
    duration: "3 hours",
    rating: 4.8,
    reviews: 94,
    price: 75,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    description: {
      en: "Paddle through Helsinki's stunning archipelago, exploring hidden islands and coastal beauty. Suitable for beginners, with professional guides and all equipment provided. Discover the city from a unique water perspective.",
      fi: "Meloi Helsingin upean saariston läpi, tutkien piilossa olevia saaria ja rannikon kauneutta. Sopii aloittelijoille, ammattimaisilla oppailla ja kaikilla varusteilla. Löydä kaupunki ainutlaatuisesta vedenäkökulmasta.",
    },
    highlights: {
      en: ["Beginner-friendly", "Professional guide", "All equipment included", "Small groups", "Safety briefing"],
      fi: ["Aloittelijaystävällinen", "Ammattimainen opas", "Kaikki varusteet sisältyvät", "Pienet ryhmät", "Turvallisuusohjeistus"],
    },
    category: "adventures",
  },
  {
    id: 3,
    title: "Northern Lights Photography Tour",
    location: "Lapland",
    duration: "5 hours",
    rating: 5.0,
    reviews: 203,
    price: 149,
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop",
    description: {
      en: "Capture the mesmerizing Northern Lights with expert photography guidance. Learn camera settings, composition techniques, and enjoy the aurora in prime viewing locations. Includes professional photography tips and warm refreshments.",
      fi: "Tallenna lumoavat revontulet asiantuntijan valokuvausohjauksella. Opi kameran asetukset, kompositiotekniikat ja nauti revontulista parhaissa katselupaikoissa. Sisältää ammattimaisia valokuvausvinkkejä ja lämmintä virvokkeita.",
    },
    highlights: {
      en: ["Expert photography guidance", "Prime aurora locations", "Camera settings tutorial", "Warm refreshments", "Small groups"],
      fi: ["Asiantuntijan valokuvausohjaus", "Parhaat revontulipaikat", "Kameran asetukset -opetus", "Lämpimät virvokkeet", "Pienet ryhmät"],
    },
    category: "guided",
  },
  {
    id: 4,
    title: "Traditional Finnish Sauna & Ice Swimming",
    location: "Helsinki",
    duration: "2.5 hours",
    rating: 4.9,
    reviews: 156,
    price: 65,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
    description: {
      en: "Experience authentic Finnish sauna culture followed by invigorating ice swimming. Learn about sauna traditions, enjoy the heat, and take the traditional plunge into icy waters. A truly Finnish wellness experience.",
      fi: "Koe aitoa suomalaista saunakulttuuria, jota seuraa virkistävä avantouinti. Opi saunaperinteistä, nauti lämmöstä ja ota perinteinen sukellus jäiseen veteen. Todella suomalainen hyvinvointikokemus.",
    },
    highlights: {
      en: ["Traditional sauna", "Ice swimming", "Cultural experience", "Relaxation", "Finnish traditions"],
      fi: ["Perinteinen sauna", "Avantouinti", "Kulttuurikokemus", "Rentoutuminen", "Suomalaiset perinteet"],
    },
    category: "wellness",
  },
  {
    id: 5,
    title: "Helsinki Street Food Walk",
    location: "Helsinki",
    duration: "3 hours",
    rating: 4.7,
    reviews: 88,
    price: 55,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    description: {
      en: "Discover Helsinki's vibrant food scene on a guided walking tour. Taste local specialties, visit hidden food spots, and learn about Finnish cuisine. Perfect for food lovers who want to explore beyond tourist restaurants.",
      fi: "Löydä Helsingin eloisa ruokakulttuuri opastetulla kävelykierroksella. Maista paikallisia erikoisuuksia, vieraile piilossa olevissa ruokapaikoissa ja opi suomalaisesta keittiöstä. Täydellinen ruokaystäville, jotka haluavat tutkia turistiravintoloiden ulkopuolelle.",
    },
    highlights: {
      en: ["Local food tastings", "Hidden food spots", "Cultural insights", "Small groups", "Walking tour"],
      fi: ["Paikalliset ruokamaistelut", "Piilossa olevat ruokapaikat", "Kulttuurisivut", "Pienet ryhmät", "Kävelykierros"],
    },
    category: "food",
  },
  {
    id: 6,
    title: "Reindeer Farm Experience",
    location: "Rovaniemi",
    duration: "2 hours",
    rating: 4.8,
    reviews: 142,
    price: 45,
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop",
    description: {
      en: "Visit an authentic reindeer farm and learn about Sami culture and reindeer herding. Feed the reindeer, take photos, and enjoy traditional stories. Family-friendly experience perfect for all ages.",
      fi: "Vieraile aidossa porotilalla ja opi saamelaiskulttuurista ja poronhoidosta. Ruoki poroja, ota kuvia ja nauti perinteisistä tarinoista. Perheystävällinen kokemus, joka sopii kaikenikäisille.",
    },
    highlights: {
      en: ["Reindeer feeding", "Sami culture", "Family-friendly", "Photo opportunities", "Traditional stories"],
      fi: ["Porojen ruokinta", "Saamelaiskulttuuri", "Perheystävällinen", "Kuvausmahdollisuudet", "Perinteiset tarinat"],
    },
    category: "culture",
  },
  {
    id: 7,
    title: "Fatbike Adventure in Levi",
    location: "Levi",
    duration: "3 hours",
    rating: 4.9,
    reviews: 76,
    price: 95,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
    description: {
      en: "Explore Levi's winter trails on a fatbike adventure. Ride through snow-covered forests and enjoy stunning mountain views. Suitable for all fitness levels with professional guides and quality equipment.",
      fi: "Tutustu Levin talvipoluille fatbike-seikkailulla. Aja lumipeitteisten metsien läpi ja nauti upeista vuoristonäkymistä. Sopii kaikille kuntoeroille ammattimaisilla oppailla ja laadukkailla varusteilla.",
    },
    highlights: {
      en: ["Fatbike rental", "Mountain trails", "All fitness levels", "Professional guide", "Quality equipment"],
      fi: ["Fatbike-vuokraus", "Vuoristopolut", "Kaikki kuntoerot", "Ammattimainen opas", "Laadukkaat varusteet"],
    },
    category: "adventures",
  },
  {
    id: 8,
    title: "Arctic Ice Fishing Experience",
    location: "Lapland",
    duration: "4 hours",
    rating: 4.6,
    reviews: 63,
    price: 79,
    image: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e4?w=800&h=600&fit=crop",
    description: {
      en: "Try traditional ice fishing on a frozen lake. Learn the techniques, drill your own hole, and enjoy the peaceful Arctic atmosphere. Includes warm drinks and traditional snacks. A unique Lapland experience.",
      fi: "Kokeile perinteistä jääkalastusta jäätyneellä järvellä. Opi tekniikat, poraa oma reikäsi ja nauti rauhallisesta arktisesta tunnelmasta. Sisältää lämmintä juomaa ja perinteisiä välipaloja. Ainutlaatuinen Lappi-kokemus.",
    },
    highlights: {
      en: ["Traditional technique", "Ice drilling", "Warm drinks included", "Peaceful atmosphere", "Unique experience"],
      fi: ["Perinteinen tekniikka", "Jään poraus", "Lämpimät juomat sisältyvät", "Rauhallinen tunnelma", "Ainutlaatuinen kokemus"],
    },
    category: "nature",
  },
];

const categories = [
  {
    id: 1,
    name: "nature",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "adventures",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "wellness",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "culture",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "food",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    name: "guided",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  },
];

const destinations = [
  { name: "Helsinki", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop" },
  { name: "Lapland", image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&h=400&fit=crop" },
  { name: "Levi", image: "https://images.unsplash.com/photo-1551524164-6cf77f5e1d66?w=600&h=400&fit=crop" },
  { name: "Rovaniemi", image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop" },
  { name: "Tahko", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop" },
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Array<{
    title: string;
    experienceId?: number;
    price?: number;
    duration?: string;
  }>;
};

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchActivity, setSearchActivity] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPeople, setSearchPeople] = useState("");
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacyConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const t = translations[language];

  // Update initial messages when language changes
  useEffect(() => {
    setAiMessages([
      {
        id: "1",
        role: "user",
        content: language === "en" ? "I want a relaxing winter day in Lapland for two people." : "Haluan rentouttavan talvipäivän Lapissa kahdelle henkilölle.",
      },
      {
        id: "2",
        role: "assistant",
        content: language === "en"
          ? "Perfect! For a relaxing winter day in Lapland, I recommend these experiences that combine wellness and nature:"
          : "Loistavaa! Rentouttavaan talvipäivään Lapiin suosittelen näitä elämyksiä, jotka yhdistävät hyvinvointia ja luontoa:",
        suggestions: [
          { title: "Traditional Finnish Sauna & Ice Swimming", experienceId: 4, price: 65, duration: "2.5 hours" },
          { title: "Northern Lights Photography Tour", experienceId: 3, price: 149, duration: "5 hours" },
          { title: "Arctic Snowshoe Adventure", experienceId: 1, price: 89, duration: "4 hours" },
          { title: "Reindeer Farm Experience", experienceId: 6, price: 45, duration: "2 hours" },
        ],
      },
    ]);
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would go here
    console.log("Search:", { searchLocation, searchActivity, searchDate, searchPeople });
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: aiInput,
    };

    setAiMessages((prev) => [...prev, userMessage]);
    const currentInput = aiInput;
    setAiInput("");
    setAiLoading(true);

    // Enhanced AI response with better logic and linked suggestions
    setTimeout(() => {
      const input = currentInput.toLowerCase();
      let response = "";
      let suggestions: Array<{ title: string; experienceId?: number; price?: number; duration?: string }> = [];

      // Lapland / Winter experiences
      if (input.includes("lapland") || input.includes("lappi") || (input.includes("winter") && input.includes("relax")) || (input.includes("talvi") && input.includes("rentoutua"))) {
        response = language === "en"
          ? "Perfect! For a relaxing winter day in Lapland, I recommend these experiences that combine wellness and nature:"
          : "Loistavaa! Rentouttavaan talvipäivään Lapiin suosittelen näitä elämyksiä, jotka yhdistävät hyvinvointia ja luontoa:";
        suggestions = [
          { title: "Traditional Finnish Sauna & Ice Swimming", experienceId: 4, price: 65, duration: "2.5 hours" },
          { title: "Northern Lights Photography Tour", experienceId: 3, price: 149, duration: "5 hours" },
          { title: "Arctic Snowshoe Adventure", experienceId: 1, price: 89, duration: "4 hours" },
          { title: "Reindeer Farm Experience", experienceId: 6, price: 45, duration: "2 hours" },
        ];
      }
      // Helsinki / City experiences
      else if (input.includes("helsinki") || (input.includes("city") && !input.includes("adventure")) || input.includes("kaupunki")) {
        response = language === "en"
          ? "Great choice! Helsinki offers amazing urban experiences. Here are my top picks:"
          : "Loistava valinta! Helsinki tarjoaa upeita kaupunkielämyksiä. Tässä suositukseni:";
        suggestions = [
          { title: "Helsinki Archipelago Kayaking Tour", experienceId: 2, price: 75, duration: "3 hours" },
          { title: "Traditional Finnish Sauna & Ice Swimming", experienceId: 4, price: 65, duration: "2.5 hours" },
          { title: "Helsinki Street Food Walk", experienceId: 5, price: 55, duration: "3 hours" },
        ];
      }
      // Adventure / Active experiences
      else if (input.includes("adventure") || input.includes("seikkailu") || input.includes("active") || input.includes("aktiivinen") || input.includes("sport")) {
        response = language === "en"
          ? "Adventure awaits! Here are some thrilling experiences for active travelers:"
          : "Seikkailu kutsuu! Tässä jännittäviä elämyksiä aktiivisille matkailijoille:";
        suggestions = [
          { title: "Fatbike Adventure in Levi", experienceId: 7, price: 95, duration: "3 hours" },
          { title: "Arctic Snowshoe Adventure", experienceId: 1, price: 89, duration: "4 hours" },
          { title: "Helsinki Archipelago Kayaking Tour", experienceId: 2, price: 75, duration: "3 hours" },
          { title: "Arctic Ice Fishing Experience", experienceId: 8, price: 79, duration: "4 hours" },
        ];
      }
      // Food / Tasting experiences
      else if (input.includes("food") || input.includes("ruoka") || input.includes("tasting") || input.includes("maistelu") || input.includes("eat") || input.includes("syödä")) {
        response = language === "en"
          ? "Food lovers, rejoice! Discover authentic Finnish flavors with these experiences:"
          : "Ruokaystävät, iloitskaa! Löydä aitoja suomalaisia makuja näillä elämyksillä:";
        suggestions = [
          { title: "Helsinki Street Food Walk", experienceId: 5, price: 55, duration: "3 hours" },
        ];
      }
      // Wellness / Relaxation
      else if (input.includes("wellness") || input.includes("hyvinvointi") || input.includes("relax") || input.includes("rentoutua") || input.includes("spa") || input.includes("sauna")) {
        response = language === "en"
          ? "Time to unwind! These wellness experiences will help you relax and recharge:"
          : "Aika rentoutua! Nämä hyvinvointielämykset auttavat rentoutumaan ja latautumaan:";
        suggestions = [
          { title: "Traditional Finnish Sauna & Ice Swimming", experienceId: 4, price: 65, duration: "2.5 hours" },
        ];
      }
      // Photography / Northern Lights
      else if (input.includes("photo") || input.includes("kuva") || input.includes("northern lights") || input.includes("revontuli") || input.includes("aurora")) {
        response = language === "en"
          ? "Capture unforgettable moments! Here are photography and nature experiences:"
          : "Tallenna unohtumattomia hetkiä! Tässä valokuvaus- ja luontoelämyksiä:";
        suggestions = [
          { title: "Northern Lights Photography Tour", experienceId: 3, price: 149, duration: "5 hours" },
        ];
      }
      // Family / Kids
      else if (input.includes("family") || input.includes("perhe") || input.includes("kids") || input.includes("lapset") || input.includes("children")) {
        response = language === "en"
          ? "Family-friendly adventures! These experiences are perfect for all ages:"
          : "Perheystävällisiä seikkailuja! Nämä elämykset sopivat kaikenikäisille:";
        suggestions = [
          { title: "Reindeer Farm Experience", experienceId: 6, price: 45, duration: "2 hours" },
          { title: "Helsinki Street Food Walk", experienceId: 5, price: 55, duration: "3 hours" },
          { title: "Arctic Snowshoe Adventure", experienceId: 1, price: 89, duration: "4 hours" },
        ];
      }
      // Budget / Cheap
      else if (input.includes("cheap") || input.includes("halpa") || input.includes("budget") || input.includes("budjetti") || input.includes("affordable")) {
        response = language === "en"
          ? "Great experiences don't have to break the bank! Here are affordable options:"
          : "Loistavat elämykset eivät maksa paljon! Tässä edullisia vaihtoehtoja:";
        suggestions = [
          { title: "Reindeer Farm Experience", experienceId: 6, price: 45, duration: "2 hours" },
          { title: "Helsinki Street Food Walk", experienceId: 5, price: 55, duration: "3 hours" },
          { title: "Traditional Finnish Sauna & Ice Swimming", experienceId: 4, price: 65, duration: "2.5 hours" },
        ];
      }
      // Default / General help
      else {
        response = language === "en"
          ? "I'd love to help you find the perfect experience! Tell me more about:\n\n• What type of activities interest you? (adventure, wellness, food, culture)\n• Which destination? (Helsinki, Lapland, Rovaniemi, Levi)\n• What's your travel style? (relaxing, active, family-friendly, budget)\n• Any specific interests? (photography, sauna, nature, food)"
          : "Autan mielelläni löytämään täydellisen elämyksen! Kerro lisää:\n\n• Minkälaiset aktiviteetit kiinnostavat? (seikkailu, hyvinvointi, ruoka, kulttuuri)\n• Mikä kohde? (Helsinki, Lappi, Rovaniemi, Levi)\n• Mikä on matkailutyylisi? (rentouttava, aktiivinen, perheystävällinen, budjetti)\n• Erityisiä kiinnostuksenkohteita? (valokuvaus, sauna, luonto, ruoka)";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };

      setAiMessages((prev) => [...prev, assistantMessage]);
      setAiLoading(false);
    }, 1200);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSubmitStatus("error");
      return;
    }

    if (!contactForm.privacyConsent) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone || undefined,
          message: contactForm.message,
          language: language,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus("success");
        setContactForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          privacyConsent: false,
        });
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--color-forest)]">
              Seeks & Explore
            </Link>
              <div className="hidden md:flex items-center gap-8">
              <a href="#experiences" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors">
                {t.nav.experiences}
              </a>
              <a href="#destinations" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors">
                {t.nav.destinations}
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors">
                  {t.nav.howItWorks}
                </a>
              <a href="#providers" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors">
                {t.nav.forProviders}
              </a>
              <a href="#contact" className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors">
                  {t.nav.contact}
                </a>
              </div>
            <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                  language === "en" ? "text-[var(--color-forest)] bg-[var(--color-cream)]/50" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("fi")}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                  language === "fi" ? "text-[var(--color-forest)] bg-[var(--color-cream)]/50" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  FI
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&h=1080&fit=crop"
            alt="Hero background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cream)]/60 via-white/80 to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-forest)] mb-6 leading-tight">
            {t.hero.headline}
          </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors shadow-lg hover:shadow-xl text-lg">
              {t.hero.ctaPrimary}
              </button>
              <button className="px-8 py-4 bg-white text-[var(--color-forest)] border-2 border-[var(--color-forest)] rounded-lg font-semibold hover:bg-[var(--color-cream)] transition-colors text-lg">
              {t.hero.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                    {t.hero.search.location}
                  </label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Helsinki, Lapland..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                    {t.hero.search.activity}
                  </label>
                  <input
                    type="text"
                    value={searchActivity}
                    onChange={(e) => setSearchActivity(e.target.value)}
                    placeholder="Kayaking, Sauna..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                    {t.hero.search.date}
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                    {t.hero.search.people}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={searchPeople}
                      onChange={(e) => setSearchPeople(e.target.value)}
                      placeholder="2"
                      min="1"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      className="px-8 py-3 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors whitespace-nowrap"
                    >
                      {t.hero.search.searchButton}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.categories.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-xl cursor-pointer transform transition-transform hover:scale-105"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src={category.image}
                    alt={t.categories[category.name as keyof typeof t.categories]}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base">
                      {t.categories[category.name as keyof typeof t.categories]}
              </h3>
            </div>
                </div>
              </div>
            ))}
          </div>
            </div>
      </section>

      {/* Featured Experiences */}
      <section id="experiences" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-cream)]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.experiences.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((experience) => (
              <Link
                key={experience.id}
                href={`/experiences/${experience.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
              </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-forest)] mb-1 text-lg group-hover:text-[#0f2a1f] transition-colors">
                        {experience.title}
              </h3>
                      <p className="text-sm text-neutral-600">{experience.location}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {experience.description[language].substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {experience.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {experience.rating} ({experience.reviews})
                    </span>
            </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500">{t.experiences.startingFrom}</span>
                      <span className="text-2xl font-bold text-[var(--color-forest)] ml-1">€{experience.price}</span>
                    </div>
                    <div className="px-4 py-2 bg-[var(--color-forest)] text-white rounded-lg text-sm font-medium group-hover:bg-[#0f2a1f] transition-colors">
                      {t.experiences.viewExperience}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Destinations */}
      <section id="destinations" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.destinations.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="group relative overflow-hidden rounded-xl cursor-pointer aspect-[4/3]"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{destination.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Travel Assistant */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[var(--color-cream)]/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-4">
            {t.aiAssistant.title}
          </h2>
          <p className="text-center text-neutral-600 mb-12 text-lg">
            {t.aiAssistant.subtitle}
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-neutral-200">
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-[var(--color-cream)]"
                        : "bg-[var(--color-forest)]"
                    }`}
                  >
                    {message.role === "user" ? (
                      <svg className="w-5 h-5 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    )}
              </div>
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-neutral-50 text-neutral-700"
                          : "bg-[var(--color-cream)]/30 text-neutral-700"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div>
                          <div className="whitespace-pre-line mb-4">
                            {message.content.split("\n").map((line, idx) => (
                              <p key={idx} className={line.startsWith("•") && !message.suggestions ? "font-semibold text-[var(--color-forest)] mb-1" : "mb-2"}>
                                {line}
                              </p>
                            ))}
                          </div>
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="space-y-2 mt-4 pt-4 border-t border-neutral-200">
                              <p className="text-sm font-semibold text-[var(--color-forest)] mb-2">
                                {language === "en" ? "Recommended experiences:" : "Suositellut elämykset:"}
                              </p>
                              {message.suggestions.map((suggestion, idx) => {
                                const experience = experiences.find((e) => e.id === suggestion.experienceId);
                                return (
                                  <a
                                    key={idx}
                                    href={`#experiences`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="block bg-white rounded-lg p-3 border border-neutral-200 hover:border-[var(--color-forest)] hover:shadow-md transition-all group"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <p className="font-semibold text-[var(--color-forest)] group-hover:text-[#0f2a1f] transition-colors">
                                          {suggestion.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
                                          {suggestion.duration && (
                                            <span className="flex items-center gap-1">
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                              </svg>
                                              {suggestion.duration}
                                            </span>
                                          )}
                                          {experience && (
                                            <span className="flex items-center gap-1">
                                              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                              {experience.rating} ({experience.reviews})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {suggestion.price && (
                                        <div className="text-right">
                                          <span className="text-xs text-neutral-500">{t.experiences.startingFrom}</span>
                                          <p className="text-lg font-bold text-[var(--color-forest)]">€{suggestion.price}</p>
                                        </div>
                                      )}
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-forest)] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
                  <div className="flex-1 bg-[var(--color-cream)]/30 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[var(--color-forest)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-[var(--color-forest)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-[var(--color-forest)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAiSubmit} className="flex gap-3">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={language === "en" ? "Ask about experiences, destinations, activities..." : "Kysy elämyksistä, kohteista, aktiviteeteista..."}
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="px-6 py-3 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {aiLoading
                  ? language === "en" ? "Thinking..." : "Ajatellaan..."
                  : language === "en" ? "Send" : "Lähetä"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Did you know */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-4">
            {t.didYouKnow.title}
          </h2>
          <p className="text-center text-xl text-neutral-600 mb-12">
            {t.didYouKnow.subtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-cream)]/30 rounded-xl p-6">
              <h3 className="font-semibold text-[var(--color-forest)] mb-2 text-lg">
                {t.didYouKnow.fact1}
              </h3>
              <p className="text-neutral-600">{t.didYouKnow.fact1Content}</p>
            </div>
            <div className="bg-[var(--color-cream)]/30 rounded-xl p-6">
              <h3 className="font-semibold text-[var(--color-forest)] mb-2 text-lg">
                {t.didYouKnow.fact2}
              </h3>
              <p className="text-neutral-600">{t.didYouKnow.fact2Content}</p>
            </div>
            <div className="bg-[var(--color-cream)]/30 rounded-xl p-6">
              <h3 className="font-semibold text-[var(--color-forest)] mb-2 text-lg">
                {t.didYouKnow.fact3}
              </h3>
              <p className="text-neutral-600">{t.didYouKnow.fact3Content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-cream)]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.howItWorks.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-sky)] to-[var(--color-forest)] text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-forest)] mb-4">
                {t.howItWorks.step1.title}
              </h3>
              <p className="text-neutral-600 text-lg">
                {t.howItWorks.step1.description}
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-forest)] text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-forest)] mb-4">
                {t.howItWorks.step2.title}
              </h3>
              <p className="text-neutral-600 text-lg">
                {t.howItWorks.step2.description}
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-forest)] text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-forest)] mb-4">
                {t.howItWorks.step3.title}
              </h3>
              <p className="text-neutral-600 text-lg">
                {t.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Logos */}
      <section id="providers" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-neutral-600 mb-8 font-medium">
            {t.providers.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {/* Placeholder logos - would be replaced with actual provider logos */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-32 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                <span className="text-neutral-400 text-sm font-medium">Provider {i}</span>
              </div>
            ))}
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[var(--color-forest)] mb-4">
              {t.contactForm.title}
          </h2>
            <p className="text-neutral-600 mb-2 text-lg">
              {t.contactForm.subtitle}
            </p>
            <p className="text-neutral-500 text-sm">
              {language === "en" 
                ? "Or email us directly: " 
                : "Tai lähetä sähköpostia suoraan: "}
              <a 
                href="mailto:hello@seeksexplore.com" 
                className="text-[var(--color-forest)] hover:underline font-medium"
              >
                hello@seeksexplore.com
              </a>
            </p>
          </div>
          
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t.contactForm.name} <span className="text-red-500">*</span>
                </label>
                <input
                id="contact-name"
                  type="text"
                required
                  value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                placeholder={language === "en" ? "Your name" : "Nimesi"}
                />
              </div>

              <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t.contactForm.email} <span className="text-red-500">*</span>
                </label>
                <input
                id="contact-email"
                  type="email"
                required
                  value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                placeholder={t.contactForm.emailPlaceholder}
                />
              </div>

              <div>
              <label htmlFor="contact-phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t.contactForm.phone}
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                placeholder={t.contactForm.phonePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t.contactForm.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                id="contact-message"
                required
                rows={6}
                  value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none resize-none"
                placeholder={language === "en" ? "Your message..." : "Viestisi..."}
              />
            </div>

            <div className="flex items-start">
              <input
                id="contact-privacy"
                type="checkbox"
                  required
                checked={contactForm.privacyConsent}
                onChange={(e) => setContactForm({ ...contactForm, privacyConsent: e.target.checked })}
                className="mt-1 mr-3 w-4 h-4 text-[var(--color-forest)] border-neutral-300 rounded focus:ring-[var(--color-forest)]"
              />
              <label htmlFor="contact-privacy" className="text-sm text-neutral-600">
                {t.contactForm.privacyConsent}{" "}
                <Link href="/privacy" className="text-[var(--color-forest)] hover:underline">
                  {t.contactForm.privacyLink}
                </Link>
                <span className="text-red-500"> *</span>
              </label>
              </div>

            {submitStatus === "success" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {t.contactForm.success}
              </div>
            )}

            {submitStatus === "error" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {t.contactForm.error}
              </div>
            )}

              <button
                type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {isSubmitting ? t.contactForm.sending : t.contactForm.sendMessage}
              </button>
            </form>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--color-forest)] mb-4">
              {language === "en" ? "Company Information" : "Yritystiedot"}
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-neutral-700">
              <div className="flex items-center gap-2">
                <i className="fas fa-envelope text-[var(--color-forest)]"></i>
              <a
                href="mailto:hello@seeksexplore.com"
                  className="hover:text-[var(--color-forest)] transition-colors font-medium"
              >
                hello@seeksexplore.com
              </a>
              </div>
              <div className="hidden md:block w-px h-6 bg-neutral-300"></div>
              <div className="text-sm text-neutral-500">
                {language === "en" 
                  ? "Seeks & Explore - Experience Marketplace" 
                  : "Seeks & Explore - Elämysmarkkinapaikka"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-forest)] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">{t.footer.about}</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li><a href="#" className="hover:text-white transition-colors">Our story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.footer.forProviders}</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li><a href="#" className="hover:text-white transition-colors">Become a provider</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Provider resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.footer.faq}</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li><a href="#" className="hover:text-white transition-colors">Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cancellation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.footer.contact}</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="mailto:hello@seeksexplore.com" className="hover:text-white transition-colors">
                hello@seeksexplore.com
              </a>
                </li>
                <li className="text-neutral-400 text-xs mt-3">
                  {language === "en" 
                    ? "For business inquiries" 
                    : "Liiketoimintakysymykset"}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-neutral-300">
            <p>
              © {new Date().getFullYear()} Seeks & Explore. {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
