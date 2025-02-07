import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Contest } from "../../../components/Contest";


export default async function ContestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin"); 
  }

  if (!params.id) {
    return <div>Contest doesn't exist...</div>;
  }

  return <Contest id={params.id} />;
}

export const dynamic = "force-dynamic";
