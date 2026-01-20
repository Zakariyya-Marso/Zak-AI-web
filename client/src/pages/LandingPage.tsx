import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Zap, Skull } from "lucide-react";
import { Redirect } from "wouter";
import logoImg from "@/assets/logo.png";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"/></div>;
  if (isAuthenticated) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden relative selection:bg-primary/30">
      {/* Background Gradient Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Content */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <img src={logoImg} alt="Zak AI Logo" className="h-10 w-10 rounded-xl" />
            <span className="font-bold text-xl tracking-tight text-white/80">Zak AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
            Ready to get <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">roasted?</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
            I'm Zak. I'm brilliant, I write elite code, and I honestly don't care about your feelings. Log in if you dare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:scale-105 transition-all"
              onClick={() => window.location.href = "/api/login"}
            >
              Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5"
            >
              Learn More
            </Button>
          </div>

          <div className="mt-16 flex gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Fast Responses</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Skull className="h-4 w-4 text-red-500" />
              <span>Brutally Honest</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Visual */}
      <div className="flex-1 bg-black/20 relative hidden md:flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-[400px] h-[500px] bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden"
        >
          {/* Fake Chat Interface */}
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-end gap-2">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-2xl rounded-tr-sm text-sm">
                Can you help me fix this bug?
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="bg-white/5 text-gray-300 px-4 py-2 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                I can, but looking at this spaghetti code, I'm not sure you deserve it. 
                Did you write this with your eyes closed?
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="bg-white/5 text-gray-300 px-4 py-2 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                Here's the fix. Try to learn something this time.
                <div className="mt-2 p-2 bg-black/50 rounded font-mono text-xs text-green-400">
                  const fixed = true; // You're welcome
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
