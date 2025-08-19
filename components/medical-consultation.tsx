"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Mic, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface MedicalConsultationProps {
  conversation: any | null;
}

export function MedicalConsultation({ conversation: initialConversation }: MedicalConsultationProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (initialConversation && initialConversation.messages) {
      const loadedMessages = initialConversation.messages.map((msg: any, index: number) => ({
        id: `${initialConversation.id}-${index}`,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(initialConversation.timestamp?._seconds * 1000),
      }));
      setMessages(loadedMessages);
      setCurrentConversationId(initialConversation.id);
    } else {
      // New chat
      setMessages([
        {
          id: "1",
          content:
            "Hello! I'm your AI health companion. I'm here to help with your medical questions and provide guidance. Please note that I'm not a replacement for professional medical care. How can I assist you today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      setCurrentConversationId(null);
    }
  }, [initialConversation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    // Optimistically add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/medical-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          message: currentInput, 
          conversationId: currentConversationId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // If it was a new conversation, set the new ID for continuation
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            Medical Consultation
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-muted text-foreground mr-12",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary/10 text-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-foreground rounded-2xl px-4 py-3 mr-12">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms or ask a health question..."
                  className="pr-20 h-12 bg-background border-border/50 focus:border-primary/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="h-12 px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This AI assistant provides general health information and is not a substitute for professional medical
              advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}