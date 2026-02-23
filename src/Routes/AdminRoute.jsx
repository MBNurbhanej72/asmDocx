import { useEffect, useState } from "react";
import Admin from "../Pages/Admin";
import NotFound from "../Pages/NotFound";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, false = not admin, true = admin
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 Scroll lock
  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isLoading]);

  // 🔐 Auth & Role check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // User logged in, check role in Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            // ✅ Set active status
            await updateDoc(doc(db, "users", currentUser.uid), {
              status: "active"
            });

            const role = userDoc.data().role;
            if (role === "superAdmin" || role === "admin") {
              setIsAdmin(true);
              setUserRole(role);
            } else {
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        // No user logged in
        setUser(null);
        setIsAdmin(false);
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

  // If user is logged in AND is admin, show Admin panel, otherwise show NotFound (404)
  return isAdmin ? <Admin user={user} userRole={userRole} /> : <NotFound />;
};

export default AdminRoute;
