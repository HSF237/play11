// Sample jerseys used in DEMO MODE (before Firebase is connected) and as a
// fallback if Firestore has no products yet. Once Nashid adds real products in
// the admin portal, those replace these automatically.

const seedProducts = [
  {
    id: 'demo-1',
    name: 'Madrid Home Authentic 25/26',
    club: 'Real Madrid',
    price: 1499,
    category: 'Club',
    sleeve: 'Half Sleeve',
    image:
      'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=800&q=80',
    description:
      'Match-grade home kit with moisture-wicking AeroWeave fabric and heat-pressed crest. Worn by legends, built for the modern game.',
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Bestseller',
    featured: true,
  },
  {
    id: 'demo-2',
    name: 'Barça Blaugrana Pro 25/26',
    club: 'FC Barcelona',
    price: 1599,
    category: 'Club',
    sleeve: 'Half Sleeve',
    image:
      'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=800&q=80',
    description:
      'Iconic stripes reimagined with a tailored athletic cut and breathable mesh ventilation zones.',
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'New',
    featured: true,
  },
  {
    id: 'demo-3',
    name: 'Albiceleste National Kit',
    club: 'Argentina',
    price: 1799,
    category: 'National',
    sleeve: 'Full Sleeve',
    image:
      'https://images.unsplash.com/photo-1670002375787-c4f33d7a9d59?auto=format&fit=crop&w=800&q=80',
    description:
      'Champions of the world. Premium national team jersey with embroidered three-star crest.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: 'Limited',
    featured: true,
  },
  {
    id: 'demo-4',
    name: 'Red Devils Home 25/26',
    club: 'Manchester United',
    price: 1399,
    category: 'Club',
    sleeve: 'Half Sleeve',
    image:
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
    description:
      'Classic red with a contemporary fit. Lightweight, durable, and ready for matchday.',
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true,
  },
  {
    id: 'demo-5',
    name: 'Citizens Sky Blue Pro',
    club: 'Manchester City',
    price: 1449,
    category: 'Club',
    sleeve: 'Full Sleeve',
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
    description:
      'Engineered for speed. The sky-blue pro kit with laser-cut ventilation and a streamlined collar.',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'demo-6',
    name: 'Les Bleus National Kit',
    club: 'France',
    price: 1749,
    category: 'National',
    sleeve: 'Half Sleeve',
    image:
      'https://images.unsplash.com/photo-1602197416893-9e6c0e2b8b3a?auto=format&fit=crop&w=800&q=80',
    description:
      'Deep navy national jersey with a golden crest and tonal detailing. Elegance meets performance.',
    sizes: ['M', 'L', 'XL'],
    badge: 'New',
  },
  {
    id: 'demo-7',
    name: 'Reds Anfield Retro 2005',
    club: 'Liverpool',
    price: 1349,
    category: 'Retro',
    sleeve: 'Full Sleeve',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    description:
      "You'll never walk alone. A retro tribute to the legendary Istanbul night — bold red, classic cut.",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: 'Retro',
  },
  {
    id: 'demo-8',
    name: 'Selecao Home Gold 25/26',
    club: 'Brazil',
    price: 1899,
    category: 'National',
    sleeve: 'Half Sleeve',
    image:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
    description:
      'The legendary canary yellow. Premium national jersey crafted for samba flair and elite comfort.',
    sizes: ['M', 'L', 'XL'],
    badge: 'Bestseller',
  },
]

export default seedProducts
