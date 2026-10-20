export type ServiceId = "events" | "merch" | "auto";

export interface Hotspot {
  title: string;
  description: string;
  action: string;
}

export interface Service {
  id: ServiceId;
  label: string;
  subtitle: string;
  /** 3D accent color (hex, used only inside the WebGL scene) */
  color: string;
  /** Tailwind token suffix: text-events, bg-merch, etc. */
  token: "events" | "merch" | "auto";
  target: [number, number, number];
  marker: [number, number, number];
  hotspots: Hotspot[];
  categories: string[];
}

export const SERVICES: Service[] = [
  {
    id: "events",
    label: "Events",
    subtitle: "Plan & book",
    color: "#a78bfa",
    token: "events",
    target: [-15, 0, 1],
    marker: [-15, 7.5, -1],
    categories: ["All", "Popular", "Packages", "Weddings", "Corporate"],
    hotspots: [
      { title: "Weddings & Celebrations", description: "Garden ceremonies, receptions and milestone celebrations styled end to end by our coordinators.", action: "Explore Packages" },
      { title: "Corporate Events", description: "Seminars, launches and conferences with staging, seating and on-site event staff.", action: "Explore Venues" },
      { title: "Private Parties", description: "Birthdays, reunions and intimate gatherings in the garden or rooftop lounge.", action: "Plan a Party" },
      { title: "Event Packages", description: "Bundled inclusions for venue, styling, catering coordination and lights & sound.", action: "Explore Packages" },
      { title: "Venues & Inclusions", description: "A glass pavilion, conference hall and open-air garden — see what each space includes.", action: "Explore Venues" },
    ],
  },
  {
    id: "merch",
    label: "Merchandise",
    subtitle: "Browse & shop",
    color: "#60a5fa",
    token: "merch",
    target: [0, 0, 0],
    marker: [0, 8.5, -2],
    categories: ["All", "Promo", "Popular", "New Arrivals", "Bundles"],
    hotspots: [
      { title: "Product Collections", description: "Curated merchandise collections, sorted and packed in our fulfillment center.", action: "Browse Products" },
      { title: "Popular Products", description: "The items customers come back for, ready to ship from our racks.", action: "Browse Products" },
      { title: "Promotions & Bundles", description: "Bundled sets and seasonal promos assembled at the packing stations.", action: "Explore Bundles" },
      { title: "Merchandise Categories", description: "Browse by category — apparel, event souvenirs, giveaways and more.", action: "View Categories" },
      { title: "Order Fulfillment", description: "Picked, packed and dispatched from our loading docks to your door.", action: "How It Works" },
    ],
  },
  {
    id: "auto",
    label: "Auto Care",
    subtitle: "Choose & schedule",
    color: "#2dd4bf",
    token: "auto",
    target: [15, 0, 0],
    marker: [15, 7.5, -2],
    categories: ["All", "Popular", "Car Wash", "Detailing", "Polishing"],
    hotspots: [
      { title: "Car Wash", description: "Automatic tunnel wash with soft rollers, foam and spot-free rinse.", action: "Explore Services" },
      { title: "Interior Cleaning", description: "Vacuum, shampoo and conditioning for cabins, seats and mats.", action: "Explore Services" },
      { title: "Detailing", description: "Hand detailing bays for a deep clean inside and out.", action: "Book Appointment" },
      { title: "Paint Polishing", description: "Machine polishing to lift swirls and restore gloss.", action: "Book Appointment" },
      { title: "Automotive Services", description: "Inspection bays and vehicle preparation by our technicians.", action: "Book Appointment" },
    ],
  },
];

export const SERVICE_ORDER: ServiceId[] = ["events", "merch", "auto"];
export const DWELL_MS = 4000;
export const USER_HOLD_MS = 8000;

export const getService = (id: ServiceId) => SERVICES.find((s) => s.id === id)!;
export const nextService = (id: ServiceId): ServiceId =>
  SERVICE_ORDER[(SERVICE_ORDER.indexOf(id) + 1) % SERVICE_ORDER.length];
