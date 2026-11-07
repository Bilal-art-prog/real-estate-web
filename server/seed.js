/**
 * Seed: creates the admin user (from .env) and the property register.
 * Run: npm run seed
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const j = (v) => JSON.stringify(v ?? []);

const properties = [
  { slug: "pine-water-villa-margalla-hills", title: "Pine Water Villa", style: "Hillside layered stone & blackened timber", signature: "Glass-bottom water channel beneath the entrance bridge", society: "Margalla Hills", sector: "Pine Ridge Road", city: "Islamabad", purpose: "buy", type: "Villa", price: 92000000, beds: 5, baths: 6, parking: 4, area: 5200, plotArea: 9000, marla: 33, status: "Available", featured: true, premium: true, year: 2025, possession: "Ready", lat: 33.6851, lng: 73.0155, poster: "/images/property-pine-water-villa.jpg", amenities: ["Reflecting Pool", "Guest Wing", "Solar Hybrid", "Smart Home", "Pine Garden", "Staff Suite"] },
  { slug: "rammed-earth-monolith-dha-5", title: "The Rammed Earth Monolith", style: "Desert-modern monolith", signature: "Sunken conversation pit around a suspended fire bowl", society: "DHA Phase 5", sector: "Block K", city: "Islamabad", purpose: "buy", type: "Villa", price: 148000000, beds: 4, baths: 5, parking: 3, area: 4400, plotArea: 4500, marla: 16.5, status: "Available", featured: true, premium: true, year: 2024, possession: "Ready", furnished: true, lat: 33.5488, lng: 73.1218, amenities: ["Courtyard", "Fire Bowl", "Furnished", "Solar Ready"] },
  { slug: "cliff-cantilever-bani-gala", title: "Cliff Cantilever", style: "Cantilevered glass villa on a cliff", signature: "Six-metre cantilever over the river bend", society: "Bani Gala", sector: "Riverside Road", city: "Islamabad", purpose: "buy", type: "Villa", price: 265000000, beds: 4, baths: 5, parking: 3, area: 4800, plotArea: 8100, marla: 29.7, status: "Under Offer", featured: true, premium: true, year: 2023, lat: 33.5671, lng: 73.0985, amenities: ["River View", "Lift", "Heated Pool", "Cinema Room"] },
  { slug: "jali-courtyard-house-gulberg", title: "Jali Courtyard House", style: "Mughal-inspired contemporary courtyard", signature: "Brass jali screens and an indoor tree atrium", society: "Gulberg Greens", sector: "Block C", city: "Islamabad", purpose: "buy", type: "Villa", price: 186000000, beds: 5, baths: 6, parking: 4, area: 5100, plotArea: 6000, marla: 22, status: "New Launch", featured: true, premium: true, year: 2026, lat: 33.5284, lng: 73.1373, amenities: ["Courtyard", "Jali Screens", "Tree Atrium"] },
  { slug: "timber-water-pavilion-park-road", title: "Timber & Water Pavilion", style: "Japandi timber villa with water garden", signature: "Still reflecting water garden on three sides", society: "Park Road", sector: "Chak Shahzad", city: "Islamabad", purpose: "buy", type: "Farmhouse", price: 210000000, beds: 4, baths: 4, parking: 6, area: 3600, plotArea: 18000, marla: 66, year: 2022, lat: 33.5778, lng: 73.0358, amenities: ["Water Garden", "Orchard", "Caretaker Unit"] },
  { slug: "concrete-oak-residence-e11", title: "Concrete & Oak Residence", style: "Brutalist-luxe concrete and oak", signature: "Double-height library with a brass rolling ladder", society: "E-11/3", sector: "Street 8", city: "Islamabad", purpose: "buy", type: "Townhouse", price: 132000000, beds: 4, baths: 4, parking: 2, area: 3400, plotArea: 3300, marla: 12.1, year: 2021, lat: 33.6511, lng: 73.0121, amenities: ["Library", "Roof Terrace", "Garden"] },
  { slug: "limestone-colonnade-f7", title: "Limestone Colonnade", style: "Mediterranean limestone estate", signature: "Eleven-bay arched colonnade around a fountain court", society: "F-7/3", sector: "Street 34", city: "Islamabad", purpose: "buy", type: "Villa", price: 340000000, beds: 6, baths: 7, parking: 5, area: 6800, plotArea: 8100, marla: 29.7, featured: true, premium: true, year: 2019, lat: 33.6901, lng: 73.0638, amenities: ["Fountain Court", "Colonnade", "Guest Suites"] },
  { slug: "skyline-penthouse-blue-area", title: "Skyline Penthouse", style: "Double-height glass penthouse", signature: "Private rooftop cinema with a retractable screen", society: "Blue Area", sector: "Jinnah Avenue", city: "Islamabad", purpose: "buy", type: "Penthouse", price: 224000000, beds: 4, baths: 5, parking: 3, area: 3900, featured: true, premium: true, year: 2023, furnished: true, lat: 33.6742, lng: 73.0902, amenities: ["Terrace Pool", "Rooftop Cinema", "Concierge"] },
  { slug: "infinity-ridge-villa-bahria-encore", title: "Infinity Ridge Villa", style: "Tropical resort villa", signature: "Glass-bottom pool spanning the lounge below", society: "Bahria Enclave", sector: "Zone D", city: "Islamabad", purpose: "buy", type: "Villa", price: 298000000, beds: 5, baths: 6, parking: 4, area: 5600, plotArea: 7200, marla: 26.4, year: 2024, furnished: true, lat: 33.6088, lng: 73.1935, amenities: ["Glass-Bottom Pool", "Cinema", "Gym"] },
  { slug: "white-cube-residence-f6", title: "White Cube Residence", style: "Minimal cube with sculptural staircase", signature: "Cast-stone spiral stair with no visible support", society: "F-6/3", sector: "Street 12", city: "Islamabad", purpose: "rent", type: "Apartment", price: 425000, monthly: true, beds: 3, baths: 4, parking: 2, area: 2450, featured: true, year: 2021, furnished: true, lat: 33.6862, lng: 73.0781, amenities: ["Furnished", "Walled Garden", "Security"] },
  { slug: "boulevard-plaza-blue-area", title: "Boulevard Plaza", style: "Grade-A commercial plaza", signature: "Bronze fin facade with a six-storey atrium", society: "Blue Area", sector: "Jinnah Avenue", city: "Islamabad", purpose: "commercial", type: "Commercial Plaza", price: 640000000, baths: 8, parking: 40, area: 18500, plotArea: 12000, marla: 44, featured: true, premium: true, year: 2020, lat: 33.6761, lng: 73.0871, amenities: ["Lifts x2", "Basement Parking", "Fire Suppression"] },
  { slug: "ridge-plot-b17", title: "Ridge Corner Plot", style: "Park-facing corner plot", signature: "Double frontage on a developed tree-lined street", society: "B-17", sector: "Block C", city: "Islamabad", purpose: "plot", type: "Plot", price: 78000000, area: 4500, plotArea: 4500, marla: 16.5, year: 2024, lat: 33.6007, lng: 72.9686, amenities: ["Corner", "Park Facing", "Clear Title"] },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@bilalestate.pk").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "change-me-before-deploying";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash, name: "Bilal" });
  console.log(`✔ admin user: ${email}`);

  await prisma.agent.upsert({
    where: { id: "owner-bilal" },
    update: {},
    create: { id: "owner-bilal", name: "Bilal", role: "Founder & Property Consultant", languages: j(["English", "Urdu", "Punjabi"]), phone: "03450655699", photo: "/images/owner/bilal.jpg", speciality: "Islamabad & Rawalpindi · overseas buyers", isOwner: true, sort: 0, bio: "Founder of Bilal Estate. Handles every mandate personally." },
  });

  let created = 0;
  for (const p of properties) {
    const exists = await prisma.property.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.property.create({
      data: {
        ...p,
        materials: j(p.materials),
        images: j(p.images ?? [p.poster].filter(Boolean)),
        highlights: j(p.highlights),
        amenities: j(p.amenities),
        floorplan: j(p.floorplan),
        description: p.description ?? `${p.title} — ${p.style}. ${p.signature}.`,
        visualStatus: "concept",
      },
    });
    created++;
  }
  console.log(`✔ properties created: ${created} (existing skipped)`);

  const posts = [
    { slug: "how-to-verify-a-property-file", title: "How to verify a property file in Pakistan (a real checklist)", category: "Legal", excerpt: "Seven documents, three phone calls and one physical visit.", published: true },
    { slug: "overseas-buyers-guide", title: "A buyer's guide for overseas Pakistanis", category: "Invest", excerpt: "Banking routes, tax treatment and completing a purchase without flying in.", published: true },
    { slug: "designing-for-islamabad-light", title: "Designing for Islamabad light: why the west wall matters", category: "Design", excerpt: "The Margallas turn gold late in the afternoon.", published: true },
  ];
  for (const p of posts) {
    const exists = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (!exists) await prisma.post.create({ data: { ...p, body: j(["Draft body — replace from src/data/content.ts"]) } });
  }
  console.log(`✔ posts: ${posts.length}`);

  console.log("\nNext: set VITE_API_BASE in the frontend .env and rebuild (npm run build).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
