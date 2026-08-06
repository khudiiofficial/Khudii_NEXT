import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import countryCodes from './countries_full.json';
import phonePatterns from './countryPatternsByName.json';
import PageHeader from "../../componets/PageHeader/PageHeader";
import SEO from "../../componets/Helmet/Helmet";
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '') ;
import { showError } from "../../SwalPopUp/swal";
export default function JobApplicationForm({con,url}) {
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
      country:"PK"
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

    console.log("Job Application Data:", data);
   
    try {
      const res = await axios.post(`${API_URL}/api/job-application`, data, {
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
      console.error("Job application submit error:", err);
      // setServerError(err?.response?.data?.error || "Failed to submit application. Please try again.");
      showError(err?.response?.data?.error || "Failed to submit application. Please try again.")
    }
  };

  const selectedCountry = countryCodes.find(country => country.dialCode === watchCountryCode);

  return (
    <>
  <SEO 
        title={con?.meta_title||"Careers at Khudii Pakistan | Join Our Welfare Team"}
        description={con?.meta_description||"Apply for meaningful career opportunities at Khudii Welfare Organization. Join our team dedicated to serving communities across Pakistan through healthcare, education, and social welfare initiatives."}
        keywords={con?.meta_keywords||"khudii careers, welfare jobs pakistan, NGO jobs, charity careers, social work employment, khudii vacancies, humanitarian jobs, community development careers"}
        url={`${url}/jobs`}
        type="website"
      />

 <PageHeader 
                title="Jobs"
                breadcrumbs={[
                  { label: "Home", link: "/" },
                  { label: "Jobs" }
                ]}
              />

    <section className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#E3001C] to-[#FF6B6B] px-8 py-6">
          <h2 className="text-3xl font-bold text-white text-center">Job Application</h2>
          <p className="text-blue-100 text-center mt-2">
            Join our team and make a difference
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
              <div className="text-sm text-red-800 bg-red-50 border border-red-200 p-4 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Name and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { 
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.name ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                  placeholder="Full Name"
                />
                {errors.name && (
                  <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Mobile No.
                </label>
                <div ref={phoneInputRef} className="relative">
                  <div className="flex">
                    {/* Country Code Selector */}
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
                        className={`w-4 h-4 text-[#222222] transition-transform ${
                          showCountryDropdown ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Phone Input */}
                    <input
                      {...register("phone", {
                        validate: validatePhoneNumber
                      })}
                      onBlur={handlePhoneBlur}
                      className={`flex-1 w-1/2 px-4 py-3 border border-[#222222] rounded-r-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                        errors.phone ? "border-red-400 bg-red-50" : "border-[#222222]"
                      }`}
                      placeholder={watchCountryCode === '92' ? '301 2345678' : 'Enter Phone Number'}
                      maxLength={16}
                    />
                  </div>

                  {/* Country Dropdown */}
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
                {errors.phone && (
                  <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>
                )}
                
                {/* Hidden fields for country data */}
                <input type="hidden" {...register("countryCode")} />
                <input type="hidden" {...register("CountryName")} />
                <input type="hidden" {...register("country")} />
              </div>
            </div>

            {/* Email and Experience Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Email <span className="text-red-500">*</span>
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
                  <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>
                )}
              </div>

              {/* Experience Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  {...register("experience", {
                    required: "Experience is required",
                    min: {
                      value: 0,
                      message: "Experience cannot be negative"
                    },
                    max: {
                      value: 50,
                      message: "Experience seems too high"
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors ${
                    errors.experience ? "border-red-400 bg-red-50" : "border-[#222222]"
                  }`}
                  placeholder="e.g. 2, 4.5, 8 etc."
                />
                <div className="text-xs text-[#009dc8] mt-1">In Years</div>
                {errors.experience && (
                  <span className="text-xs text-red-500 mt-1">{errors.experience.message}</span>
                )}
              </div>
            </div>

            {/* Qualification and Interested Post Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualification Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Qualification
                </label>
                <input
                  {...register("qualification")}
                  className="w-full px-4 py-3 border border-[#222222] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors"
                  placeholder="e.g. Bachelor's Degree, Master's etc."
                />
              </div>

              {/* Interested Post Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#222222] mb-2">
                  Interested Post
                </label>
                <input
                  {...register("interestedPost")}
                  className="w-full px-4 py-3 border border-[#222222] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02236e] transition-colors"
                  placeholder="Position You're Applying For"
                />
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
                placeholder="Tell Us Why You're Interested In This Position And What Makes You A Great Candidate..."
              />
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
                  "Submit Application"
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
              
              <h3 className="text-2xl font-bold text-[#222222] mb-2">Application Submitted!</h3>
              <p className="text-[#222222] mb-6">
                Thank you for your interest in joining our team. We have received your application and will review it carefully. We'll be in touch soon!
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#1c5e20] text-white py-3 px-6 rounded-xl font-semibold text-lg cursor-pointer transition-colors"
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