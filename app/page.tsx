"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { GoogleGenAI } from "@google/genai";
import { Play, Code, Youtube, Send, Loader2 } from "lucide-react";

// আপনার Gemini API Key সরাসরি যুক্ত করা হয়েছে
const GEMINI_API_KEY = "AQ.Ab8RN6LyevdDQYpV1cQd5vplmU_YAymn2p2CV4xvCrUgDpeJ_g";

export default function AICoderApp() {
  const [prompt, setPrompt] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [code, setCode] = useState("// আপনার কোড এখানে জেনারেট হবে বা নিজে লিখুন...\n");
  const [language, setLanguage] = useState("javascript");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt && !youtubeUrl) {
      alert("অনুগমন করে কোনো প্রম্পট অথবা ইউটিউব লিংক দিন!");
      return;
    }

    setLoading(true);
    
    // গুগল জেনারেটিভ এআই ক্লায়েন্ট ইনিশিয়ালাইজেশন
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
      let fullPrompt = `আপনি একজন ওয়ার্ল্ড-ক্লাস এক্সপার্ট সফটওয়্যার ইঞ্জিনিয়ার ও অল-রাউন্ডার কোডার। যেকোনো কোডিং ল্যাঙ্গুয়েজ (Python, JS, C++, Rust, Assembly ইত্যাদি) এবং টেকনিক্যাল বিষয়ে আপনার গভীর জ্ঞান রয়েছে।\n\n`;

      if (youtubeUrl) {
        fullPrompt += `ব্যবহারকারী একটি ইউটিউব ভিডিও বিশ্লেষণ করতে চেয়েছেন: ${youtubeUrl}\nভিডিওটিতে কি কি বিষয় ও কোডিং কনসেপ্ট আলোচনা করা হয়েছে তা বিস্তারিতভাবে ব্যাখ্যা করুন।\n\n`;
      }

      if (prompt) {
        fullPrompt += `ইউজারের প্রশ্ন/রিকোয়েস্ট: ${prompt}\n\n`;
      }

      fullPrompt += `উত্তর দেওয়ার সময় স্পষ্ট ও নির্ভুল লজিক ব্যবহার করুন। যদি কোনো কোড জেনারেট করতে হয়, তবে কোডটি অবশ্যই মার্কডাউন কোড ব্লকে (যেমন: \`\`\`javascript ... \`\`\`) লিখুন।`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: fullPrompt,
      });

      const responseText = response.text || "কোনো রেসপন্স পাওয়া যায়নি।";

      // চ্যাট স্টোরি আপডেট
      setChatLog((prev) => [
        ...prev,
        { role: "user", text: prompt || `YouTube Analysis: ${youtubeUrl}` },
        { role: "ai", text: responseText },
      ]);

      // উত্তর থেকে কোড ফিল্টার করে এডিটরে বসানো
      const codeMatch = responseText.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setCode(codeMatch[1]);
      }

      setPrompt("");
      setYoutubeUrl("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans">
      {/* বাম পাশের কন্ট্রোল প্যানেল ও চ্যাট এলাকা */}
      <div className="w-1/2 flex flex-col border-r border-slate-800 p-4 space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
          <Code /> Universal AI Coder
        </h1>

        {/* চ্যাট বক্স */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-4 overflow-y-auto space-y-4">
          {chatLog.length === 0 && (
            <div className="text-slate-500 text-sm text-center mt-20">
              <p className="font-semibold text-slate-400 mb-2">স্বাগতম Universal AI Coder-এ!</p>
              <p>১. যেকোনো জটিল কোডের চাহিদা প্রম্পটে লিখুন।</p>
              <p>২. ইউটিউব ভিডিও লিংক দিয়ে ভিডিওর কনসেপ্ট বা কোড জানতে চান।</p>
            </div>
          )}
          {chatLog.map((chat, index) => (
            <div
              key={index}
              className={`p-3 rounded text-sm ${
                chat.role === "user" ? "bg-blue-600/20 ml-8 text-blue-200" : "bg-slate-800 mr-8 text-slate-200"
              }`}
            >
              <strong className="block mb-1 text-xs text-slate-400">
                {chat.role === "user" ? "ইউজার" : "AI Coder"}:
              </strong>
              <pre className="whitespace-pre-wrap font-sans">{chat.text}</pre>
            </div>
          ))}
        </div>

        {/* ইনপুট ফিল্ডস */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ইউটিউব ভিডিও লিঙ্ক (ঐচ্ছিক)..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-red-500"
            />
            <Youtube className="text-red-500 self-center" />
          </div>

          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder="আপনি কি ধরনের কোড বা প্রবলেম সলভ করতে চান লিখুন..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded flex items-center justify-center text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ডান পাশের কোড এডিটর (VS Code Look) */}
      <div className="w-1/2 flex flex-col bg-slate-900">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <span className="text-sm font-medium text-slate-400">Code Editor</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="rust">Rust</option>
            <option value="assembly">Assembly</option>
            <option value="html">HTML</option>
          </select>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
    }
    
