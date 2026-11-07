import { images, placeholderStock } from "../lib/images";

/**
 * Typed local catalogue — every screen reads from here.
 * Swap for a CMS/API later without touching components.
 *
 * `visualStatus`:
 *   "concept"   → architectural concept rendering (footer note applies)
 *   "verified"  → real, physically inspected listing (shows the Verified badge)
 */

export type Purpose = "buy" | "rent" | "commercial" | "plot";

export type PropertyType =
  | "Villa"
  | "Penthouse"
  | "Apartment"
  | "Townhouse"
  | "Farmhouse"
  | "Commercial Plaza"
  | "Plot";

export interface FloorLevel {
  level: string;
  rooms: string;
  area: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  /** one-of-a-kind architectural identity */
  style: string;
  signature: string;
  materials: string[];
  mood: string;
  society: string;
  sector: string;
  city: "Islamabad" | "Rawalpindi";
  purpose: Purpose;
  type: PropertyType;
  price: number;
  monthly?: boolean;
  beds: number;
  baths: number;
  parking: number;
  area: number; // sq ft (covered)
  plotArea: number; // sq ft (plot)
  marla: number;
  status: "Available" | "Under Offer" | "New Launch" | "Ready to Move" | "Sold";
  featured: boolean;
  premium: boolean;
  year: number;
  possession: string;
  furnished: boolean;
  coordinates: { lat: number; lng: number };
  images: string[];
  poster: string;
  visualStatus: "concept" | "verified";
  description: string;
  highlights: string[];
  amenities: string[];
  floorplan: FloorLevel[];
  agentId: string;
}

const S = placeholderStock;

