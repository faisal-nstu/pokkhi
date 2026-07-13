export interface BirdSpecies {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  region: string;
  habitat: string;
  funFact: string;
  imageUrl: string;
  soundUrl: string;
  callType: string; // song, call, screech, hoot, etc.
  description: string;
}
