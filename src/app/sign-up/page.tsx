"use client";


import { useState } from "react";
import * as z from "zod";

interface SignUpClickEvent extends React.FormEvent<HTMLButtonElement> {}

const SignUpPage = () =>{

  const [restaurantName, setRestaurantName] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  const User = z.object({
    restaurantName: z.string().min(1).trim(),
    userName: z.string().min(1).trim(),
    email: z.email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/).trim(),
    confirmPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/).trim(),    
  });
function SignUpClick(event: SignUpClickEvent): void {
    try {
      const data = User.parse({restaurantName,userName,email,password,confirmPassword})
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  
}


  // Let the form's onSubmit handle the actual submission.
  // If you prefer to programmatically submit after validation, uncomment:
  // form.requestSubmit();

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        fontFamily: "'Pontano Sans', sans-serif",
        background: "linear-gradient(135deg, #f8a45a 0%, #fbd0a9 35%, #ee46a2 100%)",
      }}
    >
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="logo w-10 h-10 bg-black rounded-full flex items-center justify-center mb-8 mx-auto">
          <span className="text-white text-xl">✦</span>
        </div>
        <h1 className="text-2xl md:text-3xl mb-2 font-bold text-center" style={{ color: "#683817" }}>
          Create your account
        </h1>
        <p className="subtitle mb-8 text-base md:text-lg text-center" style={{ color: "#E11383" }}>
          Please fill in your details
        </p>
        <form
          onSubmit={e => {
            e.preventDefault();
            // Add your sign up logic here
          }}
        >
          <div className="form-group mb-5">
            <label htmlFor="restaurantName" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Restaurant Name
            </label>
            <input
              onChange={(e) => setRestaurantName(e.target.value)}
              type="text"
              id="restaurantName"
              placeholder="Enter the restaurant name"
              className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base"
              required
            />
          </div>
          <div className="form-group mb-5">
            <label htmlFor="ownerName" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Full Name
            </label>
            <input
            onChange={(e) => setUserName(e.target.value)}
              type="text"
              id="ownerName"
              placeholder="Enter your full name"
              className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base"
              required
            />
          </div>
          <div className="form-group mb-5">
            <label htmlFor="email" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base"
              required
            />
          </div>
          <div className="form-group mb-5">
            <label htmlFor="password" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Password
            </label>
            <input
            onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base"
              required
            />
          </div>
          <div className="form-group mb-5">
            <label htmlFor="confirmPassword" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Confirm Password
            </label>
            <input
            onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base"
              required
            />
          </div>
          <button
            onClick={SignUpClick}
            type="submit"
            className="w-full py-3 bg-[#F8645A] text-white rounded-lg text-lg font-bold mb-5 hover:bg-[#E11383] transition"
          >
            Sign Up
          </button>

          <button
            type="button"
            className="w-full py-3 bg-white border-2 border-[#F8645A] rounded-lg text-[#F8645A] text-base flex items-center justify-center gap-2 hover:border-[#E11383] hover:text-[#E11383] transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign Up with Google
          </button>
        </form>
        <div className="text-center mt-8 text-[#683817] text-base">
          Already have an account? <a href="/log-in" className="text-[#E11383] font-bold">Log In</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
