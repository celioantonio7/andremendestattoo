import { art } from "./content";
import { ExpandingMosaic } from "./ExpandingMosaic";
const details = [
  { ...art[4]!, src: "/works/detail-mask.webp" },
  {
    name: "Faith — composição autoral",
    src: "/works/detail-1.webp",
    source: "https://www.instagram.com/andremndes/reel/DdKgm_spUkz/",
  },
  {
    name: "Onibaba e Namakubi",
    src: "/works/detail-3.webp",
    source: "https://www.instagram.com/andremndes/reel/Dc6LjluRHpu/",
  },
  art[5]!,
  art[7]!,
  {
    name: "Itachi Uchiha — projeto autoral",
    src: "/works/detail-2.webp",
    source: "https://www.instagram.com/andremndes/reel/DdAIuouJJW4/",
  },

  art[1]!,
];
export function DiveSequence() {
  return <ExpandingMosaic items={details} title="APROXIME O OLHAR." />;
}
