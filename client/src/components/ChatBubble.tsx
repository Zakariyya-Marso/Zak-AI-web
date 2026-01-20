import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ChatBubbleProps {
  role: "user" | "assistant" | "model"; // model is what gemini returns sometimes
  content: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Simple check for base64 image or image markdown
  const isImage = content.includes("data:image") || content.match(/!\[.*?\]\(.*?\)/);

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
          "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-secondary text-secondary-foreground rounded-tl-sm border border-white/5"
        )}>
          {isImage ? (
             // Custom handling for images if mixed with text would be complex, 
             // but here we rely on markdown mostly or direct image
             <div className="prose prose-invert max-w-none text-inherit break-words">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({src, alt}) => (
                      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-zoom-in mt-2 rounded-lg overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <img 
                              src={src} 
                              alt={alt} 
                              className="max-w-full h-auto rounded-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to expand
                            </div>
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
