/**
 * Read-only ingredient-almanac content for the board footer.
 *
 * The entries intentionally use generic ingredient names. They describe the
 * ingredients and preparation methods, never a commercial recipe or product.
 */
export interface IceNote {
  ingredient: string;
  fact: string;
  flavor: string;
  chaiRole: string;
  source: string;
  harvest: string;
}

interface IceNoteProfile {
  flavor: string;
  chaiRole: string;
  source: string;
  harvest: string;
}

const noteSet = (ingredient: string, profile: IceNoteProfile, facts: readonly string[]): readonly IceNote[] =>
  facts.map((fact) => ({ ingredient, fact, ...profile }));

export const ICE_NOTES: readonly IceNote[] = [
  ...noteSet("Cardamom", { flavor: "Floral, citrusy warmth", chaiRole: "Lifts the spice blend", source: "Tropical South Asian farms", harvest: "Pods picked, then dried" }, [
    "Green cardamom keeps its tiny seeds inside a papery pod, which helps protect its fragrant oils.",
    "Cardamom pods are picked and dried; gentle drying helps preserve their color and aroma.",
    "The warm, almost citrusy character comes from aromatic oils in both the seeds and the pod.",
  ]),
  ...noteSet("Black Tea", { flavor: "Malty, brisk, tannic", chaiRole: "Builds the tea backbone", source: "Camellia sinensis gardens", harvest: "Leaves plucked and oxidized" }, [
    "Black, green, and oolong teas all begin as leaves from the Camellia sinensis plant.",
    "For black tea, the leaves are allowed to oxidize fully, which deepens their color and malty character.",
    "Rolling or crushing tea leaves exposes their contents to oxygen and starts the oxidation process.",
  ]),
  ...noteSet("Ginger", { flavor: "Peppery, bright heat", chaiRole: "Adds a fresh spark", source: "Tropical rhizome fields", harvest: "Rhizomes lifted and washed" }, [
    "Ginger is a rhizome: a horizontal underground stem, not a root.",
    "A ginger plant stores energy in its branching rhizome, growing joint by joint below the soil.",
    "The lively bite of fresh ginger comes largely from compounds called gingerols.",
  ]),
  ...noteSet("Star Anise", { flavor: "Sweet, licorice-like", chaiRole: "Adds a high warm note", source: "Evergreen orchards in East Asia", harvest: "Fruit picked green, then dried" }, [
    "Star anise is a dried fruit, not a seed; each point of the star is a small fruit segment.",
    "The star-shaped fruit is picked before it is fully ripe, then dried until firm and fragrant.",
    "Its sweet licorice-like aroma comes from anethole, an aromatic oil also found in anise.",
  ]),
  ...noteSet("Oat Milk", { flavor: "Mild, cereal, creamy", chaiRole: "Softens the spice body", source: "Temperate oat fields", harvest: "Grain cut, threshed, and milled" }, [
    "Oat milk starts with oats blended with water and strained into a smooth, pale liquid.",
    "Oats naturally contain soluble fiber called beta-glucan, which contributes to a silky texture.",
    "Some oat-milk methods use enzymes to break down part of the oat starch into smaller sugars.",
  ]),
  ...noteSet("Raw Cane Sugar", { flavor: "Golden, lightly molassesy", chaiRole: "Rounds sweetness", source: "Tropical cane fields", harvest: "Stalks cut, crushed, crystallized" }, [
    "Cane sugar begins as juice pressed from tall sugarcane stalks.",
    "The juice is clarified and concentrated until sucrose forms crystals.",
    "A trace of molasses left with the crystals gives less-refined cane sugar its warm golden color.",
  ]),
  ...noteSet("Ice", { flavor: "Clean and cooling", chaiRole: "Keeps the chai iced", source: "Clean potable water", harvest: "Water frozen into cubes" }, [
    "When water freezes, its molecules arrange into an open crystal structure.",
    "That open structure makes ice less dense than liquid water, which is why ice floats.",
    "A generously iced drink stays cold because melting ice absorbs heat from the liquid around it.",
  ]),
  ...noteSet("Water", { flavor: "Neutral", chaiRole: "Carries tea and spice", source: "Treated potable water", harvest: "Collected, treated, then brewed" }, [
    "Water is the quiet carrier that dissolves and carries tea and spice flavors into the cup.",
    "Steep time and temperature both change how quickly tea and spices give up their soluble flavor compounds.",
    "Pouring a finished concentrate over ice cools it quickly while keeping the drink firmly iced.",
  ]),
  ...noteSet("Black Pepper", { flavor: "Sharp, tingly heat", chaiRole: "Balances sweetness", source: "Tropical pepper vines", harvest: "Green berries picked and dried" }, [
    "A black peppercorn is the dried berry of a climbing pepper vine.",
    "Pepper berries are harvested green, then dried until their skins darken and wrinkle.",
    "Piperine is the compound responsible for black pepper's recognizable, tingly heat.",
  ]),
  ...noteSet("Cinnamon", { flavor: "Woody, sweet warmth", chaiRole: "Sets the cozy base", source: "Evergreen bark groves", harvest: "Young shoots cut and peeled" }, [
    "Cinnamon is made from the inner bark of selected evergreen tree shoots.",
    "As thin strips of bark dry, they curl naturally into the familiar quill shape.",
    "Cinnamaldehyde is the aromatic compound most closely associated with cinnamon's warm scent.",
  ]),
  ...noteSet("Cloves", { flavor: "Sweet, intense spice", chaiRole: "Deepens the blend", source: "Tropical clove trees", harvest: "Unopened buds picked and dried" }, [
    "Cloves are unopened flower buds harvested before they bloom.",
    "The buds are dried until they become the small, dark, nail-shaped spice used in chai blends.",
    "Eugenol is a major aromatic compound in clove oil and gives cloves their sweet-spicy intensity.",
  ]),
  ...noteSet("Natural Flavors", { flavor: "Blend-specific aroma", chaiRole: "Rounds the finish", source: "Plant, spice, or dairy materials", harvest: "Extracted and blended" }, [
    "Natural flavors are an ingredient-label category, not one single crop or spice.",
    "The category can include flavoring materials derived from plants, spices, fruits, herbs, or dairy ingredients.",
    "A small amount of a flavor extract can round out a blend without changing its visible texture.",
  ]),
  ...noteSet("Cane Sugar", { flavor: "Clean, caramel sweetness", chaiRole: "Balances spice heat", source: "Tropical cane fields", harvest: "Stalks cut, crushed, and boiled" }, [
    "Sugarcane stores sucrose in its fibrous stalk rather than in a fruit.",
    "Mills crush the stalks to release cane juice before the juice is filtered and concentrated.",
    "As concentrated cane juice cools, sucrose molecules organize into crystals.",
  ]),
  ...noteSet("Honey", { flavor: "Floral, mellow sweetness", chaiRole: "Adds a round note", source: "Beehives near flowering plants", harvest: "Bees gather nectar; comb is collected" }, [
    "Honey begins as floral nectar gathered by bees.",
    "Bees reduce nectar's water content in the hive, concentrating the sugars into honey.",
    "The flower sources available to bees influence honey's color, aroma, and flavor.",
  ]),
  ...noteSet("Ginger Juice", { flavor: "Fresh, peppery lift", chaiRole: "Boosts ginger presence", source: "Tropical rhizome fields", harvest: "Rhizomes washed and pressed" }, [
    "Ginger juice is made by crushing or pressing fresh ginger rhizome to release its flavorful liquid.",
    "The juice carries ginger's bright, peppery character into a blend without adding pieces of root.",
    "Fresh ginger's pungency comes from the same gingerol-rich rhizome used for dried ginger spice.",
  ]),
  ...noteSet("Vanilla Extract", { flavor: "Creamy, floral, soft", chaiRole: "Smooths sharp spice", source: "Tropical orchid vines", harvest: "Pods cured after harvest" }, [
    "Vanilla comes from the long seed pods of a tropical orchid.",
    "The pods are cured after harvest; that slow process develops vanilla's familiar deep aroma.",
    "Vanillin is the best-known aroma compound in vanilla, though a real extract contains many more notes.",
  ]),
  ...noteSet("Citric Acid", { flavor: "Bright, clean tartness", chaiRole: "Sharpens sweet notes", source: "Citrus fruit or sugar fermentation", harvest: "Fruit pressed or acid purified" }, [
    "Citric acid occurs naturally in citrus fruits such as lemons and limes.",
    "In a drink, a small amount of citric acid adds a clean tart note that can sharpen sweeter flavors.",
    "Commercial food-grade citric acid is commonly produced by fermenting sugars, then purifying the result.",
  ]),
  ...noteSet("Spice Extracts", { flavor: "Concentrated aroma", chaiRole: "Distributes spice evenly", source: "Harvested spices and botanicals", harvest: "Spices extracted into liquid" }, [
    "A spice extract concentrates aroma compounds from a spice into a liquid or oil-based ingredient.",
    "Extracts can be made with methods that use water, alcohol, oil, carbon dioxide, or combinations of them.",
    "Because extracts are concentrated, very small amounts can distribute a spice note evenly through a drink.",
  ]),
  ...noteSet("Nonfat Ultra-Filtered Milk", { flavor: "Clean dairy, gentle creaminess", chaiRole: "Adds body without heaviness", source: "Dairy farms", harvest: "Milk collected, separated, filtered" }, [
    "Nonfat milk has most of its cream removed while retaining water, protein, minerals, and natural milk sugars.",
    "Ultra-filtration uses fine membranes to separate some milk components by size.",
    "Filtering and blending can change the balance of milk proteins and sugars without turning it into a plant-based drink.",
  ]),
  ...noteSet("Lactase Enzyme", { flavor: "No direct flavor; sweeter finish", chaiRole: "Makes the milk lactose-free", source: "Cultured enzyme production", harvest: "Fermented, then purified" }, [
    "Lactase is an enzyme that splits lactose, the natural sugar in milk, into glucose and galactose.",
    "Adding lactase before packaging is how lactose-free milk is made from dairy milk.",
    "Because glucose and galactose taste sweeter than lactose, lactose-free milk can seem sweeter without extra sugar.",
  ]),
  ...noteSet("Vitamin A Palmitate", { flavor: "Neutral", chaiRole: "Restores milk fortification", source: "Food-grade vitamin supply", harvest: "Manufactured and measured" }, [
    "Vitamin A palmitate is a stable form of vitamin A used in food fortification.",
    "It pairs vitamin A with palmitic acid, a fatty acid, to make a form that stores well.",
    "Vitamin A is fat-soluble, so it is commonly restored to low-fat and nonfat dairy products.",
  ]),
  ...noteSet("Vitamin D3", { flavor: "Neutral", chaiRole: "Completes milk fortification", source: "Food-grade vitamin supply", harvest: "Manufactured and measured" }, [
    "Vitamin D3 is also called cholecalciferol.",
    "In fortified milk, vitamin D is added in a measured amount rather than occurring as a chai spice.",
    "Vitamin D helps the body absorb calcium from foods and drinks.",
  ]),
] as const;

/** Select a random entry while avoiding an immediate repeat. UI-only; never game math. */
export function nextIceNoteIndex(previousIndex: number, random = Math.random): number {
  if (ICE_NOTES.length < 2) return 0;
  const boundedRandom = Math.min(Math.max(random(), 0), 0.9999999999999999);
  const candidate = Math.floor(boundedRandom * (ICE_NOTES.length - 1));
  return candidate >= previousIndex ? candidate + 1 : candidate;
}
