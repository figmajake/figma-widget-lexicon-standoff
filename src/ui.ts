import { GameRole, GameTopics } from "./types";
import { Theme, theme } from "./theme";
import { randomOrderTopics, userKey } from "./utils";

export function ui(
  topics: GameTopics,
  constraint: string | null,
  roles: SyncedMap<GameRole>,
  currentUser: User | null
) {
  const sessionId = userKey(currentUser);
  const role = roles.get(sessionId) || "agent";
  const shownTopics = randomOrderTopics(role, topics);

  return `
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
`;
}

function uiStyle({ block, color, text, spacing }: Theme) {
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
}
