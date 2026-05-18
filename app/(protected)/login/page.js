"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Info, ChartPie, BarChart3, EyeIcon, Loader2, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [seePassword, setSeePassword] = useState(false);
  
  // Form and API State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonState, setButtonState] = useState("idle"); // 'idle' | 'loading' | 'success'

  // Animation variants for staggering the form elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Animation for the floating elements on the right side
  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Handle Form Submission
  const handleLogin = async (e) => {
  e.preventDefault();

  // Prevent multiple clicks
  if (buttonState !== "idle") return;

  if (!email || !password) {
    toast.error("Please fill in both fields.");
    return;
  }

  setButtonState("loading");

  try {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setButtonState("idle");
      toast.error(result.error || "Invalid credentials");
      return;
    }

    // Success
    setButtonState("success");

    toast.success("Welcome back!");

    // Redirect manually
    window.location.href = "/";

  } catch (error) {
    setButtonState("idle");

    toast.error(
      error.message || "Something went wrong"
    );
  }
};

  return (
    <div className="flex min-h-screen w-full bg-[#FDF6F6]">
      {/* Toast Notifications Provider */}
   

      {/* Left Column - Login Form */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 font-bold text-[#002C54] text-xl"
        >
          {/* Logo Placeholder */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#002C54]">
            <span className="text-white text-xs">I</span>
          </div>
          Internal CRM
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-md flex-col justify-center"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-800 mb-8">
            Please login to access your account.
          </motion.p>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Username Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-800">Email</label>
                <Info size={14} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
                className="w-full rounded-lg border-none bg-white p-3 text-sm shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002C54]"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Password
              </label>

              <div className="relative">
                <input
                  type={seePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your password"
                  className="w-full rounded-lg border-none bg-white p-3 text-sm shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002C54]"
                />

                <button
                  type="button"
                  onClick={() => setSeePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {seePassword ? (
                    <EyeIcon size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div variants={itemVariants} className="flex justify-start">
              <a href="#" className="text-sm font-medium text-[#002C54] hover:text-[#C5001A] transition-colors">
                Forgot Password?
              </a>
            </motion.div>

            {/* Animated Login Button */}
            <motion.button
              type="submit"
              variants={itemVariants}
              disabled={buttonState !== "idle"}
              animate={{
                backgroundColor:
                  buttonState === "success"
                    ? "#10B981" // Green for success
                    : buttonState === "loading"
                    ? "#4B5563" // Gray for loading
                    : "#002C54", // Default brand color
              }}
              whileHover={buttonState === "idle" ? { scale: 1.02 } : {}}
              whileTap={buttonState === "idle" ? { scale: 0.98 } : {}}
              className="relative w-full overflow-hidden rounded-lg py-3 text-center font-medium text-white shadow-md flex items-center justify-center h-[48px]"
            >
              <AnimatePresence mode="wait">
                {buttonState === "idle" && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute"
                  >
                    Log In
                  </motion.span>
                )}
                {buttonState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute flex items-center gap-2"
                  >
                    <Loader2 size={18} className="animate-spin" />
                    <span>Logging in...</span>
                  </motion.div>
                )}
                {buttonState === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute flex items-center gap-2"
                  >
                    <Check size={20} className="stroke-[3px]" />
                    <span>Success!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="flex justify-between text-xs text-gray-400">
          <p>Copyright © 2026 Internal CRM</p>
        </div>
      </div>

      {/* Right Column - Promotional Graphic (Hidden on Mobile) */}
      <div className="hidden w-1/2 relative overflow-hidden shadow-2xl bg-[#002C54] rounded-2xl my-10 mx-12 lg:flex flex-col items-center justify-center p-12">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="z-10 w-full max-w-lg"
        >
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage Your Students Seamlessly with CMS
          </h2>
          <p className="text-[#FDF6F6] text-opacity-80 mb-12">
            Log in to manage, update, and publish your student data with ease.
          </p>

          {/* Abstract Dashboard Graphic Presentation */}
          <div className="relative h-80 w-full rounded-xl bg-white shadow-2xl p-6">
            <div className="h-4 w-1/3 rounded bg-gray-200 mb-6"></div>
            <div className="flex gap-4">
               <div className="h-24 w-1/2 rounded bg-gray-100"></div>
               <div className="h-24 w-1/2 rounded bg-gray-100"></div>
            </div>
            <div className="mt-4 h-32 w-full rounded bg-gray-50 flex items-end p-4 gap-2">
               <div className="w-1/6 h-1/3 bg-[#002C54] rounded-t opacity-50"></div>
               <div className="w-1/6 h-2/3 bg-[#002C54] rounded-t opacity-70"></div>
               <div className="w-1/6 h-1/2 bg-[#002C54] rounded-t opacity-60"></div>
               <div className="w-1/6 h-full bg-[#C5001A] rounded-t"></div>
            </div>

            {/* Floating Elements simulated with Framer Motion */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="absolute -left-12 top-16 flex h-32 w-48 flex-col justify-center rounded-xl bg-white p-4 shadow-xl border border-gray-100"
            >
              <BarChart3 className="text-[#002C54] mb-2" size={24} />
              <div className="text-xs text-gray-400">.......</div>
              <div className="text-xl font-bold text-gray-800">12,500</div>
            </motion.div>

            <motion.div
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: "1s" }} // Offset the animation
              className="absolute -right-8 -bottom-8 flex h-40 w-40 items-center justify-center rounded-xl bg-white p-4 shadow-xl border border-gray-100"
            >
               <ChartPie className="text-[#C5001A]" size={80} strokeWidth={1} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}