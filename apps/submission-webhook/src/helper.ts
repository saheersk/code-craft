import prismaClient from "./db";
import { getPoints } from "./points";
import { updatePoints } from "./updatePoints";
import { redisClient } from "@repo/redis-utils";


export async function updateSubmissionStatus(
    submissionId: string,
    allTestcaseData: any[]
  ) {
    const accepted = allTestcaseData.every(
      (testcase) => testcase.status === "AC"
    );
  
    return await prismaClient.submission.update({
      where: { id: submissionId },
      data: {
        status: accepted ? "AC" : "REJECTED",
        time: Math.max(
          ...allTestcaseData.map((testcase) => Number(testcase.time || "0"))
        ),
        memory: Math.max(
          ...allTestcaseData.map((testcase) => testcase.memory || 0)
        ),
      },
      include: {
        problem: true,
        activeContest: true,
        user: true,
      },
    });
  }
  
  export async function handleContestSubmission(response: any) {
    if (!response.activeContestId || !response.activeContest || !response.user) {
      return;
    }
  
    // Fetch the current score for the user and the given problem in the contest
    const currentScoreStr = await redisClient.zscore(
      `contest:leaderboard:${response.activeContestId}`,
      response.user.name
    );
    // if(currentScore)
    const currentScore = parseFloat(currentScoreStr) || 0; // Ensure it's a valid number, default to 0 if not
    console.log(currentScore, "currentScore");
    const points = await getPoints(
      response.activeContestId,
      response.userId,
      response.problemId,
      response.problem.difficulty,
      response.activeContest.startTime,
      response.activeContest.endTime
    );
  console.log(points, "points")
    // Check if the current score exists and if the problemId has been attempted before
    // If this is a new problem or a new score for the user, update the leaderboard
    await updatePoints(
      response.activeContestId,
      response.problemId,
      points,
      response.user.name
    );
    
    const leaderboardData = {
      event: "leaderboard-update",
      data: {
        contestId: response.activeContestId,
        score: points, // Update with the calculated points
        userId: response.user.name,
      },
    };
    
    if (currentScore === null || !await hasAttemptedProblem(response.userId, response.activeContestId, response.problemId)) {
      await redisClient.zadd(`contest:leaderboard:${response.activeContestId}`, points, response.user.name);
      // Publish an update to the leaderboard channel
     
    }else {

      await redisClient.zadd(
        `contest:leaderboard:${response.activeContestId}`,
        (currentScore + points),
        response.user.name
      );
    }

    await redisClient.publish(
      `contest:leaderboard:update:${response.activeContestId}`,
      JSON.stringify(leaderboardData)
    );
  
    console.log(response);
  
    // Upsert the contest submission in the database
    await prismaClient.contestSubmission.upsert({
      where: {
        userId_problemId_contestId: {
          contestId: response.activeContestId,
          userId: response.userId,
          problemId: response.problemId,
        },
      },
      create: {
        submissionId: response.id,
        userId: response.userId,
        problemId: response.problemId,
        contestId: response.activeContestId,
        points,
      },
      update: { points },
    });
  }
  
  // Helper function to check if the user has already attempted the given problem in the contest
  async function hasAttemptedProblem(userId: string, contestId: string, problemId: string): Promise<boolean> {
    const existingSubmission = await prismaClient.contestSubmission.findUnique({
      where: {
        userId_problemId_contestId: {
          contestId,
          userId,
          problemId,
        },
      },
    });
  
    return existingSubmission !== null;
  }
  