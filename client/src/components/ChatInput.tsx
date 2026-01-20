import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ImagePlus, Loader2 } from "lucide-react";
import { useGenerateImage } from "@/hooks/use-images";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage();
  const [imagePrompt, setImagePrompt] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    
    setIsImageDialogOpen(false);
    
    // Optimistically show user request
    onSend(`Generate an image of: ${imagePrompt}`);
    
    generateImage(imagePrompt, {
      onSuccess: (data) => {
        // Send the image as markdown to the chat (server stores it)
        // Note: In a real app we might upload this to storage first. 
        // Here we put the base64 right in, which might be heavy but fulfills requirements without complex storage.
        // Actually, let's just pretend to send it so it renders. 
        // A better pattern would be the AI responding with the image. 
        // But the requirements say "The '+' icon... can trigger image generation".
        
        // We will inject a message from "Zak" with the image
        // Since we can't easily inject a message from the client side without a dedicated endpoint, 
        // we'll rely on the user asking Zak to generate it, OR utilize the component's parent to handle this.
        // For now, I'll assume the parent handles sending the result as a "system" or "assistant" message if possible.
        // Wait, `onSend` sends a USER message. 
        // Let's create a special format or just let the user know.
        
        // Revised Strategy: Just let the user ask normally for now? 
        // No, requirements say "+" icon.
        // Let's modify onSend or add a callback for generated content? 
        // Simplified: The backend image route returns the image. We can render it in the stream or as a separate message.
        // Let's append the image markdown to a new message sent by the "assistant" logically? 
        // Or send the image URL/Base64 as a user message attachment?
        
        // Hack for this demo: Send a markdown image link as the user message (or system message if we had one).
        // Since we control the UI, let's just send the image markdown as a message from "Assistant" 
        // But we don't have an endpoint to force an assistant message.
        // The most robust way without changing backend: 
        // User sends "Generate X". 
        // Zak responds with the image.
        // BUT the tool uses `generateImage` separately.
        
        // Let's just insert the image into the input buffer as markdown and let the user send it?
        // Or send it automatically.
        const markdown = `![${imagePrompt}](data:${data.mimeType};base64,${data.b64_json})`;
        onSend(markdown); 
      }
    });
    setImagePrompt("");
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-3xl mx-auto flex items-end gap-2 bg-secondary/50 p-2 rounded-3xl border border-white/5 shadow-inner">
        {/* Attachment Button */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
              disabled={disabled || isGenerating}
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-foreground">
            <DialogHeader>
              <DialogTitle>Generate Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImageSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>What should Zak draw?</Label>
                <Input 
                  value={imagePrompt} 
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="A cyberpunk cat hacking a mainframe..."
                  className="bg-secondary border-white/10"
                />
              </div>
              <Button type="submit" disabled={isGenerating || !imagePrompt} className="w-full">
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something stupid..."
          className="min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none py-3 px-2 text-base md:text-sm"
          disabled={disabled}
        />

        {/* Send Button */}
        <Button 
          size="icon" 
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={cn(
            "h-10 w-10 rounded-full shrink-0 transition-all duration-300",
            input.trim() 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
          )}
        >
          <Send className="h-4 w-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
