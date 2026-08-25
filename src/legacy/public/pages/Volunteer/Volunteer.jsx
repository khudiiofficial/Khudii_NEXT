import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import countryCodes from './countries_full.json';
import phonePatterns from './countryPatternsByName.json';
import PageHeader from "../../componets/PageHeader/PageHeader";
import SEO from "../../componets/Helmet/Helmet";
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { showError } from "../../SwalPopUp/swal";
export default function VolunteerForm({con,url}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      countryCode: "92",
      CountryName: "Pakistan",
      country: "PK"
    }
  });

const [val,setval]=useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const watchCountryCode = watch("countryCode");
  const watchCountryName = watch("CountryName");
  const watchPhone = watch("phone");

  const phoneInputRef = useRef(null);

  const handleClickOutside = (event) => {
    if (phoneInputRef.current && !phoneInputRef.current.contains(event.target)) {
      setShowCountryDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Phone validation functions from your component
  const validatePhone = (phone, dialCode, CountryName) => {
    const pattern = phonePatterns.phonePatterns[CountryName]?.pattern;
    if (!pattern) return true;
    const regex = new RegExp(pattern);
    return regex.test(phone.replace(/\s+/g, ""));
  };

  const validatePhoneNumber = (phone) => {
    const countryCode = watchCountryCode;
    const countryName = watchCountryName;
    
    if (!phone) {
      return "Phone number is required";
    }
    
    if (!validatePhone(phone, countryCode, countryName)) {
      const country = countryCodes.find(c => c.dialCode === countryCode);
      return `Please enter a valid phone number for ${country?.name || 'selected country'}`;
    }
    
    return true;
  };

  const selectCountryCode = (dialCode, name, code) => {
    setValue("countryCode", dialCode);
    setValue("CountryName", name);
    setValue("country", code);
    console.log(code)
    setShowCountryDropdown(false);
    
    if (errors.phone) {
      clearErrors("phone");
    }
  };

  const handlePhoneBlur = () => {
    if (watchPhone) {
      const validationResult = validatePhoneNumber(watchPhone);
      if (validationResult !== true) {
        setError("phone", { message: validationResult });
      } else {
        clearErrors("phone");
      }
    }
  };

  const onSubmit = async (data) => {
         if(val){
    console.warn('bot detected')
    return
   }
    setServerMessage(null);
    setServerError(null);
    
    // Final phone validation before submission
    const phoneValidation = validatePhoneNumber(data.phone);
    if (phoneValidation !== true) {
      setError("phone", { message: phoneValidation });
      return;
    }

    console.log("Volunteer Application Data:", data);
    
    try {
      const res = await axios.post(`${API_URL}/api/volunteer`, data, {
       withCredentials:true
      });

      if (res.status === 200) {
        setShowSuccessModal(true);
        reset();
      } else {
        // setServerError("Unexpected response from server.");
        showError("Unexpected response from server.")
      }
    } catch (err) {
      console.error("Volunteer application submit error:", err);
      // setServerError(err?.response?.data?.error || "Failed to submit application. Please try again.");
        showError(err?.response?.data?.error || "Failed to submit application. Please try again.")
    }
  };

  const selectedCountry = countryCodes.find(country => country.dialCode === watchCountryCode);

  return (
    <>
        <SEO 
        title={con?.meta_title||"Volunteer with Khudii Pakistan | Make a Difference in Your Community"}
        description={con?.meta_description||"Join Khudii as a volunteer and help transform lives across Pakistan. Contribute your time and skills to support healthcare, education, and community welfare initiatives."}
        keywords={con?.meta_keywords||"khudii volunteer, welfare volunteering, pakistan charity volunteer, community service, humanitarian work, volunteer opportunities, social work volunteer, khudii volunteer program"}
        url={`${url}/volunteer`}
        type="website"
      />
     <PageHeader 
                    title="Volunteer"
                    breadcrumbs={[
                      { label: "Home", link: "/" },
                      { label: "Volunteer" }
                    ]}
                  />
   
    <section className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#E3001C] to-[#FF6B6B] px-8 py-6">
          <h2 className="text-3xl font-bold text-white text-center">Become A Volunteer</h2>
          <p className="text-blue-100 text-center mt-2">
            Join our mission and make a difference in your community
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {serverMessage && (
              <div className="text-sm text-green-800 bg-green-50 border border-green-200 p-4 rounded-lg">
                {serverMessage}
              </div>
            )}
            {serverError && (
              <div className="text-sm text-[#e7001e] bg-red-50 border border-red-200 p-4 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Name <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  {...register("name", { 
                    required: "Name is Required",
                    minLength: {
                      value: 6,
                      message: "Name must be at least 6 characters"
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.name ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                  placeholder="Full name"
                />
                {errors.name && (
                  <span className="text-xs text-[#e7001e] mt-1">{errors.name.message}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Email <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}

                    onInput={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.email ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                  placeholder="Email"
                />
                {errors.email && (
                  <span className="text-xs text-[#e7001e] mt-1">{errors.email.message}</span>
                )}
              </div>
            </div>

            {/* Phone, Contact Date and City Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Phone Field - full width share */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Phone <span className="text-[#e7001e]">*</span>
                </label>
                <div ref={phoneInputRef} className="relative">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center w-28 justify-between px-3 py-3 bg-gray-50 border border-r-0 border-[#222222] rounded-l-xl hover:bg-[#222222] transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-sm mr-2">{selectedCountry?.flag}</span>
                        <span className="text-[#222222] text-sm">+{watchCountryCode}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#222222] transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <input
                      {...register("phone", {
                        required: "Phone Number is Required",
                        validate: validatePhoneNumber
                      })}
                      onBlur={handlePhoneBlur}
                      className={`flex-1 min-w-0 px-4 py-3 border border-[#222222] rounded-r-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                        errors.phone ? "border-red-400 bg-red-50" : "border-[#222222]"
                      }`}
                      placeholder={watchCountryCode === '92' ? '301 234567' : 'Enter phone number'}
                      maxLength={16}
                    />
                  </div>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#222222] rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountryCode(country.dialCode, country.name, country.code)}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                              watchCountryCode === country.dialCode ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="flex-1 text-left font-medium text-sm">{country.name}</span>
                            <span className="text-[#222222] text-sm">+{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.phone && <span className="text-xs text-[#e7001e] mt-1">{errors.phone.message}</span>}
                <input type="hidden" {...register("countryCode")} />
                <input type="hidden" {...register("CountryName")} />
                <input type="hidden" {...register("country")} />
              </div>

              {/* Contact Date Field - short */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Contact Date <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="date"
                  {...register("contactTime", { required: "Preferred contact date is required" })}
                  className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.contactTime ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                />
                {errors.contactTime && <span className="text-xs text-[#e7001e] mt-1">{errors.contactTime.message}</span>}
              </div>

              {/* City Field - short */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  City <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="text"
                  {...register("city", { required: "City is required" })}
                  className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.city ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                  placeholder="City"
                />
                {errors.city && <span className="text-xs text-[#e7001e] mt-1">{errors.city.message}</span>}
              </div>
            </div>

            {/* Message Field */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#222222] mb-2">
                Message
              </label>
              <textarea
                {...register("message")}
                rows={4}
                className="w-full px-4 py-3 border border-[#222222] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors resize-vertical"
                placeholder="Tell Us About Your Interests, Skills, And Why You'd Like To Volunteer With Us..."
              />
              <div className="text-xs text-[#009dc8] mt-1">
                Optional: Share Your Motivation, Relevant Experience, Or Specific Areas You'd Like To Help With
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full bg-[#e7001e] hover:bg-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Join as Volunteer"
                )}
              </button>
               <input style={{border:' solid 1px red'}} value={val} onChange={(e)=>{setval(e.target.value)}} type="hidden" />
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-[#1c5e20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-[#222222] mb-2">Thank You for Your Interest!</h3>
              <p className="text-[#222222] mb-6">
                Your volunteer application has been received successfully. Our team will review your information and contact you soon to discuss how you can contribute to our mission.
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#1c5e20] cursor-pointer text-lg text-white py-3 px-6 rounded-xl font-semibold  transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
     </>
  );
}