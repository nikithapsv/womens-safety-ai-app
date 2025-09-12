"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Settings2,
  LifeBuoy,
  MonitorCheck,
  MonitorDot,
  Gauge,
  ShieldUser,
  Cctv,
  HeartPulse,
  LayoutDashboard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

type ActivityItem = {
  id: string
  time: string
  title: string
  description: string
  tone: "neutral" | "success" | "warning"
}

export type SafetyDashboardProps = {
  userName?: string
  initials?: string
  initialActive?: boolean
  initialLocationSharing?: boolean
  initialEmergencyMode?: boolean
  protectionLevel?: number
  trustedContactsCount?: number
  recentActivity?: ActivityItem[]
  className?: string
}

export default function SafetyDashboard({
  userName = "Aparna",
  initials = "AP",
  initialActive = true,
  initialLocationSharing = true,
  initialEmergencyMode = false,
  protectionLevel = 82,
  trustedContactsCount = 3,
  recentActivity,
  className,
}: SafetyDashboardProps) {
  const [isActive, setIsActive] = React.useState<boolean>(initialActive)
  const [locationSharing, setLocationSharing] = React.useState<boolean>(initialLocationSharing)
  const [emergencyMode, setEmergencyMode] = React.useState<boolean>(initialEmergencyMode)
  const [locationLabel, setLocationLabel] = React.useState<string>("Hyderabad, Telangana • Near Banjara Hills")
  const [updatingLocation, setUpdatingLocation] = React.useState<boolean>(false)
  const [servicesOnline, setServicesOnline] = React.useState<boolean>(true)
  const [batteryOptimized, setBatteryOptimized] = React.useState<boolean>(false)

  const activity: ActivityItem[] =
    recentActivity ??
    [
      {
        id: "a1",
        time: "2 min ago",
        title: "Background monitoring verified",
        description: "Motion and audio sensitivity calibrated",
        tone: "success",
      },
      {
        id: "a2",
        time: "25 min ago",
        title: "Location updated",
        description: "Precision improved via Wi‑Fi",
        tone: "neutral",
      },
      {
        id: "a3",
        time: "Yesterday",
        title: "Trusted contacts confirmed",
        description: "3 contacts ready for emergency",
        tone: "success",
      },
    ]

  function handleToggleMonitoring() {
    const next = !isActive
    setIsActive(next)
    if (next) {
      toast.success("Monitoring activated", {
        description: "Liora is now watching over you.",
      })
    } else {
      toast("Monitoring paused", {
        description: "You can resume anytime from the dashboard.",
      })
    }
  }

  function handleSilentSOS() {
    setEmergencyMode(true)
    toast.success("Silent SOS sent", {
      description: "Trusted contacts notified with live location.",
    })
  }

  function handlePanic() {
    setEmergencyMode(true)
    toast.success("Emergency mode active", {
      description: "High-alert protocols initiated. Stay safe.",
    })
  }

  function handleContacts() {
    toast("Contacts panel", {
      description: "Quick access to trusted contacts.",
    })
  }

  function handleUpdateLocation() {
    setUpdatingLocation(true)
    const label = locationSharing
      ? "Live: Hyderabad • Road No. 12, Banjara Hills"
      : "Location hidden • Privacy mode"
    setTimeout(() => {
      setLocationLabel(label)
      setUpdatingLocation(false)
      toast.success("Location refreshed", {
        description: locationSharing ? "Sharing precise location securely." : "Location sharing is off.",
      })
    }, 900)
  }

  function handleSettings() {
    toast("Opening Settings", {
      description: "Adjust preferences, contacts, and permissions.",
    })
  }

  function handleHelp() {
    toast("Help Center", {
      description: "Learn how Liora protects you in emergencies.",
    })
  }

  function handleOptimizeBattery() {
    setBatteryOptimized(true)
    toast.success("Battery optimization set", {
      description: "Background monitoring will be more reliable.",
    })
  }

  function handleServicesCheck() {
    // Simulate a quick status check
    const ok = Math.random() > 0.1
    setServicesOnline(ok)
    if (ok) {
      toast.success("All services online", {
        description: "Emergency channels and sensors are ready.",
      })
    } else {
      toast("Service disruption", {
        description: "Some services are degraded. Retrying soon.",
      })
    }
  }

  const headerToneClasses = emergencyMode
    ? "bg-destructive text-destructive-foreground"
    : "bg-card text-card-foreground"

  const statusBadgeClasses = isActive
    ? emergencyMode
      ? "bg-destructive-foreground/20 text-destructive-foreground"
      : "bg-accent text-accent-foreground"
    : emergencyMode
    ? "bg-destructive-foreground/20 text-destructive-foreground"
    : "bg-muted text-foreground"

  const sensorDotClasses = (active: boolean) =>
    active
      ? emergencyMode
        ? "bg-destructive-foreground"
        : "bg-chart-3"
      : "bg-muted"

  const primaryActionClasses = emergencyMode
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : "bg-primary text-primary-foreground hover:bg-primary/90"

  return (
    <div className={className}>
      <TooltipProvider delayDuration={200}>
        <Card className="w-full max-w-full bg-card shadow-sm border border-border rounded-[var(--radius)]">
          <CardHeader className="p-4 sm:p-6">
            <div className="w-full max-w-full">
              <div
                className={`w-full max-w-full rounded-[calc(var(--radius)-2px)] ${headerToneClasses} px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="size-8 sm:size-9 rounded-md bg-secondary flex items-center justify-center">
                    <LayoutDashboard className="size-4 sm:size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold font-heading leading-none truncate">
                      Liora Safety
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`px-2 py-0.5 text-[11px] sm:text-xs ${statusBadgeClasses} border-0`}
                      >
                        {isActive ? "Monitoring: Active" : "Monitoring: Paused"}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {servicesOnline ? "Services online" : "Service check needed"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Help and resources"
                        className="bg-secondary hover:bg-secondary/80"
                        onClick={handleHelp}
                      >
                        <LifeBuoy className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Help</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Settings"
                        className="bg-secondary hover:bg-secondary/80"
                        onClick={handleSettings}
                      >
                        <Settings2 className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Settings</TooltipContent>
                  </Tooltip>
                  <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground leading-none">Signed in</p>
                      <p className="text-sm font-medium leading-none truncate max-w-[12ch]">{userName}</p>
                    </div>
                    <Avatar className="size-8 sm:size-9 ring-2 ring-border">
                      <AvatarFallback className="bg-secondary text-primary text-sm">{initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
            {/* Status and Controls */}
            <div className="w-full max-w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <Card className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldUser className="size-5 text-primary" aria-hidden="true" />
                      <p className="text-sm font-medium">Protection level</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm font-semibold">{protectionLevel}%</span>
                    </div>
                  </div>
                  <Progress value={protectionLevel} className="mt-3" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-2 rounded-full bg-chart-3 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Real-time monitoring</span>
                    </div>
                    <Button
                      variant={isActive ? "secondary" : "default"}
                      size="sm"
                      aria-pressed={isActive}
                      onClick={handleToggleMonitoring}
                      className={isActive ? "" : primaryActionClasses}
                    >
                      {isActive ? "Pause" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-[var(--radius)] overflow-hidden md:col-span-2">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Current status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {isActive ? (
                          <MonitorCheck className="size-5 text-chart-3" aria-hidden="true" />
                        ) : (
                          <MonitorDot className="size-5 text-muted-foreground" aria-hidden="true" />
                        )}
                        <p className="text-base sm:text-lg font-semibold truncate">
                          {emergencyMode
                            ? "Emergency mode"
                            : isActive
                            ? "Safe monitoring"
                            : "Monitoring paused"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Location sharing</p>
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={locationSharing}
                            onCheckedChange={setLocationSharing}
                            aria-label="Toggle location sharing"
                          />
                          <span className="text-sm">{locationSharing ? "On" : "Off"}</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleUpdateLocation}
                        disabled={updatingLocation}
                        aria-busy={updatingLocation}
                        className="bg-secondary hover:bg-secondary/80"
                      >
                        {updatingLocation ? "Updating..." : "Refresh"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-secondary px-3 py-2">
                    <p className="text-sm break-words">
                      {locationLabel}
                      {!locationSharing && (
                        <span className="ml-2 text-xs text-muted-foreground">(privacy protected)</span>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <Button
                      onClick={handleSilentSOS}
                      aria-label="Send silent SOS"
                      className="h-12 sm:h-14 rounded-md bg-muted hover:bg-muted/80 text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span className="relative inline-flex">
                          <span className="absolute inset-0 rounded-full opacity-20 animate-ping bg-chart-3" />
                          <span className="relative inline-flex size-2 rounded-full bg-chart-3" />
                        </span>
                        <span className="text-sm font-medium">Silent SOS</span>
                      </div>
                    </Button>
                    <Button
                      onClick={handlePanic}
                      aria-label="Activate panic alarm"
                      className={`h-12 sm:h-14 rounded-md ${primaryActionClasses} font-semibold`}
                    >
                      Panic
                    </Button>
                    <Button
                      onClick={handleContacts}
                      aria-label="Open trusted contacts"
                      className="h-12 sm:h-14 rounded-md bg-accent hover:bg-accent/80 text-accent-foreground"
                    >
                      Contacts ({trustedContactsCount})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sensors visualization and services */}
            <div className="w-full max-w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-4 sm:mt-5">
              <Card className="bg-card border border-border rounded-[var(--radius)]">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold">Background sensors</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Audio</p>
                        <span className={`inline-flex size-2 rounded-full ${sensorDotClasses(isActive)}`} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <MonitorDot className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs text-muted-foreground">Passive</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Motion</p>
                        <span className={`inline-flex size-2 rounded-full ${sensorDotClasses(isActive)}`} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <HeartPulse className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs text-muted-foreground">Dynamic</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Camera</p>
                        <span className={`inline-flex size-2 rounded-full ${sensorDotClasses(isActive)}`} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Cctv className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs text-muted-foreground">Ready</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Sensors are optimized for discretion. Visual and audible feedback is minimized during alerts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-[var(--radius)] md:col-span-2">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Emergency services</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          servicesOnline ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            servicesOnline ? "bg-chart-3 animate-pulse" : "bg-muted-foreground"
                          }`}
                        />
                        {servicesOnline ? "Online" : "Degraded"}
                      </span>
                      <Button variant="secondary" size="xs" onClick={handleServicesCheck} className="bg-secondary">
                        Check
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-md border border-border p-3">
                      <p className="text-xs text-muted-foreground">Dispatch readiness</p>
                      <div className="mt-2 flex items-center gap-2">
                        <SquareStatus ok={servicesOnline} />
                        <span className="text-sm">{servicesOnline ? "Connected" : "Retrying..."}</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-xs text-muted-foreground">Contact delivery</p>
                      <div className="mt-2 flex items-center gap-2">
                        <SquareStatus ok={true} />
                        <span className="text-sm">Verified</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-xs text-muted-foreground">Location relays</p>
                      <div className="mt-2 flex items-center gap-2">
                        <SquareStatus ok={locationSharing} />
                        <span className="text-sm">{locationSharing ? "Precise" : "Restricted"}</span>
                      </div>
                    </div>
                  </div>

                  {!batteryOptimized && (
                    <div className="mt-4 rounded-md bg-secondary px-3 py-2 flex items-start gap-3">
                      <div className="mt-0.5">
                        <span className="inline-flex size-2 rounded-full bg-destructive animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Battery optimization recommended</p>
                        <p className="text-xs text-muted-foreground">
                          Allow Liora to run reliably in the background for uninterrupted protection.
                        </p>
                      </div>
                      <div className="ml-auto shrink-0">
                        <Button size="sm" onClick={handleOptimizeBattery} className={primaryActionClasses}>
                          Optimize
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent activity */}
            <div className="w-full max-w-full mt-4 sm:mt-5">
              <Card className="bg-card border border-border rounded-[var(--radius)]">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <ul className="space-y-3">
                    {activity.map((item) => (
                      <li key={item.id} className="flex items-start gap-3">
                        <TimelineDot tone={item.tone} />
                        <div className="min-w-0 w-full max-w-full">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 break-words">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  )
}

function TimelineDot({ tone }: { tone: "neutral" | "success" | "warning" }) {
  const toneClass =
    tone === "success" ? "bg-chart-3" : tone === "warning" ? "bg-destructive" : "bg-muted-foreground"
  return (
    <span className="relative inline-flex mt-1">
      <span className={`absolute inset-0 rounded-full opacity-20 ${toneClass} animate-ping`} />
      <span className={`relative inline-flex size-2 rounded-full ${toneClass}`} />
    </span>
  )
}

function SquareStatus({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs ${
        ok ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
      }`}
    >
      <span className={`size-1.5 rounded-[2px] ${ok ? "bg-chart-3" : "bg-muted-foreground"}`} />
      {ok ? "OK" : "Issue"}
    </span>
  )
}