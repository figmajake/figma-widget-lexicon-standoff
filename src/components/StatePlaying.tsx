import { GameResponse, GameTopics } from "../code";
import { theme } from "../theme";
import { Avatar, Button, Topic } from "./";
import { sortedPlayersByResponseTime } from "../utils";

const { widget } = figma;
const { AutoLayout, Text } = widget;

interface Props {
  onResponse(): void;
  onVote(votedId: string): void;
  players: SyncedMap<ActiveUser>;
  responses: SyncedMap<GameResponse>;
  topics: GameTopics;
  votes: SyncedMap<string>;
}

export const StatePlaying = ({
  onResponse,
  onVote,
  players,
  responses,
  topics,
}: Props) => {
  const voting = responses.entries().filter(Boolean).length >= players.size;

  const renderVoting = () => (
    <AutoLayout
      direction="vertical"
      fill={theme.color.background}
      horizontalAlignItems="center"
      spacing={theme.spacing.md}
      verticalAlignItems="center"
      width="fill-parent"
    >
      {sortedPlayersByResponseTime(responses, players).map(
        ({ photoUrl, sessionId }) => (
          <AutoLayout
            cornerRadius={theme.block.lg}
            key={sessionId}
            fill={theme.color.text}
            onClick={() => onVote(sessionId.toString())}
            padding={{ right: theme.spacing.md }}
            spacing={theme.spacing.sm}
            verticalAlignItems="center"
            width="hug-contents"
          >
            <Avatar key={sessionId} src={photoUrl} round={true} />
            <Text
              fill={theme.color.accent}
              fontSize={theme.text.sm}
              italic={true}
            >
              {responses.get(sessionId.toString())?.value}
            </Text>
          </AutoLayout>
        )
      )}
    </AutoLayout>
  );

  const renderSubmissions = () => (
    <AutoLayout
      direction="vertical"
      spacing={theme.spacing.md}
      horizontalAlignItems="center"
      width="hug-contents"
    >
      <Button onClick={onResponse} width="fill-parent">
        Show me Secrets
      </Button>
      <Text fontSize={theme.text.sm} fill={theme.color.text} italic={true}>
        waiting for...
      </Text>
      <AutoLayout spacing={theme.spacing.sm} verticalAlignItems="center">
        {players
          .values()
          .map(({ photoUrl, sessionId }) =>
            responses.get(sessionId.toString()) ? null : (
              <Avatar key={sessionId} round={true} src={photoUrl} />
            )
          )}
      </AutoLayout>
    </AutoLayout>
  );

  return (
    <AutoLayout
      direction="vertical"
      fill={theme.color.background}
      spacing={theme.spacing.md}
      verticalAlignItems="center"
    >
      {voting ? (
        <AutoLayout
          spacing={theme.spacing.sm}
          horizontalAlignItems="center"
          direction="vertical"
        >
          <Topic topic={topics.a} />
          <Topic topic={topics.b} />
        </AutoLayout>
      ) : null}
      {voting ? renderVoting() : renderSubmissions()}
    </AutoLayout>
  );
};
