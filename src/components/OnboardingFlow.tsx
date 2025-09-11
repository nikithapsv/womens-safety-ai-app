"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { ShieldCheck, Settings2, LifeBuoy, Siren, MonitorSmartphone, CheckCheck, CircleCheckBig, Hand } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

type LanguageCode = "en" | "hi" | "te"

type Props = {
  className?: string
  style?: React.CSSProperties
  defaultLanguage?: LanguageCode
  languages?: { code: LanguageCode; label: string }[]
  onComplete?: (result: {
    profile: Profile
    preferences: Preferences
    permissions: PermissionsState
    contacts: TrustedContact[]
    emergencyConfig: EmergencyConfig
    calibration: Calibration
    educationAcknowledged: boolean
    assessment: Assessment
  }) => void
}

type Profile = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  preferredName?: string
}

type Preferences = {
  language: LanguageCode
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
}

type PermissionsState = {
  location: "granted" | "prompt" | "denied"
  camera: "granted" | "prompt" | "denied"
  microphone: "granted" | "prompt" | "denied"
  motion: "granted" | "prompt" | "denied"
}

type TrustedContact = {
  id: string
  name: string
  phone: string
  verified: boolean
}

type EmergencyConfig = {
  region: string
  helpline: string
  activationMethods: {
    powerButton: boolean
    shake: boolean
    safeWordEnabled: boolean
    safeWord?: string
  }
}

type Calibration = {
  sensitivity: number
  demoArmed: boolean
}

type Assessment = {
  commute: boolean
  lateHours: boolean
  rideshare: boolean
  campus: boolean
  livingAlone: boolean
  notes?: string
}

