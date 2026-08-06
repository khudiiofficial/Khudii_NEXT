import React, { useState, useRef, useEffect } from "react";
import styles from "./Modale.module.css";
import axios from 'axios';
import countryCodes from './countries_full.json';
import phonePatterns from './countryPatternsByName.json';
import { showError } from "../../SwalPopUp/swal";
import { showSuccessAlert } from "../../SwalPopUp/swal";
const ContactModal = ({ OrgId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    OrgId,
    countryCode: "92",
    CountryName: "Pakistan",
    country: "PK"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
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

  // Phone validation functions
  const validatePhone = (phone, dialCode, CountryName) => {
    const pattern = phonePatterns.phonePatterns[CountryName]?.pattern;
    if (!pattern) return true;
    const regex = new RegExp(pattern);
    return regex.test(phone.replace(/\s+/g, ""));
  };

  const validatePhoneNumber = (phone) => {
    const countryCode = formData.countryCode;
    const countryName = formData.CountryName;
    
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
    setFormData(prev => ({
      ...prev,
      countryCode: dialCode,
      CountryName: name,
      country: code
    }));
    setShowCountryDropdown(false);
    setPhoneError("");
  };

  const handlePhoneBlur = () => {
    if (formData.phone) {
      const validationResult = validatePhoneNumber(formData.phone);
      if (validationResult !== true) {
        setPhoneError(validationResult);
      } else {
        setPhoneError("");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear phone error when user starts typing
    if (name === 'phone') {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone before submission
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (phoneValidation !== true) {
      setPhoneError(phoneValidation);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${(process.env.NEXT_PUBLIC_BACKEND_PATH || '')}/contact-inquiry`, formData, { withCredentials: true });
console.log("hey",response)
      if (response.status === 201) {
        // alert("Thank you for your inquiry! We'll get back to you soon.");
        showSuccessAlert("Thank you for your inquiry! We'll get back to you soon.")
        setFormData({ 
          name: "", 
          phone: "", 
          email: "", 
          message: "", 
          OrgId,
          countryCode: "92",
          CountryName: "Pakistan",
          country: "PK"
        });
        setPhoneError("");
        onClose();
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
       onClose();
      console.error("Error submitting form:", error);
      // alert();
      showError("There was an error submitting your form. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCountry = countryCodes.find(country => country.dialCode === formData.countryCode);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className={styles.modalHeader}>
          <h3 style={{ color: "#e7001e", textAlign: "center", margin: 0 }}>
            <strong>Know More About Org.?</strong>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.contactForm}>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.formInput}
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.phoneLabel}>Phone <span className={styles.required}>*</span></label>
            <div ref={phoneInputRef} className={styles.phoneContainer}>
              <div className={styles.phoneInputWrapper}>
                {/* Country Code Selector */}
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={styles.countryCodeButton}
                >
                  <div className={styles.countryCodeContent}>
                    <span className={styles.countryFlag}>{selectedCountry?.flag}</span>
                    <span className={styles.countryCodeText}>+{formData.countryCode}</span>
                  </div>
                  <svg 
                    className={`${styles.dropdownArrow} ${showCountryDropdown ? styles.rotated : ''}`}
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
                  id="phone"
                  name="phone"
                  className={`${styles.formInput} ${styles.phoneInput} ${phoneError ? styles.inputError : ''}`}
                  placeholder={formData.countryCode === '92' ? '0301 2345678' : 'Enter phone number'}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  maxLength={16}
                  required
                />
              </div>

              {/* Country Dropdown */}
              {showCountryDropdown && (
                <div className={styles.countryDropdown}>
                  <div className={styles.countryList}>
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => selectCountryCode(country.dialCode, country.name, country.code)}
                        className={`${styles.countryOption} ${
                          formData.countryCode === country.dialCode ? styles.selectedCountry : ''
                        }`}
                      >
                        <span className={styles.countryFlag}>{country.flag}</span>
                        <span className={styles.countryName}>{country.name}</span>
                        <span className={styles.countryDialCode}>+{country.dialCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {phoneError && (
              <span className={styles.errorText}>{phoneError}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.formInput}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <textarea
              id="message"
              name="message"
              className={`${styles.formInput} ${styles.textarea}`}
              placeholder="Write what exactly you want to know about?"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{marginRight: '0.5rem'}}></i>
                Sending...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;