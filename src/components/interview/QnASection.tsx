import { Card } from "@/components/ui/card";

export default function QnASection() {
    return (
        <Card className="p-4 bg-background rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3">Q&amp;A</h3>
            <ul className="space-y-4">
                <li>
                    <div className="font-bold text-foreground">Q: Tell me about yourself.</div>
                    <div className="text-muted-foreground mt-1">A: [Your answer here]</div>
                </li>
                <li>
                    <div className="font-bold text-foreground">Q: Why do you want this job?</div>
                    <div className="text-muted-foreground mt-1">A: [Your answer here]</div>
                </li>
            </ul>
        </Card>
    );
}
