import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Share2, Twitter, Facebook, Link as LinkIcon, Download } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ChatBubbleProps {
  role: "user" | "assistant" | "model"; // model is what gemini returns sometimes
  content: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { toast } = useToast();

  // Simple check for base64 image or image markdown
  const imageMatch = content.match(/!\[.*?\]\((data:image\/.*?;base64,.*?)\)/) || content.match(/!\[.*?\]\((.*?)\)/);
  const isImage = content.includes("data:image") || !!imageMatch;
  const imageUrl = imageMatch ? imageMatch[1] : null;

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `zak-ai-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'copy', url: string | null) => {
    if (!url) return;

    const shareUrl = window.location.href;
    const shareText = "Zak AI actually generated something cool. Miracles exist.";

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Copied",
          description: "Link copied. Go spam someone.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Clipboard failed. Skill issue.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-4 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "h-8 w-8 mt-1 border shadow-sm",
        isUser ? "border-primary/20 bg-primary/10" : "border-white/10 bg-secondary"
      )}>
        {isUser ? (
          <AvatarFallback className="bg-transparent text-primary"><User className="h-4 w-4" /></AvatarFallback>
        ) : (
          <AvatarFallback className="bg-transparent text-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
        )}
      </Avatar>

      {/* Bubble */}
      <div className={cn(
        "flex flex-col max-w-[80%] md:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Name (Optional) */}
        <span className="text-[10px] text-muted-foreground mb-1 px-1">
          {isUser ? "You" : "Zak AI"}
        </span>

        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden group/bubble relative",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-secondary text-secondary-foreground rounded-tl-sm border border-white/5"
        )}>
          {isImage ? (
             <div className="prose prose-invert max-w-none text-inherit break-words">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({src, alt}) => (
                      <div className="relative group/image">
                        <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                          <DialogTrigger asChild>
                            <div className="relative cursor-zoom-in mt-2 rounded-lg overflow-hidden border border-white/10">
                              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
                              <img 
                                src={src} 
                                alt={alt} 
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                            <img 
                              src={src} 
                              alt={alt} 
                              className="w-full h-auto rounded-lg shadow-2xl"
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border-white/10 hover:bg-black/70"
                            onClick={() => src && handleDownload(src)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="secondary" 
                                className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border-white/10 hover:bg-black/70"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                              <DropdownMenuItem onClick={() => handleShare('twitter', src || null)} className="gap-2 cursor-pointer">
                                <Twitter className="h-4 w-4" /> Twitter
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('facebook', src || null)} className="gap-2 cursor-pointer">
                                <Facebook className="h-4 w-4" /> Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('copy', src || null)} className="gap-2 cursor-pointer">
                                <LinkIcon className="h-4 w-4" /> Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
             </div>
          ) : (
            <div className="prose prose-invert max-w-none text-inherit break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
          
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
