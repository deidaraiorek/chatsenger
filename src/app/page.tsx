import Button from "@/components/ui/Button";
import { db } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  // await db.set("Hello", "Hello");
  return (
    <div className="bg-red-500">
      Hello World
      <Button isLoading={false}></Button>
    </div>
  );
}
