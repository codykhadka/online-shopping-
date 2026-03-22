export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  rating: number;
  inStock: boolean;
  features: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Pure Raw Honey",
    description: "100% natural and unprocessed raw honey harvested directly from wild forest bees.",
    price: 15.99,
    category: "Honey",
    image: "/images/honey_jar.png",
    rating: 4.9,
    inStock: true,
    features: [
      "No added sugar",
      "Rich in antioxidants",
      "Sustainably sourced"
    ]
  },
  {
    id: "2",
    name: "A2 Cow Ghee",
    description: "Traditional biloba churned A2 cow ghee packed with rich aroma and nutritional benefits.",
    price: 24.99,
    category: "Ghee & Oils",
    image: "/images/cow_ghee.png",
    rating: 5.0,
    inStock: true,
    features: [
      "Made from A2 cow milk",
      "Traditional bilona method",
      "Rich in Omega-3"
    ]
  },
  {
    id: "3",
    name: "Organic Jaggery Powder",
    description: "Chemical-free jaggery powder, a perfect healthy alternative to refined white sugar.",
    price: 8.99,
    category: "Jaggery",
    image: "/images/jaggery_cubes.png",
    rating: 4.8,
    inStock: true,
    features: [
      "No artificial colors",
      "Rich in iron",
      "Unrefined"
    ]
  },
  {
    id: "4",
    name: "Cold Pressed Mustard Oil",
    description: "100% pure cold-pressed mustard oil retaining its natural pungency and health benefits.",
    price: 12.49,
    category: "Ghee & Oils",
    image: "/images/mustard_oil.png",
    rating: 4.6,
    inStock: true,
    features: [
      "Cold-pressed extraction",
      "High smoking point",
      "Cholesterol free"
    ]
  },
  {
    id: "5",
    name: "Unsweetened Peanut Butter",
    description: "Crunchy, all-natural peanut butter made from 100% roasted peanuts with zero additives.",
    price: 10.99,
    category: "Peanut Butter",
    image: "/images/peanut_butter.png",
    rating: 4.7,
    inStock: true,
    features: [
      "100% Roasted Peanuts",
      "No added oil",
      "High protein content"
    ]
  },
  {
    id: "6",
    name: "Wild Forest Honey",
    description: "Dark, robust honey collected from deep forest flora with high medicinal value.",
    price: 18.99,
    category: "Honey",
    image: "/images/honey_jar.png",
    rating: 4.9,
    inStock: false,
    features: [
      "Immunity booster",
      "Unpasteurized",
      "Direct from forest tribes"
    ]
  },
  {
    id: "7",
    name: "Virgin Coconut Oil",
    description: "Cold-pressed virgin coconut oil, excellent for cooking, baking, and skin care.",
    price: 16.50,
    category: "Ghee & Oils",
    image: "/images/cow_ghee.png",
    rating: 4.8,
    inStock: true,
    features: [
      "Extra virgin",
      "Multi-purpose usage",
      "Non-refined"
    ]
  },
  {
    id: "8",
    name: "Jaggery Cubes",
    description: "Convenient, bite-sized jaggery cubes made from naturally grown sugarcane.",
    price: 9.99,
    category: "Jaggery",
    image: "/images/jaggery_cubes.png",
    rating: 4.5,
    inStock: true,
    features: [
      "Easy to use cubes",
      "Healthy sweetener",
      "Farm fresh sugarcane"
    ]
  }
];

export const categories = [
  "All",
  "Honey",
  "Ghee & Oils",
  "Jaggery",
  "Peanut Butter"
];