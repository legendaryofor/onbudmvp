import { NextResponse } from "next/server";
import { createClient } from "@/server/db/server";

const seedData = [
  // Tier 1
  { name: "Taylor Swift", category: "music", tier: 1 },
  { name: "Drake", category: "music", tier: 1 },
  { name: "Bad Bunny", category: "music", tier: 1 },
  { name: "The Weeknd", category: "music", tier: 1 },
  { name: "Sabrina Carpenter", category: "music", tier: 1 },
  { name: "Billie Eilish", category: "music", tier: 1 },
  { name: "Bruno Mars", category: "music", tier: 1 },
  { name: "Olivia Rodrigo", category: "music", tier: 1 },
  { name: "Ariana Grande", category: "music", tier: 1 },
  { name: "Travis Scott", category: "music", tier: 1 },
  { name: "Beyoncé", category: "music", tier: 1 },
  { name: "SZA", category: "music", tier: 1 },
  { name: "Tems", category: "music", tier: 1 },
  { name: "Rema", category: "music", tier: 1 },
  { name: "Wizkid", category: "music", tier: 1 },
  { name: "MrBeast", category: "internet", tier: 1 },
  { name: "Kai Cenat", category: "internet", tier: 1 },
  { name: "IShowSpeed", category: "internet", tier: 1 },
  { name: "KSI", category: "internet", tier: 1 },
  { name: "Sidemen (YouTube group)", category: "internet", tier: 1 }, // Added disambiguation for Wikipedia
  { name: "Pedro Pascal", category: "content", tier: 1 },
  { name: "Zendaya", category: "content", tier: 1 },
  { name: "Timothée Chalamet", category: "content", tier: 1 },
  { name: "Sydney Sweeney", category: "content", tier: 1 },
  { name: "Lewis Hamilton", category: "content", tier: 1 },
  // Tier 2
  { name: "Sombr", category: "music", tier: 2 },
  { name: "Alex Warren", category: "music", tier: 2 },
  { name: "Chappell Roan", category: "music", tier: 2 },
  { name: "Tate McRae", category: "music", tier: 2 },
  { name: "Doechii", category: "music", tier: 2 },
  { name: "Ravyn Lenae", category: "music", tier: 2 },
  { name: "Lola Young", category: "music", tier: 2 },
  { name: "Teddy Swims", category: "music", tier: 2 },
  { name: "Benson Boone", category: "music", tier: 2 },
  { name: "Olivia Dean", category: "music", tier: 2 },
  { name: "KATSEYE", category: "music", tier: 2 },
  { name: "Jack Harlow", category: "music", tier: 2 },
  { name: "Beta Squad", category: "internet", tier: 2 },
  { name: "Hasan Piker", category: "internet", tier: 2 },
  { name: "Theo Von", category: "internet", tier: 2 },
  { name: "Druski", category: "internet", tier: 2 },
  { name: "Alix Earle", category: "internet", tier: 2 },
  { name: "Emma Chamberlain", category: "internet", tier: 2 },
  { name: "Pokimane", category: "internet", tier: 2 },
  { name: "Bobbi Althoff", category: "internet", tier: 2 },
  { name: "Brittany Broski", category: "internet", tier: 2 },
  { name: "Quenlin Blackwell", category: "internet", tier: 2 },
  { name: "Jenna Ortega", category: "content", tier: 2 },
  { name: "Ayo Edebiri", category: "content", tier: 2 },
  { name: "Jacob Elordi", category: "content", tier: 2 },
];

async function getWikiImage(name: string) {
  try {
    const encodedName = encodeURIComponent(name);
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodedName}&prop=pageimages&format=json&pithumbsize=1000`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (error) {
    console.error(`Failed to fetch image for ${name}`, error);
  }
  // Fallback to UI avatars if wiki fails
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=512`;
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET() {
  const supabase = await createClient();
  
  const results = [];
  
  for (const c of seedData) {
    const avatar_url = await getWikiImage(c.name);
    const slug = generateSlug(c.name);
    
    // Generate random starting price between 20 and 200
    const current_price = +(Math.random() * 180 + 20).toFixed(2);
    const fundamental_anchor = +(current_price * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2);
    
    // Check if exists
    const { data: existing } = await supabase.from('creators').select('id').eq('slug', slug).single();
    
    let dbRes;
    const cleanName = c.name.replace(" (YouTube group)", "");
    
    if (existing) {
      dbRes = await supabase.from('creators').update({
        avatar_url,
        current_price,
        fundamental_anchor,
      }).eq('id', existing.id);
    } else {
      dbRes = await supabase.from('creators').insert({
        name: cleanName,
        slug,
        avatar_url,
        tier: c.tier,
        category: c.category,
        current_price,
        fundamental_anchor,
      });
    }
    
    results.push({ name: cleanName, success: !dbRes.error, error: dbRes.error });
  }

  return NextResponse.json({ message: "Seed completed", results });
}
