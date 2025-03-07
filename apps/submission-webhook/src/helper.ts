import prisma from "./db";
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
  
    return await prisma.submission.update({
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
  
    const currentScoreStr = await redisClient.zscore(
      `contest:leaderboard:${response.activeContestId}`,
      response.user.name
    );

    const currentScore = currentScoreStr ? parseFloat(currentScoreStr) : 0;
    console.log(currentScore, "======")
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
        score: points,
        userId: response.user.name,
      },
    };
    
    console.log('=================new=====================');
  
    await prisma.contestSubmission.upsert({
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
    if(response.status == 'AC'){
      const totalScore = await UserContestScore(response.userId, response.activeContestId, response.problemId)
      await redisClient.zadd(`contest:leaderboard:${response.activeContestId}`,  totalScore, response.user.name);
      await redisClient.publish(
        `contest:leaderboard:update:${response.activeContestId}`,
        JSON.stringify(leaderboardData)
      );
    }
  }
  
  async function UserContestScore(userId: string, contestId: string, problemId: string): Promise<number> {
    const submissions = await prisma.contestSubmission.findMany({
      where: {
        contestId,
        userId,
      },
      select: {
        points: true,
      },
    });
    
    const totalScore = submissions.reduce((acc: any, curr: any) => acc + curr.points, 0);
    
    console.log("Total Score:", totalScore);

    return totalScore
  }
  