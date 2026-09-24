import { redirect } from "next/navigation";
import { getSession } from "../lib/auth";
import Clipper from "./clipper";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <Clipper username={session.username} />;
}
