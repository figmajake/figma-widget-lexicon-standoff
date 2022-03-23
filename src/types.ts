export type GameResponse = { value: string; time: number };
export type GameRole = "agent" | "imposter";
export type GameState = "start" | "playing" | "results";
export type GameTopics = {
  a: string | null;
  b: string | null;
  c: string | null;
};
