"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bot, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// --- Demo Specific Types ---
// ... (Keep DemoMessage, DemoGenUIMessage, DemoGenUIResponse, ScriptItem types as before) ...
type DemoRole = "user" | "assistant"
interface DemoTextMessage {
  id: string
  role: DemoRole
  content: string
  type: 'text'
}
interface DemoGenUIMessage {
  id: string
  role: 'assistant'
  type: 'genui'
  component: 'buttons'
  props: {
    questionId: string
    questionText: string
    options: Array<{ id: string; text: string }>
  }
}
type DemoMessage = DemoTextMessage | DemoGenUIMessage
interface DemoGenUIResponse {
  type: 'user_genui_response'
  questionId: string
  selectedOptionId: string
}
type ScriptItem = Omit<DemoTextMessage, 'id' | 'type'> | Omit<DemoGenUIMessage, 'id' | 'role'> | DemoGenUIResponse;

// --- REVISED Conversation Script ---
const conversationScript: ScriptItem[] = [
  { role: "assistant", content: "Welcome. I'm Pulse. Is there a particular topic or feeling you'd like to reflect on today?" },
  { role: "user", content: "I've been thinking about the pressure to always be 'on' or productive lately." },
  {
    role: "assistant",
    content: "That resonates with many people. It sounds like there might be a tension between societal expectations and personal well-being. Could you say more about where that pressure feels like it comes from?",
  },
  { role: "user", content: "It feels like it comes from everywhere – work, social media, even myself sometimes." },
  {
    role: "assistant",
    content: "That makes sense, feeling it from multiple directions can be overwhelming. Let's pause on that for a moment. I have a related question that might offer a different angle, if you're open to it?",
  },
  // --- GenUI Step ---
  {
    type: 'genui',
    component: 'buttons',
    props: {
      questionId: 'demo-q2',
      questionText: 'When you think about "productivity," which feels most true for you right now?',
      options: [
        { id: 'opt_energy', text: 'A source of energy/satisfaction' },
        { id: 'opt_drain', text: 'A source of drain/pressure' },
        { id: 'opt_neutral', text: 'Mostly neutral' },
        { id: 'opt_mixed', text: 'It\'s complicated/mixed' },
      ]
    }
  },
  // --- User's Simulated GenUI Response ---
  {
    type: 'user_genui_response',
    questionId: 'demo-q2',
    selectedOptionId: 'opt_drain', // Simulate user selects 'drain'
  },
  // --- Assistant's Follow-up ---
  {
    role: "assistant",
    content: "Thank you for sharing that. Acknowledging that it feels like a source of drain right now is an important insight. We don't need to solve it, just notice it. Perhaps we can explore what 'rest' or 'non-productivity' feels like?",
  },
]
// --- End Script ---

// --- Sub Components (Keep DemoButtonsInput as before) ---
interface DemoGenUIButtonsProps {
  questionText: string;
  options: Array<{ id: string; text: string }>;
  selectedOptionId?: string | null;
  isSubmitted?: boolean;
  questionId: string;
}

function DemoButtonsInput({ questionText, options, selectedOptionId, isSubmitted }: DemoGenUIButtonsProps) {
  // ... (Keep the implementation from the previous step)
  return (
    <Card className="bg-card/80 border-primary/20 my-2 shadow-inner">
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">{questionText}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <Button
                        key={option.id}
                        variant={selectedOptionId === option.id && isSubmitted ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "transition-all",
                            isSubmitted && selectedOptionId !== option.id ? "opacity-60 cursor-default" : "",
                            selectedOptionId === option.id && isSubmitted ? "ring-2 ring-primary ring-offset-1" : "",
                            !isSubmitted ? "cursor-default" : "" // Demo not interactive
                        )}
                    >
                        {selectedOptionId === option.id && isSubmitted && <CheckCircle className="h-4 w-4 mr-2" />}
                        {option.text}
                    </Button>
                ))}
            </div>
             {isSubmitted && <p className="text-xs text-primary/80 mt-2">Simulated response recorded.</p>}
        </CardContent>
    </Card>
  );
}

