import express from "express";
import cors from "cors";
import prismaClient from "./db";
import { SubmissionCallback } from "@repo/common/zod";
import { outputMapping } from "./outputMapping";
import { handleContestSubmission, updateSubmissionStatus } from "./helper";

const app = express();
app.use(cors()); 
app.use(express.json());


app.put("/submission-callback", async (req: any, res: any) => {
  const parsedBody = SubmissionCallback.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(403).json({
      message: "Invalid input",
    });
  }

  const testCase = await prismaClient.testCase.update({
    where: {
      judge0TrackingId: parsedBody.data.token,
    },
    data: {
      status: outputMapping[parsedBody.data.status.description],
      time: Number(parsedBody.data.time),
      memory: parsedBody.data.memory,
    },
  });

  if (!testCase) {
    return res.status(404).json({
      message: "Testcase not found",
    });
  }

  const allTestcaseData = await prismaClient.testCase.findMany({
    where: {
      submissionId: testCase.submissionId,
    },
  });

  const pendingTestcases = allTestcaseData.filter(
    (testcase) => testcase.status === "PENDING",
  );
  const failedTestcases = allTestcaseData.filter(
    (testcase) => testcase.status !== "AC",
  );


  // This logic is fairly ugly
  // We should have another async process update the status of the submission.
  // This can also lead to a race condition where two test case webhooks are sent at the same time
  // None of them would update the status of the submission
  try {
    const response = await updateSubmissionStatus(
      testCase.submissionId,
      allTestcaseData
    );

    await handleContestSubmission(response);
  } catch (error) {
    console.error("Error updating submission or contest data:", error);
  }
  res.send("Received");
});

app.listen(process.env.PORT || 3002, () => {
  console.log(`Server started on port ${process.env.PORT || 3002}`);
});
