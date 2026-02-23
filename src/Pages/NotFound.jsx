import { useState, useEffect } from "react";
import {
  Home,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  Users,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  const [glitchText, setGlitchText] = useState("404");



  // Glitch effect for 404 text
  useEffect(() => {
    const glitchChars = ["4", "0", "4", "█", "▓", "▒", "░"];
    const interval = setInterval(() => {
      const randomChars = Array.from(
        { length: 3 },
        () => glitchChars[Math.floor(Math.random() * glitchChars.length)],
      ).join("");
      setGlitchText(randomChars);

      setTimeout(() => setGlitchText("404"), 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);



  // Back To Page
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };



  // Refresh Page
  const refreshPage = () => {
    window.location.reload();
  };



  const popularPages = [
    {
      title: "Email Generator",
      description: "Generate professional emails instantly",
      icon: <Mail className="w-5 h-5" />,
      href: "/email-generator",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
    },
    {
      title: "Application Generator",
      description: "Create professional application letters with AI",
      icon: <FileText className="w-5 h-5" />,
      href: "/application-generator",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "About Us",
      description: "Learn more about asmDocx and our mission",
      icon: <Users className="w-5 h-5" />,
      href: "/about",
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
    {
      title: "Contact Us",
      description: "Get in touch with our support team",
      icon: <Phone className="w-5 h-5" />,
      href: "/contact-us",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-[300px] left-1/4 w-96 h-96 -translate-x-[200px] bg-purple-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-[400px] left-1/2 w-96 h-96 translate-y-[150px] bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"></div>
        </div>
      </div>



      {/* Navigation */}
      <Navbar showAuthButtons={false} />



      {/* Main Content */}
      <div className="relative z-10 px-6 pt-8 mb-[82px] mt-[80px]">
        <div className="max-w-6xl mx-auto">
          {/* 404 Hero Section */}
          <div className="text-center mb-16">
            {/* Large 404 with Glitch Effect */}
            <div className="mb-8">
              <h1
                className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent select-none"
                style={{
                  textShadow: "0 0 30px rgba(168, 85, 247, 0.5)",
                  filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))",
                }}
              >
                {glitchText}
              </h1>
            </div>



            {/* Error Message */}
            <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-200 mb-8">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Page Not Found
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Oops! This page got lost in cyberspace
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
              The page you're looking for doesn't exist or has been moved. Don't worry though, we'll help you find what
              you're looking for or get you back on track.
            </p>



            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={goBack}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>

              <a
                href="/"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </a>

              <button
                onClick={refreshPage}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>



          {/* Popular Pages */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Popular Pages</h3>
              <p className="text-xl text-gray-300">Maybe you were looking for one of these?</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPages.map((page, index) => (
                <a
                  key={index}
                  href={page.href}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 group block"
                >
                  <div className={`${page.bgColor} p-4 rounded-lg mb-4 w-fit`}>
                    <div className={page.color}>{page.icon}</div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {page.title}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{page.description}</p>
                  <div className="flex items-center text-purple-400 text-sm font-medium">
                    <span>Visit page</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>



          {/* Error Details */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 backdrop-blur-lg rounded-2xl p-8">
              <h4 className="text-xl font-bold text-white mb-4">Still need help?</h4>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                If you believe this is an error or you're having trouble finding what you're looking for, please don't
                hesitate to contact our support team. We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact-us"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </div>



          {/* Fun Error Code */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>Error Code: 404_CYBERSPACE_LOST</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
