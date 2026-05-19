export interface Creator {
  id: string;
  name: string;
  slug: string;
  avatar_url: string;
  category: "music" | "internet" | "content";
  current_price: number;
  price_change_24h: number;
  price_change_pct: number;
  sparkline: number[];
  ai_context: string;
}

// Helper to generate a somewhat realistic sparkline (random walk)
function generateSparkline(startPrice: number, points: number = 20) {
  let current = startPrice;
  const data = [current];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * (startPrice * 0.05); // max 5% jump per point
    current = Math.max(1, current + change); // floor at 1
    data.push(current);
  }
  return data;
}

export const seedCreators: Creator[] = [
  {
    id: "1",
    name: "Taylor Swift",
    slug: "taylor-swift",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png",
    category: "music",
    current_price: 142.50,
    price_change_24h: 3.20,
    price_change_pct: 2.3,
    sparkline: generateSparkline(139.30),
    ai_context: "Up 2.3% — Surprise acoustic set announcement driving massive social volume.",
  },
  {
    id: "2",
    name: "MrBeast",
    slug: "mrbeast",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/MrBeast_2023_%28cropped%29.jpg/640px-MrBeast_2023_%28cropped%29.jpg",
    category: "internet",
    current_price: 210.80,
    price_change_24h: -1.50,
    price_change_pct: -0.7,
    sparkline: generateSparkline(212.30),
    ai_context: "Down 0.7% — Slight dip in daily views, but core holding remains strong.",
  },
  {
    id: "3",
    name: "Kai Cenat",
    slug: "kai-cenat",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kai_Cenat_2023.jpg/640px-Kai_Cenat_2023.jpg",
    category: "internet",
    current_price: 85.40,
    price_change_24h: 12.30,
    price_change_pct: 16.8,
    sparkline: generateSparkline(73.10),
    ai_context: "Up 16.8% — Broke concurrent viewership record on Twitch during marathon stream.",
  },
  {
    id: "4",
    name: "Billie Eilish",
    slug: "billie-eilish",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Billie_Eilish_at_the_2024_Golden_Globes_%281%29.jpg/640px-Billie_Eilish_at_the_2024_Golden_Globes_%281%29.jpg",
    category: "music",
    current_price: 112.90,
    price_change_24h: 0.80,
    price_change_pct: 0.7,
    sparkline: generateSparkline(112.10),
    ai_context: "Flat — Steady streaming numbers ahead of rumored album drop.",
  },
  {
    id: "5",
    name: "Pedro Pascal",
    slug: "pedro-pascal",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pedro_Pascal_by_Gage_Skidmore.jpg/640px-Pedro_Pascal_by_Gage_Skidmore.jpg",
    category: "content",
    current_price: 94.20,
    price_change_24h: 5.10,
    price_change_pct: 5.7,
    sparkline: generateSparkline(89.10),
    ai_context: "Up 5.7% — Cast announcement for major sci-fi franchise driving cultural relevance.",
  }
];