const I18N: Record<LanguageCode, any> = {
  en: {
    appTitle: "Aegis",
    stepOf: (a: number, b: number) => `Step ${a} of ${b}`,
    next: "Next",
    back: "Back",
    skip: "Skip",
    finish: "Finish",
    getStarted: "Get started",
    // steps
    welcomeTitle: "Welcome to Aegis",
    welcomeBody:
      "Your calm, discreet safety companion. We protect your privacy and put you in control—always. Let’s set things up for your comfort and safety.",
    commitment: "Our commitment: private by default, transparent by design.",
    privacyTitle: "Privacy & Consent",
    privacyBody:
      "We only collect what’s needed for your safety features to work. You can change permissions anytime.",
    readPolicy: "I’ve read and agree to the privacy policy.",
    permissionsTitle: "Permissions for safety features",
    permissionsExplain:
      "Grant access selectively. We’ll explain why and only activate when needed.",
    locationWhy: "Location helps share your live position with trusted contacts during an emergency.",
    cameraWhy: "Camera can capture evidence or stream to a trusted contact if you choose.",
    micWhy: "Microphone helps detect distress keywords and record only when you activate it.",
    motionWhy: "Motion detects strong shakes to trigger quick help.",
    allow: "Allow",
    test: "Test",
    granted: "Granted",
    denied: "Denied",
    prompt: "Prompt",
    contactsTitle: "Trusted contacts",
    contactsExplain: "Add people who should be alerted in emergencies.",
    name: "Name",
    phone: "Phone",
    addContact: "Add contact",
    sendCode: "Send code",
    verify: "Verify",
    code: "Verification code",
    verified: "Verified",
    emergencyTitle: "Emergency service integration",
    regionLabel: "Region",
    helplineLabel: "Default helpline",
    activationMethods: "Emergency activation methods",
    powerBtn: "Power button press",
    shake: "Shake to trigger",
    safeWord: "Safe word",
    safeWordPlaceholder: "e.g., apple tree",
    trainingHint: "Practice here so you’re confident—this won’t contact anyone.",
    calibrationTitle: "Distress detection calibration",
    calibrationExplain:
      "Set sensitivity so accidental triggers are minimized while staying responsive.",
    sensitivityLabel: "Sensitivity",
    educationTitle: "Safety education",
    bestPractices:
      "Keep your phone charged, share plans with someone you trust, and use discreet activation in public.",
    guideTitle: "Quick usage guide",
    guide1: "Press power button rapidly 5 times to arm emergency mode.",
    guide2: "Shake firmly twice to trigger alert if enabled.",
    guide3: "Speak your safe word to start recording and notify contacts.",
    profileTitle: "Your profile (optional)",
    preferencesTitle: "App preferences",
    language: "Language",
    highContrast: "High contrast (Emergency mode style)",
    largeText: "Larger text",
    reducedMotion: "Reduce motion",
    assessmentTitle: "Initial safety assessment",
    scenarios: "Select what applies to you:",
    commute: "Frequent solo commute",
    lateHours: "Often out late",
    rideshare: "Regular rideshare use",
    campus: "On campus",
    livingAlone: "Living alone",
    notes: "Anything you'd like us to know?",
    completionTitle: "You’re all set",
    completionBody: "Aegis is ready. You’re in control. Stay safe.",
    startUsing: "Go to dashboard",
    practice: "Practice activation",
    consentNeeded: "Please agree to the privacy policy to continue.",
    sensorToastGranted: (s: string) => `${s} permission granted`,
    sensorToastDenied: (s: string) => `${s} permission denied`,
    contactAdded: "Contact added",
    contactVerified: "Contact verified",
    pleaseAddContact: "Please add at least one verified contact before continuing.",
    safeWordHint: "Choose a phrase you won’t say accidentally.",
  },
  hi: {
    appTitle: "Aegis",
    stepOf: (a: number, b: number) => `कदम ${a} / ${b}`,
    next: "आगे",
    back: "पीछे",
    skip: "छोड़ें",
    finish: "समाप्त",
    getStarted: "शुरू करें",
    welcomeTitle: "Aegis में आपका स्वागत है",
    welcomeBody:
      "आपका शांत, गुप्त सुरक्षा साथी। हम आपकी प्राइवेसी का सम्मान करते हैं और नियंत्रण हमेशा आपके हाथ में रहता है।",
    commitment: "हमारा वादा: डिफ़ॉल्ट रूप से निजी, और पारदर्शी तरीके से।",
    privacyTitle: "गोपनीयता और सहमति",
    privacyBody:
      "हम केवल उतना ही डेटा लेते हैं जितना फीचर्स के लिए आवश्यक है। आप कभी भी सेटिंग बदल सकते हैं।",
    readPolicy: "मैंने गोपनीयता नीति पढ़ी और सहमत हूँ।",
    permissionsTitle: "सुरक्षा फीचर्स के लिए अनुमतियाँ",
    permissionsExplain: "ज़रूरत के अनुसार अनुमति दें। हम कारण समझाते हैं और केवल आवश्यकता पर सक्रिय करते हैं।",
    locationWhy: "लोकेशन आपातकाल में विश्वसनीय संपर्कों के साथ आपकी स्थिति साझा करने में मदद करती है।",
    cameraWhy: "कैमरा प्रमाण कैप्चर कर सकता है या आपकी पसंद पर स्ट्रीम कर सकता है।",
    micWhy: "माइक्रोफोन संकट शब्द पहचानने और रिकॉर्डिंग में मदद करता है—केवल आपकी अनुमति पर।",
    motionWhy: "मोशन से तेज़ शेक को पहचानकर मदद सक्रिय की जा सकती है।",
    allow: "अनुमति दें",
    test: "परीक्षण",
    granted: "स्वीकृत",
    denied: "अस्वीकृत",
    prompt: "अनुरोध",
    contactsTitle: "विश्वसनीय संपर्क",
    contactsExplain: "ऐसे लोग जोड़ें जिन्हें आपातकाल में सूचित करना है।",
    name: "नाम",
    phone: "फ़ोन",
    addContact: "संपर्क जोड़ें",
    sendCode: "कोड भेजें",
    verify: "सत्यापित करें",
    code: "सत्यापन कोड",
    verified: "सत्यापित",
    emergencyTitle: "आपातकालीन सेवा एकीकरण",
    regionLabel: "क्षेत्र",
    helplineLabel: "डिफ़ॉल्ट हेल्पलाइन",
    activationMethods: "आपातकालीन सक्रियण विधियाँ",
    powerBtn: "पावर बटन प्रेस",
    shake: "शेक कर सक्रिय करें",
    safeWord: "सेफ़ वर्ड",
    safeWordPlaceholder: "जैसे, आम का पेड़",
    trainingHint: "यहां अभ्यास करें—किसी को सूचित नहीं किया जाएगा।",
    calibrationTitle: "डिस्ट्रेस डिटेक्शन कैलिब्रेशन",
    calibrationExplain:
      "संवेदनशीलता सेट करें ताकि गलत ट्रिगर कम हों और प्रतिक्रिया बनी रहे।",
    sensitivityLabel: "संवेदनशीलता",
    educationTitle: "सुरक्षा शिक्षा",
    bestPractices:
      "फ़ोन चार्ज रखें, अपनी योजना किसी विश्वसनीय व्यक्ति से साझा करें, और सार्वजनिक जगहों पर गुप्त सक्रियण इस्तेमाल करें।",
    guideTitle: "त्वरित उपयोग गाइड",
    guide1: "पावर बटन को 5 बार तेजी से दबाएँ।",
    guide2: "यदि सक्षम है तो दो बार तेज़ी से फोन हिलाएँ।",
    guide3: "अपना सेफ़ वर्ड बोलें—रिकॉर्डिंग/सूचना शुरू होगी।",
    profileTitle: "आपकी प्रोफ़ाइल (वैकल्पिक)",
    preferencesTitle: "ऐप प्रेफरेंस",
    language: "भाषा",
    highContrast: "हाई कॉन्ट्रास्ट (इमरजेंसी मोड)",
    largeText: "बड़ा टेक्स्ट",
    reducedMotion: "कम एनिमेशन",
    assessmentTitle: "प्रारंभिक सुरक्षा मूल्यांकन",
    scenarios: "जो लागू हो उसे चुनें:",
    commute: "अक्सर अकेले यात्रा",
    lateHours: "रात में देर तक बाहर",
    rideshare: "राइडशेयर नियमित",
    campus: "कैंपस में",
    livingAlone: "अकेले रहना",
    notes: "कुछ साझा करना चाहें?",
    completionTitle: "सब तैयार है",
    completionBody: "Aegis तैयार है। नियंत्रण आपके पास है। सुरक्षित रहें।",
    startUsing: "डैशबोर्ड पर जाएँ",
    practice: "सक्रियण का अभ्यास करें",
    consentNeeded: "कृपया आगे बढ़ने से पहले नीति से सहमत हों।",
    sensorToastGranted: (s: string) => `${s} अनुमति स्वीकृत`,
    sensorToastDenied: (s: string) => `${s} अनुमति अस्वीकृत`,
    contactAdded: "संपर्क जोड़ा गया",
    contactVerified: "संपर्क सत्यापित",
    pleaseAddContact: "कृपया आगे बढ़ने से पहले कम से कम एक सत्यापित संपर्क जोड़ें।",
    safeWordHint: "ऐसा वाक्य चुनें जिसे आप अनजाने में न बोलें।",
  },
  te: {
    appTitle: "Aegis",
    stepOf: (a: number, b: number) => `దశ ${a} / ${b}`,
    next: "తర్వాత",
    back: "వెనుకకు",
    skip: "దాటవేయి",
    finish: "పూర్తి",
    getStarted: "ప్రారంభించండి",
    welcomeTitle: "Aegis కు స్వాగతం",
    welcomeBody:
      "మీ ప్రశాంత, గోప్యమైన భద్రత భాగస్వామి. మీ గోప్యతకు ప్రాధాన్యం—నియంత్రణ మీ చేతుల్లోనే.",
    commitment: "మా వాగ్దానం: డిఫాల్ట్ ప్రైవసీ, పారదర్శక రూపకల్పన.",
    privacyTitle: "గోప్యత & సమ్మతి",
    privacyBody:
      "సౌకర్యాలు పనిచేయడానికి అవసరమైన కనిష్ట డేటా మాత్రమే. మీరు ఎప్పుడైనా మార్పు చేయవచ్చు.",
    readPolicy: "గోప్యత విధానాన్ని చదివి అంగీకరిస్తున్నాను.",
    permissionsTitle: "భద్రతా అనుమతులు",
    permissionsExplain:
      "అవసరమైతేనే అనుమతి ఇవ్వండి. ఎందుకు అవసరం చెబుతాం మరియు అవసరమైనప్పుడు మాత్రమే యాక్టివ్ అవుతుంది.",
    locationWhy:
      "అత్యవసర సమయంలో మీ స్థానం విశ్వసనీయ పరిచయాలకు షేర్ చేయడానికి.",
    cameraWhy: "మీ ఎంపికపై కెమెరా సాక్ష్యాలు తీసుకోవచ్చు/స్ట్రీమ్ చేయవచ్చు.",
    micWhy: "మైక్రోఫోన్ డిస్ట్రెస్ కీవర్డ్స్ గుర్తించడంలో సహాయపడుతుంది—మీ యాక్టివేషన్‌తోనే.",
    motionWhy: "ఫోన్ బలంగా షేక్ చేసినప్పుడు త్వరిత సహాయం ప్రారంభించడానికి.",
    allow: "అనుమతించండి",
    test: "పరీక్షించండి",
    granted: "అనుమతించబడింది",
    denied: "నిరాకరించబడింది",
    prompt: "ప్రాంప్ట్",
    contactsTitle: "నమ్మకమైన పరిచయులు",
    contactsExplain: "ఎమర్జెన్సీ సమయంలో సమాచారం ఇవ్వాల్సిన వారు.",
    name: "పేరు",
    phone: "ఫోన్",
    addContact: "పరిచయం జోడించు",
    sendCode: "కోడ్ పంపు",
    verify: "నిర్ధారించు",
    code: "నిర్ధరణ కోడ్",
    verified: "నిర్ధారిత",
    emergencyTitle: "ఎమర్జెన్సీ సర్వీస్ సమీకరణ",
    regionLabel: "ప్రాంతం",
    helplineLabel: "డిఫాల్ట్ హెల్ప్‌లైన్",
    activationMethods: "ఎమర్జెన్సీ యాక్టివేషన్ పద్ధతులు",
    powerBtn: "పవర్ బటన్ ప్రెస్",
    shake: "షేక్ చేసి యాక్టివేట్",
    safeWord: "సేఫ్ వర్డ్",
    safeWordPlaceholder: "ఉదా., మామిడి చెట్టు",
    trainingHint: "ఇక్కడ ప్రాక్టీస్ చేయండి—ఎవరినీ సంప్రదించము.",
    calibrationTitle: "డిస్ట్రెస్ గుర్తింపు కాలిబ్రేషన్",
    calibrationExplain:
      "సున్నితత్వాన్ని సెట్ చేయండి—తప్పు ట్రిగర్స్ తగ్గి స్పందన కొనసాగాలి.",
    sensitivityLabel: "సున్నితత్వం",
    educationTitle: "భద్రతా విద్య",
    bestPractices:
      "ఫోన్ చార్జ్ ఉంచండి, మీ ప్రణాళికలను నమ్మకమైన వ్యక్తితో పంచుకోండి, పబ్లిక్‌లో డిస్క్రీట్ యాక్టివేషన్ వాడండి.",
    guideTitle: "త్వరిత గైడ్",
    guide1: "పవర్ బటన్‌ను వరుసగా 5 సార్లు నొక్కండి.",
    guide2: "ఎనేబుల్ చేసినట్లయితే ఫోన్‌ను బలంగా రెండు సార్లు షేక్ చేయండి.",
    guide3: "మీ సేఫ్ వర్డ్ చెప్పండి—రికార్డింగ్/నోటిఫికేషన్స్ ప్రారంభమవుతాయి.",
    profileTitle: "మీ ప్రొఫైల్ (ఐచ్చికం)",
    preferencesTitle: "యాప్ అభిరుచులు",
    language: "భాష",
    highContrast: "హై కాన్ట్రాస్ట్ (ఎమర్జెన్సీ మోడ్)",
    largeText: "పెద్ద టెక్స్ట్",
    reducedMotion: "తక్కువ యానిమేషన్స్",
    assessmentTitle: "ప్రాథమిక భద్రత అంచనా",
    scenarios: "మీకు వర్తించేవి ఎంచుకోండి:",
    commute: "తరచుగా ఒంటరిగా ప్రయాణం",
    lateHours: "రాత్రి ఆలస్యంగా బయట",
    rideshare: "రైడ్‌షేర్ తరచుగా",
    campus: "క్యాంపస్‌లో",
    livingAlone: "ఒంటరిగా ఉండటం",
    notes: "మేము తెలుసుకోవాలనుకుంటున్నదేమైనా?",
    completionTitle: "అన్నీ సిద్ధం",
    completionBody: "Aegis సిద్ధంగా ఉంది. నియంత్రణ మీ చేతుల్లోనే. సురక్షితంగా ఉండండి.",
    startUsing: "డాష్‌బోర్డ్‌కి వెళ్లండి",
    practice: "యాక్టివేషన్ ప్రాక్టీస్",
    consentNeeded: "దయచేసి ముందుకు సాగడానికి విధానానికి అంగీకరించండి.",
    sensorToastGranted: (s: string) => `${s} అనుమతి మంజూరైంది`,
    sensorToastDenied: (s: string) => `${s} అనుమతి నిరాకరించబడింది`,
    contactAdded: "పరిచయం జోడించబడింది",
    contactVerified: "పరిచయం నిర్ధారించబడింది",
    pleaseAddContact: "దయచేసి కనీసం ఒక నిర్ధారిత పరిచయాన్ని జోడించండి.",
    safeWordHint: "అనుకోకుండా చెప్పని పదబంధాన్ని ఎంచుకోండి.",
  },
}

