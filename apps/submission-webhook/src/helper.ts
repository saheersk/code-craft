import prismaClient from "./db";
import { getPoints } from "./points";
import { updatePoints } from "./updatePoints";


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
  
    const points = await getPoints(
      response.activeContestId,
      response.userId,
      response.problemId,
      response.problem.difficulty,
      response.activeContest.startTime,
      response.activeContest.endTime
    );
  
    await updatePoints(
      response.activeContestId,
      response.problemId,
      points,
      response.user.name
    );
  
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
  