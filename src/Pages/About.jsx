import { useState, useEffect } from "react";
import OurDetails from "../components/OurDetails";
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  Lightbulb,
  Rocket,
} from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("mission");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  document.title = "asmDocx | About Us";

  const values = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible with AI and document automation.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      title: "Simplicity",
      description: "Complex problems deserve simple solutions. We make the complicated feel effortless.",
      icon: <Target className="w-6 h-6" />,
    },
    {
      title: "Quality",
      description: "Every document generated meets professional standards. No compromises on quality.",
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "Growth",
      description: "We're committed to continuous improvement and helping our users achieve more.",
      icon: <Rocket className="w-6 h-6" />,
    },
  ];



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
      <div className="relative z-10 px-6 py-8 mt-[80px]">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-[100px]">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors mb-6">
              <Users className="w-4 h-4 mr-2" />
              About asmDocx
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Revolutionizing Document Creation
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              asmDocx is an innovative platform that combines the power of artificial intelligence with intuitive design
              to make professional document creation accessible to everyone. From applications to emails, we're
              transforming how people create and manage their important documents.
            </p>
          </div>



          {/* Mission, Vision, Values Tabs */}
          <div className="mb-[100px]">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center mb-8 space-x-2">
                {["mission", "vision", "values"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>



              {/* Tab Content */}
              <div className="text-center">
                {activeTab === "mission" && (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="bg-purple-500/20 p-4 rounded-full">
                        <Target className="w-12 h-12 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                      To democratize professional document creation by providing intelligent, user-friendly tools that
                      save time, reduce complexity, and ensure quality. We believe everyone deserves access to
                      professional-grade document generation, regardless of their technical expertise or resources.
                    </p>
                  </div>
                )}

                {activeTab === "vision" && (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="bg-cyan-500/20 p-4 rounded-full">
                        <Globe className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                      To become the world's leading platform for AI-powered document creation, where millions of users
                      can effortlessly generate professional documents in seconds. We envision a future where document
                      creation is no longer a barrier to productivity and success.
                    </p>
                  </div>
                )}

                {activeTab === "values" && (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="bg-pink-500/20 p-4 rounded-full">
                        <Heart className="w-12 h-12 text-pink-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-6">Our Values</h3>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {values.map((value, index) => (
                        <div key={index} className="bg-white/10 rounded-xl p-6 text-left">
                          <div className="flex items-center mb-3">
                            <div className="bg-purple-500/20 p-2 rounded-lg mr-3">{value.icon}</div>
                            <h4 className="text-xl font-semibold text-white">{value.title}</h4>
                          </div>
                          <p className="text-gray-300">{value.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <OurDetails />

        </div>
      </div>
    </div>
  );
}
