import { useForm } from "react-hook-form";
import { useState,useEffect,useRef } from "react";
import PageHeader from "../../componets/PageHeader/PageHeader";
import countryCodes from './countries_full.json';
import phonePatterns from './countryPatternsByName.json';
import axios from "axios";
import SEO from "../../componets/Helmet/Helmet";
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { showError } from "../../SwalPopUp/swal";
export default function ContributeStory({con,url}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setValue,
  } = useForm({
    defaultValues: {
      countryCode: "92",
      CountryName: "Pakistan",
      country:"PK",
      entityType:"Individual"
    }
  });
const [val,setval]=useState('')
const myDivRef = useRef(null);
 const handleClickOutside = (event) => {
    if (myDivRef.current && !myDivRef.current.contains(event.target)) {
     
      setShowCountryDropdown(false); // Example: Close a dropdown
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuccessModal,setshowSuccessModal]=useState(false)
  const [serverError, setServerError] = useState(null);
  const entityType = watch("entityType");
  const watchCountryCode = watch("countryCode");
  const watchCountryName = watch("CountryName");
  const watchPhone = watch("phone");

  // Phone validation function
  const validatePhone = (phone, dialCode, CountryName) => {
    const pattern = phonePatterns.phonePatterns[CountryName]?.pattern;
    if (!pattern) return true; // fallback: accept anything if no rule
    const regex = new RegExp(pattern);
    return regex.test(phone.replace(/\s+/g, ""));
  };

  // Custom phone validation for react-hook-form
  const validatePhoneNumber = (phone) => {
    const countryCode = watchCountryCode;
    const countryName = watchCountryName;
    
    if (!phone) {
      return "Mobile number is required";
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
    
    // Clear phone error when country code changes
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
    // Final validation before submission
    const phoneValidation = validatePhoneNumber(data.phone);
    if (phoneValidation !== true) {
      setError("phone", { message: phoneValidation });
      return;
    }


try {
  const res=await axios.post(`${API_URL}/api/contribute-story`,data,{withCredentials:true})
if(res.status===200){
 console.log("Story Submitted:", data);
  setshowSuccessModal(true)
  reset();
}
  else{
    setServerError('Error in sending data! Try again')
  }
   
} catch (error) {
  //  setServerError(err?.response?.data?.error || "Failed to submit application. Please try again.");
  showError(err?.response?.data?.error || "Failed to submit application. Please try again.")
}

  };

  const selectedCountry = countryCodes.find(country => country.dialCode === watchCountryCode);

  return (
    <>
   <SEO 
        title={con?.meta_title||"Share Your Story - Khudii Pakistan | Contribute Your Experience"}
        description={con?.meta_description||"Share your inspiring story with Khudii - Pakistan's digital welfare platform. Contribute as an individual or organization and inspire others with your journey of making a difference."}
        keywords={con?.meta_keywords||"share story khudii, contribute story pakistan, welfare stories, inspirational stories, community experiences, khudii stories, personal journey, organization stories, social impact stories"}
        url={`${url}/contribute-your-story`}
        type="website"
      />

      <PageHeader 
        title="Contribute Your Story"
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "Contribute" }
        ]}
      />
      <section className="py-16 bg-[#e6edff] grid place-items-center">
        <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-lg">


          {/* Heading */}
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Contribute Your Story
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
             {serverError && (
              <div className="text-sm text-[#e7001e] bg-red-50 border border-[#e7001e] p-4 rounded-lg">
                {serverError}
              </div>
            )}
            {/* Entity Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Entity Type <span className="text-[#e7001e]">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Individual"
                    {...register("entityType", { required: "Entity type is required" })}
                    className="accent-[#022279]"
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Organization"
                    {...register("entityType", { required: "Entity type is required" })}
                    className="accent-[#022279]"
                  />
                  <span>Organization</span>
                </label>
              </div>
              {errors.entityType && (
                <p className="text-[#e7001e] text-sm mt-1">{errors.entityType.message}</p>
              )}
            </div>

            {/* Name + Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Name <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("name", { required: "Name is required" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.name ? "border-[#e7001e] focus:ring-[#e7001e]" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-[#e7001e] text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                    onInput={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.email ? "border-[#e7001e] focus:ring-[#e7001e]" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-[#e7001e] text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Mobile No. + Company (conditionally) */}
            <div className={`grid ${entityType === "Organization" ? "md:grid-cols-2" : "grid-cols-1"} gap-6`}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mobile No. <span className="text-[#e7001e]">*</span>
                </label>
                <div ref={myDivRef} className="relative">
                  <div className="flex">
                    {/* Country Code Selector */}
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center w-28 justify-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-sm">{selectedCountry?.flag}</span>
                      <span className="text-gray-700 text-sm ml-1">+{watchCountryCode}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
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
                        required: "Mobile number is required",
                        validate: validatePhoneNumber
                      })}
                      onBlur={handlePhoneBlur}
                      placeholder={watchCountryCode === '92' ? '301 2345678' : 'Enter Phone Number'}
                      maxLength={16}
                      className={`flex-1 px-4 w-1/2 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:outline-none focus:ring-blue-500 ${
                        errors.phone ? "border-[#e7001e] focus:ring-[#e7001e]" : "border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountryCode(country.dialCode, country.name, country.code)}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                              watchCountryCode === country.dialCode ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="flex-1 text-left font-medium text-sm">{country.name}</span>
                            <span className="text-gray-600 text-sm">+{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="text-[#e7001e] text-sm mt-1">{errors.phone.message}</p>
                )}
                
                {/* Hidden fields for country data */}
                <input type="hidden" {...register("countryCode")} />
                <input type="hidden" {...register("CountryName")} />
                <input type="hidden" {...register("country")} />
              </div>

              {entityType === "Organization" && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Company <span className="text-[#e7001e]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Company Name"
                    {...register("company", {
                      required: "Company name is required for organizations",
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.company ? "border-[#e7001e] focus:ring-[#e7001e]" : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.company && (
                    <p className="text-[#e7001e] text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Story */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Story <span className="text-[#e7001e]">*</span>
              </label>
              <textarea
                placeholder="Write Your Story Here..."
                rows="6"
                {...register("story", { required: "Story is required" })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.story ? "border-[#e7001e] focus:ring-[#e7001e]" : "border-gray-300 focus:ring-blue-500"
                }`}
              ></textarea>
              {errors.story && (
                <p className="text-[#e7001e] text-sm mt-1">{errors.story.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full bg-[#e7001e]  text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e7001e] transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Story"}
            </button>
            <input style={{border:' solid 1px red'}} value={val} onChange={(e)=>{setval(e.target.value)}} type="hidden" />
          </form>
        </div>


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
              
              <h3 className="text-2xl font-bold text-[#1c5e20] mb-2">Thank You!</h3>
              <p className="text-[#222222] mb-6">
                Your story information has been submitted successfully. We appreciate your support.
              </p>
              
              <button
                onClick={()=>{setshowSuccessModal(false)}}
                className="cursor-pointer w-full bg-[#1c5e20] text-lg text-white py-3 px-6 rounded-2xl font-semibold transition-colors"
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