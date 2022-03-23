import { lexiconTopics } from "lexicon-data";
import { StatePlaying, StateResults, StateStart } from "./components";
import { theme } from "./theme";
import { userKey } from "./utils";
import { ui } from "./ui";
import { GameResponse, GameRole, GameState, GameTopics } from "./types";

const { widget, activeUsers, currentUser } = figma;
const { AutoLayout, useEffect, useSyncedMap, useSyncedState } = widget;

export const activeImposterCount = (players: SyncedMap<ActiveUser>) =>
  Math.max(1, Math.round((1 / 3) * players.size));

function Lexicon() {
  const killsMap = useSyncedMap<string[]>("kills");
  const playersMap = useSyncedMap<ActiveUser>("players");
  const responsesMap = useSyncedMap<GameResponse>("responses");
  const rolesMap = useSyncedMap<GameRole>("roles");
  const votesMap = useSyncedMap<string>("votes");
  const scoresMap = useSyncedMap<number>("scores");
  const [constraint, setConstraint] = useSyncedState<string | null>(
    "constraint",
    null
  );
  const [state, setState] = useSyncedState<GameState>("state", "start");
  const [topics, setTopics] = useSyncedState<GameTopics | null>("topics", null);

  useEffect(() => {
    figma.ui.onmessage = ({ value, sessionId, store }) => {
      switch (store) {
        case "responses":
          responsesMap.set(sessionId, { value, time: Date.now() });
          break;
      }
    };
  });

  const handleBoot = (sessionId: number) => {
    playersMap.delete(sessionId.toString());
  };

  const handleJoin = () => {
    const sessionId = userKey(currentUser);
    const user = activeUsers.find((user) => userKey(user) === sessionId);
    if (user) {
      playersMap.set(sessionId, user);
    }
  };

  const handleStart = () => {
    killsMap.keys().forEach((key) => killsMap.delete(key));
    responsesMap.keys().forEach((key) => responsesMap.delete(key));
    rolesMap.keys().forEach((key) => rolesMap.delete(key));
    votesMap.keys().forEach((key) => votesMap.delete(key));
    const imposterCount = activeImposterCount(playersMap);
    const ids = playersMap.values().map((user) => {
      rolesMap.set(userKey(user), "agent");
      return userKey(user);
    });
    const imposterIds: string[] = [];
    while (imposterIds.length < imposterCount) {
      const id = ids.splice(Math.floor(Math.random() * ids.length))[0];
      imposterIds.push(id);
      rolesMap.set(id, "imposter");
    }
    const constraints = [
      "Anything Goes",
      "A Question",
      "A Destination",
      "A Person",
      "3-Word Phrase",
    ];
    const clonedTopics = lexiconTopics.map((a) => [...a]);
    const chosen: string[] = [];
    while (chosen.length < 3) {
      const group =
        clonedTopics[Math.floor(Math.random() * clonedTopics.length)];
      const index = Math.floor(Math.random() * group.length);
      chosen.push(group.splice(index, 1)[0]);
    }
    setConstraint(constraints[Math.floor(Math.random() * constraints.length)]);
    setTopics({ a: chosen[0], b: chosen[1], c: chosen[2] });
    setState("playing");
  };

  const handleVote = (votedId: string) => {
    votesMap.set(userKey(currentUser), votedId);
    if (votesMap.entries().length >= playersMap.size) {
      handleVotesEnd();
    }
  };

  const handleVotesEnd = () => {
    let max = 0;
    const playerToVoted: { [k: string]: string[] } = {};
    const voteResult = votesMap
      .entries()
      .reduce<{ [k: string]: number }>((votes, [voterId, votedId]) => {
        votes[votedId] = votes[votedId] || 0;
        votes[votedId]++;
        playerToVoted[votedId] = playerToVoted[votedId] || [];
        playerToVoted[votedId].push(voterId);
        max = Math.max(max, votes[votedId]);
        return votes;
      }, {});
    for (let id in voteResult) {
      if (voteResult[id] === max) {
        killsMap.set(id, playerToVoted[id]);
      }
    }
    playersMap.values().forEach((user) => {
      const key = userKey(user);
      const existing = scoresMap.get(key) || 0;
      const score = rolesMap.get(key) === "imposter" ? 2 : 1;
      if (killsMap.get(key)) {
        scoresMap.set(key, existing);
      } else {
        scoresMap.set(key, existing + score);
      }
    });
    setState("results");
  };

  const handleDone = () => setState("start");

  return (
    <AutoLayout
      cornerRadius={theme.block.md}
      direction="vertical"
      fill={theme.color.background}
      stroke={theme.color.text}
      strokeWidth={theme.spacing.sm}
      padding={theme.spacing.lg}
      spacing={theme.spacing.md}
      width="hug-contents"
    >
      {state === "start" ? (
        <StateStart
          onBoot={handleBoot}
          onJoin={handleJoin}
          onStart={handleStart}
          players={playersMap}
        />
      ) : null}
      {state === "playing" && topics ? (
        <StatePlaying
          onResponse={() =>
            new Promise(() =>
              figma.showUI(ui(topics, constraint, rolesMap, currentUser), {
                height: 300,
                width: 400,
              })
            )
          }
          onVote={handleVote}
          players={playersMap}
          responses={responsesMap}
          topics={topics}
          votes={votesMap}
        />
      ) : null}
      {state === "results" && topics ? (
        <StateResults
          kills={killsMap}
          onDone={handleDone}
          players={playersMap}
          roles={rolesMap}
          scores={scoresMap}
          topics={topics}
        />
      ) : null}
    </AutoLayout>
  );
}

widget.register(Lexicon);
