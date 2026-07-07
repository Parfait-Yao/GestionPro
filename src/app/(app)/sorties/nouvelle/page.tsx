import { redirect } from "next/navigation";

export default function NouvelleSortieRedirect() {
  redirect("/pointage?tab=sorties&new=1");
}