// --- Main Demo Component ---
export default function MarketingChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [currentTypingContent, setCurrentTypingContent] = useState<string>("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [submittedGenUIAnswers, setSubmittedGenUIAnswers] = useState<Record<string, string>>({}) // Renamed from isSubmitted to submittedGenUIAnswers

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const stopSimulation = useCallback(() => {
    // ... (Keep implementation from previous step) ...
     setIsSimulating(false);
    setShowTypingIndicator(false);
    setCurrentTypingContent("");
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    typingIntervalRef.current = null;
    messageTimeoutRef.current = null;
  }, []);

  const typeMessage = useCallback((content: string, onComplete: () => void) => {
    // ... (Keep implementation from previous step, adjust speed if needed) ...
    let charIndex = 0;
    setCurrentTypingContent("");
    setShowTypingIndicator(true);

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < content.length) {
        setCurrentTypingContent(content.substring(0, charIndex + 1));
        charIndex++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setShowTypingIndicator(false);
        onComplete();
      }
    }, 50); // Slightly faster typing
  }, []);

  // Simulation Effect
  useEffect(() => {
    // ... (Keep implementation from previous step) ...
     if (!isSimulating || currentIndex >= conversationScript.length) {
        stopSimulation();
        return;
    }

    const scriptItem = conversationScript[currentIndex];
    const isAssistant = 'role' in scriptItem && scriptItem.role === 'assistant';
    const isGenUI = 'type' in scriptItem && scriptItem.type === 'genui';
    const isUserGenUIResponse = 'type' in scriptItem && scriptItem.type === 'user_genui_response';
    const isUserText = 'role' in scriptItem && scriptItem.role === 'user';

    const delay = isAssistant || isGenUI ? 1400 : 900; // Slightly longer pauses for thought

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);

    messageTimeoutRef.current = setTimeout(() => {
       const messageId = `msg-${currentIndex}-${Date.now()}`;

        if (isUserText && 'content' in scriptItem) {
            setMessages((prev) => [...prev, { id: messageId, role: 'user', content: scriptItem.content, type: 'text' }]);
            setCurrentIndex(i => i + 1);
        } else if (isAssistant && 'content' in scriptItem) {
            typeMessage(scriptItem.content, () => {
                setMessages((prev) => [...prev, { id: messageId, role: 'assistant', content: scriptItem.content, type: 'text' }]);
                setCurrentIndex(i => i + 1);
            });
        } else if (isGenUI && 'component' in scriptItem) {
            const genUIProps = scriptItem.props as DemoGenUIButtonsProps;
             setMessages((prev) => [...prev, {
                 id: messageId,
                 role: 'assistant',
                 type: 'genui',
                 component: 'buttons',
                 props: genUIProps
             }]);
             setCurrentIndex(i => i + 1);
        } else if (isUserGenUIResponse && 'questionId' in scriptItem) {
             setSubmittedGenUIAnswers(prev => ({
                 ...prev,
                 [scriptItem.questionId]: scriptItem.selectedOptionId
             }));
             setCurrentIndex(i => i + 1);
        }

    }, delay);

    return () => {
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isSimulating, currentIndex, typeMessage, stopSimulation]);


  // Scroll Effect
  useEffect(() => {
    // ... (Keep implementation from previous step) ...
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTypingContent]); // Keep scrolling on typing update

  const startSimulation = () => {
    // ... (Keep implementation from previous step) ...
    stopSimulation();
    setMessages([]);
    setSubmittedGenUIAnswers({});
    setCurrentIndex(0);
    setIsSimulating(true);
  };

  // Helper to check if the assistant is currently typing for the indicator
  const isAssistantTyping = showTypingIndicator && currentIndex < conversationScript.length && 'role' in conversationScript[currentIndex] && conversationScript[currentIndex].role === 'assistant';

  return (
    <Card className="rounded-2xl overflow-hidden bg-card shadow-xl flex flex-col h-[500px] max-w-md mx-auto border-primary/10 border-2">
      {/* Header */}
      <CardHeader className="bg-muted/60 p-3 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-full">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Pulse AI Demo</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={startSimulation} className="h-8 text-xs px-3">
           {isSimulating || messages.length > 0 ? "Restart Demo" : "Start Demo"}
        </Button>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-muted-foreground/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-2.5",
              message.role === "user" ? "justify-end" : "justify-start",
              "animate-fade-in-up" // Keep subtle animation
            )}
             style={{ '--animation-delay': '50ms' } as React.CSSProperties}
          >
            {message.role === "assistant" && (
               <div className="flex-shrink-0 bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center border border-primary/20">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "rounded-xl px-4 py-2.5 max-w-[85%] shadow-sm",
                 message.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background border rounded-bl-none",
              )}
            >
              {message.type === 'text' && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
              {message.type === 'genui' && message.component === 'buttons' && (
                <DemoButtonsInput
                  {...message.props}
                  selectedOptionId={submittedGenUIAnswers[message.props.questionId]} // Use submitted answer state
                  // Indicate submission state visually for the *specific* GenUI element
                  isSubmitted={!!submittedGenUIAnswers[message.props.questionId]}
                 />
              )}
            </div>
             {message.role === "user" && (
               <div className="flex-shrink-0 bg-foreground/5 text-foreground h-8 w-8 rounded-full flex items-center justify-center border border-border">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isAssistantTyping && (
           // ... (Keep typing indicator rendering as before) ...
            <div className="flex items-start gap-2.5 animate-fade-in-up" style={{ '--animation-delay': '50ms' } as React.CSSProperties}>
             <div className="flex-shrink-0 bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center border border-primary/20">
                <Bot className="h-4 w-4" />
             </div>
            <div className="flex space-x-1.5 p-3 bg-background rounded-xl border rounded-bl-none shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-150" />
            </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

       {/* Footer */}
       <div className="text-center text-xs text-muted-foreground p-2 border-t bg-muted/60">
            Simulated Conversation Demo
       </div>
    </Card>
  );
} 