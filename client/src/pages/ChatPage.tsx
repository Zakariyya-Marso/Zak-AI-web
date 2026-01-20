import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { ChatBubble } from "@/components/ChatBubble";
import { useConversation, useChatStream } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data hooks
  const { data: conversation, isLoading: convLoading } = useConversation(currentConvId);
  const { sendMessage, isStreaming, streamedContent } = useChatStream(currentConvId);
  
  // Auto-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, streamedContent]);

  // Combine DB messages + Streamed content
  const displayMessages = conversation?.messages ? [...conversation.messages] : [];
  
  // If streaming, and the last message isn't the one being streamed yet (handled by hook update),
  // we might want to append a temporary message.
  // Actually the hook optimistically adds the User message. 
  // We just need to show the Assistant's streaming response.
  // We'll render a transient ChatBubble for the stream if isStreaming is true.

  if (authLoading) return null;
  if (!isAuthenticated) return <Redirect to="/" />;

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar 
        currentId={currentConvId} 
        onSelect={setCurrentConvId} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center px-4 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {conversation?.title || (currentConvId ? "Chat" : "Select a Roast")}
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 px-4 md:px-8 py-4">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-start pb-4">
            {!currentConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 mt-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">👋</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Welcome to Zak AI</h3>
                <p className="max-w-md">Select a conversation from the sidebar or start a new roast. Don't say I didn't warn you.</p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <AnimatePresence initial={false}>
                  {displayMessages.map((msg) => (
                    <ChatBubble 
                      key={msg.id} 
                      role={msg.role as any} 
                      content={msg.content} 
                    />
                  ))}
                </AnimatePresence>
                
                {isStreaming && (
                  <ChatBubble 
                    role="assistant" 
                    content={streamedContent} 
                    isStreaming={true}
                  />
                )}
                
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        {currentConvId && (
          <div className="shrink-0 z-20">
            <ChatInput 
              onSend={sendMessage} 
              disabled={isStreaming} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
