import { redirect } from "next/navigation";

// The builder now lives on the home page.
export default function CreatePage() {
  redirect("/");
}
