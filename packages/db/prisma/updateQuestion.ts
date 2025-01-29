import { LANGUAGE_MAPPING } from "@repo/common/language";
import fs from "fs";
import { prismaClient } from "../src";

const MOUNT_PATH = process.env.MOUNT_PATH ?? "../../apps/problems";
function promisifiedReadFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(new Error(`Failed to read file at ${path}: ${err.message}`));
      }
      resolve(data);
    });
  });
}

async function main(problemSlug: string) {
  const problemStatement = await promisifiedReadFile(
    `${MOUNT_PATH}/${problemSlug}/Problem.md`,
  );

  const problem = await prismaClient.problem.upsert({
    where: {
      slug: problemSlug,
    },
    create: {
      title: problemSlug,
      slug: problemSlug,
      description: problemStatement,
      hidden: false
    },
    update: {
      description: problemStatement,
    },
  });

  await Promise.all(
    Object.keys(LANGUAGE_MAPPING).map(async (language) => {
      const code = await promisifiedReadFile(
        `${MOUNT_PATH}/${problemSlug}/boilerplate/function.${language}`,
      );
      await prismaClient.defaultCode.upsert({
        where: {
          problemId_languageId: {
            problemId: problem.id,
            languageId: LANGUAGE_MAPPING[language].internal,
          },
        },
        create: {
          problemId: problem.id,
          languageId: LANGUAGE_MAPPING[language].internal,
          code,
        },
        update: {
          code,
        },
      });
    }),
  );
}

main(process.env.PROBLEM_SLUG!);
