import { activeImposterCount } from "../code";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { theme } from "../theme";

const { widget } = figma;
const { AutoLayout, Text } = widget;

interface Props {
  onBoot(sessionId: number): void;
  onJoin(): void;
  onStart(): void;
  players: SyncedMap<ActiveUser>;
}

export const StateStart = ({ onBoot, onJoin, onStart, players }: Props) => {
  const minPlayers = 1;
  const playersNeeded = minPlayers - players.size;
  const ready = players.size >= minPlayers;
  const imposterCount = activeImposterCount(players);
  return (
    <AutoLayout
      direction="vertical"
      fill={theme.color.background}
      horizontalAlignItems="center"
      spacing={theme.spacing.md}
      verticalAlignItems="center"
    >
      <Text
        fill={theme.color.text}
        fontSize={theme.text.lg}
        fontWeight="extra-bold"
      >
        Lexicon Standoff
      </Text>
      {players.size ? (
        <AutoLayout
          spacing={theme.spacing.sm}
          horizontalAlignItems="center"
          width="fill-parent"
        >
          {players.values().map((player) => (
            <Avatar
              key={player.sessionId}
              onClick={() => onBoot(player.sessionId)}
              round={true}
              src={player.photoUrl}
            />
          ))}
        </AutoLayout>
      ) : null}

      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        spacing={theme.spacing.sm}
        width="fill-parent"
      >
        <Button onClick={onJoin}>Join</Button>
        {ready ? <Button onClick={onStart}>Start Game</Button> : null}
        <Text fontSize={theme.text.sm} fill={theme.color.text} italic={true}>
          {ready
            ? `there will be ${imposterCount} imposter${
                imposterCount === 1 ? "" : "s"
              }`
            : `waiting for ${playersNeeded}...`}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
};
