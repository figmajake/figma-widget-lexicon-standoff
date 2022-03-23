import { GameResponse, GameRole, GameTopics } from "./code";

const topicDisplays: { [K in GameRole]: ("a" | "b" | "c")[][] } = {
  agent: [
    ["a", "b"],
    ["b", "a"],
  ],
  imposter: [
    ["a", "b", "c"],
    ["a", "c", "b"],
    ["b", "a", "c"],
    ["b", "c", "a"],
    ["c", "a", "b"],
    ["c", "b", "a"],
  ],
};

export const randomOrderTopics = (
  role: GameRole,
  topics: GameTopics
): (string | null)[] => {
  const source = topicDisplays[role];
  return source[Math.floor(Math.random() * source.length)].map(
    (a) => topics[a]
  );
};

export const userKey = (user: User | null) => (user?.sessionId || 0).toString();

export const sortedPlayersByScore = (
  scores: SyncedMap<number>,
  players: SyncedMap<ActiveUser>
): ActiveUser[] => {
  const memo: { [k: string]: number } = {};
  return players.values().sort((a, b) => {
    const aKey = userKey(a);
    const bKey = userKey(b);
    const scoreA = memo[aKey] || scores.get(userKey(a)) || 0;
    memo[aKey] = scoreA;
    const scoreB = memo[bKey] || scores.get(userKey(a)) || 0;
    memo[bKey] = scoreB;
    if (scoreA > scoreB) {
      return -1;
    }
    if (scoreB > scoreA) {
      return 1;
    }
    return 0;
  });
};

export const sortedPlayersByResponseTime = (
  responses: SyncedMap<GameResponse>,
  players: SyncedMap<ActiveUser>
): ActiveUser[] => {
  const memo: { [k: string]: number } = {};
  return players.values().sort((a, b) => {
    const aKey = userKey(a);
    const bKey = userKey(b);
    const responseA = memo[aKey] || responses.get(userKey(a))?.time || 0;
    memo[aKey] = responseA;
    const responseB = memo[bKey] || responses.get(userKey(a))?.time || 0;
    memo[bKey] = responseB;
    if (responseA > responseB) {
      return 1;
    }
    if (responseB > responseA) {
      return -1;
    }
    return 0;
  });
};
