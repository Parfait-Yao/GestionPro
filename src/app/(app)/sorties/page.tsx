import { redirect } from "next/navigation";

export default function SortiesRedirect() {
  redirect("/pointage?tab=sorties");
}
