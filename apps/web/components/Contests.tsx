import { getExistingContests, getUpcomingContests } from "../app/db/contest";
import { ContestCard } from "./ContestCard";

export async function Contests() {
  const [upcomingContests, pastContests] = await Promise.all([
    getUpcomingContests(),
    getExistingContests(),
  ]);
  console.log(upcomingContests, "==upcomoing")
  return (
    <div className="min-h-screen">
      <section className="bg-white dark:bg-gray-900 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Upcoming Contests</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the upcoming programming contests on Code-Craft.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* // TODO: add the correct type */}
            {upcomingContests.map((contest: any) => (
              <ContestCard
                key={contest.id}
                title={contest.title}
                id={contest.id}
                startTime={contest.startTime}
                endTime={contest.endTime}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-gray-900 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Previous Contests</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the previous programming contests on Code-Craft.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* // TODO: add the correct type */}
            {pastContests.map((contest: any) => (
              <ContestCard
                key={contest.id}
                title={contest.title}
                id={contest.id}
                startTime={contest.startTime}
                endTime={contest.endTime}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
