import React from "react";
import { Moon, Sun, Calculator, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header({ theme, toggleTheme }) {
  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl no-print"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight">
                  StayOrJump
                </span>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] font-mono border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                >
                  PP 35/2021
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5">
                Kalkulator Pesangon & Karir UU Cipta Kerja
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">
                Data lokal · Tanpa login
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
              className="rounded-full h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
