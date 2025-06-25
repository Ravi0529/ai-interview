import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function Error() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md text-center animate-fade-in">
                <CardHeader className="flex flex-col items-center gap-2">
                    <XCircle className="text-destructive size-12 mb-2" />
                    <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Sorry, the page you are looking for does not exist or an unexpected error occurred.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild variant="outline">
                        <Link href="/">Go back home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
