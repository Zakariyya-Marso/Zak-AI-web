import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, X, Image as ImageIcon } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; base64: string; type: string } | null>(null);
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
    if ((!input.trim() && !selectedFile) || disabled) return;
    
    let message = input;
    if (selectedFile) {
      message += `\n\n![${selectedFile.name}](${selectedFile.base64})`;
    }
    
    onSend(message);
    setInput("");
    setSelectedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        base64: reader.result as string,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    
    setIsImageDialogOpen(false);
    onSend(`Generate an image of: ${imagePrompt}`);
    
    generateImage(imagePrompt, {
      onSuccess: (data) => {
        const markdown = `![${imagePrompt}](data:${data.mimeType};base64,${data.b64_json})`;
        onSend(markdown); 
      }
    });
    setImagePrompt("");
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-xl border border-white/5 self-start">
            {selectedFile.type.startsWith("image/") ? (
              <img src={selectedFile.base64} alt="Preview" className="h-8 w-8 rounded object-cover" />
            ) : (
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs truncate max-w-[150px]">{selectedFile.name}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 rounded-full hover:bg-white/10" 
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-secondary/50 p-2 rounded-3xl border border-white/5 shadow-inner">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <div className="flex items-center">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
                  disabled={disabled || isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
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
          </div>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something stupid..."
            className="min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none py-3 px-2 text-base md:text-sm"
            disabled={disabled}
          />

          <Button 
            size="icon" 
            onClick={handleSubmit}
            disabled={(!input.trim() && !selectedFile) || disabled}
            className={cn(
              "h-10 w-10 rounded-full shrink-0 transition-all duration-300",
              (input.trim() || selectedFile)
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
