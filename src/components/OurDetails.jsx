import {
  Zap,
  Shield,
  Globe,
  Heart,
  ArrowRight,
  Mail,
  Linkedin,
  Github,
} from "lucide-react";

import { useEffect } from "react";
import MBImg from "../images/MB.jpg";
import SKImg from "../images/SK.jpg";
import ARImg from "../images/AR.jpg";
import { NavLink } from "react-router-dom";

const OurDetails = () => {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  const teamMembers = [
    {
      name: "ShabbirHasan Kovadiya",
      role: "Frontend Developer",
      image: SKImg,
      bio: "Passionate about AI integration and frontend development.",
      social: { linkedin: "https://www.linkedin.com/in/shabbirkovadiya/", github: "https://github.com/shabbirkovadiya" },
    },
    {
      name: "MohammadAli Nurbhanej",
      role: "Frontend Developer",
      image: MBImg,
      bio: "Frontend developer with expertise in AI and document processing.",
      social: { linkedin: "https://www.linkedin.com/in/mohammadali-nurbhanej/", github: "https://github.com/MBNurbhanej72" },
    },
    {
      name: "AbbasAli Rajpura",
      role: "Frontend Developer",
      image: ARImg,
      bio: "Creating beautiful user experiences for complex workflows.",
      social: { linkedin: "https://www.linkedin.com/in/abbasali-rajpura-035865308", github: "https://github.com/rajpuraabbasali" },
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Advanced AI algorithms that understand context and generate professional documents instantly.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is encrypted and never stored. Complete privacy and security guaranteed.",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Universal Access",
      description: "Available anywhere, anytime. No downloads required - just open your browser and start creating.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "User-Centric Design",
      description: "Built with users in mind. Simple, intuitive interface that anyone can master in minutes.",
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
  ];


  return (
    <section id="features" className="relative z-10 px-6 mb-[50px]">
      <div className="max-w-6xl mx-auto">
        {/* Features Section */}
        <div className="mb-[100px]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose asmDocx?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We've built asmDocx with cutting-edge technology and user-centric design to deliver the best document
              creation experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className={`${feature.bgColor} p-4 rounded-lg mb-6 w-fit`}>
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-[100px]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The passionate individuals behind asmDocx, working tirelessly to make document creation effortless for
              everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl text-center hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="mb-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-500/30 group-hover:border-purple-500/50 transition-all"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-purple-300 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
                </div>

                <div className="flex justify-center space-x-3">
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    className="bg-white/10 hover:bg-blue-500/20 p-2 rounded-lg transition-all duration-300"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400" />
                  </a>
                  <a
                    href={member.social.github}
                    target="_blank"
                    className="bg-white/10 hover:bg-gray-500/20 p-2 rounded-lg transition-all duration-300"
                  >
                    <Github className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/20 backdrop-blur-lg rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already creating professional documents with asmDocx. Experience the
              future of document creation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/email-generator"
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Try Email Generator</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <NavLink
                to="/contact-us"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Contact Us</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurDetails;