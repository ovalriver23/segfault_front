"use client";

/* This page is sign-in page
    to be able to show this page, you need to navigate to /sign-in
*/

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const SignInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type SignInFormData = z.infer<typeof SignInSchema>;

/*  Array describing each character (key, image path, position, eye position, animation speed).*/
const charactersData = [
  {
    key: "rw",
    img: "/images/Shawarma.webp",
    style: { zIndex: 1, left: "-9%", bottom: "-3%", width: "400px" },
    eyes: { top: 173, left: 180 },
    speed: 0.03,
  },
  {
    key: "rt",
    img: "/images/Fri.webp",
    style: { zIndex: 2, left: "48%", bottom: "5px", width: "240px" },
    eyes: { top: 80, left: 95 },
    speed: 0.05,
  },
  {
    key: "ham",
    img: "/images/Ham.webp",
    style: { zIndex: 4, left: "34%", bottom: "0", width: "180px" },
    eyes: { top: 48, left: 75 },
    speed: 0.04,
  },
  {
    key: "pizza",
    img: "/images/Pizza.webp",
    style: { zIndex: 3, left: "-12%", bottom: "0px", width: "280px" },
    eyes: { top: 115, left: 110 },
    speed: 0.06,
  },
];

const SignInPage = () => {
  const router = useRouter();
  const charsRef = useRef<Array<HTMLDivElement | null>>([]);
  const lookingAway = useRef(false);
  const [mouseMoved, setMouseMoved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
  });

  // Mouse/Touch tracking and floating animation
  useEffect(() => {
    function handlePointerMove(e: MouseEvent | TouchEvent) {
      if (!mouseMoved) setMouseMoved(true);
      if (lookingAway.current) return;
      
      // Get clientX and clientY from either mouse or touch event
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      
      if (clientX === undefined || clientY === undefined) return;
      
      charsRef.current.forEach((char, i) => {
        if (!char) return;
        const rect = char.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const speed = charactersData[i].speed;
        const deltaX = (clientX - charX) * speed;
        const deltaY = (clientY - charY) * speed;
        char.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        // Eyes
        const pupils = char.querySelectorAll<HTMLElement>(".pupil");
        pupils.forEach((pupil) => {
          const eye = pupil.parentElement!;
          const eyeRect = eye.getBoundingClientRect();
          const eyeX = eyeRect.left + eyeRect.width / 2;
          const eyeY = eyeRect.top + eyeRect.height / 2;
          const angle = Math.atan2(clientY - eyeY, clientX - eyeX);
          const distance = Math.min(3, Math.hypot(clientX - eyeX, clientY - eyeY) / 50);
          const pupilX = Math.cos(angle) * distance;
          const pupilY = Math.sin(angle) * distance;
          pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
      });
    }
    
    // Add both mouse and touch event listeners
    document.addEventListener("mousemove", handlePointerMove as EventListener);
    document.addEventListener("touchmove", handlePointerMove as EventListener, { passive: true });

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
      document.removeEventListener("mousemove", handlePointerMove as EventListener);
      document.removeEventListener("touchmove", handlePointerMove as EventListener);
    };
  }, [mouseMoved]);

  // Password toggle and character reactions
  function togglePassword() {
    const newShowPassword = !showPassword;
    setShowPassword(newShowPassword);
    if (newShowPassword) makeCharactersLookAway();
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

  // Form submission handler
  const onSubmit = async (data: SignInFormData) => {
    setApiError(""); // Clear any previous errors
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error responses - backend returns error message in "error" field
        const errorMessage = responseData.error || responseData.message || 'Sign-in failed. Please try again.';
        setApiError(errorMessage);
        return;
      }

      // TODO: Store auth data in global state/context if needed
      // For now, the JWT cookie is automatically stored by the browser

      // Show success message
      setShowSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Sign-in error:', error);
      setApiError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-center"
      style={{
        fontFamily: "'Pontano Sans', sans-serif",
        background: "linear-gradient(135deg, #f8a45a 0%, #fbd0a9 35%, #ee46a2 100%)",
      }}
    >
      <div className="flex flex-col md:flex-row w-full md:w-[90%] max-w-[900px] bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Section: Characters */}
        <div className="flex-1 bg-[#f5f5f5] p-8 md:p-16 flex items-center justify-center relative overflow-hidden min-h-[250px] md:min-h-0">
          <div className="relative w-full max-w-[420px] h-[220px] md:h-[400px] mx-auto mt-8 md:mt-0">
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
          <h1 className="text-2xl md:text-[32px] mb-2 font-bold" style={{ color: "#683817" }}>Welcome back!</h1>
          <p className="subtitle mb-10 text-base md:text-lg" style={{ color: "#E11383" }}>Please enter your details</p>
          
          {/* General API error message */}
          {apiError && (
            <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* Success message */}
          {showSuccess && (
            <div className="mb-5 p-4 bg-green-50 border-2 border-green-400 rounded-lg text-green-700 text-sm font-medium text-center">
              ✓ Login successful!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group mb-5">
              <label htmlFor="username" className="block mb-2 font-medium" style={{ color: "#683817" }}>Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Enter your username"
                {...register("username")}
                className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-text-500 focus:border-[#E11383] text-base" 
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div className="form-group mb-5">
              <label htmlFor="password" className="block mb-2 font-medium" style={{ color: "#683817" }}>Password</label>
              <div className="relative">
                <input  
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full p-3 border-2 border-[#F8645A] rounded-lg text-text-500 focus:border-[#E11383] text-base" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={togglePassword}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20"  fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 16C14.658 16 18.5 13.839 18.5 11C18.5 8.161 14.658 6 10 6C5.342 6 1.5 8.161 1.5 11C1.5 13.839 5.342 16 10 16ZM10 7C14.179 7 17.5 8.868 17.5 11C17.5 13.132 14.179 15 10 15C5.821 15 2.5 13.132 2.5 11C2.5 8.868 5.821 7 10 7Z" fill="#f8645a"/>
                      <path d="M9.50003 3.5C9.50003 3.36739 9.55271 3.24021 9.64648 3.14645C9.74024 3.05268 9.86742 3 10 3C10.1326 3 10.2598 3.05268 10.3536 3.14645C10.4474 3.24021 10.5 3.36739 10.5 3.5V6.5C10.5 6.63261 10.4474 6.75979 10.3536 6.85355C10.2598 6.94732 10.1326 7 10 7C9.86742 7 9.74024 6.94732 9.64648 6.85355C9.55271 6.75979 9.50003 6.63261 9.50003 6.5V3.5ZM13.51 3.902C13.5398 3.77584 13.6174 3.66617 13.7265 3.59613C13.8356 3.5261 13.9676 3.50116 14.0947 3.52658C14.2218 3.552 14.3341 3.6258 14.4078 3.7324C14.4816 3.83901 14.5111 3.97009 14.49 4.098L13.99 6.598C13.9602 6.72416 13.8826 6.83383 13.7736 6.90387C13.6645 6.9739 13.5325 6.99884 13.4053 6.97342C13.2782 6.948 13.166 6.8742 13.0922 6.7676C13.0185 6.66099 12.989 6.52991 13.01 6.402L13.51 3.902ZM6.49003 3.902C6.46025 3.77584 6.38263 3.66617 6.27355 3.59613C6.16448 3.5261 6.03246 3.50116 5.90535 3.52658C5.77823 3.552 5.66596 3.6258 5.59221 3.7324C5.51846 3.83901 5.489 3.97009 5.51003 4.098L6.01003 6.598C6.03981 6.72416 6.11743 6.83383 6.22651 6.90387C6.33559 6.9739 6.4676 6.99884 6.59471 6.97342C6.72183 6.948 6.8341 6.8742 6.90785 6.7676C6.9816 6.66099 7.01106 6.52991 6.99003 6.402L6.49003 3.902ZM2.42903 5.243C2.36087 5.12922 2.2503 5.04718 2.12165 5.01492C1.993 4.98267 1.85681 5.00284 1.74303 5.071C1.62925 5.13916 1.54721 5.24973 1.51496 5.37838C1.4827 5.50703 1.50287 5.64322 1.57103 5.757L3.07103 8.257C3.13919 8.37078 3.24976 8.45282 3.37841 8.48507C3.50706 8.51733 3.64325 8.49716 3.75703 8.429C3.87081 8.36084 3.95285 8.25027 3.98511 8.12162C4.01736 7.99297 3.99719 7.85678 3.92903 7.743L2.42903 5.243ZM17.571 5.243C17.6048 5.18666 17.6493 5.13752 17.702 5.09839C17.7548 5.05926 17.8147 5.0309 17.8784 5.01492C17.9421 4.99895 18.0083 4.99568 18.0733 5.00531C18.1383 5.01493 18.2007 5.03725 18.257 5.071C18.3134 5.10475 18.3625 5.14927 18.4016 5.20201C18.4408 5.25475 18.4691 5.31468 18.4851 5.37838C18.5011 5.44208 18.5043 5.5083 18.4947 5.57327C18.4851 5.63823 18.4628 5.70066 18.429 5.757L16.929 8.257C16.8953 8.31334 16.8508 8.36248 16.798 8.40161C16.7453 8.44074 16.6854 8.4691 16.6217 8.48507C16.558 8.50105 16.4917 8.50432 16.4268 8.49469C16.3618 8.48507 16.2994 8.46275 16.243 8.429C16.1867 8.39525 16.1376 8.35073 16.0984 8.29799C16.0593 8.24525 16.0309 8.18532 16.015 8.12162C15.999 8.05792 15.9957 7.9917 16.0053 7.92673C16.015 7.86177 16.0373 7.79934 16.071 7.743L17.571 5.243ZM13 10.5C13 11.2956 12.684 12.0587 12.1214 12.6213C11.5587 13.1839 10.7957 13.5 10 13.5C9.20438 13.5 8.44132 13.1839 7.87871 12.6213C7.3161 12.0587 7.00003 11.2956 7.00003 10.5C7.00003 9.70435 7.3161 8.94129 7.87871 8.37868C8.44132 7.81607 9.20438 7.5 10 7.5C10.7957 7.5 11.5587 7.81607 12.1214 8.37868C12.684 8.94129 13 9.70435 13 10.5Z" fill="#f8645a"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.09402 8.01399C2.05356 7.96081 2.02416 7.90005 2.00758 7.83532C1.991 7.77058 1.98756 7.70318 1.99747 7.63709C2.00738 7.571 2.03044 7.50757 2.06528 7.45055C2.10013 7.39352 2.14605 7.34406 2.20033 7.30509C2.25462 7.26611 2.31616 7.23841 2.38133 7.22363C2.4465 7.20885 2.51398 7.20728 2.57976 7.21902C2.64555 7.23075 2.70832 7.25556 2.76436 7.29197C2.82039 7.32838 2.86856 7.37565 2.90602 7.43099C3.25402 7.91499 3.77602 8.36499 4.44202 8.74899C5.81502 9.54099 7.69202 9.99999 9.70402 9.99999C11.716 9.99999 13.594 9.54099 14.967 8.74899C15.632 8.36499 16.154 7.91499 16.502 7.43099C16.5793 7.32318 16.6963 7.2505 16.8272 7.22893C16.9581 7.20736 17.0922 7.23868 17.2 7.31599C17.3078 7.3933 17.3805 7.51027 17.4021 7.64117C17.4236 7.77207 17.3923 7.90618 17.315 8.01399C16.878 8.62199 16.248 9.16399 15.467 9.61499C13.934 10.499 11.884 11 9.70402 11C7.52402 11 5.47402 10.5 3.94202 9.61499C3.16002 9.16399 2.53002 8.62199 2.09402 8.01499" fill="#a0aec0"/>
                      <path d="M10.5 11C10.5 10.8674 10.4473 10.7402 10.3536 10.6464C10.2598 10.5527 10.1326 10.5 10 10.5C9.8674 10.5 9.74023 10.5527 9.64646 10.6464C9.55269 10.7402 9.50001 10.8674 9.50001 11V13.5C9.50001 13.6326 9.55269 13.7598 9.64646 13.8535C9.74023 13.9473 9.8674 14 10 14C10.1326 14 10.2598 13.9473 10.3536 13.8535C10.4473 13.7598 10.5 13.6326 10.5 13.5V11ZM6.01001 10.402C6.0209 10.3358 6.04501 10.2724 6.0809 10.2157C6.11679 10.159 6.16373 10.1101 6.21892 10.0719C6.27411 10.0337 6.33642 10.0071 6.40214 9.99347C6.46786 9.97988 6.53564 9.97966 6.60144 9.99282C6.66725 10.006 6.72973 10.0323 6.78517 10.0701C6.84061 10.1079 6.88786 10.1565 6.92412 10.213C6.96038 10.2694 6.9849 10.3326 6.99622 10.3988C7.00754 10.4649 7.00543 10.5327 6.99001 10.598L6.49001 13.098C6.46023 13.2241 6.38262 13.3338 6.27354 13.4039C6.16446 13.4739 6.03244 13.4988 5.90533 13.4734C5.77822 13.448 5.66595 13.3742 5.5922 13.2676C5.51844 13.161 5.48898 13.0299 5.51001 12.902L6.01001 10.402ZM13.99 10.402C13.9602 10.2758 13.8826 10.1662 13.7735 10.0961C13.6645 10.0261 13.5324 10.0011 13.4053 10.0266C13.2782 10.052 13.1659 10.1258 13.0922 10.2324C13.0184 10.339 12.989 10.4701 13.01 10.598L13.51 13.098C13.5398 13.2241 13.6174 13.3338 13.7265 13.4039C13.8356 13.4739 13.9676 13.4988 14.0947 13.4734C14.2218 13.448 14.3341 13.3742 14.4078 13.2676C14.4816 13.161 14.511 13.0299 14.49 12.902L13.99 10.402ZM16.354 8.64598C16.2601 8.5521 16.1328 8.49935 16 8.49935C15.8672 8.49935 15.7399 8.5521 15.646 8.64598C15.5521 8.73987 15.4994 8.86721 15.4994 8.99998C15.4994 9.13276 15.5521 9.2601 15.646 9.35398L17.646 11.354C17.7399 11.4479 17.8672 11.5006 18 11.5006C18.1328 11.5006 18.2601 11.4479 18.354 11.354C18.4479 11.2601 18.5006 11.1328 18.5006 11C18.5006 10.8672 18.4479 10.7399 18.354 10.646L16.354 8.64598ZM3.44801 8.66398C3.49153 8.61322 3.54479 8.5717 3.60463 8.54189C3.66448 8.51207 3.7297 8.49455 3.79643 8.49038C3.86316 8.48621 3.93006 8.49547 3.99315 8.51761C4.05624 8.53974 4.11425 8.57431 4.16375 8.61926C4.21325 8.66421 4.25323 8.71863 4.28133 8.77931C4.30942 8.83998 4.32507 8.90567 4.32733 8.9725C4.32959 9.03932 4.31843 9.10592 4.2945 9.16835C4.27057 9.23079 4.23436 9.28779 4.18801 9.33598L2.37001 11.336C2.27981 11.4298 2.15659 11.4847 2.02653 11.4891C1.89647 11.4935 1.76982 11.447 1.67348 11.3596C1.57714 11.2721 1.5187 11.1505 1.51059 11.0206C1.50247 10.8907 1.54531 10.7628 1.63001 10.664L3.44801 8.66398Z" fill="#a0aec0"/>
                    </svg>
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#F8645A] text-white rounded-lg text-lg font-bold mb-5 hover:bg-[#E11383] transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>
            <button type="button"
              className="w-full py-3 bg-white border-2 border-[#F8645A] rounded-lg text-[#F8645A] text-base flex items-center justify-center gap-2 hover:border-[#E11383] hover:text-[#E11383] transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Log in with Google
            </button>
          </form>
          <div className="text-center mt-8 text-text-500 text-base">
            Don't have an account? <a href="/sign-up" className="text-[#E11383] font-bold">Sign Up</a>
          </div>
        </div>
      </div>
      {/* Inline styles for eyes */}
      <style jsx>{`
        .character {
          transform: scale(0.55);
          transform-origin: bottom left;
        }
        
        @media (min-width: 768px) {
          .character {
            transform: scale(1);
          }
        }
        
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
        
        /* Prevent gray background on autofill/autocomplete */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #683817 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default SignInPage;