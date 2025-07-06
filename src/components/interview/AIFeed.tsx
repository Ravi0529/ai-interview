import { Card } from "@/components/ui/card";

export default function AIFeed() {
    return (
        <Card className="flex items-center gap-4 p-4 bg-background rounded-xl shadow-md">
            <div className="text-2xl">🤖</div>
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <div className="text-base text-muted-foreground font-medium">AI is speaking...</div>
        </Card>
    );
}
