"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiveLocation } from "@/hooks/use-live-location";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, MapPin, Clock, Users, Phone, AlertTriangle, CheckCircle, XCircle, Battery, Signal } from "lucide-react";
import { toast } from "sonner";

export const Dashboard = () => {
  const { data: session, isPending } = useSession();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online");

  const {
    isStreaming,
    lastCoords,
    buildSmsFallback
  } = useLiveLocation({
    enabled: monitoringEnabled || emergencyMode,
    intervalMs: emergencyMode ? 30000 : 300000, // 30s in emergency, 5min normal
    apiUrl: "/api/locations/stream",
    bearerToken: session?.user?.id ? localStorage.getItem("bearer_token") : null,
    onUpdate: (coords) => {
      if (emergencyMode) {
        console.log("Emergency location update:", coords);
      }
    },
    onError: (error) => {
      console.error("Location error:", error);
      if (emergencyMode) {
        toast.error("Unable to get location. Consider SMS backup.");
      }
    }
  });

  // Emergency activation sequence
  const handleEmergencyActivation = useCallback(async () => {
    if (emergencyMode) return;

    setEmergencyMode(true);
    setMonitoringEnabled(true);

    // Vibration pattern for emergency
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Send emergency alert to backend
    try {
      const response = await fetch("/api/emergency/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          location: lastCoords ? {
            lat: lastCoords.latitude,
            lng: lastCoords.longitude,
            accuracy: lastCoords.accuracy
          } : null,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        toast.success("Emergency alert activated", {
          description: "Your contacts have been notified"
        });
      }
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      // Show SMS fallback options
      toast.error("Network issue detected", {
        description: "Consider using SMS backup",
        action: emergencyContacts.length > 0 ? {
          label: "Send SMS",
          onClick: () => {
            const smsUrl = buildSmsFallback(emergencyContacts[0]);
            window.open(smsUrl, '_blank');
          }
        } : undefined
      });
    }
  }, [emergencyMode, lastCoords, emergencyContacts, buildSmsFallback]);

  // Deactivate emergency mode
  const handleEmergencyDeactivation = useCallback(async () => {
    try {
      await fetch("/api/emergency/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      setEmergencyMode(false);
      toast.success("Emergency mode deactivated");
    } catch (error) {
      console.error("Failed to deactivate emergency:", error);
      setEmergencyMode(false);
    }
  }, []);

  // Load emergency contacts
  useEffect(() => {
    const loadContacts = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/contacts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        });

        if (response.ok) {
          const contacts = await response.json();
          setEmergencyContacts(contacts);
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
      }
    };

    loadContacts();
  }, [session]);

  // Monitor battery and network status
  useEffect(() => {
    // Battery status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        
        battery.addEventListener('levelchange', updateBattery);
        return () => battery.removeEventListener('levelchange', updateBattery);
      });
    }

    // Network status
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? "online" : "offline");
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-heading font-bold">Aegis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your safety companion
        </p>
      </div>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            Emergency mode active. Your location is being shared.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <Card className={emergencyMode ? "border-destructive" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status</CardTitle>
            <Badge variant={isStreaming ? "default" : "secondary"}>
              {isStreaming ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Location Tracking</p>
              <p className="text-xs text-muted-foreground">
                {lastCoords 
                  ? `Updated ${new Date().toLocaleTimeString()}`
                  : "No location data"
                }
              </p>
            </div>
            {lastCoords && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>

          <Separator />

          {/* System Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">{batteryLevel}%</p>
                <Progress value={batteryLevel} className="h-1 w-12" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Signal className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium capitalize">{networkStatus}</p>
                <div className={`h-1 w-12 rounded-full ${networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Actions</CardTitle>
          <CardDescription>
            Quick access to safety features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emergencyMode ? (
            <Button
              onClick={handleEmergencyActivation}
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <AlertTriangle className="mr-2 h-6 w-6" />
              Activate Emergency
            </Button>
          ) : (
            <Button
              onClick={handleEmergencyDeactivation}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-semibold border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <XCircle className="mr-2 h-6 w-6" />
              Deactivate Emergency
            </Button>
          )}

          {emergencyContacts.length > 0 && (
            <Button
              onClick={() => {
                const smsUrl = buildSmsFallback(emergencyContacts[0]);
                window.open(smsUrl, '_blank');
              }}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Phone className="mr-2 h-4 w-4" />
              Send SMS Alert
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monitoring</CardTitle>
          <CardDescription>
            Background location tracking settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="monitoring">Location Monitoring</Label>
              <p className="text-xs text-muted-foreground">
                Share location with trusted contacts
              </p>
            </div>
            <Switch
              id="monitoring"
              checked={monitoringEnabled}
              onCheckedChange={setMonitoringEnabled}
              disabled={emergencyMode}
            />
          </div>

          {monitoringEnabled && (
            <div className="p-3 bg-accent rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Active Monitoring</p>
                  <p className="text-xs text-muted-foreground">
                    Location updated every {emergencyMode ? '30 seconds' : '5 minutes'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Emergency Contacts</span>
            </div>
            <Badge variant="secondary">
              {emergencyContacts.length} configured
            </Badge>
          </div>
          
          {emergencyContacts.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Add emergency contacts to enable full protection features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};