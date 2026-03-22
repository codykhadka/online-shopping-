export interface HowToGuide {
  id: string;
  title: string;
  shortDescription: string;
  image: string;
  instructions: string[];
  tips: string[];
  ingredients?: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  timeToMake: string;
}

export const howToGuides: HowToGuide[] = [
  {
    id: "rice",
    title: "How to Make Perfect Fluffy Rice",
    shortDescription: "Master the fundamental skill of cooking perfect, non-sticky rice every single time.",
    image: "/images/rice_bowl.png",
    ingredients: [
      "1 cup long-grain white rice",
      "2 cups water",
      "1/2 teaspoon salt",
      "1 teaspoon butter or oil (optional)"
    ],
    instructions: [
      "Rinse the rice in a fine-mesh strainer under cold water until the water runs clear.",
      "Combine rice, water, salt, and butter in a medium saucepan.",
      "Bring the mixture to a boil over medium-high heat.",
      "Once boiling, reduce heat to low, cover the pot with a tight-fitting lid.",
      "Simmer for 18-20 minutes until water is absorbed.",
      "Remove from heat and let it sit, covered, for 5 minutes.",
      "Fluff with a fork and serve."
    ],
    tips: [
      "Don't peek! Keeping the lid on is crucial for steaming.",
      "Use a heavy-bottomed pot to prevent burning.",
      "For extra flavor, use chicken or vegetable broth instead of water."
    ],
    difficulty: "Easy",
    timeToMake: "25 mins"
  },
  {
    id: "honey-tea",
    title: "Soothing Honey Ginger Tea",
    shortDescription: "A perfect natural remedy for cold or just a relaxing evening drink.",
    image: "/images/honey_jar.png",
    ingredients: [
      "1 cup water",
      "1 inch fresh ginger, sliced",
      "1 tablespoon Pure Raw Honey",
      "1 squeeze of lemon juice"
    ],
    instructions: [
      "Boil water in a small pot with the ginger slices.",
      "Simmer for about 5-10 minutes depending on how strong you want the ginger.",
      "Pour into a mug, straining out the ginger.",
      "Let it cool slightly (about 1 minute) before adding honey to preserve its benefits.",
      "Stir in the honey and lemon juice."
    ],
    tips: [
      "Add a cinnamon stick for extra warmth.",
      "Do not add honey to boiling water as high heat can destroy its natural enzymes."
    ],
    difficulty: "Easy",
    timeToMake: "15 mins"
  },
  {
    id: "ghee-roast",
    title: "Perfect Ghee Roasted Veggies",
    shortDescription: "Elevate your daily vegetables with the rich aroma of A2 Cow Ghee.",
    image: "/images/cow_ghee.png",
    ingredients: [
      "2 cups seasonal vegetables (carrots, broccoli, potatoes)",
      "2 tablespoons A2 Cow Ghee",
      "Salt and pepper to taste",
      "1/2 teaspoon cumin seeds"
    ],
    instructions: [
      "Preheat your oven to 400°F (200°C).",
      "Melt the ghee if it's solid.",
      "Toss the chopped vegetables with ghee, salt, pepper, and cumin seeds.",
      "Spread them on a baking sheet in a single layer.",
      "Roast for 20-30 minutes, tossing halfway through, until golden and tender."
    ],
    tips: [
      "Make sure vegetables are dry before tossing with ghee for maximum crispiness.",
      "Don't overcrowd the pan."
    ],
    difficulty: "Medium",
    timeToMake: "40 mins"
  }
];
