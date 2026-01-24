import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Image as ImageIcon, Sparkles, AlertCircle, Share2, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ImageGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResultImage(null);
    
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) throw new Error("Failed to generate image");
      
      const data = await res.json();
      setResultImage(`data:${data.mimeType};base64,${data.b64_json}`);
      
      toast({
        title: "Success",
        description: "Zak's AI actually did something useful for once.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "The AI failed. Big surprise. Try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `zak-ai-gen-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'copy') => {
    if (!resultImage) return;

    const shareUrl = window.location.href; // In a real app, this would be a link to the specific image
    const shareText = `Check out this edgy masterpiece Zak AI generated for me: "${prompt}"`;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Copied",
          description: "Link and prompt copied to clipboard. Go spam your friends.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy. Even your clipboard hates you.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-12 pt-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">AI Image Studio</h1>
          </div>
          <p className="text-muted-foreground">
            Describe what you want Zak's primitive brain to visualize. Don't expect a masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Image Prompt</label>
                  <Input 
                    placeholder="e.g. A dystopian cyberpunk city with neon lights..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-black/20 border-white/5 focus-visible:ring-primary/50"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  />
                </div>
                
                <Button 
                  className="w-full gap-2 shadow-lg shadow-primary/20"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate Image"}
                </Button>

                <div className="pt-4 flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-500/80 leading-relaxed">
                    Zak's image generation is edgy and gritty by default. 
                    Clean, 'polite' prompts will still result in cynical art.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 aspect-square flex items-center justify-center"
                >
                  <img 
                    src={resultImage} 
                    alt="Generated Art" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm border-white/10">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                        <DropdownMenuItem onClick={() => handleShare('twitter')} className="gap-2 cursor-pointer">
                          <Twitter className="h-4 w-4" /> Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2 cursor-pointer">
                          <Facebook className="h-4 w-4" /> Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('copy')} className="gap-2 cursor-pointer">
                          <LinkIcon className="h-4 w-4" /> Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border-2 border-dashed border-white/5 bg-white/[0.02] aspect-square flex flex-col items-center justify-center text-muted-foreground p-12 text-center"
                >
                  {isGenerating ? (
                    <div className="space-y-4 flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="animate-pulse">Zak is drawing something terrible...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                      <p className="max-w-xs">Your edgy masterpiece will appear here. If the server doesn't crash first.</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
