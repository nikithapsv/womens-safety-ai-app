"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  UserPlus,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  MessageCircle,
  LifeBuoy,
  Hospital,
  HeartPulse,
  Group as GroupIcon,
  IdCard,
  MessageCirclePlus,
  ContactRound,
  Nfc,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Availability = "available" | "busy" | "offline"
type Verification = "pending" | "verified" | "failed"

type LanguageLabel = "en" | "hi" | "te"

type Relationship =
  | "family"
  | "friend"
  | "colleague"
  | "neighbor"
  | "other"

type Contact = {
  id: string
  name: string
  phone: string
  altPhone?: string
  email?: string
  relationship: Relationship
  languages: LanguageLabel[]
  isEmergency: boolean
  priority: number // 1 = highest
  verified: Verification
  availability: Availability
  shareLocation: boolean
  receiveAlerts: boolean
  notes?: string
}

type ServiceIntegration = {
  id: string
  name: string
  type: "emergency-number" | "police-app" | "hospital"
  enabled: boolean
  lastTest?: string
  instructions?: string
}

const LANGUAGE_LABELS: Record<LanguageLabel, string> = {
  en: "English",
  hi: "हिंदी",
  te: "తెలుగు",
}

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  family: "Family",
  friend: "Friend",
  colleague: "Colleague",
  neighbor: "Neighbor",
  other: "Other",
}

export interface ContactManagementProps {
  className?: string
  style?: React.CSSProperties
  initialContacts?: Contact[]
  initialServices?: ServiceIntegration[]
  onContactsChange?: (contacts: Contact[]) => void
  onServicesChange?: (services: ServiceIntegration[]) => void
}

