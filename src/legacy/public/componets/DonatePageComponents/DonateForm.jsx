import React, { useState,useRef,useEffect } from 'react';
import countryCodes from './countries_full.json'
import phonePatterns from './countryPatternsByName.json'
import countries from './countries_list.json'
import axios from 'axios'
import { showError } from '../../SwalPopUp/swal';
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const DonationForm = () => {
  const [loader,setloader]=useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '92',
    donationAmount: '',
    donationType: '',
    address1: '',
    city: '',
    state: '',
    country: 'PK',
    message: '',
    CountryName:'Pakistan'
  });
const [val,setval]=useState('')
  const [copied, setCopied] = useState({
    iban: false,
    account: false
  });
const [data,setdata]=useState({})
useEffect(()=>{
const call=async()=>{
  setloader(true)
try {
  const res=await axios.get(`${API_URL}/api/bank`)
  if(res.status===200){
    setdata(res.data.data)
  }
} catch (error) {
  console.log(error)
}
setloader(false)
}
call()
},[])

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

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



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        donationType: checked ? value : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // const phonePatterns = {
  //   "92": /^[3][0-9]{9}$/, // Pakistan: starts with 3, 10 digits
  //   "1": /^[2-9][0-9]{9}$/, // US/Canada: 10 digits, cannot start with 0/1
  //   "44": /^[1-9][0-9]{8,10}$/, // UK: 9–11 digits
  //   "971": /^[2-9][0-9]{7,9}$/, // UAE
  //   "966": /^5[0-9]{8}$/, // Saudi Arabia
  //   // Add more as needed
  // };

  const validatePhone = (phone, dialCode,CountryName) => {
    const pattern = phonePatterns.phonePatterns[CountryName].pattern;
    console.log(pattern)
    if (!pattern) return true; // fallback: accept anything if no rule
    const regex = new RegExp(pattern);
  return regex.test(phone.replace(/\s+/g, ""));
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone, formData.countryCode,formData.CountryName)) {
      const country = countryCodes.find(c => c.dialCode === formData.countryCode);
      newErrors.phone = `Please Enter a Valid Phone Number for ${country?.name || 'selected country'}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    } catch (err) {
      console.error('Failed to Copy Text: ', err);
    }
  };

  const handleSubmit = async(e) => {
     if(val){
    console.warn('Bot Detected')
    return
   }
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // console.log('Donation submitted:', formData);

   setloader(true)
    try {
      const res = await axios.post(`${API_URL}/api/donations`, formData, {
       withCredentials:true
      });

      if (res.status === 200) {
        setShowSuccessModal(true);
        
    // Reset form after submission
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '92',
      donationAmount: '',
      donationType: '',
      address1: '',
      city: '',
      state: '',
      country: 'PK',
      message: '',
      CountryName:'Pakistan'
    });
    
    // Clear errors
    setErrors({});
      } else {
        // setServerError("Unexpected response from server.");
        showError("Unexpected response from server.")
      }
    } catch (err) {
      console.error("Volunteer application submit error:", err);
      // setServerError(err?.response?.data?.error || "Failed to submit application. Please try again.");
       showError(err?.response?.data?.error || "Failed to submit application. Please try again.")
    }

   setloader(false)
  
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const selectCountryCode = (code, dialCode,name) => {
    setFormData(prev => ({
      ...prev,
      countryCode: dialCode,
      CountryName:name,
      country:code
    }));
    setShowCountryDropdown(false);
    
    // Clear phone error when country code changes
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone) {
      validateForm();
    }
  };

  // const bankDetails = {
  //   name: "Meezan Bank",
  //   accountTitle: "Khudii Welfare Organization",
  //   branch: "DHA Y Block, Lahore, Punjab, Pakistan",
  //   iban: "PK34 MEZN 0002 0501 1076 2400",
  //   accountNumber: "0205 0110 7624 00",
  //   logo: "/meezan1.png.webp"
  // };

  const donationTypes = [
    { value: 'General', label: 'General', icon: '💰' },
    { value: 'Sadqa', label: 'Sadqa', icon: '🔄' },
    { value: 'Zakat', label: 'Zakat', icon: '🤝' }
  ];

  // const countries = [
  //   { value: 'PK', label: 'Pakistan' },
  //   { value: 'US', label: 'United States' },
  //   { value: 'GB', label: 'United Kingdom' },
  //   { value: 'CA', label: 'Canada' },
  //   { value: 'AE', label: 'United Arab Emirates' },
  //   { value: 'SA', label: 'Saudi Arabia' }
  // ];

  const selectedCountry = countryCodes.find(country => country.dialCode === formData.countryCode);
// console.log(formData)
// console.log(phonePatterns.phonePatterns.Afghanistan)
  return (<>
    {loader?<div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>:
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#222222] mb-4">Support Our Cause</h1>
          <p className="text-xl text-[#222222]">Your donation makes a difference. Together we can create positive change.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Details Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <img 
                src={data.imagepath} 
                alt="Meezan Bank" 
                className="mx-auto mb-4 w-32 h-24 object-contain"
              />
              <h2 className="text-2xl font-bold text-[#222222] ">Bank Transfer Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-[#222222]">Bank Name:</span>
                  <span className="text-[#222222]">{data.name}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-[#222222]">Account Title:</span>
                  <span className="text-[#222222]">{data.account_title}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-[#222222]">Branch:</span>
                  <span className="text-[#222222] text-right">{data.branch}</span>
                </div>
              </div>

              {/* IBAN Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[#222222]">IBAN:</span>
                  <button
                    onClick={() => copyToClipboard(data.iban.replace(/\s/g, ''), 'iban')}
                    className="cursor-pointer flex items-center space-x-2 text-[#02236e] hover:text-blue-800 transition-colors"
                  >
                    {copied.iban ? (
                      <>
                        <svg className="w-4 h-4 text-[#009dc8]" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                        <span className="text-sm font-medium text-[#009dc8]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <span className="text-sm font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
                  <code className="text-[#02236e] font-mono text-lg">{data.iban}</code>
                </div>
              </div>

              {/* Account Number Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[#222222]">Account Number:</span>
                  <button
                    onClick={() => copyToClipboard(data.accountNumber.replace(/\s/g, ''), 'account')}
                    className="cursor-pointer flex items-center space-x-2 text-[#02236e] hover:text-blue-800 transition-colors"
                  >
                    {copied.account ? (
                      <>
                        <svg className="w-4 h-4 text-[#009dc8]" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                        <span className="text-sm font-medium text-[#009dc8]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <span className="text-sm font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
                  <code className="text-[#1c5e20] font-mono text-lg">{data.accountNumber}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#222222] mb-6">Donation Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Name <span className="text-[red-500]">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="First Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Last Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    Phone <span className="text-[#e7001e]">*</span>
                  </label>
                  <div ref={myDivRef} className="relative">
                    <div className="flex">
                      {/* Country Code Selector */}
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center w-30 justify-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-2xl hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-lg">{selectedCountry?.flag}</span>
                        <span className="text-[#222222]">+{formData.countryCode}</span>
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
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handlePhoneBlur}
                        required
                        placeholder={formData.countryCode === '92' ? '301 2345678' : 'Enter phone number'}
                        maxLength="15"
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-r-2xl w-20 focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all ${
                          errors.phone ? 'border-red-500' : ''
                        }`}
                      />
                    </div>

                    {/* Error Message */}
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}

                    {/* Country Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => selectCountryCode(country.code, country.dialCode,country.name)}
                              className={`flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-gray-100 transition-colors ${
                                formData.countryCode === country.dialCode ? 'bg-red-50 text-[#e7001e]' : ''
                              }`}
                            >
                              <span className="text-xl">{country.flag}</span>
                              <span className="flex-1 text-left font-medium">{country.name}</span>
                              <span className="text-[#222222]">+{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Donation Amount */}
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Donation Amount <span className="text-[#e7001e]">*</span>
                </label>
                <input
                  type="text"
                  name="donationAmount"
                  value={formData.donationAmount}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Amount in PKR"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                />
              </div>

              {/* Donation Type */}
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-3">
                  Donation Type <span className="text-[#e7001e]">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {donationTypes.map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        type="checkbox"
                        name="donationType"
                        value={type.value}
                        checked={formData.donationType === type.value}
                        onChange={handleInputChange}
                        className="absolute opacity-0"
                      />
                      <div className={`p-4 border-2 rounded-2xl text-center cursor-pointer transition-all ${
                        formData.donationType === type.value 
                          ? 'border-blue-800 bg-blue-200 text-[#02236e]' 
                          : 'border-[#cedcff] hover:border-[#247b2a]'
                      }`}>
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Address <span className="text-[#e7001e]">*</span>
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                    placeholder="Address Line 1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                    />
                    
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State / Province"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all"
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Your Message (Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#02236e] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="cursor-pointer w-full bg-[#e7001e] text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-[#e7001e] focus:ring-4 focus:ring-red-300 transition-all duration-200"
               disabled={loader}
              >
                {loader ? "Donating..." : "Donate Now"}
              </button>
              <input style={{border:' solid 1px red'}} value={val} onChange={(e)=>{setval(e.target.value)}} type="hidden" />
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center font-medium mt-8 text-[#222222]">
          <p>Your Donation Helps Us Continue Our Mission. Thank You For Your Support!</p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-[#1c5e20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-[#222222] mb-2">Thank You!</h3>
              <p className="text-[#222222] mb-6">
                Your Donation Information Has Been Submitted Successfully. We Appreciate Your Generosity And Support.
              </p>
              
              <button
                onClick={closeModal}
                className="w-full bg-[#1c5e20] cursor-pointer text-lg text-white py-3 px-6 rounded-2xl font-semibold  transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    }
    </>
  );
};

export default DonationForm;