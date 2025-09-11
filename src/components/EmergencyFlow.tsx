"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CircleAlert, Siren, OctagonAlert, BadgeAlert, LifeBuoy, Captions, Hospital, Phone, CirclePower, Signal, Flashlight, Biohazard } from "lucide-react"

type Locale = "en" | "hi" | "te"

const i18n: Record<Locale, Record<string, string>> = {
  en: {
    title: "Emergency",
    description: "Silent SOS, live tracking and secure evidence capture",
    activate: "Activate SOS",
    active: "Emergency Active",
    preparing: "Preparing secure channel…",
    tracking: "Live location tracking",
    contacts: "Trusted contacts",
    services: "Emergency services",
    recording: "Recording & upload",
    audioRecording: "Audio recording",
    videoRecording: "Video recording",
    uploading: "Uploading securely",
    notifications: "Notifications",
    contactsNotified: "Contacts notified",
    servicesNotified: "Services notified",
    cancel: "I'm Safe",
    confirmCancel: "Cancel Emergency",
    cancelHint: "Ends tracking and stops recording",
    tools: "Communication",
    quickText: "Send quick text",
    quickVoice: "Send voice note",
    messagePlaceholder: "Type a short message…",
    send: "Send",
    integrations: "Local Services",
    call112: "Call 112 (India)",
    openHimmat: "Open Himmat",
    safetyTorch: "Torch",
    silentMode: "Discreet Mode",
    triggers: "Silent Triggers",
    powerSequence: "Power button sequence",
    shakeDevice: "Device shake",
    voiceWord: "Voice safe word",
    autoDetect: "Automatic distress detection",
    on: "On",
    off: "Off",
    incidentReport: "Incident Report",
    reportHint: "Write what happened. This will be securely stored.",
    submitReport: "Submit report",
    reportSubmitted: "Incident report submitted",
    emergencyEnded: "Emergency ended",
    emergencyStarted: "Emergency activated",
    sending: "Sending…",
    sent: "Sent",
    status: "Status",
    connected: "Connected",
    connecting: "Connecting…",
    privacyNote: "Minimal on-screen signals shown to stay discreet.",
    language: "Language",
  },
  hi: {
    title: "आपातकाल",
    description: "साइलेंट SOS, लाइव ट्रैकिंग और सुरक्षित साक्ष्य संग्रह",
    activate: "SOS सक्रिय करें",
    active: "आपातकाल सक्रिय",
    preparing: "सुरक्षित चैनल तैयार हो रहा है…",
    tracking: "लाइव लोकेशन ट्रैकिंग",
    contacts: "विश्वसनीय संपर्क",
    services: "आपातकालीन सेवाएँ",
    recording: "रिकॉर्डिंग और अपलोड",
    audioRecording: "ऑडियो रिकॉर्डिंग",
    videoRecording: "वीडियो रिकॉर्डिंग",
    uploading: "सुरक्षित रूप से अपलोड हो रहा है",
    notifications: "सूचनाएँ",
    contactsNotified: "संपर्कों को सूचित किया गया",
    servicesNotified: "सेवाओं को सूचित किया गया",
    cancel: "मैं सुरक्षित हूँ",
    confirmCancel: "आपातकाल रद्द करें",
    cancelHint: "ट्रैकिंग समाप्त और रिकॉर्डिंग बंद",
    tools: "संचार",
    quickText: "त्वरित संदेश भेजें",
    quickVoice: "वॉइस नोट भेजें",
    messagePlaceholder: "संक्षिप्त संदेश लिखें…",
    send: "भेजें",
    integrations: "स्थानीय सेवाएँ",
    call112: "112 पर कॉल करें",
    openHimmat: "हिम्मत खोलें",
    safetyTorch: "टॉर्च",
    silentMode: "गुप्त मोड",
    triggers: "साइलेंट ट्रिगर्स",
    powerSequence: "पावर बटन क्रम",
    shakeDevice: "डिवाइस हिलाना",
    voiceWord: "वॉइस सेफ वर्ड",
    autoDetect: "स्वचालित आपात पहचान",
    on: "चालू",
    off: "बंद",
    incidentReport: "घटना रिपोर्ट",
    reportHint: "क्या हुआ लिखें। सुरक्षित रूप से संग्रहीत होगा।",
    submitReport: "रिपोर्ट जमा करें",
    reportSubmitted: "रिपोर्ट जमा हुई",
    emergencyEnded: "आपातकाल समाप्त",
    emergencyStarted: "आपातकाल सक्रिय",
    sending: "भेजा जा रहा है…",
    sent: "भेजा गया",
    status: "स्थिति",
    connected: "कनेक्टेड",
    connecting: "कनेक्ट किया जा रहा है…",
    privacyNote: "गोपनीय रहने के लिए न्यूनतम ऑन-स्क्रीन संकेत।",
    language: "भाषा",
  },
  te: {
    title: "అత్యవసరం",
    description: "నిశ్శబ్ద SOS, లైవ్ ట్రాకింగ్ మరియు సురక్షిత సాక్ష్య సేకరణ",
    activate: "SOS ప్రారంభించండి",
    active: "అత్యవసర స్థితి యాక్టివ్",
    preparing: "సురక్షిత ఛానల్ సిద్ధం అవుతోంది…",
    tracking: "లైవ్ లొకేషన్ ట్రాకింగ్",
    contacts: "నమ్మకమైన కాంటాక్టులు",
    services: "ఎమర్జెన్సీ సర్వీసులు",
    recording: "రికార్డింగ్ & అప్‌లోడ్",
    audioRecording: "ఆడియో రికార్డింగ్",
    videoRecording: "వీడియో రికార్డింగ్",
    uploading: "సురక్షితంగా అప్‌లోడ్ అవుతోంది",
    notifications: "నోటిఫికేషన్స్",
    contactsNotified: "కాంటాక్టులకు సమాచారం పంపబడింది",
    servicesNotified: "సర్వీసులకు సమాచారం పంపబడింది",
    cancel: "నేను సేఫ్",
    confirmCancel: "ఎమర్జెన్సీ రద్దు",
    cancelHint: "ట్రాకింగ్ ఆగి రికార్డింగ్ నిలుస్తుంది",
    tools: "కమ్యూనికేషన్",
    quickText: "క్విక్ టెక్స్ట్ పంపు",
    quickVoice: "వాయిస్ నోట్ పంపు",
    messagePlaceholder: "చిన్న సందేశం టైప్ చేయండి…",
    send: "పంపు",
    integrations: "లోకల్ సర్వీసులు",
    call112: "112 కాల్ చేయండి",
    openHimmat: "హిమ్మత్ ఓపెన్ చేయండి",
    safetyTorch: "టార్చ్",
    silentMode: "డిస్క్రీట్ మోడ్",
    triggers: "నిశ్శబ్ద ట్రిగర్స్",
    powerSequence: "పవర్ బటన్ సీక్వెన్స్",
    shakeDevice: "డివైస్ షేక్",
    voiceWord: "వాయిస్ సేఫ్ వర్డ్",
    autoDetect: "ఆటో డిస్ట్రెస్ డిటెక్షన్",
    on: "ఆన్",
    off: "ఆఫ్",
    incidentReport: "ఇన్సిడెంట్ రిపోర్ట్",
    reportHint: "ఏం జరిగిందో వ్రాయండి. ఇది సురక్షితంగా సేవ్ అవుతుంది.",
    submitReport: "రిపోర్ట్ సమర్పించు",
    reportSubmitted: "రిపోర్ట్ సమర్పించబడింది",
    emergencyEnded: "ఎమర్జెన్సీ ముగిసింది",
    emergencyStarted: "ఎమర్జెన్సీ ప్రారంభమైంది",
    sending: "పంపుతోంది…",
    sent: "పంపబడింది",
    status: "స్థితి",
    connected: "కనెక్ట్ అయ్యింది",
    connecting: "కనెక్ట్ అవుతోంది…",
    privacyNote: "డిస్క్రీట్‌గా ఉండేందుకు కనీస ఆన్-స్క్రీన్ సంకేతాలు.",
    language: "భాష",
  },
}

