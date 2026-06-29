import { redirect } from "next/navigation";

/* Temporary: send / to /tools until the home page is ready again. */

export default function HomePage() {
  redirect("/tools");
}
