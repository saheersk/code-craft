import { redisClient } from "@repo/redis-utils";
import * as WebSocket from "ws";
import http from "http";

const redisSubscriber = redisClient.duplicate();
redisSubscriber.connect().catch((err) => console.error("Failed to connect to Redis:", err));

const server = http.createServer();
const wss = new WebSocket.Server({ server });

redisSubscriber.psubscribe("contest:leaderboard:update:*", (err, count) => {
  if (err) console.error("Failed to subscribe:", err);
  else console.log(`Subscribed to ${count} leaderboard update channels`);
});

const fetchLeaderboard = async (contestId: string) => {
  const top20 = await redisClient.zrevrange(`contest:leaderboard:${contestId}`, 0, 19, "WITHSCORES");
  return top20.reduce((leaderboard: any[], value, index) => {
    if (index % 2 === 0) {
      leaderboard.push({
        userId: value,
        score: parseInt(top20[index + 1], 10),
      });
    }
    return leaderboard;
  }, []);
};

redisSubscriber.on("pmessage", async (pattern, channel) => {
  const contestId = channel.split(":")[3];
  try {
    const leaderboard = await fetchLeaderboard(contestId);
    console.log("Updated Leaderboard:", leaderboard);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "leaderboard_data", contestId, leaderboard }));
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
});

wss.on("connection", (ws) => {
  ws.on("message", async (message: any) => {
    const { type, contestId } = JSON.parse(message);
    if (type === "join:leaderboard") {
      try {
        const leaderboard = await fetchLeaderboard(contestId);
        ws.send(JSON.stringify({ type: "leaderboard_data", contestId, leaderboard }));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    }
  });

  ws.on("close", () => console.log("User disconnected"));
});

server.listen(4000, () => console.log("WebSocket server is running on port 4000"));
