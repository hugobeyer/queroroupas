// Mock data for Quero Roupas fashion store

export const featuredProducts = [
  {
    id: 1,
    name: "Vestido Elegante",
    price: 299.90,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
    category: "Vestidos",
    isNew: true
  },
  {
    id: 2,
    name: "Blusa Chiffon",
    price: 149.90,
    image: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=500&q=80",
    category: "Blusas",
    isNew: true
  },
  {
    id: 3,
    name: "Saia Midi",
    price: 189.90,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80",
    category: "Saias",
    isNew: false
  },
  {
    id: 4,
    name: "Conjunto Social",
    price: 399.90,
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&q=80",
    category: "Conjuntos",
    isNew: true
  }
];

export const allProducts = [
  ...featuredProducts,
  {
    id: 5,
    name: "Calça Alfaiataria",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80",
    category: "Calças",
    isNew: false
  },
  {
    id: 6,
    name: "Blazer Premium",
    price: 349.90,
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
    category: "Blazers",
    isNew: true
  },
  {
    id: 7,
    name: "Top Cropped",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&q=80",
    category: "Tops",
    isNew: false
  },
  {
    id: 8,
    name: "Vestido Longo",
    price: 329.90,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80",
    category: "Vestidos",
    isNew: true
  },
  {
    id: 9,
    name: "Camisa Seda",
    price: 199.90,
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&q=80",
    category: "Blusas",
    isNew: false
  },
  {
    id: 10,
    name: "Shorts Elegante",
    price: 139.90,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80",
    category: "Shorts",
    isNew: false
  },
  {
    id: 11,
    name: "Jaqueta Couro",
    price: 449.90,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
    category: "Jaquetas",
    isNew: true
  },
  {
    id: 12,
    name: "Vestido Cocktail",
    price: 379.90,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
    category: "Vestidos",
    isNew: true
  }
];

export const categories = [
  "Todos",
  "Vestidos",
  "Blusas",
  "Calças",
  "Saias",
  "Conjuntos",
  "Blazers",
  "Tops",
  "Shorts",
  "Jaquetas"
];

export const heroData = {
  title: "Nova Coleção",
  subtitle: "Outono/Inverno 2025",
  description: "Elegância e sofisticação em cada peça",
  bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
};