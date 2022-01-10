import { GameRole, GameTopics } from "../code";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { theme } from "../theme";
import { Topic } from "../components/Topic";
import { sortedPlayersByScore, userKey } from "../utils";

const { widget } = figma;
const { AutoLayout, Text } = widget;

interface Props {
  kills: SyncedMap<string[]>;
  onDone(): void;
  players: SyncedMap<ActiveUser>;
  roles: SyncedMap<GameRole>;
  scores: SyncedMap<number>;
  topics: GameTopics;
}

export const StateResults = ({
  kills,
  onDone,
  players,
  roles,
  scores,
  topics,
}: Props) => {
  return (
    <AutoLayout
      direction="vertical"
      fill={theme.color.background}
      horizontalAlignItems="center"
      spacing={theme.spacing.md}
      verticalAlignItems="center"
      width="hug-contents"
    >
      <Button onClick={onDone} width="hug-contents">
        Lobby
      </Button>

      <AutoLayout
        spacing={theme.spacing.sm}
        direction="vertical"
        horizontalAlignItems="center"
        width="fill-parent"
      >
        <Topic topic={topics.a} />
        <Topic topic={topics.b} />
        <Topic topic={topics.c} emphasize={true} />
      </AutoLayout>

      <AutoLayout
        spacing={theme.spacing.sm}
        direction="vertical"
        width="fill-parent"
      >
        {sortedPlayersByScore(scores, players).map((player) => {
          const key = userKey(player);
          const killVotes = kills.get(key);
          const role = roles.get(key);
          const killed = killVotes && killVotes.length > 0;
          const imposter = role === "imposter";
          return (
            <AutoLayout
              key={key}
              direction="vertical"
              horizontalAlignItems="center"
              width="fill-parent"
            >
              <AutoLayout
                spacing={theme.spacing.sm}
                verticalAlignItems="center"
              >
                <Avatar round={true} src={player.photoUrl} />
                <Text
                  fontSize={theme.text.lg}
                  fill={theme.color.text}
                  fontWeight="extra-bold"
                >
                  {scores.get(key)}
                </Text>
                <AutoLayout direction="vertical" verticalAlignItems="center">
                  <Text
                    fontSize={theme.text.sm}
                    fill={theme.color.text}
                    fontWeight={imposter ? "normal" : "extra-bold"}
                    italic={imposter}
                  >
                    {role}
                  </Text>
                  <Text
                    fontSize={theme.text.sm}
                    fill={theme.color.text}
                    fontWeight={killed ? "extra-bold" : "normal"}
                  >
                    {killed ? "DEAD" : "SURVIVED"}
                  </Text>
                </AutoLayout>
              </AutoLayout>
              {killed ? (
                <AutoLayout
                  horizontalAlignItems="center"
                  spacing={theme.spacing.sm}
                  verticalAlignItems="center"
                >
                  {killVotes.map((sessionId) => {
                    const player = players.get(sessionId);
                    return player ? (
                      <Avatar
                        key={sessionId}
                        round={true}
                        src={player.photoUrl}
                        size="sm"
                      />
                    ) : null;
                  })}
                </AutoLayout>
              ) : null}
            </AutoLayout>
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
};
