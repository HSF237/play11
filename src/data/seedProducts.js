// Sample jerseys used in DEMO MODE (before Firebase is connected) and as a
// fallback if Firestore has no products yet. Once Nashid adds real products in
// the admin portal (with real photos), those replace these automatically.

const IMG = {
  ronaldo:
    'https://www.shutterstock.com/editorial/image-editorial/OfT1I6w8NfTeU4y8NzYxOA==/cristiano-ronaldo-real-madrid-points-440nw-9140847av.jpg',
  neymar:
    'https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/743/cached.offlinehbpl.hbpl.co.uk/news/OMC/NeymarNike-20140611105309134.jpg',
  retro: 'https://wallpaperaccess.com/full/11022590.jpg',
  bicycle: 'https://pbs.twimg.com/media/DeYCKikVQAIfrpm.jpg',
  beckham:
    'https://media.cnn.com/api/v1/images/stellar/prod/170810160912-david-beckham.jpg?q=w_3260,h_4763,x_0,y_0,c_fill',
}

const seedProducts = [
  {
    id: 'demo-1',
    name: 'Madrid Home Authentic 25/26',
    club: 'Real Madrid',
    price: 1499,
    category: 'Club',
    sleeve: 'Half Sleeve',
    image: IMG.ronaldo,
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
    image: IMG.bicycle,
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
    image: IMG.neymar,
    description:
      'Champions of the world. Premium national team jersey with embroidered three-star crest.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: 'Limited',
    limited: true,
    stockLeft: 1,
    featured: true,
  },
  {
    id: 'demo-4',
    name: 'Red Devils Home 25/26',
    club: 'Manchester United',
    price: 1399,
    category: 'Club',
    sleeve: 'Half Sleeve',
    image: IMG.beckham,
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
    image: IMG.beckham,
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
    image: IMG.bicycle,
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
    image: IMG.retro,
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
    image: IMG.neymar,
    description:
      'The legendary canary yellow. Premium national jersey crafted for samba flair and elite comfort.',
    sizes: ['M', 'L', 'XL'],
    badge: 'Bestseller',
  },
]

export default seedProducts
