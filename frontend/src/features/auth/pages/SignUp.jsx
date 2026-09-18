import React from "react";
import { Zap } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const LeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-[#e7ddd3] flex-col justify-between p-10">
      {/* Mesh gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
        radial-gradient(circle at 65% 75%, rgba(255,120,40,0.85), transparent 40%),
        radial-gradient(circle at 30% 25%, rgba(255,180,120,0.45), transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(255,150,80,0.35), transparent 60%)
      `,
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black/10">
          <Zap className="w-5 h-5 text-black" fill="black" />
        </div>

        <span className="text-black text-xl font-bold tracking-tight">
          FlowStack
        </span>
      </div>

      {/* Text section */}
      <div className="relative z-10">
        <p className="text-sm text-black/60 mb-2">You can easily</p>

        <h1 className="text-4xl font-semibold text-black leading-tight">
          Describe your idea. Watch a full-stack app come to life.
        </h1>
      </div>
    </div>
  );
};
const RightPanel = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { handleRegister, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setPasswordError("Passwords Do not match");
    } else {
      setPasswordError("");
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    await handleRegister(username, email, password);
    navigate("/");
  }

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className="w-full lg:w-[60%] flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black">
            <span className="text-white font-bold">⚡</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-gray-900">
          Create your account
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Start building full-stack apps in seconds.
        </p>

        {/* Google Signup */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-mediumbg-white transition-all duration-200hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm hover:-translate-y-[1px]active:translate-y-0"
          onClick={handleGoogleSignUp}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">Or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <input
            type="username"
            placeholder="Username"
            className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm mb-4 focus:outline-none focus:border-gray-400"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm mb-4 focus:outline-none focus:border-gray-400"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm mb-4 focus:outline-none focus:border-gray-400"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="Renter your password"
            className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm mb-4 focus:outline-none focus:border-gray-400"
            onChange={handleConfirmPasswordChange}
          />
          {passwordError && (
            <p className="text-red-500 text-xs mb-4">{passwordError}</p>
          )}
          {/* Signup button */}
          <button className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
            Sign up with email
          </button>
        </form>

        {/* Login link */}
        <p className="text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link className="text-black font-medium cursor-pointer" to="/sign-in">
            Sign in
          </Link>
        </p>

        {/* Footer */}
        <div className="flex justify-center gap-6 text-xs text-gray-400 mt-16">
          <span>Help</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
    </div>
  );
};
const SignUp = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/*Left panel ! :) */}
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default SignUp;
