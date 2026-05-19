const fs = require('fs');

const seedData = [
  { name: "Taylor Swift" },
  { name: "Drake" },
  { name: "Bad Bunny" },
  { name: "The Weeknd" },
  { name: "Sabrina Carpenter" },
  { name: "Billie Eilish" },
  { name: "Bruno Mars" },
  { name: "Olivia Rodrigo" },
  { name: "Ariana Grande" },
  { name: "Travis Scott" },
  { name: "Beyoncé" },
  { name: "SZA" },
  { name: "Tems" },
  { name: "Rema" },
  { name: "Wizkid" },
  { name: "MrBeast" },
  { name: "Kai Cenat" },
  { name: "IShowSpeed" },
  { name: "KSI" },
  { name: "Sidemen (YouTube group)" },
  { name: "Pedro Pascal" },
  { name: "Zendaya" },
  { name: "Timothée Chalamet" },
  { name: "Sydney Sweeney" },
  { name: "Lewis Hamilton" },
  { name: "Sombr" },
  { name: "Alex Warren" },
  { name: "Chappell Roan" },
  { name: "Tate McRae" },
  { name: "Doechii" },
  { name: "Ravyn Lenae" },
  { name: "Lola Young" },
  { name: "Teddy Swims" },
  { name: "Benson Boone" },
  { name: "Olivia Dean" },
  { name: "KATSEYE" },
  { name: "Jack Harlow" },
  { name: "Beta Squad" },
  { name: "Hasan Piker" },
  { name: "Theo Von" },
  { name: "Druski" },
  { name: "Alix Earle" },
  { name: "Emma Chamberlain" },
  { name: "Pokimane" },
  { name: "Bobbi Althoff" },
  { name: "Brittany Broski" },
  { name: "Quenlin Blackwell" },
  { name: "Jenna Ortega" },
  { name: "Ayo Edebiri" },
  { name: "Jacob Elordi" }
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function getWikiImage(name) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=1000`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (e) {}
  const cleanName = name.replace(" (YouTube group)", "");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=00FF66&color=000`;
}

async function run() {
  let sql = "-- Run this in Supabase SQL Editor to update avatars with real Wikipedia images\n\n";
  for (const c of seedData) {
    const img = await getWikiImage(c.name);
    const cleanName = c.name.replace(" (YouTube group)", "");
    const slug = generateSlug(cleanName);
    sql += `UPDATE public.creators SET avatar_url = '${img}' WHERE slug = '${slug}';\n`;
  }
  fs.writeFileSync('supabase/migrations/0002_update_avatars.sql', sql);
  console.log("SQL script generated!");
}

run();