export default function ContactManagement({
  className,
  style,
  initialContacts,
  initialServices,
  onContactsChange,
  onServicesChange,
}: ContactManagementProps) {
  const [contacts, setContacts] = React.useState<Contact[]>(
    initialContacts ?? [
      {
        id: "c-1",
        name: "Ananya Sharma",
        phone: "+91 98765 43210",
        relationship: "family",
        languages: ["en", "hi"],
        isEmergency: true,
        priority: 1,
        verified: "verified",
        availability: "available",
        shareLocation: true,
        receiveAlerts: true,
        notes: "Sister. Works nearby.",
      },
      {
        id: "c-2",
        name: "Priya Verma",
        phone: "+91 99888 77665",
        relationship: "friend",
        languages: ["en"],
        isEmergency: true,
        priority: 2,
        verified: "pending",
        availability: "busy",
        shareLocation: false,
        receiveAlerts: true,
      },
      {
        id: "c-3",
        name: "Ravi Teja",
        phone: "+91 90909 30303",
        relationship: "colleague",
        languages: ["en", "te"],
        isEmergency: false,
        priority: 3,
        verified: "verified",
        availability: "offline",
        shareLocation: false,
        receiveAlerts: false,
        notes: "Backup contact.",
      },
    ],
  )

  // Fetch contacts from API once on mount (maps minimal API fields to rich UI model)
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/contacts", { cache: "no-store" })
        if (!res.ok) return
        const data: { contacts: Array<{ id: number; name: string; phone: string; email?: string; relation?: string }> } = await res.json()
        if (!mounted) return
        setContacts((prev) => {
          const mapped: Contact[] = data.contacts.map((c) => ({
            id: String(c.id),
            name: c.name,
            phone: c.phone,
            email: c.email,
            relationship: (c.relation as Relationship) || "other",
            languages: ["en"],
            isEmergency: true,
            priority: 3,
            verified: "pending",
            availability: "offline",
            shareLocation: true,
            receiveAlerts: true,
          }))
          // If user provided initialContacts, prefer them; otherwise use API
          return initialContacts && initialContacts.length > 0 ? prev : mapped
        })
      } catch {}
    })()
    return () => {
      mounted = false
    }
  }, [initialContacts])

  const [services, setServices] = React.useState<ServiceIntegration[]>(
    initialServices ?? [
      {
        id: "s-112",
        name: "112 India (ERSS)",
        type: "emergency-number",
        enabled: true,
        lastTest: "",
        instructions:
          "Ensure SIM balance for call/SMS. 112 works across India for emergency response.",
      },
      {
        id: "s-police",
        name: "Local Police App",
        type: "police-app",
        enabled: false,
        lastTest: "",
        instructions:
          "Install state police app if available. Enable background permissions for quick SOS.",
      },
      {
        id: "s-hospital",
        name: "Nearest Hospital",
        type: "hospital",
        enabled: false,
        lastTest: "",
        instructions:
          "Enable to auto-share location and alert nearest hospital in severe emergencies.",
      },
    ],
  )

  const [search, setSearch] = React.useState("")
  const [langFilter, setLangFilter] = React.useState<LanguageLabel | "all">(
    "all",
  )
  const [relationshipFilter, setRelationshipFilter] =
    React.useState<Relationship | "all">("all")

  const [addOpen, setAddOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [testOpen, setTestOpen] = React.useState<null | string>(null)
  const [previewMessage, setPreviewMessage] = React.useState(
    "Emergency Alert: I need help. My live location will be shared. Please respond ASAP.",
  )

  const [newContact, setNewContact] = React.useState<Omit<Contact, "id">>({
    name: "",
    phone: "",
    altPhone: "",
    email: "",
    relationship: "friend",
    languages: ["en"],
    isEmergency: true,
    priority: 3,
    verified: "pending",
    availability: "offline",
    shareLocation: true,
    receiveAlerts: true,
    notes: "",
  })

  const [permissionLocation, setPermissionLocation] = React.useState(true)
  const [permissionAlerts, setPermissionAlerts] = React.useState(true)
  const [permissionContacts, setPermissionContacts] = React.useState(false)

  React.useEffect(() => {
    onContactsChange?.(contacts)
  }, [contacts, onContactsChange])

  React.useEffect(() => {
    onServicesChange?.(services)
  }, [services, onServicesChange])

  const filteredContacts = contacts
    .filter((c) => {
      const q = search.trim().toLowerCase()
      const matchesQuery =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      const matchesLang =
        langFilter === "all" || c.languages.includes(langFilter)
      const matchesRel =
        relationshipFilter === "all" || c.relationship === relationshipFilter
      return matchesQuery && matchesLang && matchesRel
    })
    .sort((a, b) => {
      // Emergency contacts first by priority, then verified, then name
      if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1
      if (a.isEmergency && b.isEmergency) return a.priority - b.priority
      if (a.verified !== b.verified)
        return a.verified === "verified" ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  async function handleAddContact() {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required.")
      return
    }
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newContact.name, phone: newContact.phone, email: newContact.email, relation: newContact.relationship }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const { contact } = await res.json()
      const id = String(contact.id)
      const contactUi: Contact = {
        id,
        name: newContact.name,
        phone: newContact.phone,
        altPhone: newContact.altPhone,
        email: newContact.email,
        relationship: newContact.relationship,
        languages: newContact.languages,
        isEmergency: newContact.isEmergency,
        priority: newContact.priority,
        verified: "pending",
        availability: "offline",
        shareLocation: newContact.shareLocation,
        receiveAlerts: newContact.receiveAlerts,
        notes: newContact.notes,
      }
      setContacts((prev) => [...prev, contactUi])
      setAddOpen(false)
      toast.success("Contact added. Verification pending.")
      setNewContact({
        name: "",
        phone: "",
        altPhone: "",
        email: "",
        relationship: "friend",
        languages: ["en"],
        isEmergency: true,
        priority: 3,
        verified: "pending",
        availability: "offline",
        shareLocation: true,
        receiveAlerts: true,
        notes: "",
      })
    } catch {
      toast.error("Failed to add contact")
    }
  }

  function handleDeleteContact(id: string) {
    fetch(`/api/contacts?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed")
        setContacts((prev) => prev.filter((c) => c.id !== id))
        toast.message("Contact removed", {
          description: "They will no longer receive alerts.",
        })
      })
      .catch(() => {
        toast.error("Failed to remove contact")
      })
  }

  function handleVerify(id: string, success: boolean) {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, verified: success ? "verified" : "failed" } : c,
      ),
    )
    toast[success ? "success" : "error"](
      success ? "Contact verified" : "Verification failed",
    )
  }

  function handleToggleEmergency(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEmergency: !c.isEmergency } : c)),
    )
  }

  function handlePriorityChange(id: string, priority: number) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, priority } : c)),
    )
  }

  function handlePermissionToggle(type: "location" | "alerts" | "contacts") {
    if (type === "location") setPermissionLocation((v) => !v)
    if (type === "alerts") setPermissionAlerts((v) => !v)
    if (type === "contacts") setPermissionContacts((v) => !v)
  }

  function handleServiceToggle(id: string) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  function handleTestService(id: string) {
    setTestOpen(id)
  }

  function runServiceTest(id: string, mode: "call" | "message") {
    // Simulated test run
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, lastTest: new Date().toISOString() } : s,
      ),
    )
    setTestOpen(null)
    toast.success(
      mode === "call" ? "Test call initiated" : "Test message sent",
    )
  }

  function bulkImportFromFile(file?: File | null) {
    if (!file) return
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || "")
        // Very simple CSV parsing: name,phone,relationship
        const rows = text
          .split(/\r?\n/)
          .map((r) => r.trim())
          .filter(Boolean)
        const imported: Contact[] = []
        for (const r of rows) {
          const [name, phone, relationshipRaw] = r.split(",").map((s) => s?.trim())
          if (!name || !phone) continue
          const relationship = (relationshipRaw as Relationship) || "other"
          imported.push({
            id: `c-${cryptoRandom()}`,
            name,
            phone,
            relationship: relationship in RELATIONSHIP_LABELS ? relationship : "other",
            languages: ["en"],
            isEmergency: false,
            priority: 5,
            verified: "pending",
            availability: "offline",
            shareLocation: false,
            receiveAlerts: true,
          })
        }
        if (imported.length === 0) {
          toast.error("No valid contacts found in the file.")
          return
        }
        setContacts((prev) => [...prev, ...imported])
        setImportOpen(false)
        toast.success(`Imported ${imported.length} contact(s).`)
      } catch {
        toast.error("Failed to import contacts.")
      }
    }
    reader.readAsText(file)
  }

  function updateContactPreferences(
    id: string,
    prefs: Partial<Pick<Contact, "shareLocation" | "receiveAlerts">>,
  ) {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...prefs } : c)))
  }

  function cryptoRandom() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      return buf[0].toString(16)
    }
    return Math.floor(Math.random() * 1e9).toString(16)
  }

  return (
    <section
      className={cn("w-full max-w-full bg-background", className)}
      style={style}
      aria-label="Trusted contacts and emergency services management"
    >
      <Card className="bg-card border rounded-2xl shadow-sm">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-xl sm:text-2xl font-heading tracking-tight">
                Contacts & Emergency Services
              </CardTitle>
              <CardDescription className="mt-1">
                Manage trusted contacts, emergency priorities, and service integrations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-secondary text-secondary-foreground">
                    <Nfc className="h-4 w-4 mr-2" aria-hidden="true" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bulk import contacts</DialogTitle>
                    <DialogDescription>
                      Upload a CSV with columns: name, phone, relationship.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="file">CSV file</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => bulkImportFromFile(e.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example row: Ananya Sharma, +91 99999 88888, family
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setImportOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add trusted contact</DialogTitle>
                    <DialogDescription>Verify contact details before saving.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Ananya Sharma"
                          value={newContact.name}
                          onChange={(e) =>
                            setNewContact((c) => ({ ...c, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Primary phone</Label>
                        <Input
                          id="phone"
                          inputMode="tel"
                          placeholder="+91 ..."
                          value={newContact.phone}
                          onChange={(e) =>
                            setNewContact((c) => ({ ...c, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="altPhone">Alternate phone (optional)</Label>
                        <Input
                          id="altPhone"
                          inputMode="tel"
                          placeholder="+91 ..."
                          value={newContact.altPhone}
                          onChange={(e) =>
                            setNewContact((c) => ({ ...c, altPhone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email (optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@email.com"
                          value={newContact.email}
                          onChange={(e) =>
                            setNewContact((c) => ({ ...c, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Relationship</Label>
                        <Select
                          onValueChange={(val) =>
                            setNewContact((c) => ({
                              ...c,
                              relationship: val as Relationship,
                            }))
                          }
                          defaultValue={newContact.relationship}
                        >
                          <SelectTrigger aria-label="Relationship">
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="colleague">Colleague</SelectItem>
                            <SelectItem value="neighbor">Neighbor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-2">
                          {(["en", "hi", "te"] as LanguageLabel[]).map((lng) => {
                            const active = newContact.languages.includes(lng)
                            return (
                              <Button
                                key={lng}
                                type="button"
                                variant={active ? "default" : "secondary"}
                                className={cn(
                                  "h-8",
                                  active ? "bg-primary text-primary-foreground" : "bg-secondary",
                                )}
                                onClick={() =>
                                  setNewContact((c) => {
                                    const set = new Set(c.languages)
                                    if (set.has(lng)) set.delete(lng)
                                    else set.add(lng)
                                    return { ...c, languages: Array.from(set) as LanguageLabel[] }
                                  })
                                }
                                aria-pressed={active}
                                aria-label={`Toggle ${LANGUAGE_LABELS[lng]}`}
                              >
                                {LANGUAGE_LABELS[lng]}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
                        <div className="mr-3">
                          <Label className="text-sm">Emergency contact</Label>
                          <p className="text-xs text-muted-foreground">Included in SOS</p>
                        </div>
                        <Switch
                          checked={newContact.isEmergency}
                          onCheckedChange={(v) =>
                            setNewContact((c) => ({ ...c, isEmergency: v }))
                          }
                          aria-label="Emergency contact toggle"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select
                          onValueChange={(val) =>
                            setNewContact((c) => ({ ...c, priority: Number(val) }))
                          }
                          defaultValue={String(newContact.priority)}
                        >
                          <SelectTrigger aria-label="Priority order">
                            <SelectValue placeholder="Choose priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Highest)</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5 (Lowest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          placeholder="Optional note"
                          value={newContact.notes}
                          onChange={(e) =>
                            setNewContact((c) => ({ ...c, notes: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
                        <div className="mr-3">
                          <Label className="text-sm">Share location</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow this contact to receive live location
                          </p>
                        </div>
                        <Switch
                          checked={newContact.shareLocation}
                          onCheckedChange={(v) =>
                            setNewContact((c) => ({ ...c, shareLocation: v }))
                          }
                          aria-label="Share location with this contact"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
                        <div className="mr-3">
                          <Label className="text-sm">Receive alerts</Label>
                          <p className="text-xs text-muted-foreground">
                            Send emergency notifications
                          </p>
                        </div>
                        <Switch
                          checked={newContact.receiveAlerts}
                          onCheckedChange={(v) =>
                            setNewContact((c) => ({ ...c, receiveAlerts: v }))
                          }
                          aria-label="Send alerts to this contact"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact} className="bg-primary text-primary-foreground">
                      Save contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1 min-w-0">
              <Input
                placeholder="Search by name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search contacts"
                className="pr-10"
              />
              <ContactRound className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(v) => setLangFilter(v as LanguageLabel | "all")} defaultValue="all">
                <SelectTrigger className="w-[150px]" aria-label="Filter by language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="te">తెలుగు</SelectItem>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) =>
                  setRelationshipFilter(v as Relationship | "all")
                }
                defaultValue="all"
              >
                <SelectTrigger className="w-[160px]" aria-label="Filter by relationship">
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All relationships</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="neighbor">Neighbor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="bg-secondary/60">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="groups">Groups & Priority</TabsTrigger>
              <TabsTrigger value="services">Emergency Services</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="mt-4">
              <ContactList
                contacts={filteredContacts}
                onDelete={handleDeleteContact}
                onVerify={handleVerify}
                onToggleEmergency={handleToggleEmergency}
                onPriorityChange={handlePriorityChange}
                onPreferenceChange={updateContactPreferences}
              />
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <GroupsAndPriority
                contacts={contacts}
                onPriorityChange={handlePriorityChange}
                onToggleEmergency={handleToggleEmergency}
              />
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <EmergencyServices
                services={services}
                onToggle={handleServiceToggle}
                onTest={handleTestService}
              />
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <CommunicationPreferences
                permissionContacts={permissionContacts}
                permissionLocation={permissionLocation}
                permissionAlerts={permissionAlerts}
                onTogglePermission={handlePermissionToggle}
                previewMessage={previewMessage}
                onPreviewChange={setPreviewMessage}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <CommunicationHistory contacts={contacts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ServiceTestDialog
        openId={testOpen}
        services={services}
        onOpenChange={(id) => setTestOpen(id)}
        onRun={runServiceTest}
        previewMessage={previewMessage}
      />
    </section>
  )
}

function ContactList({
  contacts,
  onDelete,
  onVerify,
  onToggleEmergency,
  onPriorityChange,
  onPreferenceChange,
}: {
  contacts: Contact[]
  onDelete: (id: string) => void
  onVerify: (id: string, success: boolean) => void
  onToggleEmergency: (id: string) => void
  onPriorityChange: (id: string, priority: number) => void
  onPreferenceChange: (
    id: string,
    prefs: Partial<Pick<Contact, "shareLocation" | "receiveAlerts">>,
  ) => void
}) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Trusted contacts</CardTitle>
        <CardDescription>
          Verification status, availability, and alert permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[420px] pr-2">
          <ul className="flex flex-col gap-3">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="w-full rounded-lg border bg-white/80 dark:bg-card px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-1">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                      <IdCard className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
                    </div>
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card",
                        c.availability === "available" && "bg-green-500",
                        c.availability === "busy" && "bg-yellow-500",
                        c.availability === "offline" && "bg-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-medium truncate">{c.name}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          c.verified === "verified" && "bg-green-100 text-green-800",
                          c.verified === "failed" && "bg-destructive/10 text-destructive",
                        )}
                        aria-label={`Verification: ${c.verified}`}
                      >
                        {c.verified === "verified" ? "Verified" : c.verified === "failed" ? "Failed" : "Pending"}
                      </Badge>
                      {c.isEmergency && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Priority {c.priority}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {c.languages.map((lng) => (
                          <Badge key={lng} variant="outline" className="text-xs">
                            {LANGUAGE_LABELS[lng]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 break-words">
                      {c.phone}
                      {c.altPhone ? <span className="ml-2">• {c.altPhone}</span> : null}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                        <div className="mr-3">
                          <Label className="text-sm">Emergency</Label>
                          <p className="text-xs text-muted-foreground">Include in SOS</p>
                        </div>
                        <Switch
                          checked={c.isEmergency}
                          onCheckedChange={() => onToggleEmergency(c.id)}
                          aria-label={`Toggle emergency for ${c.name}`}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select
                          value={String(c.priority)}
                          onValueChange={(v) => onPriorityChange(c.id, Number(v))}
                        >
                          <SelectTrigger aria-label={`Priority for ${c.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm">Share location</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Allow live location during emergency.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Switch
                            checked={c.shareLocation}
                            onCheckedChange={(v) =>
                              onPreferenceChange(c.id, { shareLocation: v })
                            }
                            aria-label="Share location with this contact"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                          <span className="text-sm">Receive alerts</span>
                          <Switch
                            checked={c.receiveAlerts}
                            onCheckedChange={(v) =>
                              onPreferenceChange(c.id, { receiveAlerts: v })
                            }
                            aria-label="Send alerts to this contact"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onVerify(c.id, true)}
                        className="bg-secondary"
                      >
                        <PhoneCall className="h-4 w-4 mr-2" aria-hidden="true" />
                        Verify
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onVerify(c.id, false)}
                        className="bg-secondary"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        Verification failed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(c.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {contacts.length === 0 && (
              <li className="text-sm text-muted-foreground py-8 text-center">
                No contacts found. Try adjusting filters or add a contact.
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function GroupsAndPriority({
  contacts,
  onPriorityChange,
  onToggleEmergency,
}: {
  contacts: Contact[]
  onPriorityChange: (id: string, priority: number) => void
  onToggleEmergency: (id: string) => void
}) {
  const emergency = contacts.filter((c) => c.isEmergency).sort((a, b) => a.priority - b.priority)
  const others = contacts.filter((c) => !c.isEmergency).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="grid gap-4">
      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GroupIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <CardTitle className="text-base">Emergency group</CardTitle>
              <CardDescription>Order determines who is contacted first.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {emergency.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border bg-white/80 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{RELATIONSHIP_LABELS[c.relationship]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(c.priority)}
                    onValueChange={(v) => onPriorityChange(c.id, Number(v))}
                  >
                    <SelectTrigger className="w-[120px]" aria-label={`Priority for ${c.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => onToggleEmergency(c.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {emergency.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No emergency contacts selected.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Other contacts</CardTitle>
          <CardDescription>Add to emergency group when ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {others.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border bg-white/80 px-3 py-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                <Button size="sm" onClick={() => onToggleEmergency(c.id)}>
                  Add to emergency
                </Button>
              </div>
            ))}
            {others.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">All contacts are in emergency group.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmergencyServices({
  services,
  onToggle,
  onTest,
}: {
  services: ServiceIntegration[]
  onToggle: (id: string) => void
  onTest: (id: string) => void
}) {
  function iconFor(type: ServiceIntegration["type"]) {
    if (type === "emergency-number") return <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
    if (type === "police-app") return <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
    return <Hospital className="h-5 w-5 text-primary" aria-hidden="true" />
  }

  return (
    <div className="grid gap-4">
      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Integration setup</CardTitle>
          <CardDescription>Enable services and run test to ensure connectivity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border bg-white/80 px-3 py-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {iconFor(s.type)}
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {s.instructions}
                  </p>
                  {s.lastTest && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last test: {new Date(s.lastTest).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <span className="text-sm mr-3">Enabled</span>
                  <Switch
                    checked={s.enabled}
                    onCheckedChange={() => onToggle(s.id)}
                    aria-label={`Enable ${s.name}`}
                  />
                </div>
                <Button variant="secondary" disabled={!s.enabled} onClick={() => onTest(s.id)}>
                  <PhoneOutgoing className="h-4 w-4 mr-2" aria-hidden="true" />
                  Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <CardTitle className="text-base">Response flow</CardTitle>
              <CardDescription>Preview how alerts will be sent in emergencies.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm">
              Aegis will first contact 112 India, then notify your emergency group by call and message,
              followed by enabled services like Local Police App and Nearest Hospital. Location sharing
              is controlled by your preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CommunicationPreferences({
  permissionContacts,
  permissionLocation,
  permissionAlerts,
  onTogglePermission,
  previewMessage,
  onPreviewChange,
}: {
  permissionContacts: boolean
  permissionLocation: boolean
  permissionAlerts: boolean
  onTogglePermission: (t: "location" | "alerts" | "contacts") => void
  previewMessage: string
  onPreviewChange: (m: string) => void
}) {
  return (
    <div className="grid gap-4">
      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Permissions</CardTitle>
          <CardDescription>Control access required for emergency features.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col rounded-md border bg-white/80">
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <ContactRound className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">Contacts access</span>
              </div>
              <Switch
                checked={permissionContacts}
                onCheckedChange={() => onTogglePermission("contacts")}
                aria-label="Toggle contacts permission"
              />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground px-3 py-2">
              Required for import and quick communication.
            </p>
          </div>

          <div className="flex flex-col rounded-md border bg-white/80">
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">Emergency alerts</span>
              </div>
              <Switch
                checked={permissionAlerts}
                onCheckedChange={() => onTogglePermission("alerts")}
                aria-label="Toggle alerts permission"
              />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground px-3 py-2">
              Allow Aegis to send calls and messages during SOS.
            </p>
          </div>

          <div className="flex flex-col rounded-md border bg-white/80">
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">Location sharing</span>
              </div>
              <Switch
                checked={permissionLocation}
                onCheckedChange={() => onTogglePermission("location")}
                aria-label="Toggle location permission"
              />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground px-3 py-2">
              Share live location with verified emergency contacts.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageCirclePlus className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <CardTitle className="text-base">Emergency notification</CardTitle>
              <CardDescription>Customize and preview the alert message.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="preview">Message content</Label>
            <Textarea
              id="preview"
              value={previewMessage}
              onChange={(e) => onPreviewChange(e.target.value)}
              className="min-h-[120px]"
              aria-label="Emergency message content"
            />
            <p className="text-xs text-muted-foreground">
              Keep it concise and clear. Avoid sensitive personal data.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div className="rounded-md border bg-white/90 px-3 py-2">
              <p className="text-sm">{previewMessage}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  Call + SMS
                </span>
                <span className="inline-flex items-center gap-1">
                  <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
                  Live location
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CommunicationHistory({ contacts }: { contacts: Contact[] }) {
  // Simulated history combining contacts and services
  const entries = React.useMemo(() => {
    const now = new Date()
    const list = [
      {
        id: "h1",
        type: "verification" as const,
        target: "Priya Verma",
        detail: "Verification SMS sent",
        time: new Date(now.getTime() - 1000 * 60 * 45).toLocaleString(),
      },
      {
        id: "h2",
        type: "test" as const,
        target: "112 India (ERSS)",
        detail: "Test call initiated",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 3).toLocaleString(),
      },
      {
        id: "h3",
        type: "alert" as const,
        target: "Emergency Group",
        detail: "Alert preview sent",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 5).toLocaleString(),
      },
    ]
    // Add one line per emergency contact to show personalization
    contacts
      .filter((c) => c.isEmergency)
      .slice(0, 2)
      .forEach((c, i) =>
        list.push({
          id: `hc${i}`,
          type: "alert" as const,
          target: c.name,
          detail: "Message delivered",
          time: new Date(now.getTime() - 1000 * 60 * (120 + i * 5)).toLocaleString(),
        }),
      )
    return list
  }, [contacts])

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Communication history</CardTitle>
        <CardDescription>Recent verification, test, and alert events.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y rounded-md border bg-white/80">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3 px-3 py-3">
              <div className="mt-0.5">
                {e.type === "alert" && <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />}
                {e.type === "verification" && <PhoneCall className="h-4 w-4 text-primary" aria-hidden="true" />}
                {e.type === "test" && <PhoneOutgoing className="h-4 w-4 text-primary" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{e.target}</span>
                  <span className="text-muted-foreground"> • {e.detail}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{e.time}</p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground px-3 py-4">No history yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ServiceTestDialog({
  openId,
  services,
  onOpenChange,
  onRun,
  previewMessage,
}: {
  openId: string | null
  services: ServiceIntegration[]
  onOpenChange: (id: string | null) => void
  onRun: (id: string, mode: "call" | "message") => void
  previewMessage: string
}) {
  const service = services.find((s) => s.id === openId) || null
  return (
    <Dialog open={!!openId} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Integration test</DialogTitle>
          <DialogDescription>
            Validate connectivity and message content. No real emergency will be triggered.
          </DialogDescription>
        </DialogHeader>
        {service && (
          <div className="grid gap-4">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-sm">
                Service: <span className="font-medium">{service.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Mode: call or message. Ensure network connectivity.
              </p>
            </div>
            <div className="rounded-md border bg-white/90 p-3">
              <p className="text-sm font-medium mb-2">Message preview</p>
              <p className="text-sm">{previewMessage}</p>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(null)}>
            Cancel
          </Button>
          {service && (
            <>
              <Button onClick={() => onRun(service.id, "call")} className="bg-primary text-primary-foreground">
                <PhoneCall className="h-4 w-4 mr-2" aria-hidden="true" />
                Test call
              </Button>
              <Button variant="outline" onClick={() => onRun(service.id, "message")}>
                <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Test message
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}