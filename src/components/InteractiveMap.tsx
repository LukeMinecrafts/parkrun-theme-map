import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/hooks/use-toast';
import Papa from 'papaparse';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ParkrunEvent {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  status: string;
}

interface ThemePark {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

interface InteractiveMapProps {
  showParkruns: boolean;
  showThemeParks: boolean;
  onParkrunCountChange: (count: number) => void;
  onThemeParkCountChange: (count: number) => void;
}

export function InteractiveMap({ 
  showParkruns, 
  showThemeParks, 
  onParkrunCountChange, 
  onThemeParkCountChange 
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const parkrunLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const themeParkLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  
  const [parkruns, setParkruns] = useState<ParkrunEvent[]>([]);
  const [themeParks, setThemeParks] = useState<ThemePark[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [52.5, -1.5], // Center on UK
      zoom: 6,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map.current);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map.current);

    // Add layer groups to map
    parkrunLayerGroup.current.addTo(map.current);
    themeParkLayerGroup.current.addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch parkrun data
  useEffect(() => {
    const fetchParkruns = async () => {
      try {
        // Note: This is a mock API call since parkrun API might have CORS restrictions
        // In a real implementation, you'd use their official API
        const response = await fetch('https://images.parkrun.com/events.json');
        if (!response.ok) {
          throw new Error('Failed to fetch parkrun data');
        }
        const data = await response.json();
        
        // Transform data to our format
        const events: ParkrunEvent[] = data.events?.map((event: any) => ({
          id: event.id,
          name: event.name,
          latitude: parseFloat(event.latitude),
          longitude: parseFloat(event.longitude),
          country: event.country || 'UK',
          region: event.region || '',
          status: event.status || 'active'
        })).filter((event: ParkrunEvent) => 
          !isNaN(event.latitude) && !isNaN(event.longitude)
        ) || [];

        setParkruns(events);
        onParkrunCountChange(events.length);
      } catch (error) {
        console.error('Error fetching parkrun data:', error);
        // Fallback with some sample UK parkruns
        const sampleParkruns: ParkrunEvent[] = [
          { id: 1, name: "Bushy Park parkrun", latitude: 51.4108, longitude: -0.3370, country: "UK", region: "London", status: "active" },
          { id: 2, name: "Wimbledon Common parkrun", latitude: 51.4297, longitude: -0.2356, country: "UK", region: "London", status: "active" },
          { id: 3, name: "Hampstead Heath parkrun", latitude: 51.5584, longitude: -0.1656, country: "UK", region: "London", status: "active" },
          { id: 4, name: "Birmingham parkrun", latitude: 52.4862, longitude: -1.8904, country: "UK", region: "Midlands", status: "active" },
          { id: 5, name: "Manchester parkrun", latitude: 53.4808, longitude: -2.2426, country: "UK", region: "North", status: "active" },
        ];
        setParkruns(sampleParkruns);
        onParkrunCountChange(sampleParkruns.length);
        toast({
          title: "Using sample data",
          description: "Could not fetch live parkrun data, showing sample locations",
        });
      }
    };

    fetchParkruns();
  }, [onParkrunCountChange]);

  // Fetch theme park data from CSV
  useEffect(() => {
    const fetchThemeParks = async () => {
      try {
        const response = await fetch('/themeparks.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const parks: ThemePark[] = results.data
              .map((row: any) => ({
                name: row.name || row.Name || '',
                latitude: parseFloat(row.latitude || row.Latitude || row.lat),
                longitude: parseFloat(row.longitude || row.Longitude || row.lng || row.lon),
                country: row.country || row.Country || '',
                state: row.state || row.State || '',
              }))
              .filter((park: ThemePark) => 
                park.name && !isNaN(park.latitude) && !isNaN(park.longitude)
              );

            setThemeParks(parks);
            onThemeParkCountChange(parks.length);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            toast({
              title: "Error loading theme parks",
              description: "Could not load theme park data from CSV",
              variant: "destructive",
            });
          }
        });
      } catch (error) {
        console.error('Error fetching theme park data:', error);
        toast({
          title: "Error loading theme parks",
          description: "Could not fetch theme park data",
          variant: "destructive",
        });
      }
    };

    fetchThemeParks();
  }, [onThemeParkCountChange]);

  // Create custom icons
  const parkrunIcon = L.divIcon({
    html: `<div style="background: #16a34a; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: 'custom-marker'
  });

  const themeParkIcon = L.divIcon({
    html: `<div style="background: #0369a1; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: 'custom-marker'
  });

  // Update parkrun markers
  useEffect(() => {
    if (!map.current) return;

    parkrunLayerGroup.current.clearLayers();

    if (showParkruns) {
      parkruns.forEach((parkrun) => {
        const marker = L.marker([parkrun.latitude, parkrun.longitude], {
          icon: parkrunIcon
        });
        
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-green-700">${parkrun.name}</h3>
            <p class="text-sm text-gray-600">${parkrun.region}, ${parkrun.country}</p>
            <p class="text-xs text-gray-500">Status: ${parkrun.status}</p>
          </div>
        `);
        
        parkrunLayerGroup.current.addLayer(marker);
      });
    }
  }, [showParkruns, parkruns]);

  // Update theme park markers
  useEffect(() => {
    if (!map.current) return;

    themeParkLayerGroup.current.clearLayers();

    if (showThemeParks) {
      themeParks.forEach((park) => {
        const marker = L.marker([park.latitude, park.longitude], {
          icon: themeParkIcon
        });
        
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-blue-700">${park.name}</h3>
            <p class="text-sm text-gray-600">${park.state ? `${park.state}, ` : ''}${park.country}</p>
          </div>
        `);
        
        themeParkLayerGroup.current.addLayer(marker);
      });
    }
  }, [showThemeParks, themeParks]);

  return (
    <div className="relative w-full h-screen">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg" 
        style={{ background: '#f8f9fa' }}
      />
    </div>
  );
}