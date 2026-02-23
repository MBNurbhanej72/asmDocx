import "../App.css";
import Hero from "../components/Hero";
import Features from "../components/Features";
import OurDetails from "../components/OurDetails";

function Home() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">

        <div className="absolute inset-0">
          <div className="relative w-full h-full flex flex-col items-center justify-center md:block opacity-50">
            <div className="w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1000 md:absolute md:top-0/4 md:right-2/4 md:mt-[40px]"></div>

            <div className="w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1500 md:absolute md:top-0/4 md:right-1/4 md:mt-[150px]"></div>
          </div>
        </div>

        <Hero />

        <Features />

        <div className="mb-[82px]">
          <OurDetails />
        </div>

      </div>
    </>
  );
}

export default Home;
