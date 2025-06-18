
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Bot, Send, Sparkles } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AIChatProps {
  onQueryGenerated: (query: string) => void;
}

export const AIChat = ({ onQueryGenerated }: AIChatProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuery = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate AI query generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock generated queries based on common patterns
      const mockQueries = {
        "users": "SELECT * FROM users ORDER BY created_at DESC LIMIT 10;",
        "count": "SELECT COUNT(*) FROM users;",
        "join": "SELECT u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id;",
        "filter": "SELECT * FROM users WHERE email LIKE '%@example.com%';",
        "default": `-- Generated query based on: "${prompt}"\nSELECT * FROM users \nWHERE created_at >= NOW() - INTERVAL '7 days'\nORDER BY created_at DESC;`
      };

      const lowerPrompt = prompt.toLowerCase();
      let generatedQuery = mockQueries.default;
      
      if (lowerPrompt.includes("user")) generatedQuery = mockQueries.users;
      else if (lowerPrompt.includes("count")) generatedQuery = mockQueries.count;
      else if (lowerPrompt.includes("join")) generatedQuery = mockQueries.join;
      else if (lowerPrompt.includes("filter") || lowerPrompt.includes("email")) generatedQuery = mockQueries.filter;

      onQueryGenerated(generatedQuery);
      setPrompt("");
      
      toast({
        title: "Query generated successfully!",
        description: "The AI has generated a SQL query based on your request.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerateQuery();
    }
  };

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-xs font-medium text-muted-foreground">
          <Bot className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </div>
        
        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the data you want to query (e.g., 'show me all users from last week')"
            className="flex-1 h-8 text-xs"
          />
          
          <Button 
            onClick={handleGenerateQuery}
            disabled={isGenerating || !prompt.trim()}
            size="sm"
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
          >
            {isGenerating ? (
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? "Generating..." : "Generate"}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
