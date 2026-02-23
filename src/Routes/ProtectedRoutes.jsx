// import { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { auth } from "../config/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import "../App.css";

// const ProtectedRoutes = () => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setIsLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-transparent">
//         <div className="relative w-12 h-12 rotate-45 [perspective:1000px]">

//           {/* Blue ring */}
//           <span
//             className="absolute inset-0 rounded-full text-[#2d95f3]
//         animate-[spinDots_1s_linear_infinite]
//         [transform:rotateX(70deg)]"
//           />

//           {/* Pink ring */}
//           <span
//             className="absolute inset-0 rounded-full text-[#c25eb9]
//         animate-[spinDots_1s_linear_infinite_0.4s]
//         [transform:rotateY(70deg)]"
//           />

//           <style>
//             {`
//           @keyframes spinDots {
//             0%,100% { box-shadow: .2em 0 0 0 currentColor; }
//             12% { box-shadow: .2em .2em 0 0 currentColor; }
//             25% { box-shadow: 0 .2em 0 0 currentColor; }
//             37% { box-shadow: -.2em .2em 0 0 currentColor; }
//             50% { box-shadow: -.2em 0 0 0 currentColor; }
//             62% { box-shadow: -.2em -.2em 0 0 currentColor; }
//             75% { box-shadow: 0 -.2em 0 0 currentColor; }
//             87% { box-shadow: .2em -.2em 0 0 currentColor; }
//           }
//         `}
//           </style>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow relative">
//       <Navbar user={user} />

//       <main className="flex-grow">
//         <Outlet />
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default ProtectedRoutes;






import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const ProtectedRoutes = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 Scroll lock
  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isLoading]);

  // 🔐 Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ✅ Ensure status is active on refresh/load
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            // ✅ Set active status
            await updateDoc(doc(db, "users", currentUser.uid), {
              status: "active"
            });

            const role = userDoc.data().role;
          }
        } catch (error) {
          console.error("Error updating status on refresh:", error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /* =======================
     🌀 LOADING SCREEN ONLY
     ======================= */
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">

        {/* SAME HOME BACKGROUND */}
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

          {/* blobs (EXACT COPY) */}
          <div className="absolute inset-0">
            <div className="relative w-full h-full flex flex-col items-center justify-center md:block opacity-50">
              <div className="w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1000 md:absolute md:top-0/4 md:right-2/4 md:mt-[40px]"></div>

              <div className="w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1500 md:absolute md:top-0/4 md:right-1/4 md:mt-[150px]"></div>
            </div>
          </div>

          {/* 🌑 DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* 🌀 LOADER */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative w-12 h-12 rotate-45 [perspective:1000px]">
              <span
                className="absolute inset-0 rounded-full text-[#2d95f3]
              animate-[spinDots_1s_linear_infinite]
              [transform:rotateX(70deg)]"
              />
              <span
                className="absolute inset-0 rounded-full text-[#c25eb9]
              animate-[spinDots_1s_linear_infinite_0.4s]
              [transform:rotateY(70deg)]"
              />

              <style>
                {`
                @keyframes spinDots {
                  0%,100% { box-shadow: .2em 0 0 0 currentColor; }
                  12% { box-shadow: .2em .2em 0 0 currentColor; }
                  25% { box-shadow: 0 .2em 0 0 currentColor; }
                  37% { box-shadow: -.2em .2em 0 0 currentColor; }
                  50% { box-shadow: -.2em 0 0 0 currentColor; }
                  62% { box-shadow: -.2em -.2em 0 0 currentColor; }
                  75% { box-shadow: 0 -.2em 0 0 currentColor; }
                  87% { box-shadow: .2em -.2em 0 0 currentColor; }
                }
              `}
              </style>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* =======================
     🧩 MAIN APP
     ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar user={user} />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ProtectedRoutes;
