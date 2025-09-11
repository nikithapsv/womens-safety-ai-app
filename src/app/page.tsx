"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import SafetyDashboard from "@/components/SafetyDashboard";
import EmergencyFlow from "@/components/EmergencyFlow";
import ContactManagement from "@/components/ContactManagement";
import SettingsPrivacy from "@/components/SettingsPrivacy";
import IncidentVault from "@/components/IncidentVault";
import OnboardingFlow from "@/components/OnboardingFlow";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  LayoutDashboard,
  Siren,
  ContactRound,
  Settings2,
  Vault as VaultIcon,
  ShieldCheck,
  Languages,
} from "lucide-react";

type SectionKey = "dashboard" | "emergency" | "contacts" | "settings" | "vault" | "setup";
type Locale = "en" | "hi" | "te";

export default function Page() {
  const [section, setSection] = React.useState<SectionKey>("dashboard");
  const [locale, setLocale] = React.useState<Locale>("en");
  const [emergencyActive, setEmergencyActive] = React.useState(false);
  const [onboarded, setOnboarded] = React.useState(true);

  const appTone = emergencyActive ? "bg-destructive/5" : "bg-background";

  const Header = (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        emergencyActive ? "bg-destructive text-destructive-foreground" : "bg-card text-card-foreground"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md", emergencyActive ? "bg-white/10" : "bg-primary/10")}>
            <ShieldCheck className={cn("h-5 w-5", emergencyActive ? "text-white" : "text-primary")} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold leading-tight truncate", emergencyActive ? "text-white" : "text-foreground")}>
              Aegis
            </p>
            <p className={cn("text-xs truncate", emergencyActive ? "text-white/80" : "text-muted-foreground")}>
              Women’s safety companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger className={cn("w-[120px] h-9", emergencyActive ? "bg-white/10 border-white/20 text-white" : "")} aria-label="Language">
              <Languages className={cn("mr-2 h-4 w-4", emergencyActive ? "text-white" : "text-muted-foreground")} aria-hidden="true" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="te">తెలుగు</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant={section === "emergency" ? "default" : "secondary"}
              className={cn("h-9", emergencyActive ? "bg-white/10 text-white hover:bg-white/20 border-white/20" : "")}
              onClick={() => setSection("emergency")}
            >
              <Siren className="mr-2 h-4 w-4" aria-hidden="true" />
              SOS
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  const BottomNav = (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="mx-auto max-w-6xl grid grid-cols-5">
        <NavButton
          active={section === "dashboard"}
          label="Home"
          icon={LayoutDashboard}
          onClick={() => setSection("dashboard")}
        />
        <NavButton
          active={section === "emergency"}
          label="SOS"
          icon={Siren}
          onClick={() => setSection("emergency")}
        />
        <NavButton
          active={section === "contacts"}
          label="Contacts"
          icon={ContactRound}
          onClick={() => setSection("contacts")}
        />
        <NavButton
          active={section === "vault"}
          label="Vault"
          icon={VaultIcon}
          onClick={() => setSection("vault")}
        />
        <NavButton
          active={section === "settings"}
          label="Settings"
          icon={Settings2}
          onClick={() => setSection("settings")}
        />
      </div>
    </nav>
  );

  const Sidebar = (
    <aside className="sticky top-[64px] hidden md:block w-56 shrink-0">
      <div className="rounded-lg border bg-card p-2">
        <SideItem
          active={section === "dashboard"}
          label="Dashboard"
          icon={LayoutDashboard}
          onClick={() => setSection("dashboard")}
        />
        <SideItem
          active={section === "emergency"}
          label="Emergency"
          icon={Siren}
          onClick={() => setSection("emergency")}
        />
        <SideItem
          active={section === "contacts"}
          label="Contacts"
          icon={ContactRound}
          onClick={() => setSection("contacts")}
        />
        <SideItem
          active={section === "vault"}
          label="Incident Vault"
          icon={VaultIcon}
          onClick={() => setSection("vault")}
        />
        <SideItem
          active={section === "settings"}
          label="Settings"
          icon={Settings2}
          onClick={() => setSection("settings")}
        />
        <Separator className="my-2" />
        <SideItem
          active={section === "setup"}
          label="Setup"
          icon={ShieldCheck}
          onClick={() => setSection("setup")}
        />
      </div>
    </aside>
  );

  const handleActivate = React.useCallback(() => {
    setEmergencyActive(true);
  }, []);
  const handleCancel = React.useCallback(() => {
    setEmergencyActive(false);
  }, []);

  const Main = (
    <main className={cn("mx-auto max-w-6xl w-full px-4 pb-20 md:pb-8", appTone)}>
      <div className="flex gap-6 pt-4 md:pt-6">
        {Sidebar}
        <div className="min-w-0 flex-1 space-y-6">
          {!onboarded && section !== "setup" ? (
            <OnboardingFlow
              defaultLanguage={locale}
              onComplete={() => {
                setOnboarded(true);
                setSection("dashboard");
              }}
            />
          ) : (
            <>
              {section === "dashboard" && (
                <div className="space-y-6">
                  <SafetyDashboard className="w-full" />
                </div>
              )}

              {section === "emergency" && (
                <EmergencyFlow
                  className="w-full"
                  locale={locale}
                  onActivate={handleActivate}
                  onCancel={handleCancel}
                />
              )}

              {section === "contacts" && (
                <ContactManagement className="w-full" />
              )}

              {section === "settings" && (
                <SettingsPrivacy className="w-full" />
              )}

              {section === "vault" && (
                <IncidentVault className="w-full" />
              )}

              {section === "setup" && (
                <OnboardingFlow
                  defaultLanguage={locale}
                  onComplete={() => {
                    setOnboarded(true);
                    setSection("dashboard");
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {Header}
      {Main}
      {BottomNav}
      <Toaster richColors closeButton />
    </div>
  );
}

function NavButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2.5 text-xs",
        active ? "text-primary" : "text-muted-foreground"
      )}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SideItem({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm",
        active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
      )}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}