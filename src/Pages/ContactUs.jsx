import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  User,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import LoginPopup from "../components/LoginPopup";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactUs() {
  const [contactData, setContactData] = useState({
    name: "",
    message: "",
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);



  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);



  document.title = "asmDocx | Contact Us";



  const handleChange = e => {
    const { name, value } = e.target;
    setContactData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };



  /* ----------------------------------------------------
     🔒 Firebase Auth Check
     ---------------------------------------------------- */
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Listen for auth state changes (login/logout)
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Check login status via Firebase User State
      if (!user) {
        setShowLoginPopup(true);
        toast.info("Please login to send a message.");
        return;
      }

      // ✅ Submit contact message to Firestore
      await addDoc(collection(db, "contacts"), {
        name: contactData.name,
        name: contactData.name,
        email: user.email, // Use logged-in user's email
        message: contactData.message,
        userId: user.uid,
        createdAt: serverTimestamp() // Use server timestamp for consistency
      });

      toast.success("Message sent successfully!");
      setContactData({ name: '', message: '' });

    } catch (err) {
      console.error("Error submitting form data:", err);
      toast.error("Failed to send message. Please try again.");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden z-1">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-[200px] bg-purple-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-2/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about asmDocx? Need support or want to share feedback? We'd love to hear from you.
            </p>
          </div>



          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Send className="w-6 h-6 mr-3 text-purple-400" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      name="name"
                      value={contactData.name}
                      onChange={handleChange}
                      required
                      className="inputFeild w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message *
                  </label>
                  <textarea
                    placeholder="Tell us more about your inquiry..."
                    name="message"
                    value={contactData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
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