export interface EmergencyFlowProps {
  className?: string
  locale?: Locale
  defaultSilent?: boolean
  onActivate?: () => void
  onCancel?: () => void
}

export default function EmergencyFlow({
  className,
  locale = "en",
  defaultSilent = true,
  onActivate,
  onCancel,
}: EmergencyFlowProps) {
  const t = i18n[locale]

  const [active, setActive] = React.useState(false)
  const [silent, setSilent] = React.useState(defaultSilent)
  const [autoDetect, setAutoDetect] = React.useState(true)
  const [triggerPower, setTriggerPower] = React.useState(true)
  const [triggerShake, setTriggerShake] = React.useState(true)
  const [triggerVoice, setTriggerVoice] = React.useState(true)

  const [preparing, setPreparing] = React.useState(false)
  const [locationConnected, setLocationConnected] = React.useState<"idle" | "connecting" | "connected">("idle")
  const [contactsStatus, setContactsStatus] = React.useState<"idle" | "sending" | "sent">("idle")
  const [servicesStatus, setServicesStatus] = React.useState<"idle" | "sending" | "sent">("idle")

  const [audioProgress, setAudioProgress] = React.useState(0)
  const [videoProgress, setVideoProgress] = React.useState(0)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const [message, setMessage] = React.useState("")

  // Track incident + client id for backend wiring
  const [incidentId, setIncidentId] = React.useState<number | null>(null)
  const clientIdRef = React.useRef<string>("")
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const existing = localStorage.getItem("aegis_client_id")
    if (existing) {
      clientIdRef.current = existing
    } else {
      const id = Math.random().toString(36).slice(2)
      clientIdRef.current = id
      localStorage.setItem("aegis_client_id", id)
    }
  }, [])

  // Haptic feedback helper
  const vibrate = React.useCallback((pattern: number | number[]) => {
    if (typeof window !== "undefined" && "navigator" in window && "vibrate" in window.navigator) {
      window.navigator.vibrate(pattern as any)
    }
  }, [])

  // Helpers to call backend APIs
  const startIncident = React.useCallback(async () => {
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientIdRef.current }),
      })
      if (!res.ok) return
      const data = await res.json()
      setIncidentId(data?.incident?.id ?? null)
    } catch {}
  }, [])

  const stopIncident = React.useCallback(async () => {
    if (!incidentId) return
    try {
      await fetch("/api/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: incidentId }),
      })
    } catch {}
  }, [incidentId])

  const sendLocationPing = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        fetch("/api/locations/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": clientIdRef.current || "web",
          },
          body: JSON.stringify({ lat, lng, accuracy, timestamp: Date.now() }),
        }).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, timeout: 7000 }
    )
  }, [])

  const uploadMockEvidence = React.useCallback((type: "audio" | "video") => {
    fetch("/api/evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url: type === "audio" ? "https://example.com/mock.aac" : "https://example.com/mock.mp4", durationSec: type === "audio" ? 30 : 20, incidentId: incidentId ?? undefined }),
    }).catch(() => {})
  }, [incidentId])

  // Simulate lifecycle when active + wire backend
  React.useEffect(() => {
    let timers: number[] = []
    if (active) {
      setPreparing(true)
      setLocationConnected("connecting")
      setContactsStatus("sending")
      setServicesStatus("sending")
      setAudioProgress(0)
      setVideoProgress(0)
      setUploadProgress(0)

      // begin incident and first location ping
      startIncident().then(() => sendLocationPing()).catch(() => {})

      vibrate([40, 60, 40])

      // preparing secure channel
      timers.push(
        window.setTimeout(() => {
          setPreparing(false)
        }, 800)
      )

      // location connection
      timers.push(
        window.setTimeout(() => {
          setLocationConnected("connected")
        }, 1400)
      )

      // notifications
      timers.push(
        window.setTimeout(() => {
          setContactsStatus("sent")
        }, 1200)
      )
      timers.push(
        window.setTimeout(() => {
          setServicesStatus("sent")
        }, 1800)
      )

      // progress simulation
      const interval = window.setInterval(() => {
        setAudioProgress((p) => Math.min(100, p + 3))
        setVideoProgress((p) => Math.min(100, p + 2))
        setUploadProgress((p) => Math.min(100, p + 4))
      }, 350)
      timers.push(interval)

      // periodic location streaming
      const locInterval = window.setInterval(() => sendLocationPing(), 5000)
      timers.push(locInterval)

      // mock evidence uploads
      timers.push(
        window.setTimeout(() => uploadMockEvidence("audio"), 3000)
      )
      timers.push(
        window.setTimeout(() => uploadMockEvidence("video"), 6000)
      )
    } else {
      setPreparing(false)
      setLocationConnected("idle")
      setContactsStatus("idle")
      setServicesStatus("idle")
      setAudioProgress(0)
      setVideoProgress(0)
      setUploadProgress(0)
      // resolve incident when turning inactive
      stopIncident()
    }
    return () => {
      timers.forEach((tId) => clearInterval(tId))
    }
  }, [active, startIncident, stopIncident, sendLocationPing, uploadMockEvidence])

  const handleActivate = () => {
    setActive(true)
    toast.warning(t.emergencyStarted, { duration: 2000 })
    onActivate?.()
  }

  const handleCancel = () => {
    setActive(false)
    vibrate(20)
    toast.success(t.emergencyEnded, { duration: 2000 })
    onCancel?.()
  }

  const [report, setReport] = React.useState("")
  const submitReport = () => {
    toast.success(t.reportSubmitted)
    setReport("")
  }

  const sendQuickText = () => {
    toast.message(t.sending)
    setTimeout(() => toast.success(t.sent), 900)
    vibrate(10)
  }

  const sendVoice = () => {
    toast.message(t.sending)
    setTimeout(() => toast.success(t.sent), 1200)
    vibrate([10, 30, 10])
  }

  const activeSurface = active
    ? "bg-destructive text-destructive-foreground"
    : "bg-card text-card-foreground"

  const subtlePanel = active
    ? "bg-[rgba(255,255,255,0.08)] border-white/20"
    : "bg-secondary border-border"

  return (
    <Card
      className={cn(
        "w-full max-w-full overflow-hidden border shadow-sm",
        active ? "border-destructive/40 shadow-none" : "",
        className
      )}
      aria-live="polite"
    >
      <CardHeader className={cn("space-y-1", activeSurface)}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className={cn("truncate", active ? "text-white" : "")}>
              {active ? t.active : t.title}
            </CardTitle>
            <CardDescription className={cn("mt-1", active ? "text-white/80" : "")}>
              {t.description}
            </CardDescription>
          </div>
          <Badge
            variant={active ? "destructive" : "secondary"}
            className={cn(
              "shrink-0",
              active ? "bg-white/10 text-white border-white/20" : ""
            )}
          >
            <span className="flex items-center gap-1.5">
              <Signal className={cn("h-3.5 w-3.5", active ? "text-white" : "text-foreground")} aria-hidden />
              {t.status}:{" "}
              <span className="font-medium">
                {active
                  ? locationConnected === "connected"
                    ? t.connected
                    : t.connecting
                  : t.off}
              </span>
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={cn("p-4 sm:p-6", active ? "bg-destructive/5" : "")}>
        <div className={cn("rounded-lg border p-3 sm:p-4", subtlePanel)}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Siren className={cn("h-4 w-4", active ? "text-white" : "text-primary")} aria-hidden />
              <p className={cn("text-sm font-medium truncate", active ? "text-white" : "text-foreground")}>
                {active ? t.preparing : t.privacyNote}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="silent"
                  checked={silent}
                  onCheckedChange={setSilent}
                  aria-label={t.silentMode}
                />
                <Label htmlFor="silent" className={cn("text-xs", active ? "text-white/90" : "text-foreground")}>
                  {t.silentMode}
                </Label>
              </div>
              <LanguagePill locale={locale} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              icon={CirclePower}
              label={t.activate}
              active={active}
              onClick={!active ? handleActivate : undefined}
              disabled={active}
              emphasis
            />
            <QuickAction
              icon={OctagonAlert}
              label={t.cancel}
              subtle
              onClick={active ? handleCancel : undefined}
              disabled={!active}
            />
            <QuickAction
              icon={Phone}
              label={t.call112}
              href="tel:112"
            />
            <QuickAction
              icon={Hospital}
              label={t.openHimmat}
              href="https://play.google.com/store/apps/details?id=in.delhi.police.himmat"
            />
          </div>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="status" className="min-w-max">{t.status}</TabsTrigger>
              <TabsTrigger value="triggers" className="min-w-max">{t.triggers}</TabsTrigger>
              <TabsTrigger value="recording" className="min-w-max">{t.recording}</TabsTrigger>
              <TabsTrigger value="notify" className="min-w-max">{t.notifications}</TabsTrigger>
              <TabsTrigger value="tools" className="min-w-max">{t.tools}</TabsTrigger>
              <TabsTrigger value="report" className="min-w-max">{t.incidentReport}</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="pt-3">
              <div className="grid gap-4">
                <StatusRow
                  icon={Signal}
                  title={t.tracking}
                  stateLabel={
                    active
                      ? locationConnected === "connected"
                        ? t.connected
                        : t.connecting
                      : t.off
                  }
                  active={active}
                  pulse={active && locationConnected !== "connected"}
                />
                <StatusRow
                  icon={LifeBuoy}
                  title={t.services}
                  stateLabel={
                    !active ? t.off : servicesStatus === "sent" ? t.sent : t.sending
                  }
                  active={active}
                  pulse={active && servicesStatus !== "sent"}
                />
                <StatusRow
                  icon={BadgeAlert}
                  title={t.contacts}
                  stateLabel={
                    !active ? t.off : contactsStatus === "sent" ? t.sent : t.sending
                  }
                  active={active}
                  pulse={active && contactsStatus !== "sent"}
                />
              </div>
            </TabsContent>

            <TabsContent value="triggers" className="pt-3">
              <div className="grid gap-4">
                <ToggleRow
                  icon={CircleAlert}
                  label={t.powerSequence}
                  checked={triggerPower}
                  onCheckedChange={setTriggerPower}
                />
                <ToggleRow
                  icon={Flashlight}
                  label={t.shakeDevice}
                  checked={triggerShake}
                  onCheckedChange={setTriggerShake}
                />
                <ToggleRow
                  icon={Captions}
                  label={t.voiceWord}
                  checked={triggerVoice}
                  onCheckedChange={setTriggerVoice}
                />
                <ToggleRow
                  icon={Biohazard}
                  label={t.autoDetect}
                  checked={autoDetect}
                  onCheckedChange={setAutoDetect}
                />
              </div>
            </TabsContent>

            <TabsContent value="recording" className="pt-3">
              <div className="grid gap-4">
                <ProgressBlock
                  title={t.audioRecording}
                  subtitle={t.uploading}
                  value={audioProgress}
                  uploadValue={uploadProgress}
                  active={active}
                />
                <ProgressBlock
                  title={t.videoRecording}
                  subtitle={t.uploading}
                  value={videoProgress}
                  uploadValue={uploadProgress}
                  active={active}
                />
              </div>
            </TabsContent>

            <TabsContent value="notify" className="pt-3">
              <div className="grid gap-4">
                <NotifyBlock
                  title={t.contacts}
                  status={contactsStatus}
                  onSend={() => {
                    setContactsStatus("sending")
                    setTimeout(() => setContactsStatus("sent"), 1200)
                    toast.message(t.sending)
                  }}
                  active={active}
                />
                <NotifyBlock
                  title={t.services}
                  status={servicesStatus}
                  onSend={() => {
                    setServicesStatus("sending")
                    setTimeout(() => setServicesStatus("sent"), 1400)
                    toast.message(t.sending)
                  }}
                  active={active}
                />
              </div>
            </TabsContent>

            <TabsContent value="tools" className="pt-3">
              <div className="grid gap-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="quick-text">{t.quickText}</Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <Input
                      id="quick-text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.messagePlaceholder}
                      className="min-w-0"
                    />
                    <Button
                      variant="default"
                      onClick={sendQuickText}
                      aria-label={t.quickText}
                    >
                      {t.send}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={sendVoice} aria-label={t.quickVoice}>
                    <Captions className="mr-2 h-4 w-4" aria-hidden />
                    {t.quickVoice}
                  </Button>
                  <Button variant="outline" asChild aria-label={t.call112}>
                    <a href="https://112.gov.in/" target="_blank" rel="noreferrer">
                      <Phone className="mr-2 h-4 w-4" aria-hidden />
                      {t.call112}
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="report" className="pt-3">
              <div className="grid gap-3">
                <Label htmlFor="incident-report">{t.incidentReport}</Label>
                <Textarea
                  id="incident-report"
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder={t.reportHint}
                  className="min-h-[120px] resize-y"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.cancelHint}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" disabled={!active} onClick={handleCancel} aria-label={t.confirmCancel}>
                      <OctagonAlert className="mr-2 h-4 w-4" aria-hidden />
                      {t.confirmCancel}
                    </Button>
                    <Button onClick={submitReport} aria-label={t.submitReport}>
                      <BadgeAlert className="mr-2 h-4 w-4" aria-hidden />
                      {t.submitReport}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  href,
  active,
  disabled,
  emphasis,
  subtle,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  onClick?: () => void
  href?: string
  active?: boolean
  disabled?: boolean
  emphasis?: boolean
  subtle?: boolean
}) {
  const Comp = href ? "a" : "button"
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors min-h-11 w-full"
  const styles = emphasis
    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
    : subtle
    ? "bg-secondary hover:bg-secondary/80 border-border text-foreground"
    : "bg-card hover:bg-muted border-border text-foreground"
  return (
    <Comp
      className={cn(base, styles, disabled && "opacity-60 pointer-events-none")}
      onClick={onClick}
      {...(href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noreferrer" : undefined } : {})}
      aria-disabled={disabled}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="truncate">{label}</span>
      {active ? <span className="ml-auto h-2 w-2 rounded-full bg-green-400" /> : null}
    </Comp>
  )
}

function StatusRow({
  icon: Icon,
  title,
  stateLabel,
  active,
  pulse,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  stateLabel: string
  active?: boolean
  pulse?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-lg border p-3", active ? "bg-white/5 border-white/20" : "bg-card border-border")}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", active ? "bg-white/10" : "bg-secondary")}>
          <Icon className={cn("h-4 w-4", active ? "text-white" : "text-foreground")} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-medium", active ? "text-white" : "text-foreground")}>{title}</p>
          <p className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>{stateLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Dot pulse={!!pulse} active={!!active} />
      </div>
    </div>
  )
}

function Dot({ pulse, active }: { pulse: boolean; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        active ? "bg-green-400" : "bg-muted-foreground/40",
        pulse ? "animate-pulse" : ""
      )}
      aria-hidden
    />
  )
}

