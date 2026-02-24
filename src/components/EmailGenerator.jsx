import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PHP_BASE_URL } from "../config/api";
import {
  Mail,
  Sparkles,
  Zap,
  ArrowRight,
  User,
  AtSign,
  FileText,
  MessageSquare,
  Download,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import "../App.css";
import { toast } from "react-toastify";
import LoginPopup from "./LoginPopup";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EmailGenerator() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    subject: "",
    greeting: "",
    summary: "",
    closing: "",
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  /* ----------------------------------------------------
     🔒 Firebase Auth Check
     ---------------------------------------------------- */
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(false);


  document.title = "asmDocx | Email Generator";


  const handleAI = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          "model": "openai/gpt-3.5-turbo",
          // "model": "google/gemini-2.0-flash-exp:free",
          // "model": "mistralai/mistral-small-24b-instruct-2501:free",
          "messages": [
            {
              "role": "user",
              "content": `Write an email in JSON format with the following keys: from, to, subject, greeting, summary, and closing.
              - Use this prompt for the email: ${prompt}.
              - Extract the sender's name from the 'from' email address (i.e., the part before '@') and include it in the closing.
              - End the closing with a polite phrase like 'Yours sincerely' or 'Yours faithfully', followed by a newline and the sender's name.`
            }
          ]
        }
        ,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_MY_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
          },
        },
      );

      let data = res.data.choices[0].message.content.trim();

      const jsonMatch = data.match(/({[\s\S]*})/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response.");

      data = jsonMatch[1];

      const parsed = JSON.parse(data);

      setForm({ ...form, ...parsed });

      toast.success("Email generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Generating failed. Please check API or try again.");
    }
    setLoading(false);
  };




  const handlePHPPrint = async () => {
    try {
      const response = await axios.post(`${PHP_BASE_URL}email-generator.php`, form, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Email_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF Generation failed:", error);
      toast.error("Failed to generate PDF via PHP. Make sure your PHP server is running.");
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ["from", "to", "subject", "greeting", "summary", "closing"];
    const emptyFields = requiredFields.filter((field) => !form[field]?.trim());

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.info("Please log in to download PDF.");
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Firestore (Title, Prompt, Content)
      await addDoc(collection(db, "userDocuments"), {
        userId: user.uid,
        type: "email",
        title: form.subject || "Email Document",
        prompt: prompt,
        formData: form, // Saving the full generated object
        contentPreview: form.summary?.substring(0, 150) + "...",
        createdAt: serverTimestamp(),
      });

      // 2. Generate PDF via PHP
      handlePHPPrint();


    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document info.");
    } finally {
      setLoading(false);
    }
  };




  const handleGmailRedirect = () => {
    if (user) {
      // ✅ Proceed with Gmail redirect
      const { to, subject, summary, closing } = form;
      const body = `${summary}\n\n${closing}`;
      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        to
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailURL, "_blank");
    } else {
      // 🚫 Not logged in: show login popup
      toast.info("Please log in to send an email.");
      setShowLoginPopup(true); // Trigger your popup from here
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-[200px] bg-purple-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-2/4 left-1/2 w-96 h-96 translate-y-[150px] bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 mt-[80px] mb-[50px]">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-[64px]">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Powered by AI
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Email Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Write clear, effective emails for any occasion — powered by intelligent templates and automation. Generate PDF documents
              instantly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <form
                id="emailForm"
                onSubmit={(e) => e.preventDefault()}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl"
              >
                {/* AI Prompt Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                  </div>
                  <textarea
                    placeholder="Describe your email... (e.g., Write a professional follow-up email to a client about project status, or Create a thank you email for a job interview)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-4 rounded-xl h-28 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleAI}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate with AI</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Email Details
                  </h3>

                  {/* From and To Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        From
                      </label>
                      <input
                        type="email"
                        name="from"
                        placeholder="sender@example.com"
                        value={form.from}
                        onChange={(e) => setForm({ ...form, from: e.target.value })}
                        required
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <AtSign className="w-4 h-4 mr-2" />
                        To
                      </label>
                      <input
                        type="email"
                        name="to"
                        placeholder="recipient@example.com"
                        value={form.to}
                        onChange={(e) => setForm({ ...form, to: e.target.value })}
                        required
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Email subject line"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Greeting */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Greeting
                    </label>

                    <input
                      type="text"
                      name="greeting"
                      placeholder="Greeting (e.g. Dear Sir,)"
                      value={form.greeting}
                      onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                      required
                      className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email Body */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Email Body
                    </label>
                    <textarea
                      name="summary"
                      placeholder="Main content of your email..."
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                      required
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-4 rounded-xl h-36 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Closing */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-300">Closing</label>
                    <textarea
                      name="closing"
                      placeholder="e.g., Best regards,&#10;John Smith&#10;Project Manager"
                      value={form.closing}
                      onChange={(e) => setForm({ ...form, closing: e.target.value })}
                      required
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      <span>{showPreview ? "Hide Preview" : "Preview Email"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      <span>Generate PDF</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGmailRedirect}
                    className={`w-full items-center mt-[29px] py-2 rounded 
                      ${[form.to, form.subject, form.summary, form.closing].every(f => f?.trim())
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg'
                        : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg cursor-not-allowed'
                      }`}
                    disabled={!([form.to, form.subject, form.summary, form.closing].every(f => f?.trim()))}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-purple-400" />
                  Email Preview
                </h3>

                {showPreview && (form.from || form.to || form.subject || form.greeting || form.summary || form.closing) ? (
                  <div className="bg-white/10 rounded-xl p-6 space-y-4 border border-white/20">
                    {form.from && (
                      <div className="flex items-start space-x-3">
                        <span className="text-gray-400 text-sm font-medium min-w-[60px]">From:</span>
                        <span className="text-white break-all">{form.from}</span>
                      </div>
                    )}
                    {form.to && (
                      <div className="flex items-start space-x-3">
                        <span className="text-gray-400 text-sm font-medium min-w-[60px]">To:</span>
                        <span className="text-white break-all">{form.to}</span>
                      </div>
                    )}
                    {form.subject && (
                      <div className="flex items-start space-x-3">
                        <span className="text-gray-400 text-sm font-medium min-w-[60px]">Subject:</span>
                        <span className="text-white font-medium break-all">{form.subject}</span>
                      </div>
                    )}

                    <div className="border-t border-white/20 pt-4">
                      {form.greeting && (
                        <div className="mb-4">
                          <p className="text-white leading-relaxed break-all">{form.greeting}</p>
                        </div>
                      )}
                      {form.summary && (
                        <div className="mb-4">
                          <p className="text-white leading-relaxed break-all">{form.summary}</p>
                        </div>
                      )}
                      {form.closing && (
                        <div className="mt-6">
                          <p className="text-white break-all">{form.closing}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Fill in the form to see your email preview</p>
                    <p className="text-sm mt-2">Use AI generation or manually enter your email details</p>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Be specific in your AI prompt for better results</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Include context like recipient relationship and purpose</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Review and edit the AI-generated content before generating PDF</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Use professional email addresses for business communications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Login Popup if not logged in */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />


    </div>
  );
}