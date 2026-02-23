import { Sparkles } from "lucide-react";

const Footer = () => {

  const handleTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };



  return (
    <>
      <footer className="relative z-10 px-6 py-6 border-t border-white/10" >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div onClick={handleTop} className="flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                asmDox
              </span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 asmDox. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
