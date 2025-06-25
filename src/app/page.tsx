import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Button asChild size="lg">
        <Link href="/account-type">Get Started</Link>
      </Button>
    </div>
  );
}
