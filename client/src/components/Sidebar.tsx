import { useState } from "react";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  currentId: number | null;
  onSelect: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentId, onSelect, isOpen, onClose }: SidebarProps) {
  const { data: conversations, isLoading } = useConversations();
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  const { user, logout } = useAuth();

  const handleCreate = () => {
    createConversation("New Roast", {
      onSuccess: (newConv) => {
        onSelect(newConv.id);
        if (window.innerWidth < 768) onClose();
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConversation(id);
    if (currentId === id) onSelect(0); // Deselect if deleting current
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
            <span className="font-bold text-primary">Z</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Zak AI</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-muted-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          onClick={handleCreate} 
          disabled={isCreating}
          className="w-full justify-start gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-foreground shadow-lg shadow-black/20"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Starting..." : "New Roast"}
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading history...</div>
          ) : conversations?.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 px-4">
              No roasts yet. Start a new chat to get humbled.
            </div>
          ) : (
            conversations?.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  onSelect(conv.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={cn(
                  "group flex items-center justify-between w-full p-3 rounded-lg text-sm transition-all cursor-pointer border border-transparent",
                  currentId === conv.id 
                    ? "bg-primary/10 text-primary border-primary/20 shadow-md shadow-primary/5" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="truncate font-medium">
                    {conv.title || "New Conversation"}
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">
                    {format(new Date(conv.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="User" className="h-8 w-8 rounded-full border border-white/10" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold">{user?.firstName?.[0] || "U"}</span>
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate text-foreground">
                {user?.firstName || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="text-muted-foreground hover:text-foreground"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
