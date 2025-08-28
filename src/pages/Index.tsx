import { useState } from 'react';
import { Header } from '@/components/Header';
import { InteractiveMap } from '@/components/InteractiveMap';
import { MapControls } from '@/components/MapControls';

const Index = () => {
  const [showParkruns, setShowParkruns] = useState(true);
  const [showThemeParks, setShowThemeParks] = useState(true);
  const [parkrunCount, setParkrunCount] = useState(0);
  const [themeParkCount, setThemeParkCount] = useState(0);

  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      <Header />
      
      <main className="relative">
        <InteractiveMap 
          showParkruns={showParkruns}
          showThemeParks={showThemeParks}
          onParkrunCountChange={setParkrunCount}
          onThemeParkCountChange={setThemeParkCount}
        />
        
        <MapControls
          showParkruns={showParkruns}
          showThemeParks={showThemeParks}
          onToggleParkruns={() => setShowParkruns(!showParkruns)}
          onToggleThemeParks={() => setShowThemeParks(!showThemeParks)}
          parkrunCount={parkrunCount}
          themeParkCount={themeParkCount}
        />
      </main>
    </div>
  );
};

export default Index;
