"use client";

//proper error message must reflected

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";

// Zod schema for form validation
const signUpSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required").trim(),
  restaurantLocation: z.string().min(1, "Restaurant location is required").trim(),
  userName: z.string().min(1, "Full name is required").trim(),
  email: z.email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type FormErrors = Partial<Record<keyof SignUpFormData | 'general', string>>;

const SignUpPage = () => {
  const router = useRouter();

  // Form state
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantLocation, setRestaurantLocation] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<Set<keyof SignUpFormData>>(new Set());

  // Mark field as touched on blur
  const handleBlur = (field: keyof SignUpFormData) => {
    setTouchedFields(prev => new Set(prev).add(field));
    validateField(field);
  };

  // Handle field change - validate if already touched
  const handleFieldChange = (field: keyof SignUpFormData, value: string, setter: (val: string) => void) => {
    setter(value);

    // If field has been touched, validate on change
    if (touchedFields.has(field)) {
      // Validate with the new value
      validateFieldWithValue(field, value);
    }
  };

  // Validate field with a specific value (for onChange validation)
  const validateFieldWithValue = (field: keyof SignUpFormData, value: string) => {
    try {
      const formData = {
        restaurantName,
        restaurantLocation,
        userName,
        email,
        password,
        confirmPassword,
        [field]: value, // Override with new value
      };

      // Validate the entire form to get all errors
      signUpSchema.parse(formData);

      // If validation passes, clear the error for this field
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find if there's an error for this specific field
        const fieldError = error.issues.find((err: z.core.$ZodIssue) => err.path[0] === field);

        if (fieldError) {
          // Set error for this field
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
        } else {
          // Clear error for this field if it's now valid
          setErrors(prev => ({ ...prev, [field]: undefined }));
        }
      }
    }
  };

  // Validate individual field
  const validateField = (field: keyof SignUpFormData) => {
    try {
      const formData = {
        restaurantName,
        restaurantLocation,
        userName,
        email,
        password,
        confirmPassword,
      };

      // Validate the entire form to get all errors
      signUpSchema.parse(formData);

      // If validation passes, clear the error for this field
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find if there's an error for this specific field
        const fieldError = error.issues.find((err: z.core.$ZodIssue) => err.path[0] === field);

        if (fieldError) {
          // Set error for this field
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
        } else {
          // Clear error for this field if it's now valid
          setErrors(prev => ({ ...prev, [field]: undefined }));
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      restaurantName,
      restaurantLocation,
      userName,
      email,
      password,
      confirmPassword,
    };

    // Validate all fields
    try {
      signUpSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as keyof SignUpFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    // Submit to API
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userName,
          email: email,
          password: password,
          restaurantName: restaurantName,
          restaurantLocation: restaurantLocation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors - backend returns error message in "error" field
        const errorMessage = data.error || data.message || "An error occurred. Please try again.";
        setErrors({ general: errorMessage });
        return;
      }

      // Success - HTTP-only cookie is automatically set by the backend
      // No need to manually store the token - it's already in the secure cookie

      // Clear form
      setRestaurantName("");
      setRestaurantLocation("");
      setUserName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Show success message
      setShowSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Sign-up error:', error);
      setErrors({
        general: "Network error. Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };


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
        <h1 className="text-2xl md:text-3xl mb-2 font-bold text-center text-text-500">
          Create your account
        </h1>
        <h2 className="subtitle mb-8 text-base md:text-lg text-center text-secondary-500" >
          Please fill in your details
        </h2>

        {/* General error message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg text-green-700 text-sm font-medium text-center">
            ✓ Account created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5">
            <label htmlFor="restaurantName" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Restaurant Name
            </label>
            <input
              onChange={(e) => handleFieldChange('restaurantName', e.target.value, setRestaurantName)}
              onBlur={() => handleBlur('restaurantName')}
              value={restaurantName}
              type="text"
              id="restaurantName"
              placeholder="Enter the restaurant name"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.restaurantName && touchedFields.has('restaurantName')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.restaurantName && touchedFields.has('restaurantName') && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
            )}
          </div>

          <div className="form-group mb-5">
            <label htmlFor="restaurantLocation" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Restaurant Location
            </label>
            <input
              onChange={(e) => handleFieldChange('restaurantLocation', e.target.value, setRestaurantLocation)}
              onBlur={() => handleBlur('restaurantLocation')}
              value={restaurantLocation}
              type="text"
              id="restaurantLocation"
              placeholder="e.g., Istanbul, Besiktas"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.restaurantLocation && touchedFields.has('restaurantLocation')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.restaurantLocation && touchedFields.has('restaurantLocation') && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantLocation}</p>
            )}
          </div>

          <div className="form-group mb-5">
            <label htmlFor="ownerName" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Full Name
            </label>
            <input
              onChange={(e) => handleFieldChange('userName', e.target.value, setUserName)}
              onBlur={() => handleBlur('userName')}
              value={userName}
              type="text"
              id="ownerName"
              placeholder="Enter your full name"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.userName && touchedFields.has('userName')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.userName && touchedFields.has('userName') && (
              <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
            )}
          </div>
          <div className="form-group mb-5">
            <label htmlFor="email" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Email
            </label>
            <input
              onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
              onBlur={() => handleBlur('email')}
              value={email}
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.email && touchedFields.has('email')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.email && touchedFields.has('email') && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="form-group mb-5">
            <label htmlFor="password" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Password
            </label>
            <input
              onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
              onBlur={() => handleBlur('password')}
              value={password}
              type="password"
              id="password"
              placeholder="Enter your password"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.password && touchedFields.has('password')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.password && touchedFields.has('password') && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <div className="form-group mb-5">
            <label htmlFor="confirmPassword" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Confirm Password
            </label>
            <input
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
              onBlur={() => handleBlur('confirmPassword')}
              value={confirmPassword}
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className={`w-full p-3 border-2 rounded-lg text-[#683817] placeholder:text-[#b09886] focus:border-[#E11383] text-base ${errors.confirmPassword && touchedFields.has('confirmPassword')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                }`}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && touchedFields.has('confirmPassword') && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#F8645A] text-white rounded-lg text-lg font-bold mb-5 hover:bg-[#E11383] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>

          <button
            type="button"
            className="w-full py-3 bg-white border-2 border-[#F8645A] rounded-lg text-[#F8645A] text-base flex items-center justify-center gap-2 hover:border-[#E11383] hover:text-[#E11383] transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
