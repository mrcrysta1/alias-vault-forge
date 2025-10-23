import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AliasItem } from "@/components/AliasItem";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 50;

export const AliasList = () => {
  const [aliases, setAliases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [removingTokens, setRemovingTokens] = useState<Set<string>>(new Set());

  const fetchAliases = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from("aliases")
        .select("*", { count: "exact", head: true })
        .eq("used", false);

      setTotalCount(count || 0);

      // Get page of aliases
      const { data, error } = await supabase
        .from("aliases")
        .select("*")
        .eq("used", false)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      setAliases(data || []);
    } catch (error: any) {
      console.error("Error fetching aliases:", error);
      toast.error("Failed to load aliases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, [page]);

  const handleUseAlias = async (token: string, alias: string) => {
    // Add to removing set for animation
    setRemovingTokens(prev => new Set(prev).add(token));

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(alias);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mark as used
      const { error } = await supabase.functions.invoke("use-alias", {
        body: { token },
      });

      if (error) throw error;

      // Remove from local state
      setAliases(prev => prev.filter(a => a.token !== token));
      setTotalCount(prev => prev - 1);
      
      toast.success("Copied to clipboard!", {
        description: alias,
      });
    } catch (error: any) {
      console.error("Error using alias:", error);
      toast.error("Failed to copy alias");
      setRemovingTokens(prev => {
        const next = new Set(prev);
        next.delete(token);
        return next;
      });
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && aliases.length === 0) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="text-center text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          Loading aliases...
        </div>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="text-center text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No aliases generated yet. Create some above to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Available Aliases
          </h2>
          <span className="text-sm text-muted-foreground font-mono">
            {totalCount.toLocaleString()} unused
          </span>
        </div>

        {/* Aliases List */}
        <div className="space-y-2">
          {aliases.map((alias) => (
            <AliasItem
              key={alias.token}
              alias={alias.alias}
              token={alias.token}
              onUse={handleUseAlias}
              isRemoving={removingTokens.has(alias.token)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="font-mono"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground font-mono">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="font-mono"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};