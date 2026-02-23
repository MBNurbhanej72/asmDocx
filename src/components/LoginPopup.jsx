import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import catchErrorMessage from "../utility/catchErrorMessage";


//? Import authentication instances from firebase configuration.
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";



//? For sign up user with email & password, phone number, Google, GitHub, Facebook.
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  getAdditionalUserInfo
} from "firebase/auth";



export default function LoginPopup({ isOpen, onClose, closeEsc = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    agreeTerms: false
  });


  const updateLoginField = (field) => (e) =>
    setLoginForm((f) => ({ ...f, [field]: e.target.value }));

  const updateSignupField = (field) => (e) =>
    setSignupForm((f) => ({ ...f, [field]: e.target.value }));



  // *****  Login with email and password  ***** ////

  const handleLoginUser = async (e) => {

    e.preventDefault();



    const { email, password } = loginForm;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }



    setIsLoading(true);



    try {

      await signInWithEmailAndPassword(auth, email.trim(), password);

      // ✅ Set user status to active on login
      const loggedInUser = auth.currentUser;
      if (loggedInUser) {
        await setDoc(doc(db, "users", loggedInUser.uid), {
          status: "active",
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }

      onClose();

      setLoginForm({
        email: "",
        password: "",
      });

      toast.success("Logged in successfully 🎉");

    }

    catch (err) { toast.error(catchErrorMessage(err)); }

    finally { setIsLoading(false); }

  };



  // *****  SignUp with email and password  ***** ////

  const handleSignUpUser = async (e) => {

    e.preventDefault();



    const { email, password, agreeTerms } = signupForm;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms and Privacy Policy");
      return;
    }



    setIsLoading(true);



    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 📝 ADD USER TO FIRESTORE
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || email.split('@')[0], // Use email prefix if displayName is missing
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      toast.success("Account created successfully 🎉");

      onClose();

      setSignupForm({
        email: "",
        password: "",
        agreeTerms: false
      });

    }

    catch (err) { toast.error(catchErrorMessage(err)); }

    finally { setIsLoading(false); }

  };



  // *****  Reset Password using email  ***** ////

  const resetPassword = async () => {

    if (loginForm?.email.trim() == "") {
      toast.error("Please enter your email first");
      return;
    }



    setIsResetting(true);



    try {

      await sendPasswordResetEmail(auth, loginForm?.email.trim(), { url: import.meta.env.VITE_LIVE_URL });

      toast.info("Password reset email sent 📩");

    }

    catch (err) { toast.error(catchErrorMessage(err)); }

    finally { setIsResetting(false); }

  };



  // *****  SignUp with Google  ***** ////

  const googleProvider = new GoogleAuthProvider();


  const handleGoogleAuth = async () => {

    try {

      const res = await signInWithPopup(auth, googleProvider);

      onClose();

      const isNewUser = getAdditionalUserInfo(res)?.isNewUser;

      if (isNewUser) {
        // 📝 ADD NEW GOOGLE USER TO FIRESTORE
        const user = res.user;
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "user",
          status: "active",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        toast.success("Signed up with Google successfully 🎉");
      } else {
        // ✅ Existing Google user — update status and ensure name/email are there
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
          status: "active",
          email: user.email, // Ensure email is always stored
          displayName: user.displayName, // Ensure displayName is always stored
          lastLogin: new Date().toISOString()
        }, { merge: true });
        toast.success("Logged in with Google successfully 🎉");
      }

    }

    catch (err) { toast.error(catchErrorMessage(err)); }

    finally { setIsLoading(false); }

  };



  useEffect(() => {
    const handleEscape = (e) => {
      if (!closeEsc && e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeEsc]);


  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md max-h-[70vh] ">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply opacity-20 filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-20" style={{ animationDelay: "1s" }}></div>
            <div className="absolute bottom-1/2 left-1/2 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-20" style={{ animationDelay: "2s" }}></div>
          </div>
        </div>

        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                {isLogin ? (
                  <LogIn className="w-5 h-5 text-purple-400" />
                ) : (
                  <UserPlus className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            </div>
            <button onClick={closeEsc ? null : onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col max-h-[65vh]">
            <div className="p-6 pb-2">
              <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${isLogin ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg" : "text-gray-300 hover:text-white"
                  }`}>
                  Login
                </button>
                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${!isLogin ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg" : "text-gray-300 hover:text-white"
                  }`}>
                  Sign Up
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 pb-6 space-y-4">
              {isLogin ? (
                <form onSubmit={handleLoginUser} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" /> Email Address
                    </label>
                    <input type="email" placeholder="your.email@example.com" value={loginForm.email} onChange={updateLoginField("email")} required className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Lock className="w-4 h-4 mr-2" /> Password
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginForm.password} onChange={updateLoginField("password")} required className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" tabIndex={-1} onClick={resetPassword} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={isLoading || isResetting} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : isResetting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>


                  <div className="flex items-center justify-center gap-[10px]" style={{ marginTop: 30 }}>
                    <span className="w-full h-[1px] bg-gray-400"></span>
                    <span className="text-gray-400">OR</span>
                    <span className="w-full h-[1px] bg-gray-400"></span>
                  </div>

                  <button type="button" className="btn-social google" onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />

                    <span>Continue with Google</span>
                  </button>

                </form>
              ) : (
                <form onSubmit={handleSignUpUser} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" /> Email Address
                    </label>
                    <input type="email" placeholder="your.email@example.com" value={signupForm.email} onChange={updateSignupField("email")} required className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Lock className="w-4 h-4 mr-2" /> Password
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={signupForm.password} onChange={updateSignupField("password")} required className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />

                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-sm">
                    <input type="checkbox" checked={signupForm.agreeTerms} onChange={(e) =>
                      setSignupForm((f) => ({ ...f, agreeTerms: e.target.checked }))} required className="cursor-pointer mt-1 rounded border-white/20 bg-white/10" />
                    <span className="text-gray-300">
                      I agree to the <span className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</span> and <span className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</span>
                    </span>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg" style={{ marginTop: 30 }}>
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>


                  <div className="flex items-center justify-center gap-[10px]" style={{ marginTop: 30 }}>
                    <span className="w-full h-[1px] bg-gray-400"></span>
                    <span className="text-gray-400">OR</span>
                    <span className="w-full h-[1px] bg-gray-400"></span>
                  </div>

                  <button type="button" className="btn-social google" onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />

                    <span>Continue with Google</span>
                  </button>

                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
