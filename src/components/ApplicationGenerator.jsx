import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import {
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  User,
  Building,
  Calendar,
  MessageSquare,
  Download,
  Loader2,
  Eye,
  EyeOff,
  School,
  UserCheck,
} from "lucide-react";

import { toast } from "react-toastify";
import LoginPopup from "./LoginPopup";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ApplicationGenerator() {
  const [form, setForm] = useState({
    name: "",
    classOrPosition: "",
    organization: "",
    to: "",
    toOrganization: "",
    date: new Date().toLocaleDateString("en-GB"),
    subject: "",
    respected: "Respected Sir/Madam,",
    body: "",
    closing: "Yours faithfully,\n",
  });

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);


  document.title = "asmDocx | Application Generator";


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleAI = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your application");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          // model: "mistralai/mistral-small-24b-instruct-2501:free",
          messages: [
            {
              role: "user",
              content: `Write an official application letter as JSON. Use these exact keys: name, classOrPosition, organization, to, toOrganization, date, subject, respected, body, closing.

              - Only return the JSON object, no extra text.
              - The 'closing' should be a polite phrase like "Yours faithfully,", followed by a newline and the sender's name (i.e., the value of the 'name' field).
              Prompt: "${prompt}"`
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_MY_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
          },
        }
      );

      let data = res.data.choices?.[0]?.message?.content || res.data.choices?.[0]?.text || "";
      data = data.replace(/```json|```/g, "").trim();

      const jsonMatch = data.match(/({[\s\S]*})/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response.");
      const parsed = JSON.parse(jsonMatch[1]);

      let [phrase, name] = parsed.closing.split(",").map(str => str.trim());
      if (name && !parsed.closing.includes("\n")) {
        parsed.closing = `${phrase},\n${name}`;
      }

      // ✅ Fix greeting punctuation
      if (parsed.respected && !parsed.respected.trim().endsWith(",")) {
        parsed.respected = parsed.respected.trim() + ",";
      }

      setForm((prev) => {
        const { date, ...restParsed } = parsed;
        return { ...prev, ...restParsed, date: prev.date };
      });

      toast.success("Application generated successfully!");
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("Generating failed. Please check API or try again.");
    }
    setLoading(false);
  };



  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Application_${Date.now()}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "to", "subject", "body"];
    const emptyFields = requiredFields.filter((field) => !form[field]?.trim());

    if (emptyFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.info("Please log in to continue.");
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Save to Firestore (Title, Prompt, Content)
      await addDoc(collection(db, "userDocuments"), {
        userId: user.uid,
        type: "application",
        title: form.subject || "Application Document",
        prompt: prompt,
        formData: form,
        contentPreview: form.body?.substring(0, 150) + "...",
        createdAt: serverTimestamp(),
      });

      // 2. Trigger PDF Download
      handlePrint();
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to save application info.");
    } finally {
      setLoading(false);
    }
  };


  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
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
              <FileText className="w-4 h-4 mr-2" />
              Powered by AI
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Application Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Create professional application letters with AI-powered templates and personalization. Generate PDF
              documents instantly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <form
                id="applicationForm"
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
                    placeholder="Describe your application... (e.g., Write a leave application for medical reasons, or Create an application for admission to university)"
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
                    Application Details
                  </h3>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={updateField("name")}
                        required
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <School className="w-4 h-4 mr-2" />
                        Class/Position
                      </label>
                      <input
                        type="text"
                        name="classOrPosition"
                        placeholder="Your class or position"
                        value={form.classOrPosition}
                        onChange={updateField("classOrPosition")}
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Your Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        placeholder="Your school/company"
                        value={form.organization}
                        onChange={updateField("organization")}
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <UserCheck className="w-4 h-4 mr-2" />
                        To (Recipient) *
                      </label>
                      <input
                        type="text"
                        name="to"
                        placeholder="e.g., The Principal"
                        value={form.to}
                        onChange={updateField("to")}
                        required
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Recipient Organization and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Recipient's Organization
                      </label>
                      <input
                        type="text"
                        name="toOrganization"
                        placeholder="Recipient's organization"
                        value={form.toOrganization}
                        onChange={updateField("toOrganization")}
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date
                      </label>
                      <input
                        type="text"
                        name="date"
                        placeholder="Date"
                        value={form.date}
                        onChange={updateField("date")}
                        className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Application subject"
                      value={form.subject}
                      onChange={updateField("subject")}
                      required
                      className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Greeting */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Greeting
                    </label>
                    <input
                      type="text"
                      name="respected"
                      placeholder="e.g., Respected Sir/Madam,"
                      value={form.respected}
                      onChange={updateField("respected")}
                      className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Application Body */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Application Body *
                    </label>
                    <textarea
                      name="body"
                      placeholder="Main content of your application..."
                      value={form.body}
                      onChange={updateField("body")}
                      required
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-4 rounded-xl h-36 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Closing */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Closing
                      </label>
                      <textarea
                        name="closing"
                        placeholder={`e.g., Yours faithfully,\nMammu`}
                        value={form.closing}
                        onChange={updateField("closing")}
                        required
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      <span>{showPreview ? "Hide Preview" : "Preview Application"}</span>
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
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-purple-400" />
                  Application Preview
                </h3>
                {showPreview && (form.name || form.to || form.subject || form.body) ? (
                  <div className="bg-white/10 rounded-xl p-6 space-y-4 border border-white/20">
                    {/* Header Section - Right Aligned */}
                    <div className="text-right break-all space-y-1 mb-8">
                      {form.classOrPosition && <div>{form.classOrPosition}</div>}
                      {form.organization && <div>{form.organization}</div>}
                      {form.date && <div>{form.date}</div>}
                    </div>

                    {/* Recipient Section - Left Aligned */}
                    <div className="text-left space-y-1 mb-6 break-all">
                      <div className="font-medium">To,</div>
                      {form.to && <div>{form.to}</div>}
                      {form.toOrganization && <div>{form.toOrganization}</div>}
                    </div>

                    {/* Subject Line */}
                    {form.subject && (
                      <div className="mb-6">
                        <span className="font-medium">Subject: </span>
                        <span className="break-all">{form.subject}</span>
                      </div>
                    )}

                    {/* Greeting */}
                    {form.respected && <div className="mb-4 break-all">{form.respected}</div>}

                    {/* Body Content */}
                    {form.body && <div className="mb-8 text-justify leading-relaxed break-all">{form.body}</div>}

                    {/* Closing Section - Right Aligned */}
                    <div className="text-right whitespace-pre-wrap space-y-2 mt-8">
                      {form.closing && <div className="break-all">{form.closing}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Fill in the form to see your application preview</p>
                    <p className="text-sm mt-2">Use AI generation or manually enter your application details</p>
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
                    <span>Be specific about the type of application you need</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>Include relevant details like dates, reasons, and duration</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Review the AI-generated content and customize as needed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Use formal language appropriate for official applications</span>
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

      {/* 📄 Hidden Printable Content */}
      <div style={{ display: "none" }}>
        <div ref={componentRef} className="p-10 text-black bg-white font-sans" style={{ width: '210mm' }}>
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold" style={{ color: '#4F46E5' }}>Application</h1>
            <hr className="mt-2 border-gray-300" />
          </div>

          <div className="text-right space-y-0.5 mb-6 text-gray-900">
            {form.name && <p>{form.name}</p>}
            {form.classOrPosition && <p>{form.classOrPosition}</p>}
            {form.organization && <p>{form.organization}</p>}
            {form.date && <p>{form.date}</p>}
          </div>

          <div className="mb-4 text-gray-900">
            <p><span className="font-bold">To,</span></p>
            {form.to && <p>{form.to}</p>}
            {form.toOrganization && <p>{form.toOrganization}</p>}
          </div>

          <div className="mb-4 text-gray-900">
            <p><span className="font-bold">Subject:</span> {form.subject}</p>
          </div>

          <div className="mt-4 leading-relaxed text-gray-800">
            <p className="mb-3">{form.respected}</p>
            <div className="whitespace-pre-wrap min-h-[250px]">{form.body}</div>

            <div className="mt-8 text-right">
              <p className="whitespace-pre-wrap">{form.closing}</p>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-gray-300 text-center">
            <p className="text-sm font-bold text-gray-700">© 2026 asmDocx</p>
          </div>
        </div>
      </div>
    </div>
  );
}