function ProgressBlock({
  title,
  subtitle,
  value,
  uploadValue,
  active,
}: {
  title: string
  subtitle: string
  value: number
  uploadValue: number
  active?: boolean
}) {
  return (
    <div className={cn("rounded-lg border p-3 sm:p-4", active ? "bg-white/5 border-white/20" : "bg-card border-border")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Siren className={cn("h-4 w-4", active ? "text-white" : "text-primary")} aria-hidden />
          <p className={cn("text-sm font-medium", active ? "text-white" : "text-foreground")}>{title}</p>
        </div>
        <Badge variant={active ? "destructive" : "secondary"} className={active ? "bg-white/10 text-white border-white/20" : ""}>
          {Math.round(value)}%
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        <Progress value={value} className={cn("h-2", active ? "[&>div]:bg-white" : "")} aria-label={title} />
        <div className="flex items-center justify-between">
          <span className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>{subtitle}</span>
          <span className={cn("text-xs font-medium", active ? "text-white/90" : "text-muted-foreground")}>
            {Math.round(uploadValue)}%
          </span>
        </div>
        <Progress value={uploadValue} className={cn("h-1.5", active ? "[&>div]:bg-white/80" : "")} aria-label={subtitle} />
      </div>
    </div>
  )
}

function NotifyBlock({
  title,
  status,
  onSend,
  active,
}: {
  title: string
  status: "idle" | "sending" | "sent"
  onSend: () => void
  active?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-lg border p-3", active ? "bg-white/5 border-white/20" : "bg-card border-border")}>
      <div className="flex items-center gap-3 min-w-0">
        <BadgeAlert className={cn("h-4 w-4", active ? "text-white" : "text-primary")} aria-hidden />
        <div className="min-w-0">
          <p className={cn("text-sm font-medium", active ? "text-white" : "text-foreground")}>{title}</p>
          <p className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>
            {status === "sent" ? "✓" : status === "sending" ? "…" : ""} {status}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={status === "sent" ? "secondary" : "default"}
        onClick={onSend}
        disabled={status !== "idle"}
        aria-label={`Notify ${title}`}
      >
        {status === "idle" ? <BadgeAlert className="mr-2 h-4 w-4" aria-hidden /> : null}
        {status === "idle" ? "Notify" : status === "sending" ? "…" : "Done"}
      </Button>
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
          <Icon className="h-4 w-4 text-foreground" aria-hidden />
        </div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}

function LanguagePill({ locale }: { locale: Locale }) {
  const label = locale === "en" ? "EN" : locale === "hi" ? "हिं" : "TE"
  return (
    <span
      className="inline-flex items-center rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-foreground"
      aria-label="Language"
      title="Language"
    >
      {label}
    </span>
  )
}