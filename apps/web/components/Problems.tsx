import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/card";
import { getProblems } from "../app/db/problem";
import { PrimaryButton } from "./LinkButton";

export async function Problems() {
  const problems = await getProblems();

  return (
    <section className="bg-white dark:bg-gray-900 py-8 md:py-12 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Popular Problems</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Check out the most popular programming problems on Code-Craft.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem: any) => (
            <ProblemCard problem={problem} key={problem.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({ problem }: { problem: any }) {
  console.log(problem, "===pproblem")
  return (
    <Card>
      <CardHeader>
        <CardTitle>{problem.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Difficulty</p>
            <p>{problem.difficulty}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Submissions</p>
            <p>{problem._count.submissions}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <PrimaryButton href={`/problem/${problem.id}`}>
          View Problem
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
