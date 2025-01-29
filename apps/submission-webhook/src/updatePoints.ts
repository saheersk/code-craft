import { redisClient } from "@repo/redis-utils";

export async function updatePoints(
  contestId: string,
  problemId: string,
  points: number,
  username: string
) {
  const contestUserKey = `contest:${contestId}:user:${username}`;
  const leaderboardKey = `contest:leaderboard:${contestId}`;

  const currentPoints = parseInt(
    (await redisClient.hget(contestUserKey, problemId)) || "0",
    10
  );

  await redisClient.hset(contestUserKey, problemId, points);

  await redisClient.zadd(leaderboardKey, points, username);
}
