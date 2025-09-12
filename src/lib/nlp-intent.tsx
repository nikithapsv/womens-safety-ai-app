"use client";

import { useState, useCallback } from "react";
import { detectDistress, getSamplePhrases, locales, type Locale } from "./distress-detector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, MessageSquare, Globe, Sparkles, CheckCircle } from "lucide-react";

export const DistressDetectorDemo = () => {
  const [inputText, setInputText] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en");
  const [result, setResult] = useState<"distress" | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const detection = detectDistress(inputText, selectedLocale);
    setResult(detection);
    setIsAnalyzing(false);
  }, [inputText, selectedLocale]);

  const handleSamplePhraseClick = useCallback((phrase: string) => {
    setInputText(phrase);
    setResult(null);
  }, []);

  const localeNames: Record<Locale, string> = {
    en: "English",
    hi: "हिंदी (Hindi)",
    te: "తెలుగు (Telugu)",
  };

  const samplePhrases = getSamplePhrases(selectedLocale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-start via-background to-bg-gradient-end">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              LIORA Intelligence
            </h1>
            <div className="flex items-center justify-center gap-2 text-primary/80">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide uppercase">Advanced Distress Detection</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Main Detection Interface */}
        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none"></div>
          <CardHeader className="relative pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              Intelligent Text Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Type a message to check for distress cues.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-8">
            {/* Language Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                  <Globe className="w-3 h-3 text-primary" />
                </div>
                <label className="text-sm font-semibold text-foreground">Detection Language</label>
              </div>
              <Select value={selectedLocale} onValueChange={(value: Locale) => setSelectedLocale(value)}>
                <SelectTrigger className="w-full h-12 border-2 hover:border-primary/50 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales().map((locale) => (
                    <SelectItem key={locale} value={locale} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {localeNames[locale]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground">Input Text for Analysis</label>
              <Textarea
                placeholder={`Enter text in ${localeNames[selectedLocale]} to analyze for distress patterns...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[140px] resize-none border-2 hover:border-primary/50 focus:border-primary transition-all duration-200 text-base"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{inputText.length} characters</span>
                <span>Real-time processing ready</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={!inputText.trim() || isAnalyzing} 
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              size="lg"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Text</span>
                </div>
              )}
            </Button>

            {/* Results */}
            {result !== null && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                {result === "distress" ? (
                  <div className="p-6 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 text-red-900 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <span className="font-bold text-lg">⚠️ Distress Signal Detected</span>
                        <div className="text-sm text-red-700 mt-1">High confidence detection</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      The AI system has identified potential distress indicators in the provided text. In a live environment, 
                      this would trigger immediate emergency protocols and appropriate response mechanisms.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 text-green-900 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-bold text-lg">✅ Safe Content Verified</span>
                        <div className="text-sm text-green-700 mt-1">No emergency indicators found</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      The text has been thoroughly analyzed and appears normal with no distress signals or emergency 
                      indicators identified by our detection algorithms.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Phrases */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/20 pointer-events-none"></div>
          <CardHeader className="relative">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              Sample Test Phrases
              <Badge variant="outline" className="ml-auto">
                {localeNames[selectedLocale]}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              Click on any phrase below to instantly test the detection system capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-3">
              {samplePhrases.map((phrase, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="justify-start cursor-pointer hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-300 px-4 py-3 text-sm font-medium border hover:border-primary/50"
                  onClick={() => handleSamplePhraseClick(phrase)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>
                    <span className="flex-1 text-left">{phrase}</span>
                  </div>
                </Badge>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground text-center">
                These sample phrases demonstrate various distress patterns and linguistic markers 
                across different cultural contexts and emergency scenarios.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Powered by LIORA - Advanced Women's Safety AI</span>
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            This demonstration showcases the core natural language processing capabilities of our distress detection system. 
            In production, this technology integrates with comprehensive safety protocols and emergency response systems.
          </p>
        </div>
      </div>
    </div>
  );
};

// Re-export core NLP APIs for consumers importing from "@/lib/nlp-intent"
export { detectDistress, getSamplePhrases, locales } from "./distress-detector";
export type { Locale } from "./distress-detector";