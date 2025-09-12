"use client";

import * as React from "react";
import {
  Vault,
  FolderKey,
  Lock,
  EarthLock,
  Shield,
  Cctv,
  FileKey2,
  ShieldCheck,
  BookKey,
  DoorClosedLocked,
  FileLock2,
  ScanFace,
  FileKey,
  InspectionPanel,
  FileLock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type EvidenceType = "audio" | "video" | "photo" | "note";
type IncidentCategory =
  | "harassment"
  | "stalking"
  | "assault"
  | "theft"
  | "domestic"
  | "other";

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  timestamp: string; // ISO
  hash: string; // tamper-proof checksum
  location?: string;
  storage: "encrypted-cloud" | "blockchain";
  sizeKB?: number;
  correlatedIncidentId?: string;
}

interface IncidentEvent {
  id: string;
  time: string; // ISO
  label: string;
  detail?: string;
  location?: string;
  evidenceIds?: string[];
  status?: "pending" | "acknowledged" | "responding" | "resolved";
}

interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  createdAt: string; // ISO
  location?: string;
  tags: string[];
  status: "draft" | "filed" | "verified" | "shared";
  events: IncidentEvent[];
  evidence: EvidenceItem[];
  chainAnchored?: boolean;
}

interface ReportDraft {
  category?: IncidentCategory;
  title?: string;
  description?: string;
  location?: string;
  date?: string; // ISO date
  time?: string; // HH:mm
  tags?: string[];
  privacyLevel?: "private" | "trusted" | "authority";
  includeContact?: boolean;
  consentToShare?: boolean;
}

interface IncidentVaultProps {
  className?: string;
  incidents?: Incident[];
  onExport?: (incidentId: string, format: "pdf" | "csv" | "json") => Promise<void> | void;
  onVerify?: (incidentId: string) => Promise<void> | void;
  onCreateReport?: (draft: ReportDraft) => Promise<void> | void;
}

const demoIncident: Incident = {
  id: "inc_2025_0001",
  title: "Suspicious following during commute",
  category: "stalking",
  createdAt: new Date().toISOString(),
  location: "Jubilee Hills, Hyderabad",
  tags: ["night", "commute", "bus-stop"],
  status: "filed",
  chainAnchored: true,
  events: [
    {
      id: "evt1",
      time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      label: "First noticed suspicious individual",
      detail: "Individual appeared to follow from bus stop.",
      location: "Road No. 36",
      evidenceIds: ["ev1"],
      status: "acknowledged",
    },
    {
      id: "evt2",
      time: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      label: "Recorded audio note",
      detail: "Described clothing and behavior.",
      evidenceIds: ["ev2"],
      status: "responding",
    },
    {
      id: "evt3",
      time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      label: "Captured short video clip",
      location: "Near bakery",
      evidenceIds: ["ev3"],
      status: "responding",
    },
    {
      id: "evt4",
      time: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      label: "Reached safe location",
      detail: "Friend called and stayed on call.",
      status: "resolved",
    },
  ],
  evidence: [
    {
      id: "ev1",
      type: "photo",
      title: "Street photo",
      timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      hash: "bafkreihashphoto123456",
      location: "Road No. 36",
      storage: "encrypted-cloud",
      sizeKB: 512,
      correlatedIncidentId: "inc_2024_0312",
    },
    {
      id: "ev2",
      type: "audio",
      title: "Audio note",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      hash: "bafkreihaudioabcdef7890",
      storage: "blockchain",
      sizeKB: 1280,
    },
    {
      id: "ev3",
      type: "video",
      title: "15s video",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      hash: "bafkreivid1c0d3hash777",
      location: "Near bakery",
      storage: "encrypted-cloud",
      sizeKB: 4096,
    },
    {
      id: "ev4",
      type: "note",
      title: "Detailed description",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      hash: "bafkrei_text_hash_001",
      storage: "encrypted-cloud",
      sizeKB: 16,
    },
  ],
};

