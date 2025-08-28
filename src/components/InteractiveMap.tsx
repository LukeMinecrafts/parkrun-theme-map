import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/hooks/use-toast';

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

  // Load theme park data from provided static data
  useEffect(() => {
    const themeParkData = [
      { wkt: "POINT (-1.5537028 50.9481718)", name: "Paultons Park Home of Peppa Pig World", description: "" },
      { wkt: "POINT (4.5940362 50.70186030000001)", name: "Walibi Belgium", description: "" },
      { wkt: "POINT (2.5987627 51.0808505)", name: "Plopsaland De Panne", description: "" },
      { wkt: "POINT (4.903926 51.20069600000001)", name: "Bobbejaanland", description: "" },
      { wkt: "POINT (2.5712301 49.1341839)", name: "Astérix Park", description: "" },
      { wkt: "POINT (6.8765132 50.8015677)", name: "Phantasialand", description: "" },
      { wkt: "POINT (7.7220076 48.2660194)", name: "Europa-Park", description: "" },
      { wkt: "POINT (9.8781907 53.0236683)", name: "Heide Park Resort", description: "" },
      { wkt: "POINT (10.7779549 54.0747687)", name: "Hansa-Park", description: "" },
      { wkt: "POINT (8.2997784 49.31797170000001)", name: "Holiday Park, Germany", description: "" },
      { wkt: "POINT (5.0497462 51.6506518)", name: "Efteling", description: "" },
      { wkt: "POINT (5.7626661 52.440096)", name: "Walibi Holland", description: "" },
      { wkt: "POINT (4.3842739 52.1474982)", name: "Duinrell", description: "" },
      { wkt: "POINT (5.9847667 51.39688349999999)", name: "Toverland", description: "" },
      { wkt: "POINT (19.4108192 49.99938119999999)", name: "Energylandia", description: "" },
      { wkt: "POINT (18.9914608 50.27340230000001)", name: "Legendia Śląskie Wesołe Miasteczko", description: "" },
      { wkt: "POINT (10.7137024 45.45494919999999)", name: "Gardaland Resort", description: "" },
      { wkt: "POINT (12.2633986 44.3378048)", name: "Mirabilandia", description: "" },
      { wkt: "POINT (1.1530149 41.0956079)", name: "Port Aventura", description: "" },
      { wkt: "POINT (5.8762633 50.3951009)", name: "Plopsa Coo", description: "" },
      { wkt: "POINT (5.362369299999999 50.9326023)", name: "Plopsa Indoor Hasselt", description: "" },
      { wkt: "POINT (15.0836363 52.3498931)", name: "Majaland Kownaty", description: "" },
      { wkt: "POINT (6.5571307 52.6268548)", name: "Slagharen", description: "" },
      { wkt: "POINT (12.3153018 51.2517143)", name: "Belantis", description: "" },
      { wkt: "POINT (4.3522799 52.0527185)", name: "Family park Drievliet", description: "" },
      { wkt: "POINT (8.437613100000002 51.3086583)", name: "Fort Fun Abenteuerland", description: "" },
      { wkt: "POINT (11.9924641 57.6952191)", name: "Liseberg", description: "" },
      { wkt: "POINT (4.9702859 44.0204458)", name: "Parc Spirou Provence", description: "" },
      { wkt: "POINT (-4.8000809 51.77751800000001)", name: "Oakwood Theme Park", description: "" },
      { wkt: "POINT (9.137721200000001 55.7330984)", name: "Lalandia i Billund", description: "" },
      { wkt: "POINT (9.650566799999998 57.2713353)", name: "Fårup Sommerland", description: "" },
      { wkt: "POINT (12.5777714 55.7752207)", name: "Bakken", description: "" },
      { wkt: "POINT (9.1268046 55.73551089999999)", name: "LEGOLAND® Billund Resort", description: "" },
      { wkt: "POINT (1.982817 49.421484)", name: "Parc Saint-Paul", description: "" },
      { wkt: "POINT (2.2697649 48.8777822)", name: "Jardin d'Acclimatation", description: "" },
      { wkt: "POINT (2.4065252 48.8301604)", name: "Foire du Trône", description: "" },
      { wkt: "POINT (6.155997600000001 49.22534950000001)", name: "Walygator Parc", description: "" },
      { wkt: "POINT (6.727812599999999 48.3247857)", name: "Fraispertuis City", description: "" },
      { wkt: "POINT (9.052612 49.0352748)", name: "Erlebnispark Tripsdrill", description: "" },
      { wkt: "POINT (4.610032999999999 48.260641)", name: "Nigloland", description: "" },
      { wkt: "POINT (12.5681471 55.6736841)", name: "Tivoli Gardens", description: "" },
      { wkt: "POINT (18.09639 59.32335639999999)", name: "Gröna Lund", description: "" },
      { wkt: "POINT (2.244231800000001 48.8673051)", name: "Parc Bagatelle - la Roseraie", description: "" },
      { wkt: "POINT (1.3771916 51.38523310000001)", name: "Dreamland Margate", description: "" },
      { wkt: "POINT (6.4360833 52.3896276)", name: "AdventurePark Hellendoorn", description: "" },
      { wkt: "POINT (6.807741099999999 52.2444802)", name: "Attractiepark de Waarbeek", description: "" },
      { wkt: "POINT (-3.0105711 51.2856227)", name: "Brean Theme Park", description: "" },
      { wkt: "POINT (-3.592630299999999 40.2316116)", name: "Parque Warner Madrid", description: "" },
      { wkt: "POINT (12.4465549 41.709931)", name: "Cinecittà World", description: "" },
      { wkt: "POINT (6.972393299999999 51.62080270000001)", name: "Movie Park Germany", description: "" },
      { wkt: "POINT (6.170804899999998 51.3999174)", name: "Taurus World of Adventure", description: "" },
      { wkt: "POINT (16.3990328 58.6605369)", name: "Kolmården", description: "" },
      { wkt: "POINT (-3.750089200000001 40.4118609)", name: "Parque de Atracciones de Madrid", description: "" },
      { wkt: "POINT (10.4566002 49.7794639)", name: "Freizeit-Land Geiselwind", description: "" },
      { wkt: "POINT (12.9560359 41.765255)", name: "Rainbow Magicland", description: "" },
      { wkt: "POINT (10.5912344 48.0430234)", name: "Allgäu Skyline Park", description: "" },
      { wkt: "POINT (9.6548616 48.9031029)", name: "Schwaben Park", description: "" },
      { wkt: "POINT (7.922364999999999 47.899763)", name: "Steinwasen Park", description: "" },
      { wkt: "POINT (-3.0552927 53.79233)", name: "Blackpool Pleasure Beach", description: "" },
      { wkt: "POINT (-1.7137723 52.6122148)", name: "Drayton Manor Theme Park", description: "" },
      { wkt: "POINT (-2.2865696 52.37795920000001)", name: "West Midland Safari Park", description: "" },
      { wkt: "POINT (-0.5123911999999999 51.40510020000001)", name: "Thorpe Park Resort", description: "" },
      { wkt: "POINT (-0.3192127 51.3472173)", name: "Chessington World of Adventures Resort", description: "" },
      { wkt: "POINT (-1.8864512 52.9874366)", name: "Alton Towers", description: "" },
      { wkt: "POINT (-0.8095307999999998 54.20651209999999)", name: "Flamingo Land Resort", description: "" },
      { wkt: "POINT (-1.5637592 54.1772234)", name: "Lightwater Valley Family Adventure Park", description: "" },
      { wkt: "POINT (-0.6500275000000001 51.4638338)", name: "LEGOLAND® Windsor Resort", description: "" },
      { wkt: "POINT (-0.7084625999999999 52.3868689)", name: "Wicksteed Park", description: "" },
      { wkt: "POINT (-81.467672 28.4754235)", name: "Universal Studios Florida", description: "" },
      { wkt: "POINT (-82.4194607 28.037066)", name: "Busch Gardens Tampa Bay", description: "" },
      { wkt: "POINT (-76.64589749999999 37.236405)", name: "Busch Gardens Williamsburg", description: "" },
      { wkt: "POINT (-81.6910418 27.9885659)", name: "LEGOLAND® Florida Resort", description: "" },
      { wkt: "POINT (-81.4555573 28.4654176)", name: "Fun Spot America Theme Parks", description: "" },
      { wkt: "POINT (0.7166366 51.5329097)", name: "Adventure Island", description: "" },
      { wkt: "POINT (1.7444031 52.50703189999999)", name: "Pleasurewood Hills Family Theme Park", description: "" },
      { wkt: "POINT (0.3478341 53.1923981)", name: "Fantasy Island", description: "" },
      { wkt: "POINT (-118.0002265 33.8443038)", name: "Knott's Berry Farm", description: "" },
      { wkt: "POINT (-118.5972191 34.42533049999999)", name: "Six Flags Magic Mountain", description: "" },
      { wkt: "POINT (-6.459472799999999 53.54531419999999)", name: "Emerald Park", description: "" },
      { wkt: "POINT (-117.2518979 32.770895)", name: "Belmont Park", description: "" },
      { wkt: "POINT (114.0412819 22.3129666)", name: "Hong Kong Disneyland", description: "" },
      { wkt: "POINT (114.1721746 22.2346359)", name: "Ocean Park", description: "" },
      { wkt: "POINT (121.666809 31.14228779999999)", name: "Shanghai Disney Resort", description: "" },
      { wkt: "POINT (138.7805511 35.4869467)", name: "Fuji-Q Highland", description: "" },
      { wkt: "POINT (139.8803943 35.6328964)", name: "Tokyo Disneyland", description: "" },
      { wkt: "POINT (121.213809 31.100754)", name: "Shanghai Happy Valley （North Gate）", description: "" },
      { wkt: "POINT (55.0038434 24.920732)", name: "MOTIONGATE™ Dubai", description: "" },
      { wkt: "POINT (55.01002880000001 24.9188049)", name: "Legoland® Dubai", description: "" },
      { wkt: "POINT (54.6070066 24.4837634)", name: "Ferrari World Abu Dhabi", description: "" },
      { wkt: "POINT (55.31807140000001 25.0821449)", name: "IMG Worlds of Adventure", description: "" },
      { wkt: "POINT (-82.6835206 41.482207)", name: "Cedar Point", description: "" },
      { wkt: "POINT (-98.6105607 29.5991156)", name: "Six Flags Fiesta Texas", description: "" },
      { wkt: "POINT (-97.0700347 32.75529240000001)", name: "Six Flags Over Texas", description: "" },
      { wkt: "POINT (-93.33884259999999 36.66702939999999)", name: "Silver Dollar City", description: "" },
      { wkt: "POINT (-94.48624799999999 39.1765826)", name: "Worlds of Fun", description: "" },
      { wkt: "POINT (-90.6750181 38.5129856)", name: "Six Flags St. Louis", description: "" },
      { wkt: "POINT (-86.9158101 38.1187443)", name: "Holiday World & Splashin' Safari", description: "" },
      { wkt: "POINT (-84.2691423 39.3451798)", name: "Kings Island", description: "" },
      { wkt: "POINT (-83.5311862 35.7951026)", name: "Dollywood", description: "" },
      { wkt: "POINT (-84.5497376 33.7698923)", name: "Six Flags Over Georgia", description: "" },
      { wkt: "POINT (-80.9432798 35.1034041)", name: "Carowinds", description: "" },
      { wkt: "POINT (-77.44419119999999 37.839871)", name: "Kings Dominion", description: "" },
      { wkt: "POINT (-79.86188279999999 40.386622)", name: "Kennywood", description: "" },
      { wkt: "POINT (-79.542908 43.82877239999999)", name: "Canada's Wonderland", description: "" },
      { wkt: "POINT (-76.5042299 40.8775313)", name: "Knoebels Amusement Resort", description: "" },
      { wkt: "POINT (-76.65474689999999 40.2887809)", name: "Hersheypark", description: "" },
      { wkt: "POINT (-74.4361629 40.13606049999999)", name: "Six Flags Great Adventure", description: "" },
      { wkt: "POINT (-73.9782 40.5752795)", name: "Luna Park in Coney Island", description: "" },
      { wkt: "POINT (-117.918989 33.810485)", name: "Disneyland Resort", description: "" },
      { wkt: "POINT (19.4420776 49.9886741)", name: "Zatorland Amusement Park", description: "" },
      { wkt: "POINT (2.118611 41.4225)", name: "Tibidabo", description: "" },
      { wkt: "POINT (-115.1565537 36.1475119)", name: "The STRAT Hotel, Casino & SkyPod", description: "" },
      { wkt: "POINT (16.421699 48.20114510000001)", name: "Wiener Prater", description: "" },
      { wkt: "POINT (16.6477526 47.8022634)", name: "Familypark Neusiedlersee", description: "" },
      { wkt: "POINT (2.783593 48.8673858)", name: "Disneyland Paris", description: "" },
      { wkt: "POINT (-0.1577752 38.5594384)", name: "Terra Mítica", description: "" },
      { wkt: "POINT (9.617388000000002 52.7508948)", name: "Serengeti Park Hodenhagen - \"Safari Adventure in the middle of Europe\"", description: "" },
      { wkt: "POINT (-75.53310619999999 40.5784549)", name: "Dorney Park & Wildwater Kingdom", description: "" },
      { wkt: "POINT (-80.1564393 42.1085805)", name: "Waldameer park", description: "" },
      { wkt: "POINT (-86.7711219 40.7916253)", name: "Indiana Beach", description: "" },
      { wkt: "POINT (-89.7963291 43.625026)", name: "Mt. Olympus Resort", description: "" },
      { wkt: "POINT (-92.31240679999999 42.4430722)", name: "Lost Island Waterpark & Adventure Golf & Go-Karts", description: "" },
      { wkt: "POINT (-93.49694629999999 41.657646)", name: "Adventureland Resort", description: "" },
      { wkt: "POINT (-85.74489229999999 38.1977163)", name: "Kentucky Kingdom & Hurricane Bay", description: "" },
      { wkt: "POINT (-84.42797259999999 33.4963312)", name: "Fun Spot America Theme Parks — Atlanta", description: "" },
      { wkt: "POINT (103.8238084 1.2540421)", name: "Universal Studios Singapore", description: "" },
      { wkt: "POINT (153.3131103 -27.906957)", name: "Warner Bros. Movie World", description: "" },
      { wkt: "POINT (153.0465138 -26.7498623)", name: "Aussie World", description: "" },
      { wkt: "POINT (153.3175725 -27.9147492)", name: "Wet'n'Wild Gold Coast", description: "" },
      { wkt: "POINT (153.3152531 -27.8635076)", name: "Dreamworld", description: "" },
      { wkt: "POINT (153.4257624 -27.95320449999999)", name: "Sea World Resort", description: "" },
      { wkt: "POINT (144.976924 -37.8678147)", name: "Luna Park Melbourne", description: "" },
      { wkt: "POINT (101.7948638 3.4247634)", name: "Skytropolis Indoor Theme Park", description: "" },
      { wkt: "POINT (54.61931519999999 24.4854048)", name: "SeaWorld Abu Dhabi", description: "" }
    ];

    // Parse WKT format to extract coordinates
    const parseWKT = (wkt: string) => {
      const match = wkt.match(/POINT \(([^\)]+)\)/);
      if (match) {
        const coords = match[1].split(' ');
        return {
          longitude: parseFloat(coords[0]),
          latitude: parseFloat(coords[1])
        };
      }
      return null;
    };

    // Transform data to our format
    const parks: ThemePark[] = themeParkData
      .map((item) => {
        const coords = parseWKT(item.wkt);
        if (!coords) return null;
        
        return {
          name: item.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          country: 'International' // Could be enhanced with country detection
        };
      })
      .filter((park): park is ThemePark => park !== null);

    setThemeParks(parks);
    onThemeParkCountChange(parks.length);
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