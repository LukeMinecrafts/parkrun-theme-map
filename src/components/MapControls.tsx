import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, TreePine } from "lucide-react";

interface MapControlsProps {
  showParkruns: boolean;
  showThemeParks: boolean;
  onToggleParkruns: () => void;
  onToggleThemeParks: () => void;
  parkrunCount: number;
  themeParkCount: number;
}

export function MapControls({
  showParkruns,
  showThemeParks,
  onToggleParkruns,
  onToggleThemeParks,
  parkrunCount,
  themeParkCount,
}: MapControlsProps) {
  return (
    <Card className="absolute top-4 left-4 z-[1000] p-4 shadow-glass backdrop-blur-md bg-white/90 border border-white/20">
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">Map Layers</h3>
        
        <div className="space-y-2">
          <Button
            variant={showParkruns ? "nature" : "ghost"}
            size="sm"
            onClick={onToggleParkruns}
            className="w-full justify-start gap-2"
          >
            <TreePine className="w-4 h-4" />
            Parkruns ({parkrunCount})
          </Button>
          
          <Button
            variant={showThemeParks ? "adventure" : "ghost"}
            size="sm"
            onClick={onToggleThemeParks}
            className="w-full justify-start gap-2"
          >
            <MapPin className="w-4 h-4" />
            Theme Parks ({themeParkCount})
          </Button>
        </div>
      </div>
    </Card>
  );
}