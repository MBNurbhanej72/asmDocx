import { MdAttachEmail, MdMarkEmailRead } from "react-icons/md";
import SpotlightCard from "../components/SpotlightCard";
import { NavLink } from "react-router-dom";
import { ChevronRight, Code, FileText, Mail, MessageSquare } from "lucide-react";

const Features = () => {

  const features = [
    {
      navLink: "email-generator",
      icon: Mail,
      title: "Email Generator",
      description: "Write clear, effective emails for any occasion — powered by intelligent templates and automation.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      navLink: "application-generator",
      icon: FileText,
      title: "Application Generator",
      description: "Generate complex applications effortlessly with predefined templates and intuitive customization.",
      color: "from-purple-500 to-pink-500",
    }
  ];



  return (
    <>
      <section id="features" className="relative z-10 px-6 mb-[100px]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful AI Generators
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose from our collection of specialized AI tools designed to boost your productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {features.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <NavLink to={`/${tool.navLink}`} key={index}>
                  <SpotlightCard className="custom-spotlight-card bg-[#1f29374d] border border-white/10 backdrop-blur-lg transition-all duration-500 h-full" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-white text-xl font-semibold mb- 2">{tool.title}</h3>

                    <p className="text-gray-400 leading-relaxed">{tool.description}</p>
                  </SpotlightCard>
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
