"use client";

/* This page is sign-in page
    to be able to show this page, you need to navigate to /sign-in
*/

import React, { useEffect, useRef, useState } from "react";


/*  Array describing each character (key, image path, position, eye position, animation speed).*/
const charactersData = [
  {
    key: "rw",
    img: "/images/Shawarma.png",
    style: { zIndex: 1, left: "-9%", bottom: "-3%", width: "400px" },
    eyes: { top: 173, left: 180 },
    speed: 0.03,
  },
  {
    key: "rt",
    img: "/images/Fri.png",
    style: { zIndex: 2, left: "48%", bottom: "5px", width: "240px" },
    eyes: { top: 80, left: 95 },
    speed: 0.05,
  },
  {
    key: "ham",
    img: "/images/Ham.png",
    style: { zIndex: 4, left: "34%", bottom: "0", width: "180px" },
    eyes: { top: 48, left: 75 },
    speed: 0.04,
  },
  {
    key: "pizza",
    img: "/images/Pizza.png",
    style: { zIndex: 3, left: "-12%", bottom: "0px", width: "280px" },
    eyes: { top: 115, left: 110 },
    speed: 0.06,
  },
];

const SignInPage = () => {
  const charsRef = useRef<Array<HTMLDivElement | null>>([]);
  const lookingAway = useRef(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  // Mouse tracking and floating animation
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!mouseMoved) setMouseMoved(true);
      if (lookingAway.current) return;
      charsRef.current.forEach((char, i) => {
        if (!char) return;
        const rect = char.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const speed = charactersData[i].speed;
        const deltaX = (e.clientX - charX) * speed;
        const deltaY = (e.clientY - charY) * speed;
        char.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        // Eyes
        const pupils = char.querySelectorAll<HTMLElement>(".pupil");
        pupils.forEach((pupil) => {
          const eye = pupil.parentElement!;
          const eyeRect = eye.getBoundingClientRect();
          const eyeX = eyeRect.left + eyeRect.width / 2;
          const eyeY = eyeRect.top + eyeRect.height / 2;
          const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
          const distance = Math.min(3, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 50);
          const pupilX = Math.cos(angle) * distance;
          const pupilY = Math.sin(angle) * distance;
          pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
      });
    }
    document.addEventListener("mousemove", handleMouseMove);

    // Floating animation (optional)
    charsRef.current.forEach((char, i) => {
      if (!char) return;
      const duration = 3 + i * 0.5;
      const delay = i * 0.2;
      char.animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-10px)" },
          { transform: "translateY(0px)" },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseMoved]);

  // In your character movement logic, add:
  if (!mouseMoved) {
    // Reset transforms so characters stay in place
    charsRef.current.forEach((char) => {
      if (char) char.style.transform = "none";
    });
    return;
  }

  // Password toggle and character reactions
  function togglePassword() {
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const isShowing = passwordInput.type === "password";
    passwordInput.type = isShowing ? "text" : "password";
    if (isShowing) makeCharactersLookAway();
    else makeCharactersLookNormal();
  }

  function makeCharactersLookAway() {
    lookingAway.current = true;
    charsRef.current.forEach((char, i) => {
      if (!char) return;
      char.style.transition = "transform 0.3s ease-out";
      char.style.transform += ` rotate(${i % 2 === 0 ? -5 : 5}deg)`;
      const pupils = char.querySelectorAll<HTMLElement>(".pupil");
      const angles = [180, 90, 270, 180];
      const angle = angles[i];
      const radians = (angle * Math.PI) / 180;
      pupils.forEach((pupil) => {
        pupil.style.transition = "transform 0.3s ease-out";
        pupil.style.transform = `translate(${Math.cos(radians) * 3}px, ${Math.sin(radians) * 3}px)`;
      });
    });
  }

  function makeCharactersLookNormal() {
    lookingAway.current = false;
    charsRef.current.forEach((char) => {
      if (!char) return;
      char.style.transition = "transform 0.3s ease-out";
    });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-center"
          style={{
            fontFamily: "'Pontano Sans', sans-serif",
            background: "linear-gradient(135deg, #f8a45a 0%, #fbd0a9 35%, #ee46a2 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row w-full md:w-[90%] max-w-[900px] bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
            {/* Left Section: Characters */}
            <div className="flex-1 bg-[#f5f5f5] p-8 md:p-16 flex items-center justify-center relative overflow-hidden">
              <div className="relative w-full md:w-[420px] h-[220px] md:h-[400px] mx-auto mt-8 md:mt-0">
                {charactersData.map((char, i) => (
              <div
                key={char.key}
                className={`character ${char.key}`}
                ref={el => { charsRef.current[i] = el; }}
                data-speed={char.speed}
                style={{
                  position: "absolute",
                  zIndex: char.style.zIndex,
                  left: char.style.left,
                  bottom: char.style.bottom,
                  width: char.style.width,
                  transition: "transform 0.3s ease-out",
                  cursor: "pointer",
                }}
              >
                <img src={char.img} alt={char.key} style={{ width: "100%", height: "auto" }} />
                <div
                  className="eyes"
                  style={{
                    position: "absolute",
                    top: char.eyes.top,
                    left: char.eyes.left,
                    display: "flex",
                    gap: 8,
                    pointerEvents: "none",
                  }}
                >
                  <div className="eye">
                    <div className="pupil"></div>
                  </div>
                  <div className="eye">
                    <div className="pupil"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Section: Login Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="logo w-10 h-10 bg-black rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-2xl md:text-[32px] mb-2 font-bold" style={{ color: "#683817" }}>Welcome back!</h1>
          <p className="subtitle mb-10 text-base md:text-lg" style={{ color: "#E11383" }}>Please enter your details</p>
          <form
            onSubmit={e => {
              e.preventDefault();
              // Add your login logic here
            }}>
            <div className="form-group mb-5">
              <label htmlFor="email" className="block mb-2 font-medium" style={{ color: "#683817" }}>Email</label>
              <input type="email" id="email" placeholder="Enter your email"
                className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] focus:border-[#E11383] text-base" />
            </div>
            <div className="form-group mb-5">
              <label htmlFor="password" className="block mb-2 font-medium" style={{ color: "#683817" }}>Password</label>
              <div className="relative">
                <input type="password" id="password" placeholder="Enter your password"
                  className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-[#683817] focus:border-[#E11383] text-base" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#a0aec0]"
                  onClick={togglePassword}>👁️</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-sm" style={{ color: "#683817" }}>Remember for 30 days</label>
            </div>
            <button type="submit"
              className="w-full py-3 bg-[#F8645A] text-white rounded-lg text-lg font-bold mb-5 hover:bg-[#E11383] transition">
              Log in
            </button>
            <button type="button"
              className="w-full py-3 bg-white border-2 border-[#F8645A] rounded-lg text-[#F8645A] text-base flex items-center justify-center gap-2 hover:border-[#E11383] hover:text-[#E11383] transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Log in with Google
            </button>
          </form>
          <div className="text-center mt-8 text-[#683817] text-base">
            Don't have an account? <a href="#" className="text-[#E11383] font-bold">Sign Up</a>
          </div>
        </div>
      </div>
      {/* Inline styles for eyes */}
      <style jsx>{`
        .eye {
          width: 12px;
          height: 12px;
          background: #000;
          border-radius: 50%;
          position: relative;
        }
        .pupil {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.1s ease;
        }
        .character.pizza .eye {
          width: 15px;
          height: 15px;
          background: #fff;
        }
        .character.pizza .pupil {
          width: 8px;
          height: 8px;
          background: #000;
          top: 5px;
          left: 5px;
        }
      `}</style>
    </div>
  );
};

export default SignInPage;