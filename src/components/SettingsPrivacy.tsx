"use client"

import React, { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Settings,
  UserRoundCog,
  Lock,
  ScanFace,
  Key,
  DoorClosedLocked,
  Cctv,
  CameraOff,
  LocateOff,
  Cog,
  EyeOff,
  InspectionPanel,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type Sensitivity = { audio: number; motion: number; face: number }
type NotificationPrefs = {
  low: boolean
  medium: boolean
  high: boolean
  vibrationOnly: boolean
  sound: boolean
}
type Permissions = {
  camera: boolean
  microphone: boolean
  location: boolean
  sensors: boolean
}
type Accessibility = {
  haptics: boolean
  touchTarget: "compact" | "comfortable" | "large"
}
type SettingsState = {
  aiProfile: "conservative" | "balanced" | "assertive"
  sensitivity: Sensitivity
  backgroundMonitoring: boolean
  batteryMode: "low" | "standard" | "max"
  locationPermission: "never" | "while-active" | "always"
  shareWithContacts: {
    family: boolean
    friends: boolean
    guardians: boolean
  }
  encryptionLevel: "standard" | "enhanced" | "maximum"
  requirePinForLogs: boolean
  accessPin: string
  emergency:
    | "power-3-press"
    | "power-5-press"
    | "power-2-press-hold"
  shakeSensitivity: number
  safeWordEnabled: boolean
  safeWord: string
  discrete: {
    hideNotifications: boolean
    dimScreen: boolean
    appCover: boolean
  }
  notification: NotificationPrefs
  permissions: Permissions
  privacyConsent: boolean
  dataRetention: "24h" | "7d" | "30d" | "90d" | "never"
  emergencyIntegration: {
    autoShareLocation: boolean
    sendAudioSnippet: boolean
  }
  language: "en" | "hi" | "te"
  accessibility: Accessibility
}

export interface SettingsPrivacyProps {
  className?: string
  initial?: Partial<SettingsState>
  onChange?: (next: SettingsState) => void
}

const defaultState: SettingsState = {
  aiProfile: "balanced",
  sensitivity: { audio: 60, motion: 50, face: 55 },
  backgroundMonitoring: true,
  batteryMode: "standard",
  locationPermission: "while-active",
  shareWithContacts: {
    family: true,
    friends: false,
    guardians: true,
  },
  encryptionLevel: "enhanced",
  requirePinForLogs: true,
  accessPin: "",
  emergency: "power-3-press",
  shakeSensitivity: 40,
  safeWordEnabled: false,
  safeWord: "",
  discrete: {
    hideNotifications: true,
    dimScreen: true,
    appCover: false,
  },
  notification: {
    low: false,
    medium: true,
    high: true,
    vibrationOnly: true,
    sound: false,
  },
  permissions: {
    camera: false,
    microphone: false,
    location: false,
    sensors: false,
  },
  privacyConsent: false,
  dataRetention: "30d",
  emergencyIntegration: {
    autoShareLocation: true,
    sendAudioSnippet: false,
  },
  language: "en",
  accessibility: {
    haptics: true,
    touchTarget: "comfortable",
  },
}

export default function SettingsPrivacy({
  className,
  initial,
  onChange,
}: SettingsPrivacyProps) {
  const init = useMemo<SettingsState>(
    () => ({ ...defaultState, ...initial }),
    [initial],
  )
  const [state, setState] = useState<SettingsState>(init)
  const [showSafeWord, setShowSafeWord] = useState(false)

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setState(prev => {
      const next = { ...prev, [key]: value }
      onChange?.(next)
      return next
    })
  }

  function updateNested<T extends object>(path: string[], value: any) {
    setState(prev => {
      const next: any = { ...prev }
      let cur: any = next
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = { ...cur[path[i]] }
        cur = cur[path[i]]
      }
      cur[path[path.length - 1]] = value
      onChange?.(next)
      return next
    })
  }

  const sectionCard = "bg-card border border-border rounded-lg shadow-sm"

  return (
    <section
      className={cn(
        "w-full max-w-full",
        className,
      )}
      aria-label="Settings and Privacy"
    >
      <Card className="bg-card border border-border">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-xl sm:text-2xl">Settings & Privacy</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Configure safety, privacy, and accessibility for a discrete and reliable experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="detection" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <InspectionPanel className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Distress detection & AI</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <Label htmlFor="ai-profile" className="text-sm">AI configuration</Label>
                      <Select
                        value={state.aiProfile}
                        onValueChange={(v: "conservative" | "balanced" | "assertive") =>
                          update("aiProfile", v)
                        }
                      >
                        <SelectTrigger id="ai-profile" className="bg-background">
                          <SelectValue placeholder="Select AI profile" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative (fewer false positives)</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="assertive">Assertive (faster detection)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Choose how quickly the system interprets distress signals from audio, motion, and facial cues.
                      </p>
                    </div>

                    <div className="grid gap-5">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Audio sensitivity</Label>
                          <span className="text-xs text-muted-foreground">{state.sensitivity.audio}%</span>
                        </div>
                        <Slider
                          aria-label="Audio sensitivity"
                          value={[state.sensitivity.audio]}
                          onValueChange={([v]) =>
                            updateNested(["sensitivity", "audio"], v)
                          }
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Motion sensitivity</Label>
                          <span className="text-xs text-muted-foreground">{state.sensitivity.motion}%</span>
                        </div>
                        <Slider
                          aria-label="Motion sensitivity"
                          value={[state.sensitivity.motion]}
                          onValueChange={([v]) =>
                            updateNested(["sensitivity", "motion"], v)
                          }
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Face detection sensitivity</Label>
                          <span className="text-xs text-muted-foreground">{state.sensitivity.face}%</span>
                        </div>
                        <Slider
                          aria-label="Face detection sensitivity"
                          value={[state.sensitivity.face]}
                          onValueChange={([v]) =>
                            updateNested(["sensitivity", "face"], v)
                          }
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="background" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Cog className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Background monitoring & battery</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Label className="text-sm">Background monitoring</Label>
                        <p className="text-xs text-muted-foreground">Run discreetly when app is minimized.</p>
                      </div>
                      <Switch
                        checked={state.backgroundMonitoring}
                        onCheckedChange={(v) => update("backgroundMonitoring", v)}
                        aria-label="Toggle background monitoring"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="battery-mode" className="text-sm">Battery optimization</Label>
                      <Select
                        value={state.batteryMode}
                        onValueChange={(v: "low" | "standard" | "max") => update("batteryMode", v)}
                      >
                        <SelectTrigger id="battery-mode" className="bg-background">
                          <SelectValue placeholder="Choose battery mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low usage (reduced checks)</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="max">Maximum safety (frequent checks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="location" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <LocateOff className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Location sharing & privacy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="location-perm" className="text-sm">Location access</Label>
                        <Select
                          value={state.locationPermission}
                          onValueChange={(v: "never" | "while-active" | "always") =>
                            update("locationPermission", v)
                          }
                        >
                          <SelectTrigger id="location-perm" className="bg-background">
                            <SelectValue placeholder="Select permission level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="while-active">While app active</SelectItem>
                            <SelectItem value="always">Always allow</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Control how Aegis accesses location to keep you safe and private.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm">Share with</Label>
                        <div className="grid gap-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-sm">Family</span>
                            </div>
                            <Switch
                              checked={state.shareWithContacts.family}
                              onCheckedChange={(v) =>
                                updateNested(["shareWithContacts", "family"], v)
                              }
                              aria-label="Share with family"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-sm">Friends</span>
                            </div>
                            <Switch
                              checked={state.shareWithContacts.friends}
                              onCheckedChange={(v) =>
                                updateNested(["shareWithContacts", "friends"], v)
                              }
                              aria-label="Share with friends"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-sm">Guardians</span>
                            </div>
                            <Switch
                              checked={state.shareWithContacts.guardians}
                              onCheckedChange={(v) =>
                                updateNested(["shareWithContacts", "guardians"], v)
                              }
                              aria-label="Share with guardians"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <Label className="text-sm">Share location during emergencies</Label>
                          <p className="text-xs text-muted-foreground">Automatically send live location to trusted contacts.</p>
                        </div>
                        <Switch
                          checked={state.emergencyIntegration.autoShareLocation}
                          onCheckedChange={(v) =>
                            updateNested(["emergencyIntegration", "autoShareLocation"], v)
                          }
                          aria-label="Auto share location"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <Label className="text-sm">Attach audio snippet</Label>
                          <p className="text-xs text-muted-foreground">Include a short audio clip for context.</p>
                        </div>
                        <Switch
                          checked={state.emergencyIntegration.sendAudioSnippet}
                          onCheckedChange={(v) =>
                            updateNested(["emergencyIntegration", "sendAudioSnippet"], v)
                          }
                          aria-label="Send audio snippet"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="encryption" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Data encryption & access</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="encryption-level" className="text-sm">Encryption level</Label>
                      <Select
                        value={state.encryptionLevel}
                        onValueChange={(v: "standard" | "enhanced" | "maximum") =>
                          update("encryptionLevel", v)
                        }
                      >
                        <SelectTrigger id="encryption-level" className="bg-background">
                          <SelectValue placeholder="Select encryption level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (fastest)</SelectItem>
                          <SelectItem value="enhanced">Enhanced (recommended)</SelectItem>
                          <SelectItem value="maximum">Maximum (highest security)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm">Require PIN for viewing sensitive logs</Label>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Protect incident history and settings.</p>
                        <Switch
                          checked={state.requirePinForLogs}
                          onCheckedChange={(v) => update("requirePinForLogs", v)}
                          aria-label="Require PIN for logs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="Set 4–6 digit PIN"
                          aria-label="Access PIN"
                          className="bg-background"
                          value={state.accessPin}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "").slice(0, 6)
                            update("accessPin", clean)
                          }}
                          disabled={!state.requirePinForLogs}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm">Data retention</Label>
                      <Select
                        value={state.dataRetention}
                        onValueChange={(v: "24h" | "7d" | "30d" | "90d" | "never") =>
                          update("dataRetention", v)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                          <SelectItem value="90d">90 days</SelectItem>
                          <SelectItem value="never">Do not auto-delete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        className="ml-auto"
                        onClick={() => {
                          toast.warning("Secure deletion initiated", {
                            description: "All locally stored incident data will be erased.",
                          })
                        }}
                      >
                        <DoorClosedLocked className="mr-2 h-4 w-4" aria-hidden="true" />
                        Secure delete now
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="activation" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <UserRoundCog className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Emergency activation methods</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="power-seq" className="text-sm">Power button sequence</Label>
                      <Select
                        value={state.emergency}
                        onValueChange={(v: "power-3-press" | "power-5-press" | "power-2-press-hold") =>
                          update("emergency", v)
                        }
                      >
                        <SelectTrigger id="power-seq" className="bg-background">
                          <SelectValue placeholder="Select activation sequence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="power-3-press">Press 3 times rapidly</SelectItem>
                          <SelectItem value="power-5-press">Press 5 times rapidly</SelectItem>
                          <SelectItem value="power-2-press-hold">Press twice + hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Shake sensitivity</Label>
                        <span className="text-xs text-muted-foreground">{state.shakeSensitivity}%</span>
                      </div>
                      <Slider
                        aria-label="Shake sensitivity"
                        value={[state.shakeSensitivity]}
                        onValueChange={([v]) => update("shakeSensitivity", v)}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">Lower values require stronger motion.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Safe word activation</Label>
                        <Switch
                          checked={state.safeWordEnabled}
                          onCheckedChange={(v) => update("safeWordEnabled", v)}
                          aria-label="Enable safe word"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ScanFace className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <div className="relative flex-1">
                          <Input
                            placeholder="Enter safe word"
                            value={state.safeWord}
                            onChange={(e) => update("safeWord", e.target.value)}
                            disabled={!state.safeWordEnabled}
                            type={showSafeWord ? "text" : "password"}
                            aria-label="Safe word"
                            className="bg-background pr-9"
                          />
                          <button
                            type="button"
                            aria-label={showSafeWord ? "Hide safe word" : "Show safe word"}
                            onClick={() => setShowSafeWord(s => !s)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Speak your safe word to trigger silent help.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Discrete operation</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Hide notifications</span>
                          <Switch
                            checked={state.discrete.hideNotifications}
                            onCheckedChange={(v) =>
                              updateNested(["discrete", "hideNotifications"], v)
                            }
                            aria-label="Hide notifications"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Dim screen during alerts</span>
                          <Switch
                            checked={state.discrete.dimScreen}
                            onCheckedChange={(v) =>
                              updateNested(["discrete", "dimScreen"], v)
                            }
                            aria-label="Dim screen during alerts"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Enable app cover</span>
                          <Switch
                            checked={state.discrete.appCover}
                            onCheckedChange={(v) =>
                              updateNested(["discrete", "appCover"], v)
                            }
                            aria-label="Enable app cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Cctv className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Notifications & alerts</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm">Alert levels</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Low sensitivity alerts</span>
                          <Switch
                            checked={state.notification.low}
                            onCheckedChange={(v) => updateNested(["notification", "low"], v)}
                            aria-label="Low sensitivity alerts"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Medium sensitivity alerts</span>
                          <Switch
                            checked={state.notification.medium}
                            onCheckedChange={(v) => updateNested(["notification", "medium"], v)}
                            aria-label="Medium sensitivity alerts"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">High sensitivity alerts</span>
                          <Switch
                            checked={state.notification.high}
                            onCheckedChange={(v) => updateNested(["notification", "high"], v)}
                            aria-label="High sensitivity alerts"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Delivery style</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Vibration only</span>
                          <Switch
                            checked={state.notification.vibrationOnly}
                            onCheckedChange={(v) => updateNested(["notification", "vibrationOnly"], v)}
                            aria-label="Vibration only"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Play sound</span>
                          <Switch
                            checked={state.notification.sound}
                            onCheckedChange={(v) => updateNested(["notification", "sound"], v)}
                            aria-label="Play sound"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="permissions" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CameraOff className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Device permissions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PermissionRow
                      icon={<CameraOff className="h-4 w-4" aria-hidden="true" />}
                      label="Camera"
                      granted={state.permissions.camera}
                      onRequest={() => {
                        toast.info("Requesting camera permission (mock).")
                        updateNested(["permissions", "camera"], true)
                      }}
                    />
                    <PermissionRow
                      icon={<Cctv className="h-4 w-4" aria-hidden="true" />}
                      label="Microphone"
                      granted={state.permissions.microphone}
                      onRequest={() => {
                        toast.info("Requesting microphone permission (mock).")
                        updateNested(["permissions", "microphone"], true)
                      }}
                    />
                    <PermissionRow
                      icon={<LocateOff className="h-4 w-4" aria-hidden="true" />}
                      label="Location"
                      granted={state.permissions.location}
                      onRequest={() => {
                        toast.info("Requesting location permission (mock).")
                        updateNested(["permissions", "location"], true)
                      }}
                    />
                    <PermissionRow
                      icon={<InspectionPanel className="h-4 w-4" aria-hidden="true" />}
                      label="Motion & sensors"
                      granted={state.permissions.sensors}
                      onRequest={() => {
                        toast.info("Requesting sensor permission (mock).")
                        updateNested(["permissions", "sensors"], true)
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="consent" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Privacy consent</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground break-words">
                      Aegis collects minimal data necessary for safety features. You can opt out anytime.
                      Consent enables proactive monitoring, emergency messaging, and incident logs stored securely on
                      your device unless you choose to share them.
                    </p>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={state.privacyConsent}
                        onCheckedChange={(v) => update("privacyConsent", Boolean(v))}
                        aria-describedby="consent-desc"
                      />
                      <div className="min-w-0">
                        <Label htmlFor="consent" className="text-sm">I agree to privacy terms</Label>
                        <p id="consent-desc" className="text-xs text-muted-foreground">
                          You can revoke consent in Settings at any time.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          toast.info("Opening privacy policy (mock).")
                        }
                      >
                        <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                        Review policy
                      </Button>
                      <Button
                        onClick={() => toast.success("Consent preferences saved.")}
                        disabled={!state.privacyConsent}
                      >
                        <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                        Save consent
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="language-accessibility" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-medium">Language & accessibility</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className={cn(sectionCard, "p-4 sm:p-6")}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="language" className="text-sm">Language</Label>
                      <Select
                        value={state.language}
                        onValueChange={(v: "en" | "hi" | "te") => update("language", v)}
                      >
                        <SelectTrigger id="language" className="bg-background">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm">Haptic feedback</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Vibration feedback for actions</span>
                        <Switch
                          checked={state.accessibility.haptics}
                          onCheckedChange={(v) =>
                            updateNested(["accessibility", "haptics"], v)
                          }
                          aria-label="Toggle haptic feedback"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="touch-target" className="text-sm">Touch target size</Label>
                      <Select
                        value={state.accessibility.touchTarget}
                        onValueChange={(v: "compact" | "comfortable" | "large") =>
                          updateNested(["accessibility", "touchTarget"], v)
                        }
                      >
                        <SelectTrigger id="touch-target" className="bg-background">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable (recommended)</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Larger targets improve one-handed use and accessibility.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setState(defaultState)
                toast.message("Changes discarded", {
                  description: "Settings restored to recommended defaults.",
                })
              }}
            >
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              Reset to defaults
            </Button>
            <Button
              onClick={() => {
                toast.success("Settings saved", { description: "Your preferences are now active." })
              }}
            >
              <Cog className="mr-2 h-4 w-4" aria-hidden="true" />
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function PermissionRow({
  icon,
  label,
  granted,
  onRequest,
}: {
  icon: React.ReactNode
  label: string
  granted: boolean
  onRequest: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className={cn("text-xs", granted ? "text-green-600" : "text-muted-foreground")}>
            {granted ? "Granted" : "Not granted"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={granted ? "secondary" : "default"}
          onClick={onRequest}
        >
          {granted ? "Manage" : "Allow"}
        </Button>
      </div>
    </div>
  )
}