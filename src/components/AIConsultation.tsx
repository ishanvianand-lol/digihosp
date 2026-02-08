import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  AlertTriangle,
  X,
  MessageSquare,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiConsultationProps {
  healthContext?: {
    recentSymptoms?: any[];
    sleepScore?: number;
    healthRiskScore?: number;
    pastDiagnoses?: string[];
    allergies?: string[];
    age?: number;
  };
}

export function AiConsultation({ healthContext }: AiConsultationProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Namaste! I'm your AI Health Assistant powered by Google Gemini. Main aapki health-related queries mein madad kar sakti hoon.\n\nAap mujhse kuch bhi puch sakte ho:\n• Symptoms ke baare mein\n• Diet aur nutrition advice\n• Exercise recommendations\n• Sleep improvement tips\n• Mental health support\n\nKya main aapki kaise madad kar sakti hoon?",
      timestamp: new Date(),
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const callGeminiApi = async (userQuery: string): Promise<string> => {
    try {
      // Prepare context for AI
      const contextString = healthContext
        ? `\n\nUser's Health Context:
- Recent Symptoms: ${healthContext.recentSymptoms?.map((s) => s.symptoms).join(", ") || "None"}
- Sleep Score: ${healthContext.sleepScore || "Not available"}/100
- Health Risk Score: ${healthContext.healthRiskScore || 0}/100
- Past Diagnoses: ${healthContext.pastDiagnoses?.join(", ") || "None"}
- Allergies: ${healthContext.allergies?.join(", ") || "None"}
- Age: ${healthContext.age || "Not provided"}`
        : "";

      const prompt = `You are a helpful medical AI assistant. You can respond in both English and Hinglish (Hindi-English mix) based on the user's language preference.

IMPORTANT GUIDELINES:
1. Provide helpful, evidence-based health information
2. Be empathetic and supportive
3. ALWAYS include a disclaimer that this is NOT a diagnosis
4. Recommend seeing a doctor for serious concerns
5. Use simple language that's easy to understand
6. If user asks in Hinglish, respond in Hinglish too
7. For emergency symptoms (chest pain, difficulty breathing, severe bleeding), immediately advise calling emergency services

${contextString}

User Question: ${userQuery}

Provide a helpful, informative response. Include relevant health tips and recommendations.`;

      // Call Google Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini");
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      // Add disclaimer if not already present
      if (!aiResponse.includes("Disclaimer") && !aiResponse.includes("disclaimer")) {
        return (
          aiResponse +
          "\n\n⚠️ *Disclaimer: Yeh AI-powered guidance hai, medical diagnosis nahi. Serious health concerns ke liye please qualified doctor se consult karein.*"
        );
      }

      return aiResponse;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or consult with your healthcare provider directly for urgent concerns.";
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isAiTyping) return;

    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserMessage("");
    setIsAiTyping(true);

    try {
      const aiResponse = await callGeminiApi(userMessage);

      const newAiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Maaf kijiye, mujhe kuch technical issue aa raha hai. Kripya thodi der baad try karein ya emergency ke liye 108 dial karein.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "My headache won't go away",
    "How can I sleep better?",
    "Diet tips for better health",
    "I feel anxious and stressed",
  ];

  return (
    <div
      className={`card-medical transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 md:inset-8" : "h-full"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary" />
              <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Consultation</h3>
              <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
            </div>
          </div>
          {isExpanded ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Chat Messages */}
        <div
          className={`flex-1 space-y-4 overflow-y-auto p-4 ${
            isExpanded ? "max-h-[60vh]" : "max-h-[300px]"
          }`}
        >
          {chatMessages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p className="mt-1 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions (only show when chat is empty) */}
          {chatMessages.length === 1 && !isAiTyping && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserMessage(question)}
                    className="rounded-xl border border-border/50 bg-background p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question... (English या Hinglish)"
              className="input-medical min-h-[60px] resize-none"
              rows={2}
              disabled={isAiTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isAiTyping}
              className="h-auto bg-gradient-primary text-white"
            >
              {isAiTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning/5 p-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-muted-foreground">
              AI assistant for information only. Not a substitute for professional
              medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}