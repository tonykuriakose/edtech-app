import { redirect } from "next/navigation";

// The sidebar links /teach/courses here; teaching home already shows the course list.
export default function TeachCoursesPage() {
  redirect("/teach");
}
