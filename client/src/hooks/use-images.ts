import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGenerateImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch(api.images.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate image");
      return api.images.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Image Gen Failed",
        description: error.message || "Zak refused to draw that.",
        variant: "destructive",
      });
    },
  });
}
