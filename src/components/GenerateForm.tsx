import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface GenerateFormProps {
  onSuccess: () => void;
}

export const GenerateForm = ({ onSuccess }: GenerateFormProps) => {
  const [baseEmail, setBaseEmail] = useState("");
  const [count, setCount] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!baseEmail || !baseEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (count < 1 || count > 100000) {
      toast.error("Count must be between 1 and 100,000");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-aliases", {
        body: { baseEmail, count },
      });

      if (error) throw error;

      toast.success(data.message || `Generated ${data.count} aliases!`);
      onSuccess();
    } catch (error: any) {
      console.error("Error generating aliases:", error);
      toast.error(error.message || "Failed to generate aliases");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="baseEmail" className="text-foreground">
            Base Email Address
          </Label>
          <Input
            id="baseEmail"
            type="email"
            placeholder="your.email@example.com"
            value={baseEmail}
            onChange={(e) => setBaseEmail(e.target.value)}
            className="bg-secondary border-border text-foreground font-mono"
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="count" className="text-foreground">
            Number of Aliases (1 - 100,000)
          </Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={100000}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 100)}
            className="bg-secondary border-border text-foreground font-mono"
            disabled={isGenerating}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {count} aliases...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Aliases
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};