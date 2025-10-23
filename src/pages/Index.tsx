import { useState } from "react";
import { GenerateForm } from "@/components/GenerateForm";
import { AliasList } from "@/components/AliasList";
import { toast } from "sonner";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGenerateSuccess = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Aliases generated successfully!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Email Alias Generator
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Generate up to 100,000 unique email aliases • Copy once, disappear forever
          </p>
        </header>

        {/* Generate Form */}
        <GenerateForm onSuccess={handleGenerateSuccess} />

        {/* Aliases List */}
        <AliasList key={refreshKey} />
      </div>
    </div>
  );
};

export default Index;