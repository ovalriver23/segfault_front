"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import * as z from "zod";
import { getUserLocation } from "../lib/utils/geolocation";
import { Eye, EyeOff } from "lucide-react";

const LocationPicker = dynamic(() => import("../../components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-dashed border-[#F8645A] flex items-center justify-center text-text-300 text-sm">
      Harita yükleniyor...
    </div>
  ),
});

// Allowed image types and max size (5MB)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Zod schema for form validation
const signUpSchema = z.object({
  restaurantName: z.string().min(1, "Restoran adı gereklidir.").trim(),
  restaurantLocation: z.string().min(1, "Restoran lokasyonu gereklidir.").trim(),
  userName: z.string().min(1, "Kullanıcı Adı gereklidir.").trim(),
  email: z.email("Geçersiz email adresi"),
  password: z.string()
    .min(8, "Şifre en az 8 karakter uzunluğunda olmalıdır.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Şifre en az 1 büyük harf, küçük harf, numara ve özel karakter içermelidir."),
  confirmPassword: z.string().min(8, "Lütfen şifrenizi doğrulayın"),
  latitude: z.preprocess(
    (val) => val === "" || val === undefined || val === null ? undefined : Number(val),
    z.number({ error: "Enlem bilgisi gereklidir." })
      .refine((val) => !Number.isNaN(val), { message: "Enlem bilgisi gereklidir." })
      .min(-90, "Latitude must be at least -90")
      .max(90, "Latitude cannot exceed 90"),
  ),
  longitude: z.preprocess(
    (val) => val === "" || val === undefined || val === null ? undefined : Number(val),
    z.number({ error: "Boylam bilgisi gereklidir." })
      .refine((val) => !Number.isNaN(val), { message: "Boylam bilgisi gereklidir." })
      .min(-180, "Longitude must be at least -180")
      .max(180, "Longitude cannot exceed 180"),
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor.",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type FormErrors = Partial<Record<keyof SignUpFormData | 'general' | 'profilePhoto' | 'restaurantLogo', string>>;

const SignUpPage = () => {
  const router = useRouter();

  // Form state
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantLocation, setRestaurantLocation] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // Password visibility state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Image upload state
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [restaurantLogo, setRestaurantLogo] = useState<File | null>(null);
  const [restaurantLogoPreview, setRestaurantLogoPreview] = useState<string | null>(null);

  // File input refs
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const restaurantLogoRef = useRef<HTMLInputElement>(null);

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<Set<keyof SignUpFormData>>(new Set());

  // Validate image file
  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Sadece JPEG, PNG, GIF veya WebP formatları kabul edilmektedir.";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Dosya boyutu 5MB'dan küçük olmalıdır.";
    }
    return null;
  };

  // Handle profile photo selection
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, profilePhoto: error }));
        return;
      }
      setErrors(prev => ({ ...prev, profilePhoto: undefined }));
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle restaurant logo selection
  const handleRestaurantLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, restaurantLogo: error }));
        return;
      }
      setErrors(prev => ({ ...prev, restaurantLogo: undefined }));
      setRestaurantLogo(file);
      setRestaurantLogoPreview(URL.createObjectURL(file));
    }
  };

  // Remove profile photo
  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    if (profilePhotoRef.current) {
      profilePhotoRef.current.value = '';
    }
  };

  // Remove restaurant logo
  const handleRemoveRestaurantLogo = () => {
    setRestaurantLogo(null);
    setRestaurantLogoPreview(null);
    if (restaurantLogoRef.current) {
      restaurantLogoRef.current.value = '';
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: string, lng: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setTouchedFields(prev => new Set(prev).add("latitude").add("longitude"));
    validateFieldWithValue("latitude", lat);
    validateFieldWithValue("longitude", lng);
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const coords = await getUserLocation();
      handleLocationSelect(coords.latitude.toFixed(6), coords.longitude.toFixed(6));
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error
        ? (error as { message?: string }).message
        : "Lokasyonunuz alınamıyor.";
      
      // Show error message prominently
      setErrors(prev => ({ ...prev, general: message || "Lokasyonunuz alınamıyor." }));

    } finally {
      setIsLoading(false);
    }
  };

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
        latitude,
        longitude,
        [field]: value, // Override with new value
      };

      // Validate the entire form to get all errors
      signUpSchema.parse(formData);

      // If validation passes, clear the error for this field
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find if there's an error for this specific field
        const fieldError = error.issues.find((err: z.ZodIssue) => err.path[0] === field);

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
        latitude,
        longitude,
      };

      // Validate the entire form to get all errors
      signUpSchema.parse(formData);

      // If validation passes, clear the error for this field
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find if there's an error for this specific field
        const fieldError = error.issues.find((err: z.ZodIssue) => err.path[0] === field);

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
      latitude,
      longitude,
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

    // Submit to API using FormData
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', userName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('restaurantName', restaurantName);
      formData.append('restaurantLocation', restaurantLocation);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      // Add optional image files
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }
      if (restaurantLogo) {
        formData.append('restaurantLogo', restaurantLogo);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
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
      setLatitude("");
      setLongitude("");
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      setRestaurantLogo(null);
      setRestaurantLogoPreview(null);

      // Show success message
      setShowSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);

    } catch (error) {
      setErrors({
        general: "Ağ Hatası. Lütfen daha sonra tekrar deneyin."
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
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 md:p-12 my-4">
        <h1 className="text-2xl md:text-3xl mb-2 font-bold text-center text-text-500">
          Hesabını Oluştur
        </h1>
        <h2 className="subtitle mb-8 text-base md:text-lg text-center text-secondary-500" >
          Lütfen Aşağıdaki Bilgileri Doldurun
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
            ✓ Hesabınız Başarıyla Oluşturuldu
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-5">
            <label htmlFor="restaurantName" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Restoran Adı
            </label>
            <input
              onChange={(e) => handleFieldChange('restaurantName', e.target.value, setRestaurantName)}
              onBlur={() => handleBlur('restaurantName')}
              value={restaurantName}
              type="text"
              id="restaurantName"
              placeholder="Cafe Amo"
              className={`w-full p-3 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.restaurantName && touchedFields.has('restaurantName')
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

          {/* Image Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Profile Photo Upload */}
            <div className="form-group">
              <label className="block mb-2 font-medium" style={{ color: "#683817" }}>
                Profil Fotoğrafı <span className="text-text-300 text-sm">(Opsiyonel)</span>
              </label>
              <div className="relative">
                {profilePhotoPreview ? (
                  <div className="relative w-full h-32 border-2 border-[#F8645A] rounded-lg overflow-hidden">
                    <Image
                      src={profilePhotoPreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfilePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePhoto"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#E11383] transition ${
                      errors.profilePhoto ? 'border-red-500' : 'border-[#F8645A]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-[#F8645A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-xs text-text-300">Yüklemek için tıklayın</p>
                    </div>
                    <input
                      ref={profilePhotoRef}
                      id="profilePhoto"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleProfilePhotoChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
              {errors.profilePhoto && (
                <p className="mt-1 text-sm text-red-600">{errors.profilePhoto}</p>
              )}
            </div>

            {/* Restaurant Logo Upload */}
            <div className="form-group">
              <label className="block mb-2 font-medium" style={{ color: "#683817" }}>
                Restoran Logosu <span className="text-text-300 text-sm">(Opsiyonel)</span>
              </label>
              <div className="relative">
                {restaurantLogoPreview ? (
                  <div className="relative w-full h-32 border-2 border-[#F8645A] rounded-lg overflow-hidden">
                    <Image
                      src={restaurantLogoPreview}
                      alt="Restaurant logo preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveRestaurantLogo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="restaurantLogo"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#E11383] transition ${
                      errors.restaurantLogo ? 'border-red-500' : 'border-[#F8645A]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-[#F8645A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-text-300">Yüklemek için tıklayın</p>
                    </div>
                    <input
                      ref={restaurantLogoRef}
                      id="restaurantLogo"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleRestaurantLogoChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
              {errors.restaurantLogo && (
                <p className="mt-1 text-sm text-red-600">{errors.restaurantLogo}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-text-300 mb-5 -mt-3">Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPEG, PNG, GIF, WebP</p>

          <div className="form-group mb-5">
            <label htmlFor="restaurantLocation" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Restoran Lokasyonu
            </label>
            <input
              onChange={(e) => handleFieldChange('restaurantLocation', e.target.value, setRestaurantLocation)}
              onBlur={() => handleBlur('restaurantLocation')}
              value={restaurantLocation}
              type="text"
              id="restaurantLocation"
              placeholder="Örnek: Istanbul, Besiktas"
              className={`w-full p-3 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.restaurantLocation && touchedFields.has('restaurantLocation')
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
              Kullanıcı Adı
            </label>
            <input
              onChange={(e) => handleFieldChange('userName', e.target.value, setUserName)}
              onBlur={() => handleBlur('userName')}
              value={userName}
              type="text"
              id="ownerName"
              placeholder=" "
              className={`w-full p-3 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.userName && touchedFields.has('userName')
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
              placeholder="amo@gmail.com"
              className={`w-full p-3 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.email && touchedFields.has('email')
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
              Şifre
            </label>
            <div className="relative">
              <input
                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                onBlur={() => handleBlur('password')}
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full p-3 pr-12 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.password && touchedFields.has('password')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                  }`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-500 transition"
                disabled={isLoading}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {errors.password && touchedFields.has('password') && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <div className="form-group mb-5">
            <label htmlFor="confirmPassword" className="block mb-2 font-medium" style={{ color: "#683817" }}>
              Şifre Tekrar
            </label>
            <div className="relative">
              <input
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                onBlur={() => handleBlur('confirmPassword')}
                value={confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`w-full p-3 pr-12 border-2 rounded-lg text-text-500 placeholder:text-text-200 focus:border-[#E11383] text-base ${errors.confirmPassword && touchedFields.has('confirmPassword')
                  ? 'border-red-500'
                  : 'border-[#F8645A]'
                  }`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-500 transition"
                disabled={isLoading}
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.has('confirmPassword') && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="my-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-semibold text-text-500">Restoran Lokasyonunuzu İşaretleyin</p>
                <p className="text-sm text-text-300">Haritaya tıklayın veya konum bilginizi kullanın</p>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-3 py-2 text-sm font-semibold text-white bg-[#F8645A] rounded-lg hover:bg-[#E11383] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "...Alınıyor..." : "Konumumu Kullan"}
              </button>
            </div>
            {errors.general && (
              <div className="mb-3 p-3 bg-orange-50 border border-orange-300 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">⚠️ {errors.general}</p>
                <p className="text-xs text-orange-700 mt-1">Lütfen haritaya tıklayarak restoranınızın konumunu manuel olarak seçin.</p>
              </div>
            )}
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationSelect}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">

              {errors.latitude && touchedFields.has("latitude") && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
              )}

              {errors.longitude && touchedFields.has("longitude") && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#F8645A] text-white rounded-lg text-lg font-bold mb-5 hover:bg-[#E11383] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Lütfen Bekleyiniz...' : 'Kayıt Ol'}
          </button>

          {/*<button
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
          </button>*/}
        </form>
        <div className="text-center mt-8 text-text-500 text-base">
          Zaten hesabınız var mı? <a href="/log-in" className="text-[#E11383] font-bold">Giriş Yap</a>
        </div>
      </div>
      {/* Prevent gray background on autofill/autocomplete */}
      <style jsx>{`
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

export default SignUpPage;