export const properties: Property[] = [
  {
    id: "be-01",
    slug: "pine-water-villa-margalla-hills",
    title: "Pine Water Villa",
    style: "Hillside layered stone & blackened timber",
    signature: "Glass-bottom water channel running beneath the entrance bridge",
    materials: ["Charcoal stone", "Blackened timber", "Low-iron glass", "Brushed brass"],
    mood: "Blue hour, mist between pines",
    society: "Margalla Hills",
    sector: "Pine Ridge Road",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 92_000_000,
    beds: 5,
    baths: 6,
    parking: 4,
    area: 5200,
    plotArea: 9000,
    marla: 33,
    status: "Available",
    featured: true,
    premium: true,
    year: 2025,
    possession: "Ready",
    furnished: false,
    coordinates: { lat: 33.6851, lng: 73.0155 },
    images: [images.pineWaterVilla, images.lobby, images.living, images.terrace],
    poster: images.pineWaterVilla,
    visualStatus: "concept",
    description:
      "A layered hillside house that steps down the slope in three stone terraces, so every level gets its own garden and none of them look at each other. You cross a slim bridge over a glass-bottom water channel to reach the front door — the water runs beneath the entrance hall and out into the reflecting pool on the pine side.",
    highlights: [
      "Glass-bottom water channel under the entrance bridge",
      "Three stepped terraces, each with its own garden",
      "Double-height living volume facing due west over the pines",
      "Separate guest wing with its own drive",
      "Underfloor heating and a hybrid solar system",
    ],
    amenities: ["Reflecting Pool", "Guest Wing", "Solar Hybrid", "Underfloor Heating", "Smart Home", "Pine Garden", "Staff Suite", "4-Car Parking"],
    floorplan: [
      { level: "Lower", rooms: "Family lounge · Gym · Store · Plant", area: 1600 },
      { level: "Entrance", rooms: "Hall · Drawing · Dining · Kitchen", area: 2100 },
      { level: "Upper", rooms: "Master + 3 bed · Study · Terrace", area: 1500 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-02",
    slug: "rammed-earth-monolith-dha-5",
    title: "The Rammed Earth Monolith",
    style: "Desert-modern monolith",
    signature: "Sunken conversation pit around a suspended fire bowl",
    materials: ["Rammed earth", "Black steel", "Travertine-look porcelain", "Oak"],
    mood: "Dusk, warm earth walls",
    society: "DHA Phase 5",
    sector: "Block K",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 148_000_000,
    beds: 4,
    baths: 5,
    parking: 3,
    area: 4400,
    plotArea: 4500,
    marla: 16.5,
    status: "Available",
    featured: true,
    premium: true,
    year: 2024,
    possession: "Ready",
    furnished: true,
    coordinates: { lat: 33.5488, lng: 73.1218 },
    images: [S.p2, images.living, images.kitchen],
    poster: S.p2,
    visualStatus: "concept",
    description:
      "One heavy volume of rammed earth with a single deep cut for light. The living room drops four steps into a sunken conversation pit wrapped around a suspended fire bowl, and the whole west wall opens onto a walled courtyard.",
    highlights: [
      "Sunken conversation pit with suspended fire bowl",
      "Load-bearing rammed earth, 450mm walls",
      "Walled courtyard with a single mature olive",
      "Sold furnished to the original design scheme",
    ],
    amenities: ["Courtyard", "Fire Bowl", "Furnished", "Solar Ready", "Smart Home", "Walled Garden"],
    floorplan: [
      { level: "Ground", rooms: "Drawing · Dining · Kitchen · Guest suite", area: 2300 },
      { level: "First", rooms: "Master + 2 bed · Lounge", area: 2100 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-03",
    slug: "cliff-cantilever-bani-gala",
    title: "Cliff Cantilever",
    style: "Cantilevered glass villa on a cliff",
    signature: "Six-metre cantilever over the river bend",
    materials: ["Board-formed concrete", "Structural glass", "Bronze anodised aluminium"],
    mood: "Night, city lights below",
    society: "Bani Gala",
    sector: "Riverside Road",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 265_000_000,
    beds: 4,
    baths: 5,
    parking: 3,
    area: 4800,
    plotArea: 8100,
    marla: 29.7,
    status: "Under Offer",
    featured: true,
    premium: true,
    year: 2023,
    possession: "Ready",
    furnished: false,
    coordinates: { lat: 33.5671, lng: 73.0985 },
    images: [S.p3, images.heroNight, images.bedroom],
    poster: S.p3,
    visualStatus: "concept",
    description:
      "The upper floor reaches six metres out over the river bend with nothing beneath it but air and glass. Bedroom corridors are glazed on the void side, so the walk to the master suite is a walk over the valley.",
    highlights: [
      "6m structural cantilever with a glazed floor panel",
      "Unbroken river-basin view from every principal room",
      "Board-formed concrete core, bronze window frames",
      "Lift to all three levels",
    ],
    amenities: ["River View", "Lift", "Heated Pool", "Smart Home", "Backup Power", "Landscaped", "Cinema Room"],
    floorplan: [
      { level: "Lower", rooms: "Cinema · Gym · Staff · Plant", area: 1500 },
      { level: "Entry", rooms: "Hall · Drawing · Kitchen", area: 1800 },
      { level: "Cantilever", rooms: "Master + 3 bed · Void lounge", area: 1500 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-04",
    slug: "jali-courtyard-house-gulberg",
    title: "Jali Courtyard House",
    style: "Mughal-inspired contemporary courtyard house",
    signature: "Brass jali screens and an indoor tree atrium",
    materials: ["Lime plaster", "Brass jali", "Black marble", "Walnut"],
    mood: "Warm interior shade, dappled light",
    society: "Gulberg Greens",
    sector: "Block C",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 186_000_000,
    beds: 5,
    baths: 6,
    parking: 4,
    area: 5100,
    plotArea: 6000,
    marla: 22,
    status: "New Launch",
    featured: true,
    premium: true,
    year: 2026,
    possession: "Dec 2026",
    furnished: false,
    coordinates: { lat: 33.5284, lng: 73.1373 },
    images: [S.p4, images.lobby, images.marbleWall],
    poster: S.p4,
    visualStatus: "concept",
    description:
      "Every room opens onto a planted courtyard, and the courtyard is screened from the street by a wall of brass jali that throws a moving pattern across the floor through the afternoon. A single mature tree grows through the centre of the house under a glazed oculus.",
    highlights: [
      "Hand-cast brass jali screen wall (42 panels)",
      "Indoor tree atrium under a glazed oculus",
      "Book-matched black marble entrance hall",
      "Booking available with 30% down, balance on possession",
    ],
    amenities: ["Courtyard", "Jali Screens", "Tree Atrium", "Solar Ready", "Smart Home", "Staff Quarters", "Landscaped"],
    floorplan: [
      { level: "Ground", rooms: "Hall · Drawing · Dining · Kitchen · Guest", area: 2600 },
      { level: "First", rooms: "4 bed · Family lounge · Terrace", area: 2500 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-05",
    slug: "timber-water-pavilion-park-road",
    title: "Timber & Water Pavilion",
    style: "Japandi timber villa with water garden",
    signature: "Still reflecting water garden on three sides",
    materials: ["Accoya timber", "Rammed gravel", "Paper-screen glass", "Basalt"],
    mood: "Overcast calm, steam off water",
    society: "Park Road",
    sector: "Chak Shahzad",
    city: "Islamabad",
    purpose: "buy",
    type: "Farmhouse",
    price: 210_000_000,
    beds: 4,
    baths: 4,
    parking: 6,
    area: 3600,
    plotArea: 18000,
    marla: 66,
    status: "Available",
    featured: false,
    premium: true,
    year: 2022,
    possession: "Ready",
    furnished: true,
    coordinates: { lat: 33.5778, lng: 73.0358 },
    images: [S.p5, images.lobby, images.living],
    poster: S.p5,
    visualStatus: "concept",
    description:
      "A single-storey timber pavilion set in six kanal of orchard, floated on a sheet of still water on three sides. Sliding paper-screen panels replace walls in the summer, and the whole house opens to the garden.",
    highlights: [
      "Single-storey, step-free throughout",
      "Reflecting water garden on three elevations",
      "Six kanal orchard with mature citrus and olive",
      "Separate caretaker residence and bore water",
    ],
    amenities: ["Water Garden", "Orchard", "Caretaker Unit", "Bore Water", "Solar Hybrid", "Step-Free", "Furnished"],
    floorplan: [
      { level: "Pavilion", rooms: "Living · Dining · Kitchen · 4 bed", area: 3000 },
      { level: "Annex", rooms: "Caretaker · Store", area: 600 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-06",
    slug: "concrete-oak-residence-e11",
    title: "Concrete & Oak Residence",
    style: "Brutalist-luxe concrete and oak",
    signature: "Double-height library with a brass rolling ladder",
    materials: ["Fair-faced concrete", "European oak", "Brass", "Blackened steel"],
    mood: "Nordic grey light, warm timber",
    society: "E-11/3",
    sector: "Street 8",
    city: "Islamabad",
    purpose: "buy",
    type: "Townhouse",
    price: 132_000_000,
    beds: 4,
    baths: 4,
    parking: 2,
    area: 3400,
    plotArea: 3300,
    marla: 12.1,
    status: "Available",
    featured: false,
    premium: false,
    year: 2021,
    possession: "Ready",
    furnished: false,
    coordinates: { lat: 33.6511, lng: 73.0121 },
    images: [S.p6, images.marbleWall, images.bedroom],
    poster: S.p6,
    visualStatus: "concept",
    description:
      "Fair-faced concrete outside, oak-lined inside, with a double-height library at the heart of the plan and a brass ladder that runs the full length of the shelves. Small garden, serious roof terrace.",
    highlights: [
      "Double-height library with brass rolling ladder",
      "Fair-faced concrete, no applied finishes",
      "Roof terrace with Margalla view",
      "Renovated kitchen and bathrooms, 2025",
    ],
    amenities: ["Library", "Roof Terrace", "Garden", "Parking x2", "Solar Ready", "Renovated"],
    floorplan: [
      { level: "Ground", rooms: "Living · Dining · Kitchen · Library", area: 1400 },
      { level: "First", rooms: "3 bed · Study", area: 1200 },
      { level: "Second", rooms: "Master · Terrace", area: 800 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-07",
    slug: "limestone-colonnade-f7",
    title: "Limestone Colonnade",
    style: "Mediterranean limestone estate",
    signature: "Eleven-bay arched colonnade around a fountain court",
    materials: ["Honed limestone", "Terracotta-look tile", "Wrought iron", "Oak"],
    mood: "Late afternoon, long shadows",
    society: "F-7/3",
    sector: "Street 34",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 340_000_000,
    beds: 6,
    baths: 7,
    parking: 5,
    area: 6800,
    plotArea: 8100,
    marla: 29.7,
    status: "Available",
    featured: true,
    premium: true,
    year: 2019,
    possession: "Ready",
    furnished: false,
    coordinates: { lat: 33.6901, lng: 73.0638 },
    images: [S.p7, images.kitchen, images.terrace],
    poster: S.p7,
    visualStatus: "concept",
    description:
      "A full city plot in F-7 arranged around a fountain court and wrapped in an eleven-bay limestone colonnade. Deep shade in summer, and a plan that works equally well for a large family or for entertaining two hundred people.",
    highlights: [
      "Eleven-bay arched limestone colonnade",
      "Central fountain court with mature citrus",
      "Full 1-kanal plot, F-7, freehold",
      "Two independent guest suites with private entries",
    ],
    amenities: ["Fountain Court", "Colonnade", "Guest Suites", "Orchard", "Staff Quarters", "Backup Power", "5-Car Parking"],
    floorplan: [
      { level: "Ground", rooms: "Drawing · Dining · Kitchen · 2 guest suites", area: 3600 },
      { level: "First", rooms: "Master + 3 bed · Lounge · Balcony", area: 3200 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-08",
    slug: "skyline-penthouse-blue-area",
    title: "Skyline Penthouse",
    style: "Double-height glass penthouse",
    signature: "Private rooftop cinema with a retractable screen",
    materials: ["Low-iron glass", "Bronze", "Verde marble", "Dark oak"],
    mood: "City lights, midnight blue",
    society: "Blue Area",
    sector: "Jinnah Avenue",
    city: "Islamabad",
    purpose: "buy",
    type: "Penthouse",
    price: 224_000_000,
    beds: 4,
    baths: 5,
    parking: 3,
    area: 3900,
    plotArea: 3900,
    marla: 14.3,
    status: "Ready to Move",
    featured: true,
    premium: true,
    year: 2023,
    possession: "Ready",
    furnished: true,
    coordinates: { lat: 33.6742, lng: 73.0902 },
    images: [images.heroNight, S.p8, images.living],
    poster: images.heroNight,
    visualStatus: "concept",
    description:
      "The top two floors of a Jinnah Avenue tower, joined by an internal bronze stair. Double-height glazing on three sides, a 1,100 sq ft terrace above, and a rooftop cinema that folds away when you do not want it.",
    highlights: [
      "Double-height glass living volume, three aspects",
      "1,100 sq ft private terrace with plunge pool",
      "Rooftop cinema with retractable screen",
      "Dedicated lift lobby and 24/7 concierge",
    ],
    amenities: ["Terrace Pool", "Rooftop Cinema", "Concierge", "Gym Access", "Backup Power", "Furnished", "City View"],
    floorplan: [
      { level: "Lower", rooms: "Living · Dining · Kitchen · 2 bed", area: 2400 },
      { level: "Upper", rooms: "Master + 1 bed · Lounge · Terrace", area: 1500 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-09",
    slug: "infinity-ridge-villa-bahria-encore",
    title: "Infinity Ridge Villa",
    style: "Tropical resort villa",
    signature: "Glass-bottom pool spanning the lounge below",
    materials: ["Honed basalt", "Teak", "Structural glass", "Brass"],
    mood: "Humid blue evening, pool light",
    society: "Bahria Enclave",
    sector: "Zone D",
    city: "Islamabad",
    purpose: "buy",
    type: "Villa",
    price: 298_000_000,
    beds: 5,
    baths: 6,
    parking: 4,
    area: 5600,
    plotArea: 7200,
    marla: 26.4,
    status: "Available",
    featured: false,
    premium: true,
    year: 2024,
    possession: "Ready",
    furnished: true,
    coordinates: { lat: 33.6088, lng: 73.1935 },
    images: [S.p9, images.lobby, images.bedroom],
    poster: S.p9,
    visualStatus: "concept",
    description:
      "The pool sits on the roof of the lower lounge, so the ceiling of the family room is water and light. Heated, glass-bottomed, and lit emerald at night — the single most photographed room in the house.",
    highlights: [
      "Glass-bottom heated pool over the family lounge",
      "Highest point of Zone D, unbroken ridge view",
      "Teak and basalt throughout, furnished to spec",
      "Basement cinema, gym and two-room staff suite",
    ],
    amenities: ["Glass-Bottom Pool", "Cinema", "Gym", "Smart Home", "Solar Hybrid", "Staff Suite", "Ridge View"],
    floorplan: [
      { level: "Basement", rooms: "Cinema · Gym · Staff · Plant", area: 1700 },
      { level: "Ground", rooms: "Family lounge · Drawing · Kitchen", area: 2200 },
      { level: "First", rooms: "Master + 3 bed · Pool deck", area: 1700 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-10",
    slug: "white-cube-residence-f6",
    title: "White Cube Residence",
    style: "Minimal cube with sculptural staircase",
    signature: "Cast-stone spiral stair with no visible support",
    materials: ["Lime render", "Cast stone", "Blackened steel", "Linen"],
    mood: "Quiet north light",
    society: "F-6/3",
    sector: "Street 12",
    city: "Islamabad",
    purpose: "rent",
    type: "Apartment",
    price: 425_000,
    monthly: true,
    beds: 3,
    baths: 4,
    parking: 2,
    area: 2450,
    plotArea: 2450,
    marla: 9,
    status: "Ready to Move",
    featured: true,
    premium: false,
    year: 2021,
    possession: "Immediate",
    furnished: true,
    coordinates: { lat: 33.6862, lng: 73.0781 },
    images: [S.p10, images.marbleWall, images.kitchen],
    poster: S.p10,
    visualStatus: "concept",
    description:
      "A ground-floor duplex in the diplomatic enclave with a private walled garden, a cast-stone spiral stair, and an eleven-month renewable term. Furnished in dark neutrals; suited to diplomats and returning families.",
    highlights: [
      "Cast-stone spiral stair, no visible support",
      "Private walled garden and separate entrance",
      "Fully furnished, 11-month renewable term",
      "Two parking bays and a lockable store",
    ],
    amenities: ["Furnished", "Walled Garden", "Parking x2", "Backup Power", "Security", "Pets Considered"],
    floorplan: [
      { level: "Ground", rooms: "Living · Dining · Kitchen · Garden", area: 1300 },
      { level: "Lower", rooms: "3 bed · Lounge", area: 1150 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-11",
    slug: "boulevard-plaza-blue-area",
    title: "Boulevard Plaza",
    style: "Grade-A commercial plaza",
    signature: "Bronze fin facade with a six-storey atrium",
    materials: ["Bronze anodised fins", "Structural glazing", "Granite"],
    mood: "Evening boulevard light",
    society: "Blue Area",
    sector: "Jinnah Avenue",
    city: "Islamabad",
    purpose: "commercial",
    type: "Commercial Plaza",
    price: 640_000_000,
    beds: 0,
    baths: 8,
    parking: 40,
    area: 18500,
    plotArea: 12000,
    marla: 44,
    status: "Available",
    featured: true,
    premium: true,
    year: 2020,
    possession: "Ready",
    furnished: false,
    coordinates: { lat: 33.6761, lng: 73.0871 },
    images: [S.p11, images.lobby, images.marbleWall],
    poster: S.p11,
    visualStatus: "concept",
    description:
      "Six lettable floors on Jinnah Avenue with two basement parking levels, a six-storey atrium and a bronze fin facade. Tenancy schedule, service-charge accounts and title documents available on request.",
    highlights: [
      "Six floors plus two basement parking levels",
      "Bronze fin facade, refurbished 2025",
      "Freehold, clear title, no society dues outstanding",
      "Yield and occupancy schedule shared under NDA",
    ],
    amenities: ["Lifts x2", "Basement Parking", "Fire Suppression", "Backup Generator", "Fibre Ready", "24/7 Security", "Atrium"],
    floorplan: [
      { level: "Basement 1-2", rooms: "Parking · Plant", area: 6200 },
      { level: "Ground-2", rooms: "Retail · Banking hall", area: 6100 },
      { level: "3-6", rooms: "Open-plan offices", area: 6200 },
    ],
    agentId: "bilal",
  },
  {
    id: "be-12",
    slug: "ridge-plot-b17",
    title: "Ridge Corner Plot",
    style: "Park-facing corner plot",
    signature: "Double frontage on a developed tree-lined street",
    materials: ["—"],
    mood: "Open sky, ready to build",
    society: "B-17",
    sector: "Block C",
    city: "Islamabad",
    purpose: "plot",
    type: "Plot",
    price: 78_000_000,
    beds: 0,
    baths: 0,
    parking: 0,
    area: 4500,
    plotArea: 4500,
    marla: 16.5,
    status: "Available",
    featured: false,
    premium: false,
    year: 2024,
    possession: "Immediate",
    furnished: false,
    coordinates: { lat: 33.6007, lng: 72.9686 },
    images: [S.p12, images.aerial],
    poster: S.p12,
    visualStatus: "concept",
    description:
      "A one-kanal park-facing corner with both frontages on a developed, tree-lined street. Allotment letter and possession in hand, approved map available, utilities live.",
    highlights: [
      "Park-facing corner, double frontage",
      "Allotment letter and possession in hand",
      "Approved building map available",
      "Utilities live, street developed",
    ],
    amenities: ["Corner", "Park Facing", "Utilities Live", "Clear Title", "Approved Map"],
    floorplan: [{ level: "Plot", rooms: "1 Kanal · 45 × 90 ft", area: 4500 }],
    agentId: "bilal",
  },
];

export const propertyTypes = ["all", "Villa", "Penthouse", "Apartment", "Townhouse", "Farmhouse", "Commercial Plaza", "Plot"];
export const societies = ["all", ...Array.from(new Set(properties.map((p) => p.society)))];

/** Islamabad / Rawalpindi location filter list (editable). */
export const locationOptions = [
  "DHA Phase 1", "DHA Phase 2", "DHA Phase 3", "DHA Phase 4", "DHA Phase 5", "DHA Phase 6",
  "Bahria Town", "Bahria Enclave", "F-6", "F-7", "F-8", "F-10", "F-11", "E-7", "E-11",
  "G-6", "G-9", "G-10", "G-11", "G-13", "B-17", "Gulberg Greens", "Park Road",
  "Blue Area", "Top City", "Capital Smart City", "Faisal Town", "Margalla Hills", "Bani Gala",
];

export const bySlug = (slug?: string) => properties.find((p) => p.slug === slug);
export const byId = (id?: string) => properties.find((p) => p.id === id);

export function similar(p: Property, count = 3) {
  return properties
    .filter((x) => x.slug !== p.slug)
    .map((x) => {
      let score = 0;
      if (x.purpose === p.purpose) score += 3;
      if (x.type === p.type) score += 3;
      if (x.city === p.city) score += 1;
      score -= Math.abs(Math.log10((x.price + 1) / (p.price + 1))) * 2;
      score += Math.min(2, (1 - Math.abs(x.area - p.area) / 8000) * 2);
      return { x, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((r) => r.x);
}

export const priceBounds = { min: 0, max: 700_000_000 };

export function listingJsonLd(p: Property) {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", "Residence"],
    name: `${p.title} — ${p.society}, ${p.city}`,
    description: p.description,
    url: `https://bilalestate.pk/#/properties/${p.slug}`,
    datePosted: `${p.year}-01-15`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${p.sector}, ${p.society}`,
      addressLocality: p.city,
      addressRegion: "Islamabad Capital Territory",
      addressCountry: "PK",
    },
    geo: { "@type": "GeoCoordinates", latitude: p.coordinates.lat, longitude: p.coordinates.lng },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "PKR",
      availability: p.status === "Sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "FTK" },
    numberOfRooms: p.beds || 1,
    numberOfBathroomsTotal: p.baths,
    amenityFeature: p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })),
  };
}
