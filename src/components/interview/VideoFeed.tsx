import { Card } from "@/components/ui/card";

export default function VideoFeed() {
    return (
        <Card className="flex items-center justify-center w-full h-full min-h-[250px] bg-muted text-foreground rounded-xl shadow-md">
            <span className="text-lg font-semibold">Live Video</span>
        </Card>
    );
}
