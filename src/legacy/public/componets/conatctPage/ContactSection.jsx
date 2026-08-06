import React, { useState,useRef,useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import countryCodes from './countries_full.json';
import phonePatterns from './countryPatternsByName.json';
import { showError } from "../../SwalPopUp/swal";
/**
 * Set API URL via Vite env: VITE_API_URL=http://localhost:5000
 * Falls back to http://localhost:5000 if not set.
 */
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
export default function ContactSection() {
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
 const [tel,settel]=useState('')
 const [data,setdata]=useState({})
 const [footerdata,setFooterData]=useState({})
       useEffect(()=>{
const fun=async ()=>{
  try {
    const res=await axios.get(`${APIPath}/api/telephone`,{withCredentials:true})
    if(res.status===200){
      let ch=''
    for(let i=0; i<res.data.data.phone_number.length; i++){
      if(Number.isInteger(parseInt(res.data.data.phone_number[i])) || res.data.data.phone_number[i]==='+' ){
ch=ch+res.data.data.phone_number[i]
      }
    }
    settel(ch)
     setdata(res.data.data)
    }
    
  } catch (error) {
    console.log(error)
  }
}
fun()
  },[])

  const fetchFooterData = async () => {
    try {
     
      const response = await axios.get(`${APIPath}/api/footer`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setFooterData(response.data.data);
        
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      
    }
  };
  useEffect(()=>{
fetchFooterData();    

  },[])
const [showSuccessModal,setshowSuccessModal]=useState(false)
  const [serverMessage, setServerMessage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const watchCountryCode = watch("countryCode");
  const watchCountryName = watch("CountryName");
  const watchPhone = watch("phone");
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


  // Phone validation function from your donation form
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
    setServerMessage(null);
    setServerError(null);
    
    // Final validation before submission
    const phoneValidation = validatePhoneNumber(data.phone);
    if (phoneValidation !== true) {
      setError("phone", { message: phoneValidation });
      return;
    }

    

    try {
      const res = await axios.post(`${API_URL}/api/contact`, data,{withCredentials:true});
      if (res.status === 200) {
        setServerMessage("Thanks — your message has been sent. We'll get back to you soon.");
            setshowSuccessModal(true)
            reset()
        // auto-dismiss message
        setTimeout(() => setServerMessage(null), 6000);
      } else {
        setServerError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      // setServerError(err?.response?.data?.error || "Failed to send message. Try again later.");
      showError(err?.response?.data?.error || "Failed to send message. Try again later.")
    }
  };

  const selectedCountry = countryCodes.find(country => country.dialCode === watchCountryCode);

  return (
    <section className="w-11/12 md:w-4/5 mx-auto py-16">
      <div className="grid gap-10 md:grid-cols-2 items-start">
        {/* Left: heading + description */}
        <div>
          <h1 className="text-[#222222] text-3xl md:text-4xl font-extrabold text-black-800 mb-4">
            We&rsquo;d Love to Hear From You
          </h1>
          <p className="text-[#222222] mb-6 max-w-xl">
            At <strong>Khudii</strong>, every connection matters. Whether you are a
            donor who wants to support, a volunteer looking to serve, or a welfare
            organization seeking visibility. We&rsquo;re here for you. Your message is
            important, and our team is ready to listen and respond.
          </p>

          {/* Contact cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="p-3 rounded-full bg-indigo-50">
                {/* phone icon */}
                <svg className="w-6 h-6 text-[#02236e]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M2 3.5C2 4.328 2.672 5 3.5 5h2c.828 0 1.5-.672 1.5-1.5S6.328 2 5.5 2h-2C2.672 2 2 2.672 2 3.5z" fill="#02236e"/>
                  <path d="M22 16.5v3.75a1 1 0 0 1-1.148.988C11.83 19.53 4.47 12.17 2.263 4.148A1 1 0 0 1 3.25 3H7a1 1 0 0 1 1 1v3.5a1 1 0 0 1-.742.97c-.804.25-1.6.6-2.345 1.05-.745.45-1.423 1.003-2.02 1.675a1 1 0 0 0-.044 1.33C7.47 17.53 13.47 23.53 19.9 21.98a1 1 0 0 0 .667-.98V17a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1z" fill="#02236e" opacity="0.15"/>
                  <path d="M21 3l-2 2M17 7l4 4" stroke="#02236e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Call Us</h3>
                <a  target="_blank"
                  className="text-slate-700 font-medium block"
                  href={`tel:${tel}`}
                >
                  <span className="text-sm text-slate-500 block">Hotline</span>
                  <span className="text-[#02236e]">{data.phone_number}</span>
                </a>
                <p className="text-xs text-slate-400 mt-1">Available 9:00am — 6:00pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="p-3 rounded-full bg-indigo-50">
                {/* email icon */}
                <svg className="w-6 h-6 text-[#02236e]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M2 6.5C2 5.672 2.672 5 3.5 5h17c.828 0 1.5.672 1.5 1.5v11c0 .828-.672 1.5-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-12z" fill="#02236e" opacity="0.08"/>
                  <path d="M3 7.5l8.5 5L20 7.5" stroke="#02236e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Email Us</h3>
                <a  target="_blank"
                  className="text-slate-700 font-medium block"
                  href={`mailto:${footerdata.email}`}
                >
                  <span className="text-[#02236e]">{footerdata.email}</span>
                </a>
                <p className="text-xs text-slate-400 mt-1">We reply within 24–48 hours.</p>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Follow Us on Social Media:</h4>

              <div className="flex gap-4 flex-wrap justify-center">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/Khudiioficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 448 512" aria-hidden><path fill="#1877F2" d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"></path></svg>
                  <span className="text-sm text-slate-700">Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/khudiiofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  {/* <svg className="w-5 h-5" viewBox="0 0 448 512" aria-hidden><path fill="#E1306C" d="M224 202.66A53.34 53.34 0 1 0 277.34 256 53.38 53.38 0 0 0 224 202.66zM398.8 80a48.06 48.06 0 0 0-33.95-33.95C333.23 36 224 36 224 36s-109.23 0-140.82 10.05A48.06 48.06 0 0 0 49.23 80C36 111.59 36 220.82 36 220.82s0 109.23 10.05 140.82a48.06 48.06 0 0 0 33.95 33.95C114.77 476 224 476 224 476s109.23 0 140.82-10.05a48.06 48.06 0 0 0 33.95-33.95C412 330.05 412 220.82 412 220.82S412 111.59 398.8 80z"/></svg> */}
                  <i className="text-[#c13584] text-xl fa-brands fa-instagram"></i>
                  <span className="text-sm text-slate-700">Instagram</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@khudiiofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  {/* <svg className="w-5 h-5" viewBox="0 0 576 512" aria-hidden><path fill="#FF0000" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64s-171 0-213.37 11.486c-23.497 6.321-42.003 24.947-48.284 48.597C15 166.347 15 255.785 15 255.785s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.37-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zM232 323V188l142.74 81.2L232 323z"/></svg> */}
                  <i className="text-[#e7001e] text-xl fa-brands fa-youtube"></i>
                  <span className="text-sm text-slate-700">YouTube</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@khudiiofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  {/* <svg className="w-5 h-5" viewBox="0 0 448 512" aria-hidden><path fill="#010101" d="M448 209.9c-6.28-23.65-24.78-42.28-48.28-48.6-26.45-7.12-70.58-11-141.73-11V349.4A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 0 0 52.23 71.18V0h88A121.18 121.18 0 0 0 326.7 56.3c11.41 42.87 11.41 132.3 11.41 132.3z"/></svg> */}
                  <i className="text-xl fa-brands fa-tiktok"></i>
                  <span className="text-sm text-slate-700">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-2xl shadow-lg space-y-4"
            noValidate
          >
            {serverMessage && (
              <div className="text-sm text-green-800 bg-green-50 border border-green-100 p-3 rounded">
                {serverMessage}
              </div>
            )}
            {serverError && (
              <div className="text-sm text-red-800 bg-red-50 border border-red-100 p-3 rounded">
                {serverError}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></span>
                <input
                  {...register("name", { required: "Name is required" })}
                  className={`mt-2 p-3 rounded-lg border ${errors.name ? "border-red-400" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                  placeholder="Your name"
                />
                {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
              </label>

              {/* Subject */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Subject <span className="text-red-500">*</span></span>
                <input
                  {...register("subject", { required: "Subject is required" })}
                  className={`mt-2 p-3 rounded-lg border ${errors.subject ? "border-red-400" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                  placeholder="Subject"
                />
                {errors.subject && <span className="text-xs text-red-500 mt-1">{errors.subject.message}</span>}
              </label>
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              {/* Phone */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Phone No. <span className="text-red-500">*</span></span>
                <div ref={myDivRef} className="relative mt-2">
                  <div className="flex ">
                    {/* Country Code Selector */}
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center w-28 justify-around px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-xl">{selectedCountry?.flag}</span>
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
                        required: "Phone number is required",
                        validate: validatePhoneNumber
                      })}
                      onBlur={handlePhoneBlur}
                      className={`flex-1 px-4 py-3 w-1/2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                        errors.phone ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder={watchCountryCode === '92' ? '301 2345678' : 'Enter phone number'}
                      maxLength={16}
                    />
                  </div>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div  className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountryCode(country.dialCode, country.name, country.code)}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                              watchCountryCode === country.dialCode ? 'bg-indigo-50 text-indigo-700' : ''
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
                {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>}
                
                {/* Hidden fields for country data */}
                <input type="hidden" {...register("countryCode")} />
                <input type="hidden" {...register("CountryName")} />
                <input type="hidden" {...register("country")} />
              </div>

              {/* Email */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></span>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                    onInput={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                  className={`mt-2 p-3 rounded-lg border ${errors.email ? "border-red-400" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
              </label>
            </div>

            {/* Message */}
            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Message <span className="text-red-500">*</span></span>
              <textarea
                {...register("message", { required: "Message is required" })}
                rows={5}
                className={`mt-2 p-3 rounded-lg border ${errors.message ? "border-red-400" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                placeholder="How can we help you?"
              />
              {errors.message && <span className="text-xs text-red-500 mt-1">{errors.message.message}</span>}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-[#e7001e] text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            <input style={{border:' solid 1px red'}} value={val} onChange={(e)=>{setval(e.target.value)}} type="hidden" />
          </form>
        </div>
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
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your contact information has been submitted successfully. We appreciate your support.
              </p>
              
              <button
                onClick={()=>{setshowSuccessModal(false)}}
                className="w-full bg-[#1c5e20] text-white py-3 text-lg px-6 rounded-2xl font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    

    </section>
  );
}