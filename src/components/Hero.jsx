import { useEffect, useState, useRef } from 'react';
import { Sparkles, Play, X } from "lucide-react";

const Hero = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef(null);
  const videoUrl = "https://res.cloudinary.com/dfkofafha/video/upload/v1754658619/demo_o5ofzt.mp4";



  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showVideoModal]);



  const openVideoModal = () => {
    setShowVideoModal(true);
  };



  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideoModal(false);
  };



  return (
    <>
      <section className="relative z-10 px-6 pt-20 mb-[100px] mt-[32px]">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by AI
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Generate Anything
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                with AI Magic
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your workflow with our suite of AI-powered generators. Create emails, content, code, and more in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={openVideoModal}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-8 py-4 text-lg rounded-md transition-all duration-300 group inline-flex items-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative z-20">
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-[60px] -right-5 bg-black/70 hover:bg-black/90 p-2 rounded-full text-white z-30"
            >
              <X className="w-6 h-6 " />
            </button>

            {/* Video */}
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="max-w-4xl max-h-[80vh] mt-20 w-full rounded-xl shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;