const REGIONS = [
  { code: "IN", label: "India", helpline: "112" },
  { code: "US", label: "United States", helpline: "911" },
  { code: "GB", label: "United Kingdom", helpline: "999" },
  { code: "AU", label: "Australia", helpline: "000" },
]

const STEP_ICONS = [
  ShieldCheck,
  Settings2,
  MonitorSmartphone,
  LifeBuoy,
  Siren,
  Hand,
  CheckCheck,
  CircleCheckBig,
]

export default function OnboardingFlow({
  className,
  style,
  defaultLanguage = "en",
  languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "te", label: "తెలుగు" },
  ],
  onComplete,
}: Props) {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage)
  const t = I18N[language]

  // Steps control
  const steps = useMemo(
    () => [
      { key: "welcome" },
      { key: "privacy" },
      { key: "permissions" },
      { key: "contacts" },
      { key: "emergency" },
      { key: "calibration" },
      { key: "education" },
      { key: "profile" },
      { key: "assessment" },
      { key: "complete" },
    ],
    []
  )
  const [stepIndex, setStepIndex] = useState(0)
  const totalSteps = steps.length
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  // Data states
  const [consent, setConsent] = useState(false)

  const [permissions, setPermissions] = useState<PermissionsState>({
    location: "prompt",
    camera: "prompt",
    microphone: "prompt",
    motion: "prompt",
  })

  const [contacts, setContacts] = useState<TrustedContact[]>([])
  const [contactDraft, setContactDraft] = useState<{ name: string; phone: string }>({ name: "", phone: "" })
  const [verificationCode, setVerificationCode] = useState("")
  const pendingVerifyId = useRef<string | null>(null)

  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyConfig>({
    region: "IN",
    helpline: "112",
    activationMethods: {
      powerButton: true,
      shake: true,
      safeWordEnabled: false,
      safeWord: "",
    },
  })

  const [calibration, setCalibration] = useState<Calibration>({ sensitivity: 50, demoArmed: false })
  const [educationAck, setEducationAck] = useState(false)

  const [profile, setProfile] = useState<Profile>({})
  const [preferences, setPreferences] = useState<Preferences>({
    language: defaultLanguage,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
  })

  const [assessment, setAssessment] = useState<Assessment>({
    commute: false,
    lateHours: false,
    rideshare: false,
    campus: false,
    livingAlone: false,
    notes: "",
  })

  useEffect(() => {
    setLanguage(preferences.language)
  }, [preferences.language])

  // Navigation
  const canProceed = useMemo(() => {
    const key = steps[stepIndex].key
    if (key === "privacy") return consent
    if (key === "contacts") return contacts.some((c) => c.verified)
    if (key === "emergency") {
      if (emergencyConfig.activationMethods.safeWordEnabled) {
        return (emergencyConfig.activationMethods.safeWord || "").trim().length >= 4
      }
    }
    return true
  }, [consent, contacts, emergencyConfig, stepIndex, steps])

  const next = useCallback(() => {
    if (steps[stepIndex].key === "contacts" && !contacts.some((c) => c.verified)) {
      toast.message(t.pleaseAddContact)
      return
    }
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
  }, [contacts, stepIndex, steps, t, totalSteps])

  const back = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), [])

  // Permission handlers
  const requestLocation = async () => {
    try {
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
        })
        setPermissions((p) => ({ ...p, location: "granted" }))
        toast.success(t.sensorToastGranted("Location"))
      } else {
        throw new Error("Geolocation not supported")
      }
    } catch {
      setPermissions((p) => ({ ...p, location: "denied" }))
      toast.error(t.sensorToastDenied("Location"))
    }
  }

  const requestCameraMic = async (type: "camera" | "microphone") => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const constraints = type === "camera" ? { video: true } : { audio: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        stream.getTracks().forEach((t) => t.stop())
        setPermissions((p) => ({ ...p, [type]: "granted" }))
        toast.success(t.sensorToastGranted(type === "camera" ? "Camera" : "Microphone"))
      } else {
        throw new Error("Media not supported")
      }
    } catch {
      setPermissions((p) => ({ ...p, [type]: "denied" }))
      toast.error(t.sensorToastDenied(type === "camera" ? "Camera" : "Microphone"))
    }
  }

  const requestMotion = async () => {
    try {
      const w = typeof window !== "undefined" ? (window as any) : undefined
      if (!w) throw new Error("No window")
      const iOSRequest = w.DeviceMotionEvent?.requestPermission
      if (typeof iOSRequest === "function") {
        const res = await iOSRequest()
        if (res === "granted") {
          setPermissions((p) => ({ ...p, motion: "granted" }))
          toast.success(t.sensorToastGranted("Motion"))
        } else {
          setPermissions((p) => ({ ...p, motion: "denied" }))
          toast.error(t.sensorToastDenied("Motion"))
        }
        return
      }
      // Non-iOS typically allowed
      setPermissions((p) => ({ ...p, motion: "granted" }))
      toast.success(t.sensorToastGranted("Motion"))
    } catch {
      setPermissions((p) => ({ ...p, motion: "denied" }))
      toast.error(t.sensorToastDenied("Motion"))
    }
  }

  // Contacts
  const addContact = () => {
    const name = contactDraft.name.trim()
    const phone = contactDraft.phone.trim()
    if (!name || !phone) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setContacts((c) => [...c, { id, name, phone, verified: false }])
    setContactDraft({ name: "", phone: "" })
    toast.message(t.contactAdded)
  }

  const sendVerification = (id: string) => {
    pendingVerifyId.current = id
    setVerificationCode("")
    toast.message("Code sent")
  }

  const verifyCode = () => {
    if (!pendingVerifyId.current) return
    if ((verificationCode || "").trim().length >= 4) {
      setContacts((c) => c.map((x) => (x.id === pendingVerifyId.current ? { ...x, verified: true } : x)))
      pendingVerifyId.current = null
      setVerificationCode("")
      toast.success(t.contactVerified)
    } else {
      toast.error("Invalid code")
    }
  }

  // Emergency region change
  const onRegionChange = (code: string) => {
    const found = REGIONS.find((r) => r.code === code)
    if (found) {
      setEmergencyConfig((e) => ({ ...e, region: found.code, helpline: found.helpline }))
    }
  }

  // Finish
  const complete = () => {
    onComplete?.({
      profile,
      preferences,
      permissions,
      contacts,
      emergencyConfig,
      calibration,
      educationAcknowledged: educationAck,
      assessment,
    })
    toast.success("Onboarding complete")
  }

  // UI helpers
  const StatusPill = ({ status }: { status: "granted" | "denied" | "prompt" }) => (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "granted" && "bg-green-100 text-green-700",
        status === "denied" && "bg-destructive/10 text-destructive",
        status === "prompt" && "bg-muted text-muted-foreground"
      )}
      aria-live="polite"
    >
      {t[status]}
    </span>
  )

  const StepHeader = ({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: React.ComponentType<any>
    title: string
    subtitle?: string
  }) => (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-secondary p-2 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )

  // Large text preference scaling
  const largeTextClass = preferences.largeText ? "text-[1.05rem] sm:text-base" : ""

  const progressValue = Math.round(((stepIndex + 1) / totalSteps) * 100)

  return (
    <section
      className={cn(
        "w-full max-w-full bg-card border rounded-lg shadow-sm",
        "p-4 sm:p-6",
        preferences.highContrast ? "outline outline-1 outline-ring" : "",
        className
      )}
      style={style}
      aria-label="Onboarding and setup"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className={cn("text-lg font-semibold leading-tight", largeTextClass)}>{I18N[language].appTitle}</h1>
            <p className="text-xs text-muted-foreground">{t.stepOf(stepIndex + 1, totalSteps)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => setPreferences((p) => ({ ...p, language: v as LanguageCode }))}>
            <SelectTrigger className="w-[140px]" aria-label={t.language}>
              <SelectValue placeholder={t.language} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={progressValue} aria-label="Progress" />
      </div>

      <Separator className="my-4" />

      <div className="space-y-6">
        {/* Step content */}
        {steps[stepIndex].key === "welcome" && (
          <div className="space-y-6">
            <StepHeader icon={ShieldCheck} title={t.welcomeTitle} subtitle={t.commitment} />
            <p className={cn("text-sm leading-relaxed text-muted-foreground", largeTextClass)}>{t.welcomeBody}</p>
            <div className="rounded-md bg-secondary p-4">
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>No background tracking when inactive.</li>
                <li>You decide who gets notified and when.</li>
                <li>All features can be turned off anytime.</li>
              </ul>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "privacy" && (
          <div className="space-y-6">
            <StepHeader icon={Settings2} title={t.privacyTitle} subtitle={t.privacyBody} />
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                We never sell your data. Permissions are used only during active safety sessions or when you explicitly
                start them.
              </p>
            </div>
            <label className="flex items-start gap-3">
              <Switch checked={consent} onCheckedChange={setConsent} aria-label={t.readPolicy} />
              <span className="text-sm">{t.readPolicy}</span>
            </label>
          </div>
        )}

        {steps[stepIndex].key === "permissions" && (
          <div className="space-y-6">
            <StepHeader icon={MonitorSmartphone} title={t.permissionsTitle} subtitle={t.permissionsExplain} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-4 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Location</div>
                  <StatusPill status={permissions.location} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.locationWhy}</p>
                <div className="mt-3">
                  <Button size="sm" onClick={requestLocation} aria-label="Allow location">
                    {t.allow}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Camera</div>
                  <StatusPill status={permissions.camera} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.cameraWhy}</p>
                <div className="mt-3">
                  <Button size="sm" onClick={() => requestCameraMic("camera")} aria-label="Allow camera">
                    {t.allow}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Microphone</div>
                  <StatusPill status={permissions.microphone} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.micWhy}</p>
                <div className="mt-3">
                  <Button size="sm" onClick={() => requestCameraMic("microphone")} aria-label="Allow microphone">
                    {t.allow}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Motion</div>
                  <StatusPill status={permissions.motion} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.motionWhy}</p>
                <div className="mt-3">
                  <Button size="sm" onClick={requestMotion} aria-label="Allow motion">
                    {t.allow}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "contacts" && (
          <div className="space-y-6">
            <StepHeader icon={LifeBuoy} title={t.contactsTitle} subtitle={t.contactsExplain} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cname">{t.name}</Label>
                <Input
                  id="cname"
                  value={contactDraft.name}
                  onChange={(e) => setContactDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder={t.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cphone">{t.phone}</Label>
                <Input
                  id="cphone"
                  inputMode="tel"
                  value={contactDraft.phone}
                  onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="+91 9XXXXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={addContact} disabled={!contactDraft.name || !contactDraft.phone}>
                  {t.addContact}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {contacts.length === 0 && <p className="text-sm text-muted-foreground">{t.pleaseAddContact}</p>}
              <ul className="space-y-3">
                {contacts.map((c) => (
                  <li key={c.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground break-words">{c.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.verified ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
                            <CircleCheckBig className="h-4 w-4" aria-hidden="true" /> {t.verified}
                          </span>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => sendVerification(c.id)}>
                              {t.sendCode}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {pendingVerifyId.current && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="vcode">{t.code}</Label>
                    <Input
                      id="vcode"
                      value={verificationCode}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="1234"
                    />
                  </div>
                  <Button onClick={verifyCode}>{t.verify}</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {steps[stepIndex].key === "emergency" && (
          <div className="space-y-6">
            <StepHeader icon={Siren} title={t.emergencyTitle} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.regionLabel}</Label>
                <Select value={emergencyConfig.region} onValueChange={onRegionChange}>
                  <SelectTrigger aria-label={t.regionLabel}>
                    <SelectValue placeholder={t.regionLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.helplineLabel}</Label>
                <Input value={emergencyConfig.helpline} readOnly />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">{t.activationMethods}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{t.powerBtn}</p>
                    <p className="text-xs text-muted-foreground">{t.trainingHint}</p>
                  </div>
                  <Switch
                    checked={emergencyConfig.activationMethods.powerButton}
                    onCheckedChange={(v) =>
                      setEmergencyConfig((e) => ({ ...e, activationMethods: { ...e.activationMethods, powerButton: v } }))
                    }
                    aria-label={t.powerBtn}
                  />
                </label>

                <label className="flex items-center justify-between rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{t.shake}</p>
                    <p className="text-xs text-muted-foreground">{t.trainingHint}</p>
                  </div>
                  <Switch
                    checked={emergencyConfig.activationMethods.shake}
                    onCheckedChange={(v) =>
                      setEmergencyConfig((e) => ({ ...e, activationMethods: { ...e.activationMethods, shake: v } }))
                    }
                    aria-label={t.shake}
                  />
                </label>

                <div className="sm:col-span-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.safeWord}</p>
                      <p className="text-xs text-muted-foreground">{t.safeWordHint}</p>
                    </div>
                    <Switch
                      checked={emergencyConfig.activationMethods.safeWordEnabled}
                      onCheckedChange={(v) =>
                        setEmergencyConfig((e) => ({
                          ...e,
                          activationMethods: { ...e.activationMethods, safeWordEnabled: v },
                        }))
                      }
                      aria-label={t.safeWord}
                    />
                  </div>
                  {emergencyConfig.activationMethods.safeWordEnabled && (
                    <div className="mt-3">
                      <Input
                        value={emergencyConfig.activationMethods.safeWord}
                        onChange={(e) =>
                          setEmergencyConfig((ec) => ({
                            ...ec,
                            activationMethods: { ...ec.activationMethods, safeWord: e.target.value },
                          }))
                        }
                        placeholder={t.safeWordPlaceholder}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "calibration" && (
          <div className="space-y-6">
            <StepHeader icon={Hand} title={t.calibrationTitle} subtitle={t.calibrationExplain} />
            <div className="space-y-3">
              <Label htmlFor="sens">{t.sensitivityLabel}: {calibration.sensitivity}</Label>
              <Slider
                id="sens"
                value={[calibration.sensitivity]}
                onValueChange={([v]) => setCalibration((c) => ({ ...c, sensitivity: v }))}
                min={0}
                max={100}
                step={1}
                aria-label={t.sensitivityLabel}
              />
              <div className="rounded-md border p-3 bg-secondary">
                <p className="text-sm text-muted-foreground">
                  Try a short shake. We won't alert anyone in this demo.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={calibration.demoArmed ? "default" : "outline"}
                    onClick={() => setCalibration((c) => ({ ...c, demoArmed: !c.demoArmed }))}
                  >
                    {t.test}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {calibration.demoArmed ? "Demo armed" : "Demo idle"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "education" && (
          <div className="space-y-6">
            <StepHeader icon={CheckCheck} title={t.educationTitle} subtitle={t.bestPractices} />
            <div className="rounded-md border p-0 overflow-hidden">
              <Tabs defaultValue="guide">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="guide">{t.guideTitle}</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="guide" asChild>
                  <div className="p-4 space-y-2">
                    <p className="text-sm">{t.guide1}</p>
                    <p className="text-sm">{t.guide2}</p>
                    <p className="text-sm">{t.guide3}</p>
                  </div>
                </TabsContent>
                <TabsContent value="tips" asChild>
                  <div className="p-4 space-y-2">
                    <p className="text-sm">Keep location services on only when needed.</p>
                    <p className="text-sm">Use code words with your trusted contacts.</p>
                    <p className="text-sm">Review activation methods monthly.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <label className="flex items-center gap-3">
              <Checkbox checked={educationAck} onCheckedChange={(v) => setEducationAck(Boolean(v))} />
              <span className="text-sm">I understand how to use the app safely.</span>
            </label>
          </div>
        )}

        {steps[stepIndex].key === "profile" && (
          <div className="space-y-6">
            <StepHeader icon={Settings2} title={t.profileTitle} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fname">First name</Label>
                <Input
                  id="fname"
                  value={profile.firstName || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last name</Label>
                <Input
                  id="lname"
                  value={profile.lastName || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pname">Preferred name</Label>
                <Input
                  id="pname"
                  value={profile.preferredName || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, preferredName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pphone">Phone</Label>
                <Input
                  id="pphone"
                  inputMode="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <StepHeader icon={Settings2} title={t.preferencesTitle} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.language}</Label>
                <Select value={preferences.language} onValueChange={(v) => setPreferences((p) => ({ ...p, language: v as LanguageCode }))}>
                  <SelectTrigger aria-label={t.language}>
                    <SelectValue placeholder={t.language} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.highContrast}</p>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(v) => setPreferences((p) => ({ ...p, highContrast: v }))}
                  aria-label={t.highContrast}
                />
              </div>
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.largeText}</p>
                </div>
                <Switch
                  checked={preferences.largeText}
                  onCheckedChange={(v) => setPreferences((p) => ({ ...p, largeText: v }))}
                  aria-label={t.largeText}
                />
              </div>
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.reducedMotion}</p>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(v) => setPreferences((p) => ({ ...p, reducedMotion: v }))}
                  aria-label={t.reducedMotion}
                />
              </div>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "assessment" && (
          <div className="space-y-6">
            <StepHeader icon={MonitorSmartphone} title={t.assessmentTitle} subtitle={t.scenarios} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={assessment.commute}
                  onCheckedChange={(v) => setAssessment((a) => ({ ...a, commute: Boolean(v) }))}
                />
                <span className="text-sm">{t.commute}</span>
              </label>
              <label className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={assessment.lateHours}
                  onCheckedChange={(v) => setAssessment((a) => ({ ...a, lateHours: Boolean(v) }))}
                />
                <span className="text-sm">{t.lateHours}</span>
              </label>
              <label className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={assessment.rideshare}
                  onCheckedChange={(v) => setAssessment((a) => ({ ...a, rideshare: Boolean(v) }))}
                />
                <span className="text-sm">{t.rideshare}</span>
              </label>
              <label className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={assessment.campus}
                  onCheckedChange={(v) => setAssessment((a) => ({ ...a, campus: Boolean(v) }))}
                />
                <span className="text-sm">{t.campus}</span>
              </label>
              <label className="flex items-center gap-3 rounded-md border p-3 sm:col-span-2">
                <Checkbox
                  checked={assessment.livingAlone}
                  onCheckedChange={(v) => setAssessment((a) => ({ ...a, livingAlone: Boolean(v) }))}
                />
                <span className="text-sm">{t.livingAlone}</span>
              </label>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={assessment.notes}
                  onChange={(e) => setAssessment((a) => ({ ...a, notes: e.target.value }))}
                  placeholder="Optional"
                  className="min-h-[90px]"
                />
              </div>
            </div>
          </div>
        )}

        {steps[stepIndex].key === "complete" && (
          <div className="space-y-6">
            <StepHeader icon={CircleCheckBig} title={t.completionTitle} subtitle={t.completionBody} />
            <div className="rounded-md border p-4 bg-secondary">
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Review activation methods anytime in Settings.</li>
                <li>Practice safe word in a quiet space.</li>
                <li>Check your trusted contacts quarterly.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={back} disabled={isFirst}>
            {t.back}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isLast && steps[stepIndex].key !== "privacy" && (
            <Button variant="outline" onClick={next}>
              {t.skip}
            </Button>
          )}
          {!isLast && (
            <Button onClick={next} disabled={!canProceed}>
              {stepIndex === 0 ? t.getStarted : t.next}
            </Button>
          )}
          {isLast && (
            <Button onClick={complete}>
              {t.finish}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}