"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Send,
  User,
  Sprout,
  Cloud,
  DollarSign,
  Shield,
  Zap,
  BarChart2,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Dummy AI responses
const aiResponses = {
  padi: "Berdasarkan data cuaca dan kondisi lahan saat ini, waktu terbaik untuk menanam padi adalah November-Desember. Pastikan irigasi siap dan drainase baik. Varietas Ciherang dan Mekongga direkomendasikan untuk wilayah Jawa Barat.",
  cuaca:
    "Prediksi cuaca 7 hari ke depan menunjukkan hujan ringan hingga sedang di wilayah Jawa Barat dengan suhu 23-28°C. Kelembaban tanah optimal untuk tanam. Waspadai potensi hujan lebat di akhir minggu.",
  harga:
    "Harga beras di wilayah Anda saat ini Rp 14.500/kg, sedikit di atas rata-rata nasional. Surabaya menawarkan harga termurah di Rp 13.800/kg. Tren harga stabil dengan potensi kenaikan 2-3% dalam sebulan ke depan.",
  risiko:
    "Berdasarkan analisis satelit, risiko banjir di wilayah Anda dalam kategori SEDANG (65%). Indeks curah hujan tinggi dalam 14 hari terakhir. Rekomendasi: Siapkan drainase dan pantau kondisi lahan secara berkala.",
  default:
    "Terima kasih atas pertanyaannya. Berdasarkan data yang tersedia, saya merekomendasikan untuk memantau kondisi cuaca dan kelembaban tanah secara berkala. Apakah ada aspek spesifik yang ingin Anda ketahui lebih lanjut?",
};

const suggestedQuestions = [
  { text: "Kapan waktu terbaik menanam padi?", icon: Sprout },
  { text: "Bagaimana prediksi cuaca minggu ini?", icon: Cloud },
  { text: "Berapa harga beras saat ini?", icon: DollarSign },
  { text: "Apa risiko pertanian di wilayah saya?", icon: Shield },
];

const aiCapabilities = [
  {
    icon: Sprout,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Rekomendasi Tanam",
    description: "Waktu tanam optimal berdasarkan lokasi dan komoditas pilihan Anda.",
  },
  {
    icon: BarChart2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Analisis Risiko",
    description: "Deteksi dini banjir, kekeringan, dan serangan hama berbasis satelit.",
  },
  {
    icon: Zap,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Info Pasar",
    description: "Harga komoditas real-time dan prediksi tren pasar antarwilayah.",
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("padi") || lower.includes("tanam")) return aiResponses.padi;
  if (lower.includes("cuaca") || lower.includes("hujan")) return aiResponses.cuaca;
  if (lower.includes("harga") || lower.includes("beras")) return aiResponses.harga;
  if (lower.includes("risiko") || lower.includes("banjir")) return aiResponses.risiko;
  return aiResponses.default;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
        <Bot className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Halo! Saya AI Agronomist Assistant Anda. Saya siap membantu menjawab pertanyaan tentang pertanian, cuaca, harga pasar, dan kondisi lahan. Apa yang bisa saya bantu hari ini?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: getAIResponse(text),
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1200);
  };

  const handleSend = () => sendMessage(input);

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Bot className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              AI Agronomist Assistant
            </h1>
            <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold">
              Beta
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Asisten AI untuk menjawab pertanyaan tentang pertanian, cuaca, dan pasar
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((q, index) => {
          const Icon = q.icon;
          return (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(q.text)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                "bg-white border border-gray-200 text-gray-700",
                "hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50",
                "transition-all duration-200 shadow-sm hover:shadow"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {q.text}
            </button>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="flex flex-col shadow-sm" style={{ height: "calc(100vh - 380px)", minHeight: "500px" }}>
        {/* Chat Header */}
        <CardHeader className="border-b pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">AI Agronomist</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">
              AgriNexus AI
            </Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2.5",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[72%] space-y-1",
                  message.role === "user" ? "items-end" : "items-start",
                  "flex flex-col"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                  )}
                >
                  {message.content}
                </div>
                <p
                  className={cn(
                    "text-[10px] text-gray-400",
                    message.role === "user" ? "text-right pr-1" : "pl-1"
                  )}
                >
                  {message.timestamp.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 shrink-0">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1 rounded-full border-gray-200 focus:border-emerald-400 px-4"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "w-10 h-10 rounded-full p-0 flex-shrink-0",
                "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
                "transition-all duration-200"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiCapabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <Card
              key={i}
              className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <CardContent className="pt-5 pb-5">
                <div className={cn("inline-flex p-2.5 rounded-xl mb-3", cap.iconBg)}>
                  <Icon className={cn("h-5 w-5", cap.iconColor)} />
                </div>
                <p className="font-semibold text-sm text-gray-800 mb-1">{cap.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
