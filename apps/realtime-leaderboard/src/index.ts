import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Redis from "ioredis";

const redis = new Redis();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


app.post("/update-score", async (req: Request, res: Response): Promise<any>  => {
  try {
    const { userId, score }: { userId: string; score: number } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({ error: "userId and score are required." });
    }

    await redis.zadd("leaderboard", score, userId);

    res.status(200).json({ message: "Score updated successfully!" });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


app.get("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const topUsers = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

    const formattedUsers = [];
    for (let i = 0; i < topUsers.length; i += 2) {
      formattedUsers.push({ userId: topUsers[i], score: Number(topUsers[i + 1]) });
    }

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


app.get("/rank/:userId", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const rank = await redis.zrevrank("leaderboard", userId);

    if (rank === null) {
      return res.status(404).json({ error: "User not found in the leaderboard." });
    }

    res.status(200).json({ rank: rank + 1 });
  } catch (error) {
    console.error("Error fetching rank:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


app.listen(PORT, () => {
  console.log(`Leaderboard server running at http://localhost:3003`);
});
