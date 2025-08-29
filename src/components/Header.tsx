import { MapPin, TreePine, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-[999] bg-gradient-hero border-b border-border/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TreePine className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Parkrun & Theme Park Map
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm">
              <Info className="w-4 h-4" />
              About
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-muted-foreground text-sm">
            Discover parkruns and theme parks across the country. Toggle layers to explore different activities.
          </p>
        </div>
      </div>
    </header>
  );
}