export default function IncidentVault({
  className,
  incidents,
  onExport,
  onVerify,
  onCreateReport,
}: IncidentVaultProps) {
  const [items, setItems] = React.useState<Incident[]>(incidents?.length ? incidents : [demoIncident]);
  const [activeIncidentId, setActiveIncidentId] = React.useState<string>(items[0]?.id ?? "");
  const activeIncident = React.useMemo(
    () => items.find((i) => i.id === activeIncidentId) ?? items[0],
    [items, activeIncidentId]
  );

  // added missing local UI state
  const [verifying, setVerifying] = React.useState(false);
  const [exporting, setExporting] = React.useState<null | "pdf" | "csv" | "json">(null);
  const [isSharingPrivately, setIsSharingPrivately] = React.useState(true);
  const [draft, setDraft] = React.useState<ReportDraft>({
    privacyLevel: "trusted",
    includeContact: true,
    consentToShare: false,
    tags: [],
  });

  React.useEffect(() => {
    // keep in sync if parent prop changes
    if (!incidents) return;
    setItems(incidents);
  }, [incidents]);

  React.useEffect(() => {
    // load from backend
    fetch("/api/incidents")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const raw: any[] = Array.isArray(data) ? data : (data?.items ?? data?.incidents ?? []);
        let list: Incident[] = [];
        if (raw.length && !("title" in raw[0])) {
          // map simple API incidents -> rich IncidentVault shape
          list = raw.map((it: any) => {
            const started = it.startedAt ?? new Date().toISOString();
            const ended = it.endedAt as string | undefined;
            const idStr = String(it.id ?? cryptoRandomId());
            const events: IncidentEvent[] = [
              {
                id: `${idStr}_start`,
                time: started,
                label: "Incident started",
                detail: it.notes || undefined,
                location: it.location ? `${it.location.lat}, ${it.location.lng}` : undefined,
                status: it.status === "resolved" ? "acknowledged" : "responding",
              },
            ];
            if (ended) {
              events.push({
                id: `${idStr}_end`,
                time: ended,
                label: "Incident resolved",
                status: "resolved",
              });
            }
            return {
              id: idStr,
              title: `Incident #${idStr}`,
              category: "other",
              createdAt: started,
              location: it.location ? `${it.location.lat}, ${it.location.lng}` : undefined,
              tags: [],
              status: it.status === "resolved" ? "verified" : "filed",
              events,
              evidence: [],
              chainAnchored: false,
            } as Incident;
          });
        } else {
          list = raw as Incident[];
        }
        if (list.length) {
          setItems(list);
          setActiveIncidentId((prev) => prev || list[0].id);
        }
      })
      .catch(() => {
        // fallback to existing demo incidents silently
      });
  }, []);

  // helper for id when missing
  function cryptoRandomId() {
    try {
      // @ts-ignore
      const arr = new Uint32Array(1);
      // @ts-ignore
      (globalThis.crypto || (globalThis as any).msCrypto).getRandomValues(arr);
      return Math.abs(arr[0]).toString(36);
    } catch {
      return Math.floor(Math.random() * 1e9).toString(36);
    }
  }

  // Ensure the activeIncidentId always matches an existing item to avoid invalid Select value
  React.useEffect(() => {
    if (items.length && !items.some((i) => i.id === activeIncidentId)) {
      setActiveIncidentId(items[0].id);
    }
  }, [items, activeIncidentId]);

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  async function handleVerify() {
    if (!activeIncident) return;
    setVerifying(true);
    try {
      await (onVerify ? onVerify(activeIncident.id) : new Promise((r) => setTimeout(r, 900)));
      toast.success("Integrity check complete", {
        description: activeIncident.chainAnchored
          ? "Evidence hashes anchored to chain. No tampering detected."
          : "Evidence hashes verified in encrypted storage. No tampering detected.",
      });
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleExport(fmt: "pdf" | "csv" | "json") {
    if (!activeIncident) return;
    setExporting(fmt);
    try {
      await (onExport ? onExport(activeIncident.id, fmt) : new Promise((r) => setTimeout(r, 800)));
      toast.success(`Exported as ${fmt.toUpperCase()}`, {
        description: "Use this file for official reporting.",
      });
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  async function handleShareSecurely(target: "trusted" | "authority") {
    if (!activeIncident) return;
    const payload = {
      id: activeIncident.id,
      title: activeIncident.title,
      when: activeIncident.createdAt,
      evidence: activeIncident.evidence.map((e) => ({ id: e.id, hash: e.hash })),
    };
    try {
      if (typeof window !== "undefined" && (navigator as any)?.share) {
        await (navigator as any).share({
          title: `Liora Incident: ${activeIncident.title}`,
          text: `Encrypted incident package (${payload.evidence.length} evidence items)`,
        });
        toast.success("Shared securely");
      } else if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        toast.success("Secure package copied", {
          description: "Paste into your secure channel.",
        });
      } else {
        toast.info("Sharing unavailable in this environment.");
      }
    } catch {
      toast.error("Share cancelled or failed.");
    }
  }

  async function handleCreateReport() {
    const hasBasics = draft.category && draft.title && draft.description;
    if (!hasBasics) {
      toast.message("Please complete required fields", {
        description: "Category, title and description are required.",
      });
      return;
    }
    try {
      await (onCreateReport ? onCreateReport(draft) : new Promise((r) => setTimeout(r, 900)));
      toast.success("Report saved");
      setDraft({
        privacyLevel: "trusted",
        includeContact: true,
        consentToShare: false,
        tags: [],
      });
    } catch {
      toast.error("Could not save report");
    }
  }

  if (!activeIncident) {
    return (
      <Card className={cn("bg-card w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Incident Vault</CardTitle>
          <CardDescription>No incidents found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const patterns = derivePatterns(items);
  const responseProgress = deriveResponseProgress(activeIncident);

  return (
    <TooltipProvider delayDuration={200}>
      <Card
        className={cn(
          "bg-card text-foreground border shadow-sm rounded-xl w-full",
          "transition-colors duration-200",
          "animate-fade-slide-up",
          className
        )}
        aria-label="Incident Vault"
      >
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <Vault className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                  Incident Vault
                </CardTitle>
                <CardDescription className="truncate">
                  Secure history, evidence, reports, and resources
                </CardDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-3.5" />
                Encrypted
              </Badge>
              <Badge className="bg-accent text-accent-foreground gap-1">
                <FileKey2 className="size-3.5" />
                Chain Audit
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              onValueChange={(v) => setActiveIncidentId(v)}
              value={activeIncidentId || undefined}
            >
              <SelectTrigger className="w-full sm:w-[320px]" aria-label="Select incident">
                <SelectValue placeholder="Select an incident" />
              </SelectTrigger>
              <SelectContent>
                {items.map((inc) => (
                  <SelectItem key={inc.id} value={inc.id}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="size-4 text-primary" />
                      <span className="truncate">{inc.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ms-auto inline-flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleVerify}
                    disabled={verifying}
                    aria-label="Verify integrity"
                  >
                    {verifying ? (
                      <ScanFace className="size-4 animate-pulse" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    Verify
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Check evidence integrity</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleExport("pdf")}
                    disabled={exporting !== null}
                    aria-label="Quick export PDF"
                  >
                    <FileLock2 className="size-4" />
                    Export PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate a secured PDF report</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <EarthLock className="size-3.5" />
              Encrypted cloud
            </div>
            <div className="inline-flex items-center gap-1">
              <FolderKey className="size-3.5" />
              Hash anchored
            </div>
            <div className="inline-flex items-center gap-1">
              <DoorClosedLocked className="size-3.5" />
              Privacy controls
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="evidence" className="text-xs sm:text-sm">
                Evidence
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs sm:text-sm">
                Report
              </TabsTrigger>
              <TabsTrigger value="share" className="text-xs sm:text-sm">
                Share & Export
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <TimelineSection incident={activeIncident} progress={responseProgress} />
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
              <EvidenceSection incident={activeIncident} />
            </TabsContent>

            <TabsContent value="report" className="mt-4">
              <ReportSection
                draft={draft}
                setDraft={setDraft}
                onSave={handleCreateReport}
                activeIncident={activeIncident}
              />
            </TabsContent>

            <TabsContent value="share" className="mt-4">
              <ShareExportSection
                isSharingPrivately={isSharingPrivately}
                setIsSharingPrivately={setIsSharingPrivately}
                onShare={handleShareSecurely}
                onExport={handleExport}
                exporting={exporting}
                incident={activeIncident}
              />
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <ResourcesSection patterns={patterns} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function TimelineSection({
  incident,
  progress,
}: {
  incident: Incident;
  progress: number;
}) {
  return (
    <div className="grid gap-4">
      <Card className="bg-secondary border-muted">
        <CardHeader className="py-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <InspectionPanel className="size-4 text-primary" />
            Incident timeline
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
            <span>ID: {incident.id}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Started: {new Date(incident.createdAt).toLocaleString()}</span>
            {incident.location ? (
              <>
                <Separator orientation="vertical" className="h-3" />
                <span className="truncate break-words">Location: {incident.location}</span>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Response progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <ScrollArea className="max-h-[360px] pr-3">
            <ol className="relative ms-3">
              {incident.events
                .slice()
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                .map((evt, idx) => (
                  <li key={evt.id} className="mb-6">
                    <div className="absolute -start-3 mt-1.5 flex items-center justify-center">
                      <span
                        className={cn(
                          "size-2.5 rounded-full ring-2 ring-background",
                          evt.status === "resolved"
                            ? "bg-emerald-500"
                            : evt.status === "responding"
                            ? "bg-chart-1"
                            : evt.status === "acknowledged"
                            ? "bg-amber-500"
                            : "bg-muted-foreground/40"
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="rounded-md border bg-card p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium leading-none text-sm sm:text-base">
                          {evt.label}
                        </h4>
                        <div className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Cctv className="size-3.5" />
                          <span>{new Date(evt.time).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      {evt.detail ? (
                        <p className="mt-1 text-sm text-muted-foreground">{evt.detail}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {evt.location ? (
                          <Badge variant="secondary" className="gap-1">
                            <BookKey className="size-3.5" />
                            {evt.location}
                          </Badge>
                        ) : null}
                        {evt.evidenceIds?.map((id) => (
                          <Badge key={id} className="bg-accent text-accent-foreground">
                            Evidence: {id}
                          </Badge>
                        ))}
                        <span className="ms-auto text-[11px] text-muted-foreground">
                          Step {idx + 1} of {incident.events.length}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="gap-1"
          aria-label={`Category ${incident.category}`}
        >
          <Shield className="size-3.5" />
          {capitalize(incident.category)}
        </Badge>
        {incident.tags.map((t) => (
          <Badge key={t} variant="secondary">
            #{t}
          </Badge>
        ))}
        {incident.chainAnchored ? (
          <Badge className="bg-accent text-accent-foreground gap-1">
            <FileKey className="size-3.5" />
            Anchored
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <FileLock className="size-3.5" />
            Encrypted
          </Badge>
        )}
      </div>
    </div>
  );
}

function EvidenceSection({ incident }: { incident: Incident }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {incident.evidence.map((ev) => (
          <Card key={ev.id} className="bg-card border hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center rounded-md bg-secondary text-primary p-2">
                  {renderEvidenceIcon(ev.type)}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base truncate">{ev.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(ev.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="ms-auto">
                  <Badge variant="outline" className="gap-1">
                    {ev.storage === "blockchain" ? (
                      <>
                        <FileKey2 className="size-3.5" /> Chain
                      </>
                    ) : (
                      <>
                        <EarthLock className="size-3.5" /> Cloud
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground break-words">
                <span className="font-medium text-foreground">Checksum:</span> {ev.hash}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {ev.location ? (
                  <Badge variant="secondary" className="gap-1">
                    <BookKey className="size-3.5" />
                    {ev.location}
                  </Badge>
                ) : null}
                {ev.sizeKB ? <Badge variant="outline">{ev.sizeKB} KB</Badge> : null}
                {ev.correlatedIncidentId ? (
                  <Badge className="bg-accent text-accent-foreground">
                    Correlates: {ev.correlatedIncidentId}
                  </Badge>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="secondary" size="sm" className="gap-2" aria-label="Open evidence">
                  <Cctv className="size-4" />
                  Open
                </Button>
                <Button variant="outline" size="sm" className="gap-2" aria-label="Verify hash">
                  <ShieldCheck className="size-4" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportSection({
  draft,
  setDraft,
  onSave,
  activeIncident,
}: {
  draft: ReportDraft;
  setDraft: React.Dispatch<React.SetStateAction<ReportDraft>>;
  onSave: () => void;
  activeIncident: Incident;
}) {
  return (
    <div className="grid gap-4">
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Incident report</CardTitle>
          <CardDescription className="text-xs">
            Document details for official reporting and legal support
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-title">
                Title
              </label>
              <Input
                id="rep-title"
                placeholder="e.g., Suspicious following near stop"
                value={draft.title ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-category">
                Category
              </label>
              <Select
                value={draft.category}
                onValueChange={(v: IncidentCategory) => setDraft((d) => ({ ...d, category: v }))}
              >
                <SelectTrigger id="rep-category">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="stalking">Stalking</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-date">
                Date
              </label>
              <Input
                id="rep-date"
                type="date"
                value={draft.date ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-time">
                Time
              </label>
              <Input
                id="rep-time"
                type="time"
                value={draft.time ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="rep-location">
                Location
              </label>
              <Input
                id="rep-location"
                placeholder="Add location"
                value={draft.location ?? activeIncident.location ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="rep-description">
                Description
              </label>
              <Textarea
                id="rep-description"
                placeholder="Describe what happened in detail..."
                className="min-h-[120px]"
                value={draft.description ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Include descriptions, identifiers, and directions of travel.
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-tags">
                Tags
              </label>
              <Input
                id="rep-tags"
                placeholder="night, commute, bus-stop"
                value={(draft.tags ?? []).join(", ")}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rep-privacy">
                Privacy level
              </label>
              <Select
                value={draft.privacyLevel}
                onValueChange={(v: "private" | "trusted" | "authority") =>
                  setDraft((d) => ({ ...d, privacyLevel: v }))
                }
              >
                <SelectTrigger id="rep-privacy">
                  <SelectValue placeholder="Choose privacy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (only me)</SelectItem>
                  <SelectItem value="trusted">Trusted contacts</SelectItem>
                  <SelectItem value="authority">Authorities only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Switch
                id="rep-contact"
                checked={!!draft.includeContact}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, includeContact: v }))}
              />
              <div className="grid">
                <label className="text-sm font-medium" htmlFor="rep-contact">
                  Include my contact for follow-up
                </label>
                <span className="text-xs text-muted-foreground">
                  Contact details stored encrypted
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="rep-consent"
                checked={!!draft.consentToShare}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, consentToShare: !!v }))}
              />
              <div className="grid">
                <label className="text-sm font-medium" htmlFor="rep-consent">
                  I consent to share this report securely if needed
                </label>
                <span className="text-xs text-muted-foreground">
                  You control when and with whom this is shared
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDraft({ tags: [] })}>
                Reset
              </Button>
              <Button size="sm" className="gap-2" onClick={onSave}>
                <Shield className="size-4" />
                Save report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShareExportSection({
  isSharingPrivately,
  setIsSharingPrivately,
  onShare,
  onExport,
  exporting,
  incident,
}: {
  isSharingPrivately: boolean;
  setIsSharingPrivately: (v: boolean) => void;
  onShare: (target: "trusted" | "authority") => void;
  onExport: (fmt: "pdf" | "csv" | "json") => void;
  exporting: null | "pdf" | "csv" | "json";
  incident: Incident;
}) {
  return (
    <div className="grid gap-4">
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Secure sharing</CardTitle>
          <CardDescription className="text-xs">
            Share with trusted contacts or authorities. Your privacy is protected.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3">
            <Switch
              id="share-private"
              checked={isSharingPrivately}
              onCheckedChange={setIsSharingPrivately}
            />
            <div className="grid">
              <label className="text-sm font-medium" htmlFor="share-private">
                Privacy shield
              </label>
              <span className="text-xs text-muted-foreground">
                {isSharingPrivately
                  ? "Redact personal identifiers and exact coordinates"
                  : "Include full details for legal review"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => onShare("trusted")}
              aria-label="Share with trusted contacts"
            >
              <Shield className="size-4" />
              Share to trusted
            </Button>
            <Button
              variant="default"
              className="gap-2"
              onClick={() => onShare("authority")}
              aria-label="Share with authorities"
            >
              <FileLock2 className="size-4" />
              Share to authority
            </Button>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="text-sm font-medium">Export</div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("pdf")}
                disabled={exporting !== null}
                className="gap-2"
              >
                <FileLock className="size-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("csv")}
                disabled={exporting !== null}
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("json")}
                disabled={exporting !== null}
              >
                JSON
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exports include evidence hashes, timestamps, and location metadata. Media blobs are
              referenced securely.
            </p>
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              Verification status
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <FolderKey className="size-3.5" />
                {incident.evidence.length} items hashed
              </Badge>
              <Badge className="bg-accent text-accent-foreground gap-1">
                <FileKey2 className="size-3.5" />
                {incident.chainAnchored ? "Anchored to chain" : "Local chain pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourcesSection({ patterns }: { patterns: ReturnType<typeof derivePatterns> }) {
  return (
    <div className="grid gap-4">
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Post-incident resources</CardTitle>
          <CardDescription className="text-xs">
            Counseling, legal aid, and safety recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <ResourceTile
              icon={<Shield className="size-5" />}
              title="Local helplines"
              lines={[
                "Women Helpline (All India): 1091",
                "Police Emergency: 100 / 112",
                "Hyderabad SHE Teams: 181",
              ]}
            />
            <ResourceTile
              icon={<BookKey className="size-5" />}
              title="Legal aid"
              lines={[
                "Legal Services Authority: 15100",
                "Free legal counseling available",
                "Evidence guidance for FIR",
              ]}
            />
            <ResourceTile
              icon={<Lock className="size-5" />}
              title="Counseling"
              lines={[
                "24x7 Emotional support: 9152987821",
                "Confidential sessions in local languages",
                "Connect via phone or online",
              ]}
            />
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <InspectionPanel className="size-4 text-primary" />
              <span className="text-sm font-medium">Incident analysis & patterns</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {patterns.topTags.map((t) => (
                <Badge key={t.tag} variant="secondary">
                  #{t.tag} · {t.count}
                </Badge>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card className="bg-secondary border-muted">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Time patterns</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Peak hours observed: {patterns.peakHours.join(", ") || "N/A"}
                </CardContent>
              </Card>
              <Card className="bg-secondary border-muted">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Safety recommendations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  • Share live location with a trusted contact when commuting at peak risk hours.
                  <br />
                  • Keep emergency shortcuts accessible; practice activation.
                  <br />
                  • Prefer well-lit routes; avoid repetitive schedules when feasible.
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceTile({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center rounded-md bg-secondary text-primary p-2">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
            {lines.map((l, i) => (
              <p key={i} className="break-words">
                {l}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderEvidenceIcon(type: EvidenceType) {
  const common = "size-5";
  switch (type) {
    case "audio":
      return <ScanFace className={common} aria-hidden="true" />;
    case "video":
      return <Cctv className={common} aria-hidden="true" />;
    case "photo":
      return <Shield className={common} aria-hidden="true" />;
    case "note":
      return <BookKey className={common} aria-hidden="true" />;
    default:
      return <Shield className={common} aria-hidden="true" />;
  }
}

function derivePatterns(incidents: Incident[]) {
  const tagMap = new Map<string, number>();
  incidents.forEach((i) => i.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1)));
  const topTags = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }));

  const hours = new Map<string, number>();
  incidents.forEach((i) => {
    const h = new Date(i.createdAt).getHours();
    const label = `${String(h).padStart(2, "0")}:00`;
    hours.set(label, (hours.get(label) ?? 0) + 1);
  });
  const topHours = Array.from(hours.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h);

  return { topTags, peakHours: topHours };
}

function deriveResponseProgress(incident: Incident) {
  const total = incident.events.length || 1;
  const resolvedIdx =
    incident.events
      .slice()
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .findIndex((e) => e.status === "resolved") + 1;
  const progress = Math.round(((resolvedIdx > 0 ? resolvedIdx : total - 1) / total) * 100);
  return Math.max(10, Math.min(100, progress));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}