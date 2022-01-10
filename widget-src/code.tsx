import { lexiconTopics } from "lexicon-data";
import { StatePlaying } from "./states/StatePlaying";
import { StateResults } from "./states/StateResults";
import { StateStart } from "./states/StateStart";
import { Theme, theme } from "./theme";
import { randomOrderTopics, userKey } from "./utils";

const { widget, activeUsers, currentUser } = figma;
const { AutoLayout, useEffect, useSyncedMap, useSyncedState } = widget;

export const activeImposterCount = (players: SyncedMap<ActiveUser>) =>
  Math.max(1, Math.round((1 / 3) * players.size));

export type GameResponse = { value: string; time: number };
export type GameRole = "agent" | "imposter";
export type GameState = "start" | "playing" | "results";
export type GameTopics = {
  a: string | null;
  b: string | null;
  c: string | null;
};

const uiStyle = ({ block, color, text, spacing }: Theme) => {
  const pxToRem = (px: number) => `${px / 16}rem`;
  return `
  <style>
  * {
    box-sizing: border-box;
    font-family: Helvetica, sans-serif;
    margin: 0;
  }
  body {
    background: ${color.background};
    color: ${color.text};
    text-align: center;
  }
  html, body, section {
    height: 100%;
  }
  section {
    box-shadow: inset 0 0 0 ${pxToRem(spacing.sm)} ${color.text};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
  }
  main {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
  }
  h1 {
    font-size: ${pxToRem(text.lg)};
    margin-bottom: ${pxToRem(spacing.sm)};
    margin-top: ${pxToRem(spacing.sm)};
  }
  p.mb {
    margin-bottom: ${pxToRem(spacing.md)};
  }
  button {
    margin-top: ${pxToRem(spacing.sm)};
  }
  input,
  button {
    appearance: none;
    background: ${color.text};
    border: none;
    border-radius: ${pxToRem(block.lg)};
    color: ${color.accent};
    display: inline-block;  
    font-weight: 900;
    outline: none;
    padding: ${pxToRem(spacing.sm)} ${pxToRem(spacing.md)};
    text-align: center;
  }

  input:focus-visible,
  button:focus-visible {
    box-shadow: 0 0 0 ${pxToRem(spacing.sm / 2)} ${color.accent};
  }
  </style>
`;
};

function loadResponseIframe(
  topics: GameTopics,
  constraint: string | null,
  roles: SyncedMap<GameRole>
) {
  const sessionId = userKey(currentUser);
  const role = roles.get(sessionId) || "agent";
  const shownTopics = randomOrderTopics(role, topics);

  figma.showUI(
    `
    ${uiStyle(theme)}
    <section>
      <main>
        <p><em>you are an <strong>${role.toUpperCase()}</strong>!</em></p>
        <h1>${shownTopics.map((a) => `“${a}”`).join("<br>")}</h1>
        <p class="mb"><em>${constraint?.toLowerCase()}</em></p>
      </main>
      <footer>
        <input id="input" type="text" required><br>
        <button id="button">Submit</button>
      </footer>
    </section>
    <script>
      const input = document.getElementById("input");
      const button = document.getElementById("button");
      button.addEventListener("click", () => {
        if (!input.value.trim()) {
          return;
        }
        const pluginMessage = { value: input.value, sessionId: "${sessionId}", store: "responses" };
        parent.postMessage({ pluginMessage }, '*');
        input.remove();
        button.remove();
      });
      input.focus();
    </script>
    `,
    { height: 300, width: 400 }
  );
}

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
            new Promise(() => loadResponseIframe(topics, constraint, rolesMap))
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
