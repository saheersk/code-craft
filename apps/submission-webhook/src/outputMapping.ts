// import { TestCaseResult } from "@prisma/client";

// export const outputMapping: Record<string, TestCaseResult> = {
//   Accepted: TestCaseResult.AC,
//   "Wrong Answer": TestCaseResult.FAIL,
//   "Time Limit Exceeded": TestCaseResult.TLE,
//   "Memory Limit Exceeded": TestCaseResult.COMPILATION_ERROR,
//   "Runtime Error (NZEC)": TestCaseResult.COMPILATION_ERROR,
//   "Compilation Error": TestCaseResult.COMPILATION_ERROR,
// };

export type TestCaseResult = "AC" | "FAIL" | "TLE" | "COMPILATION_ERROR";

export const outputMapping: Record<string, TestCaseResult> = {
  Accepted: "AC",
  "Wrong Answer": "FAIL",
  "Time Limit Exceeded": "TLE",
  "Memory Limit Exceeded": "COMPILATION_ERROR",
  "Runtime Error (NZEC)": "COMPILATION_ERROR",
  "Compilation Error": "COMPILATION_ERROR",
};
