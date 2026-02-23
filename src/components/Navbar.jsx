import { useEffect, useState } from "react";
import { Sparkles, Menu, X, LogIn, LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import "../App.css";
import LoginPopup from "./LoginPopup";
import { toast } from "react-toastify";
import catchErrorMessage from "../utility/catchErrorMessage";


//? Import authentication instances from firebase configuration.
import { auth, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";


// ? For logout user.
import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";



const Navbar = ({ user, showAuthButtons = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Hooks for navigation
  const navigate = useNavigate();
  const location = useLocation();

  // *****  Logout user  ***** ////

  const handleLogOutUser = async () => {

    try {
      // ✅ Set user status to inactive on logout
      if (user?.uid) {
        try {
          // Use setDoc with merge: true to avoid "Not found" error if doc is missing
          await setDoc(doc(db, "users", user.uid), {
            status: "inactive"
          }, { merge: true });
        } catch (dbErr) {
          console.error("Error updating status on logout:", dbErr);
          // Continue with sign out even if status update fails
        }
      }

      await signOut(auth);  ////? Return undefined 



      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); ////? Remove from DOM
        window.recaptchaVerifier = null;  ////? Remove from memory
      }

      toast.success("Logged out successfully 🎉");

      // 🔄 Redirect to Home if on Admin or My Docs Page
      if (location.pathname.startsWith("/admin") || location.pathname === "/my-docs") {
        navigate("/");
      }

    }

    catch (err) { toast.error(catchErrorMessage(err)); }

  };

  // Other UI-related effects
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        mobileMenuOpen &&
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);



  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);



  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] p-4 transition-all duration-300 ${sticky ? "dark-nav" : ""} ${mobileMenuOpen ? "z-[80]" : "z-[100]"}`}
      >
        <div className={`${mobileMenuOpen ? "" : "max-w-7xl mx-auto flex items-center justify-between"}`}>
          {!mobileMenuOpen && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                asmDocx
              </span>
            </Link>
          )}

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/about" className="text-white hover:text-purple-400 transition-colors">
              About Us
            </NavLink>
            <NavLink to="/contact-us" className="text-white hover:text-purple-400 transition-colors">
              Contact Us
            </NavLink>
            {user && (
              <NavLink to="/my-docs" className="text-white hover:text-purple-400 transition-colors">
                My Docs
              </NavLink>
            )}

            {showAuthButtons && (
              user ? (
                <button
                  onClick={() => {
                    handleLogOutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-300 flex items-center shadow-lg"
                >
                  <LogOut className="w-4 h-4 rotate-[180deg] mr-2" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginPopup(true);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-300 flex items-center shadow-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </button>
              )
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button text-white hover:text-purple-400 transition-colors p-2"
              aria-label="Toggle mobile menu"
            >
              {!mobileMenuOpen && <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[90] transition-opacity duration-300 md:hidden ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

        <div
          className={`mobile-menu absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-l border-white/10 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                asmDocx
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-purple-400 transition-colors p-2 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col p-6 space-y-6">
            <NavLink
              to="/about"
              className="mobile-link text-white hover:text-purple-400 transition-colors text-lg font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </NavLink>

            <NavLink
              to="/contact-us"
              className="mobile-link text-white hover:text-purple-400 transition-colors text-lg font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </NavLink>

            {user && (
              <NavLink
                to="/my-docs"
                className="mobile-link text-white hover:text-purple-400 transition-colors text-lg font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Docs
              </NavLink>
            )}

            <div className="pt-4">
              {showAuthButtons && (
                user ? (
                  <button
                    onClick={() => {
                      handleLogOutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-center bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-300 flex items-center shadow-lg"
                  >
                    <LogOut className="w-4 h-4 rotate-[180deg] mr-2" />
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginPopup(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-center bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-300 flex items-center shadow-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        setIsLoggedIn={() => { }} // ✅ update isLoggedIn from popup
      />
    </>
  );
};

export default Navbar;