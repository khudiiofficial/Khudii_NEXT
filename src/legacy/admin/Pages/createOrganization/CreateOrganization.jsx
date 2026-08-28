
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// import RichTextEditor from "../../components/editor/TextEditor";
// export default function CreateOrganizationPage() {
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     category: [], // Changed to array
//     search_tags: "", // ADDED: New search_tags field
//     youtube_video_url: '',
//     introductory_image_base64: "",
//     slug: "",
//     meta_title: "",
//     meta_description: "",
//     meta_keywords: "",
//     images_base64: [],
//     urls: [""],
//     socials: {
//       phone: "",
//       facebook: "",
//       twitter: "",
//       instagram: "",
//       location: "",
//       googlemap: "",
//       mobile: "",
//       website:"",
//       youtubechannel:"",
//       email:"",
//       linkedin:""
//     },
//     icons: [{ name: "", svg: "", qty: "" }],
//   });

//   const [captcha, setcaptch] = useState('')
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [availableCategories, setcat] = useState([])

//   useEffect(() => {
//     const func = async () => {
//       try {
//         const res = await axios.get(`${APIPath}/sectors/admin`, { withCredentials: true })
//         if (res.status === 200) {
//           setcat(res.data.data)
//         }
//       } catch (error) {
//         console.log(error)
//       }
//     }
//     func()
//   }, [])

//   // Validation rules - ADDED search_tags validation
//   const validationRules = {
//     name: {
//       required: true,
//       minLength: 2,
//       maxLength: 100,
//       pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
//     },
//     description: {
//       required: true,
//       minLength: 10,
//       maxLength: 2000
//     },
//     youtube_video_url: {
//       required: true
//     },
//     category: {
//       required: true,
//       minLength: 1 // At least one category selected
//     },
//     search_tags: { // ADDED: Validation for search_tags
//       maxLength: 500
//     },
//     introductory_image_base64: {
//       required: true
//     },
//     slug: {
//       required: true,
//       pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
//     },
//     meta_title: {
//       maxLength: 60
//     },
//     meta_description: {
//       maxLength: 160
//     },
//     meta_keywords: {
//       maxLength: 255
//     },
//     urls: {
//       pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
//     },
//     socials: {
//       phone: {
//         pattern: /^[+]?[\d\s\-()]{10,}$/
//       },
//       mobile: {
//         pattern: /^[+]?[\d\s\-()]{10,}$/
//       },
//       facebook: {
//         pattern: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/
//       },
//       twitter: {
//         pattern: /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/
//       },
//       instagram: {
//         pattern: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+$/
//       },
//       googlemap: {
//         pattern: /^(https?:\/\/)?(www\.)?google\.[a-z]+\/maps\/.*$/
//       }
//     },
//     icons: {
//       name: {
//         required: true,
//         minLength: 2,
//         maxLength: 50
//       },
//       svg: {
//         required: true,
//         pattern: /^<svg[\s\S]*<\/svg>$/
//       },
//       qty: {
//         pattern: /^\d*$/
//       }
//     }
//   };

//   // Validate individual field
//   const validateField = (name, value, rules) => {
//     const fieldErrors = [];

//     if (rules.required) {
//       if (Array.isArray(value)) {
//         if (value.length === 0) {
//           fieldErrors.push("This field is required");
//         }
//       } else if (!value.trim()) {
//         fieldErrors.push("This field is required");
//       }
//     }

//     if (rules.minLength && value.length < rules.minLength) {
//       fieldErrors.push(`Must be at least ${rules.minLength} characters`);
//     }

//     if (rules.maxLength && value.length > rules.maxLength) {
//       fieldErrors.push(`Must be less than ${rules.maxLength} characters`);
//     }

//     // if (rules.pattern && value && !rules.pattern.test(value)) {
//     //   fieldErrors.push("Invalid format");
//     // }

//     return fieldErrors;
//   };

//   // Validate entire form - ADDED search_tags validation
//   const validateForm = () => {
//     const newErrors = {};

//     // Basic fields validation
//     newErrors.name = validateField("name", form.name, validationRules.name);
//     // newErrors.description = validateField("description", form.description, validationRules.description);
//     newErrors.category = validateField("category", form.category, validationRules.category);
//     newErrors.search_tags = validateField("search_tags", form.search_tags, validationRules.search_tags); // ADDED
//     newErrors.introductory_image_base64 = validateField(
//       "introductory_image_base64", 
//       form.introductory_image_base64, 
//       validationRules.introductory_image_base64
//     );
//     newErrors.youtube_video_url = validateField('youtube_video_url', form.youtube_video_url, validationRules.youtube_video_url);
    
  
//     // URLs validation
//     newErrors.urls = [];
//     form.urls.forEach((url, index) => {
//       if (url.trim()) {
//         const urlErrors = validateField("url", url, validationRules.urls);
//         if (urlErrors.length > 0) {
//           newErrors.urls[index] = urlErrors;
//         }
//       }
//     });

//     // Socials validation
//     newErrors.socials = {};
//     Object.keys(form.socials).forEach(key => {
//       if (form.socials[key].trim() && validationRules.socials[key]) {
//         const socialErrors = validateField(key, form.socials[key], validationRules.socials[key]);
//         if (socialErrors.length > 0) {
//           newErrors.socials[key] = socialErrors;
//         }
//       }
//     });

//     // Icons validation
//     newErrors.icons = [];
//     form.icons.forEach((icon, index) => {
//       const iconErrors = {};
//       if (icon.name.trim() || icon.svg.trim() || icon.qty.trim()) {
//         iconErrors.name = validateField("name", icon.name, validationRules.icons.name);
//         iconErrors.svg = validateField("svg", icon.svg, validationRules.icons.svg);
//         iconErrors.qty = validateField("qty", icon.qty, validationRules.icons.qty);
        
//         if (iconErrors.name.length > 0 || iconErrors.svg.length > 0 || iconErrors.qty.length > 0) {
//           newErrors.icons[index] = iconErrors;
//         }
//       }
//     });

//     setErrors(newErrors);
//     return !Object.values(newErrors).some(error => 
//       Array.isArray(error) ? error.length > 0 : Object.keys(error).length > 0
//     );
//   };

//   // Handle category selection
//   const handleCategoryChange = (category) => {
//     setForm(prev => {
//       const currentCategories = [...prev.category];
//       if (currentCategories.includes(category)) {
//         // Remove category if already selected
//         return {
//           ...prev,
//           category: currentCategories.filter(cat => cat !== category)
//         };
//       } else {
//         // Add category if not selected
//         return {
//           ...prev,
//           category: [...currentCategories, category]
//         };
//       }
//     });

//     // Clear error when user selects a category
//     if (errors.category?.length) {
//       setErrors(prev => ({
//         ...prev,
//         category: []
//       }));
//     }
//   };

//   // Convert file to Base64
//   const handleFileToBase64 = (file, callback) => {
//     const reader = new FileReader();
//     reader.onloadend = () => callback(reader.result);
//     reader.readAsDataURL(file);
//   };

//   // Handle slug generation from name
//   const generateSlug = (name) => {
//     return name
//       .toLowerCase()
//       .replace(/\s+/g, '-')
//       .replace(/[^a-z0-9-]/g, '')
//       .replace(/-+/g, '-')
//       .replace(/^-|-$/g, '');
//   };

//   // Introductory image upload
//   const handleIntroImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type
//       if (!file.type.startsWith('image/')) {
//         setErrors(prev => ({
//           ...prev,
//           introductory_image_base64: ["Please select a valid image file"]
//         }));
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors(prev => ({
//           ...prev,
//           introductory_image_base64: ["Image size must be less than 5MB"]
//         }));
//         return;
//       }

//       handleFileToBase64(file, (base64) => {
//         setForm({ ...form, introductory_image_base64: base64 });
//         setErrors(prev => ({ ...prev, introductory_image_base64: [] }));
//       });
//     }
//   };

//   // Multiple images upload
//   const handleImagesChange = (e) => {
//     const files = Array.from(e.target.files);
    
//     // Validate total files
//     if (form.images_base64.length + files.length > 10) {
//       alert("Maximum 10 images allowed");
//       return;
//     }

//     files.forEach((file) => {
//       if (!file.type.startsWith('image/')) {
//         alert("Please select valid image files only");
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         alert("Each image must be less than 5MB");
//         return;
//       }

//       handleFileToBase64(file, (base64) => {
//         setForm((prev) => ({
//           ...prev,
//           images_base64: [...prev.images_base64, base64],
//         }));
//       });
//     });
//   };

//   // Handle socials
//   const handleSocialChange = (e) => {
//     const { name, value } = e.target;
//     setForm({
//       ...form,
//       socials: { ...form.socials, [name]: value },
//     });

//     // Clear error when user starts typing
//     if (errors.socials?.[name]) {
//       setErrors(prev => ({
//         ...prev,
//         socials: { ...prev.socials, [name]: [] }
//       }));
//     }
//   };

//   // Handle URLs
//   const handleUrlChange = (index, value) => {
//     const updated = [...form.urls];
//     updated[index] = value;
//     setForm({ ...form, urls: updated });

//     // Clear error when user starts typing
//     if (errors.urls?.[index]) {
//       setErrors(prev => ({
//         ...prev,
//         urls: prev.urls.map((error, i) => i === index ? [] : error)
//       }));
//     }
//   };

//   const addUrlField = () => {
//     if (form.urls.length < 5) {
//       setForm({ ...form, urls: [...form.urls, ""] });
//     } else {
//       alert("Maximum 5 URLs allowed");
//     }
//   };

//   const removeUrlField = (index) => {
//     const updated = [...form.urls];
//     updated.splice(index, 1);
//     setForm({ ...form, urls: updated.length > 0 ? updated : [""] });
//   };

//   // Handle Icons
//   const handleIconChange = (index, field, value) => {
//     const updated = [...form.icons];
//     updated[index][field] = value;
//     setForm({ ...form, icons: updated });

//     // Clear error when user starts typing
//     if (errors.icons?.[index]?.[field]) {
//       setErrors(prev => ({
//         ...prev,
//         icons: prev.icons.map((iconError, i) => 
//           i === index ? { ...iconError, [field]: [] } : iconError
//         )
//       }));
//     }
//   };

//   const addIconField = () => {
//     if (form.icons.length < 10) {
//       setForm({ ...form, icons: [...form.icons, { name: "", svg: "", qty: "" }] });
//     } else {
//       alert("Maximum 10 icons allowed");
//     }
//   };

//   const removeIconField = (index) => {
//     const updated = [...form.icons];
//     updated.splice(index, 1);
//     setForm({ ...form, icons: updated.length > 0 ? updated : [{ name: "", svg: "", qty: "" }] });
//   };

//   // Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if(captcha){
//       console.log('bot detected')
//       setcaptch('')
//       return
//     }
//     if (!validateForm()) {
//       alert("Please fix the validation errors before submitting.");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await axios.post(`${APIPath}/api/organizations`, form, {
//         withCredentials: true,
//       });
//       alert("✅ Organization created successfully!");
//       // Reset form
//       setForm({
//         name: "",
//         description: "",
//         category: [], // Reset to empty array
//         search_tags: "", // ADDED: Reset search_tags
//         introductory_image_base64: "",
//         slug: "",
//         meta_title: "",
//         meta_description: "",
//         meta_keywords: "",
//         youtube_video_url: '',
//         images_base64: [],
//         urls: [""],
//         socials: {
//           phone: "",
//           facebook: "",
//           twitter: "",
//           instagram: "",
//           location: "",
//           googlemap: "",
//           mobile: "",
//         },
//         icons: [{ name: "", svg: "", qty: "" }],
//       });
//       setErrors({});
//     } catch (err) {
//       console.error(err);
//      if (err.response?.data?.message === "Slug already exists. Please choose a different one.") {
//         alert("❌ Slug already exists. Please choose a different one.");
//       } else {
//         alert("❌ Error creating  organization");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
// console.log(form)
//   // Helper function to render error messages
//   const renderErrors = (errorArray) => {
//     if (!errorArray || errorArray.length === 0) return null;
    
//     return (
//       <div className="mt-1 space-y-1">
//         {errorArray.map((error, index) => (
//           <p key={index} className="text-sm text-red-600 flex items-center">
//             <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
//             {error}
//           </p>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Organization</h1>
//           <p className="text-gray-600 mb-6">Fill in the details below to create a new organization</p>
          
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <input type="hidden" onChange={(e)=>{setcaptch(e.target.value)}} />
            
//             {/* Basic Fields */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Organization Name *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter Organization Name"
//                   value={form.name}
//                   onChange={(e) => setForm({ 
//                     ...form, 
//                     name: e.target.value,
//                     slug: generateSlug(e.target.value)
//                   })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.name?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   required
//                 />
//                 {renderErrors(errors.name)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Slug *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Organization Slug"
//                   value={form.slug}
//                   onChange={(e) => setForm({ ...form, slug: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.slug?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   URL-friendly version of the name. Use lowercase letters, numbers, and hyphens only.
//                 </p>
//                 {renderErrors(errors.slug)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description *
//                 </label>
//                 {/* <textarea
//                   placeholder="Provide a detailed description of the organization"
//                   value={form.description}
//                   onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   rows={4}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.description?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 /> */}
//                 <RichTextEditor form={form} setForm={setForm}/>
//                 {renderErrors(errors.description)}
//               </div>

//               {/* ADDED: Search Tags Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Search Tags
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter Search Tags Separated by Commas (e.g., Charity, Donation, Help)"
//                   value={form.search_tags}
//                   onChange={(e) => setForm({ ...form, search_tags: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.search_tags?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Add relevant keywords to help users find this organization. Separate with commas.
//                 </p>
//                 {renderErrors(errors.search_tags)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   YouTube Video URL *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter Organization Video (<iframe>...</iframe>)"
//                   value={form.youtube_video_url}
//                   onChange={(e) => setForm({ ...form, youtube_video_url: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.youtube_video_url?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   required
//                 />
//                 {renderErrors(errors.youtube_video_url)}
//               </div>

//               {/* Categories with checkboxes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Categories * (Select one or more)
//                 </label>
//                 <div className={`p-4 border rounded-lg ${
//                   errors.category?.length ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
//                 }`}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {availableCategories.map((cat) => (
//                       <label key={cat.name} className="flex items-center space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={form.category.includes(cat.name)}
//                           onChange={() => handleCategoryChange(cat.name)}
//                           className="h-4 w-4 text-[#02236e] focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                         <span className="text-sm text-gray-700">{cat.name}</span>
//                       </label>
//                     ))}
//                   </div>
                  
//                   {/* Selected categories display */}
//                   {form.category.length > 0 && (
//                     <div className="mt-4 pt-3 border-t border-gray-200">
//                       <p className="text-sm font-medium text-[#222222] mb-2">Selected Categories:</p>
//                       <div className="flex flex-wrap gap-2">
//                         {form.category.map((cat) => (
//                           <span 
//                             key={cat} 
//                             className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                           >
//                             {cat}
//                             <button
//                               type="button"
//                               onClick={() => handleCategoryChange(cat)}
//                               className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
//                             >
//                               ×
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 {renderErrors(errors.category)}
//                 <p className="text-xs text-gray-500 mt-1">
//                   You can Select Multiple Categories for this Organization
//                 </p>
//               </div>
//             </div>

//             {/* Rest of your existing code remains the same... */}
//             {/* SEO Fields */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">SEO Information</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Title
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter Meta Title for SEO"
//                   value={form.meta_title}
//                   onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.meta_title?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {renderErrors(errors.meta_title)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Description
//                 </label>
//                 <textarea
//                   placeholder="Enter Meta Description for SEO"
//                   value={form.meta_description}
//                   onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
//                   rows={3}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.meta_description?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {renderErrors(errors.meta_description)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Keywords
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="keyword1, keyword2, keyword3"
//                   value={form.meta_keywords}
//                   onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.meta_keywords?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {renderErrors(errors.meta_keywords)}
//               </div>
//             </div>

//             {/* Intro Image */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Images</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Introductory Image *
//                 </label>
//                 <input 
//                   type="file" 
//                   onChange={handleIntroImageChange}
//                   accept="image/*"
//                   className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#02236e] hover:file:bg-blue-100"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, WebP. Max size: 5MB</p>
//                 {renderErrors(errors.introductory_image_base64)}
//                 {form.introductory_image_base64 && (
//                   <div className="mt-3">
//                     <p className="text-sm text-green-600 mb-1">✓ Image uploaded successfully</p>
//                     <img
//                       src={form.introductory_image_base64}
//                       alt="Intro Preview"
//                       className="h-32 rounded-lg shadow-md border"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Extra Images */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Additional Images ({form.images_base64.length}/10)
//                 </label>
//                 <input 
//                   type="file" 
//                   multiple 
//                   onChange={handleImagesChange}
//                   accept="image/*"
//                   className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#02236e] hover:file:bg-blue-100"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">You can upload up to 10 additional images</p>
//                 {form.images_base64.length > 0 && (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
//                     {form.images_base64.map((img, i) => (
//                       <div key={i} className="relative">
//                         <img
//                           src={img}
//                           alt="preview"
//                           className="h-24 w-full object-cover rounded-lg shadow border"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Socials */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Social Media & Contact</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.keys(form.socials).map((key) => (
//                   <div key={key}>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
//                       {key}
//                     </label>
//                     <input
//                       type="text"
//                       name={key}
//                       value={form.socials[key]}
//                       onChange={handleSocialChange}
//                       placeholder={`Enter ${key} ${key==='Googlemap'? "(<iframe>...</iframe>)":''}`}
//                       className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
//                         errors.socials?.[key]?.length ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {renderErrors(errors.socials?.[key])}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Icons */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
//                 Icons ({form.icons.length}/10)
//               </h2>
//               {form.icons.map((icon, i) => (
//                 <div key={i} className="bg-gray-50 rounded-lg space-y-3">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
//                       <input
//                         type="text"
//                         value={icon.name}
//                         onChange={(e) => handleIconChange(i, "name", e.target.value)}
//                         placeholder="Icon name"
//                         className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                           errors.icons?.[i]?.name?.length ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {renderErrors(errors.icons?.[i]?.name)}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">ICON Code*</label>
//                       <input
//                         type="text"
//                         value={icon.svg}
//                         onChange={(e) => handleIconChange(i, "svg", e.target.value)}
//                         placeholder="&lt;i&gt;...&lt;/i&gt;"
//                         className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                           errors.icons?.[i]?.svg?.length ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {renderErrors(errors.icons?.[i]?.svg)}
//                     </div>
//                     <div className="flex gap-2">
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                         <input
//                           type="text"
//                           value={icon.qty}
//                           onChange={(e) => handleIconChange(i, "qty", e.target.value)}
//                           placeholder="Number"
//                           className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                             errors.icons?.[i]?.qty?.length ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                         />
//                         {renderErrors(errors.icons?.[i]?.qty)}
//                       </div>
//                       {form.icons.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeIconField(i)}
//                           className="text-red-600 hover:text-red-800 font-bold p-2 rounded hover:bg-red-50 transition-colors self-end mb-1"
//                         >
//                           ✖
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               {form.icons.length < 10 && (
//                 <button
//                   type="button"
//                   onClick={addIconField}
//                   className="cursor-pointer flex items-center gap-2 text-[#e7001e] hover:text-[#e7001e] font-medium text-sm"
//                 >
//                   <span className="text-lg">+</span> Add Icon
//                 </button>
//               )}
//             </div>

//             <div className="pt-6 border-t">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
//                   isSubmitting 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Creating...
//                   </span>
//                 ) : (
//                   'Create Organization'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import RichTextEditor from "../../components/editor/TextEditor";
import { showSuccessAlert, showError, showWarning, confirmAction } from "../../SwalPopupAlert/SwalPopupAlert";

export default function CreateOrganizationPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: [],
    search_tags: "",
    youtube_video_url: '',
    introductory_image_base64: "",
    partner_image: "", // ADDED: partner_image field
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    images_base64: [],
    urls: [""],
    socials: {
      phone: "",
      facebook: "",
      twitter: "",
      instagram: "",
      location: "",
      googlemap: "",
      mobile: "",
      website:"",
      youtubechannel:"",
      email:"",
      linkedin:""
    },
    icons: [{ name: "", svg: "", qty: "" }],
  });

  const [captcha, setcaptch] = useState('')
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setcat] = useState([])

  useEffect(() => {
    const func = async () => {
      try {
        const res = await axios.get(`${APIPath}/sectors/admin`, { withCredentials: true })
        if (res.status === 200) {
          setcat(res.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    func()
  }, [])

  // Validation rules - ADDED partner_image validation
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000
    },
    youtube_video_url: {
      required: true
    },
    category: {
      required: true,
      minLength: 1
    },
    search_tags: {
      maxLength: 500
    },
    introductory_image_base64: {
      required: true
    },
    partner_image: { // ADDED: partner_image validation
      dimensions: { width: 300, height: 300 } // Only dimension validation
    },
    slug: {
      required: true,
      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    meta_title: {
      maxLength: 60
    },
    meta_description: {
      maxLength: 160
    },
    meta_keywords: {
      maxLength: 255
    },
    urls: {
      pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    },
    socials: {
      phone: {
        pattern: /^[+]?[\d\s\-()]{10,}$/
      },
      mobile: {
        pattern: /^[+]?[\d\s\-()]{10,}$/
      },
      facebook: {
        pattern: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/
      },
      twitter: {
        pattern: /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/
      },
      instagram: {
        pattern: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+$/
      },
      googlemap: {
        pattern: /^(https?:\/\/)?(www\.)?google\.[a-z]+\/maps\/.*$/
      }
    },
    icons: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      svg: {
        required: true,
        pattern: /^<svg[\s\S]*<\/svg>$/
      },
      qty: {
        pattern: /^\d*$/
      }
    }
  };

  // Validate individual field
  const validateField = (name, value, rules) => {
    const fieldErrors = [];

    if (rules.required) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          fieldErrors.push("This field is required");
        }
      } else if (!value.trim()) {
        fieldErrors.push("This field is required");
      }
    }

    if (rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`Must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      fieldErrors.push(`Must be less than ${rules.maxLength} characters`);
    }

    return fieldErrors;
  };

  // Validate entire form - ADDED partner_image validation
  const validateForm = () => {
    const newErrors = {};

    // Basic fields validation
    newErrors.name = validateField("name", form.name, validationRules.name);
    newErrors.category = validateField("category", form.category, validationRules.category);
    newErrors.search_tags = validateField("search_tags", form.search_tags, validationRules.search_tags);
    newErrors.introductory_image_base64 = validateField(
      "introductory_image_base64", 
      form.introductory_image_base64, 
      validationRules.introductory_image_base64
    );
    newErrors.youtube_video_url = validateField('youtube_video_url', form.youtube_video_url, validationRules.youtube_video_url);
    
    // Partner image validation (only dimension check, not required)
    if (form.partner_image) {
      // Dimension validation will be handled separately
    }
    
    // URLs validation
    newErrors.urls = [];
    form.urls.forEach((url, index) => {
      if (url.trim()) {
        const urlErrors = validateField("url", url, validationRules.urls);
        if (urlErrors.length > 0) {
          newErrors.urls[index] = urlErrors;
        }
      }
    });

    // Socials validation
    newErrors.socials = {};
    Object.keys(form.socials).forEach(key => {
      if (form.socials[key].trim() && validationRules.socials[key]) {
        const socialErrors = validateField(key, form.socials[key], validationRules.socials[key]);
        if (socialErrors.length > 0) {
          newErrors.socials[key] = socialErrors;
        }
      }
    });

    // Icons validation
    newErrors.icons = [];
    form.icons.forEach((icon, index) => {
      const iconErrors = {};
      if (icon.name.trim() || icon.svg.trim() || icon.qty.trim()) {
        iconErrors.name = validateField("name", icon.name, validationRules.icons.name);
        iconErrors.svg = validateField("svg", icon.svg, validationRules.icons.svg);
        iconErrors.qty = validateField("qty", icon.qty, validationRules.icons.qty);
        
        if (iconErrors.name.length > 0 || iconErrors.svg.length > 0 || iconErrors.qty.length > 0) {
          newErrors.icons[index] = iconErrors;
        }
      }
    });

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => 
      Array.isArray(error) ? error.length > 0 : Object.keys(error).length > 0
    );
  };

  // Function to check image dimensions (only for partner_image)
  const checkImageDimensions = (base64Image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        resolve({
          width: this.width,
          height: this.height
        });
      };
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      img.src = base64Image;
    });
  };

  // Convert file to Base64 (regular function without dimension check)
  const handleFileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  // Convert file to Base64 with dimension validation (only for partner_image)
  const handleFileToBase64WithDimensions = (file, callback, fieldName) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Result = reader.result;
      
      // Only check dimensions for partner_image
      if (fieldName === 'partner_image') {
        try {
          // Check image dimensions
          const dimensions = await checkImageDimensions(base64Result);
          
          if (dimensions.width !== 300 || dimensions.height !== 300) {
            throw new Error(`Partner image must be exactly 300x300 pixels. Current dimensions: ${dimensions.width}x${dimensions.height}px`);
          }
          
          // If dimensions are correct, call the callback
          callback(base64Result);
        } catch (error) {
          // Set error state
          setErrors(prev => ({
            ...prev,
            [fieldName]: [error.message]
          }));
          // Clear the image from form
          setForm(prev => ({ ...prev, [fieldName]: "" }));
          return;
        }
      } else {
        // For other images, just call the callback
        callback(base64Result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setForm(prev => {
      const currentCategories = [...prev.category];
      if (currentCategories.includes(category)) {
        return {
          ...prev,
          category: currentCategories.filter(cat => cat !== category)
        };
      } else {
        return {
          ...prev,
          category: [...currentCategories, category]
        };
      }
    });

    if (errors.category?.length) {
      setErrors(prev => ({
        ...prev,
        category: []
      }));
    }
  };

  // Generate slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Introductory image upload
  const handleIntroImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          introductory_image_base64: ["Please select a valid image file"]
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          introductory_image_base64: ["Image size must be less than 5MB"]
        }));
        return;
      }

      handleFileToBase64(file, (base64) => {
        setForm({ ...form, introductory_image_base64: base64 });
        setErrors(prev => ({ ...prev, introductory_image_base64: [] }));
      });
    }
  };

  // Partner image upload with dimension validation
  const handlePartnerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          partner_image: ["Please select a valid image file"]
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          partner_image: ["Image size must be less than 5MB"]
        }));
        return;
      }

      // Use the dimension-checking function for partner_image
      handleFileToBase64WithDimensions(file, (base64) => {
        setForm({ ...form, partner_image: base64 });
        setErrors(prev => ({ ...prev, partner_image: [] }));
      }, 'partner_image');
    }
  };

  // Multiple images upload
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (form.images_base64.length + files.length > 10) {
      showWarning("Maximum 10 images allowed");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showError("Please select valid image files only");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("Each image must be less than 5MB");
        return;
      }

      handleFileToBase64(file, (base64) => {
        setForm((prev) => ({
          ...prev,
          images_base64: [...prev.images_base64, base64],
        }));
      });
    });
  };

  // Handle socials
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      socials: { ...form.socials, [name]: value },
    });

    if (errors.socials?.[name]) {
      setErrors(prev => ({
        ...prev,
        socials: { ...prev.socials, [name]: [] }
      }));
    }
  };

  // Handle URLs
  const handleUrlChange = (index, value) => {
    const updated = [...form.urls];
    updated[index] = value;
    setForm({ ...form, urls: updated });

    if (errors.urls?.[index]) {
      setErrors(prev => ({
        ...prev,
        urls: prev.urls.map((error, i) => i === index ? [] : error)
      }));
    }
  };

  const addUrlField = () => {
    if (form.urls.length < 5) {
      setForm({ ...form, urls: [...form.urls, ""] });
    } else {
      showWarning("Maximum 5 URLs allowed");
    }
  };

  const removeUrlField = (index) => {
    const updated = [...form.urls];
    updated.splice(index, 1);
    setForm({ ...form, urls: updated.length > 0 ? updated : [""] });
  };

  // Handle Icons
  const handleIconChange = (index, field, value) => {
    const updated = [...form.icons];
    updated[index][field] = value;
    setForm({ ...form, icons: updated });

    if (errors.icons?.[index]?.[field]) {
      setErrors(prev => ({
        ...prev,
        icons: prev.icons.map((iconError, i) => 
          i === index ? { ...iconError, [field]: [] } : iconError
        )
      }));
    }
  };

  const addIconField = () => {
    if (form.icons.length < 10) {
      setForm({ ...form, icons: [...form.icons, { name: "", svg: "", qty: "" }] });
    } else {
      showWarning("Maximum 10 icons allowed");
    }
  };

  const removeIconField = (index) => {
    const updated = [...form.icons];
    updated.splice(index, 1);
    setForm({ ...form, icons: updated.length > 0 ? updated : [{ name: "", svg: "", qty: "" }] });
  };

  // Submit
  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (captcha) {
      console.log("bot detected");
      setcaptch("");
      return;
    }

    if (!validateForm()) {
      showWarning("Please fix the validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${APIPath}/api/organizations`,
        form,
        {
          withCredentials: true,
        }
      );

      console.log("Organization response:", response.data);

      showSuccessAlert("Organization created successfully!");

      setForm({
        name: "",
        description: "",
        category: [],
        search_tags: "",
        introductory_image_base64: "",
        partner_image: "",
        slug: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        youtube_video_url: "",
        images_base64: [],
        urls: [""],

        socials: {
          phone: "",
          facebook: "",
          twitter: "",
          instagram: "",
          location: "",
          googlemap: "",
          mobile: "",
        },

        icons: [
          {
            name: "",
            svg: "",
            qty: "",
          },
        ],
      });

      setErrors({});
    } catch (err) {
      console.error("Create organization error:", err);
      console.error("Status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Request payload:", form);

      const responseData = err.response?.data;

      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.errors?.[0]?.message ||
        err.message ||
        "Unknown error while creating organization";

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render error messages
  const renderErrors = (errorArray) => {
    if (!errorArray || errorArray.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {errorArray.map((error, index) => (
          <p key={index} className="text-sm text-red-600 flex items-center">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
            {error}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Organization</h1>
          <p className="text-gray-600 mb-6">Fill In The Details Below To Create A New Organization</p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <input type="hidden" onChange={(e)=>{setcaptch(e.target.value)}} />
            
            {/* Basic Fields */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter Organization Name"
                  value={(form.name) ?? ''}
                  onChange={(e) => setForm({ 
                    ...form, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {renderErrors(errors.name)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  placeholder="Organization Slug"
                  value={(form.slug) ?? ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <p className="text-xs text-[#009dc8] mt-1">
                  Url-friendly Version Of The Name. Use Lowercase Letters, Numbers, And Hyphens Only. <b>(Auto-Generated from Organization Name)</b>
                </p>
                {renderErrors(errors.slug)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <RichTextEditor form={form} setForm={setForm}/>
                {renderErrors(errors.description)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tags
                </label>
                <input
                  type="text"
                  placeholder="Enter Search Tags Separated by Commas (e.g., Charity, Donation, Help)"
                  value={(form.search_tags) ?? ''}
                  onChange={(e) => setForm({ ...form, search_tags: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.search_tags?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant keywords to help users find this organization. Separate with commas.
                </p>
                {renderErrors(errors.search_tags)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL *
                </label>
                <input
                  type="text"
                  placeholder="Enter Organization Video (<iframe>...</iframe>)"
                  value={(form.youtube_video_url) ?? ''}
                  onChange={(e) => setForm({ ...form, youtube_video_url: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.youtube_video_url?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {renderErrors(errors.youtube_video_url)}
              </div>

              {/* Categories with checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories * (Select one or more)
                </label>
                <div className={`p-4 border rounded-lg ${
                  errors.category?.length ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableCategories.map((cat) => (
                      <label key={cat.name} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.category.includes(cat.name)}
                          onChange={() => handleCategoryChange(cat.name)}
                          className="h-4 w-4 text-[#02236e] focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  
                  {form.category.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-[#222222] mb-2">Selected Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {form.category.map((cat) => (
                          <span 
                            key={cat} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {cat}
                            <button
                              type="button"
                              onClick={() => handleCategoryChange(cat)}
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {renderErrors(errors.category)}
                <p className="text-xs text-gray-500 mt-1">
                  You can Select Multiple Categories for this Organization
                </p>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">SEO Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Meta Title for SEO"
                  value={(form.meta_title) ?? ''}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.meta_title?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {renderErrors(errors.meta_title)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  placeholder="Enter Meta Description for SEO"
                  value={(form.meta_description) ?? ''}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.meta_description?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {renderErrors(errors.meta_description)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  placeholder="keyword1, keyword2, keyword3"
                  value={(form.meta_keywords) ?? ''}
                  onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.meta_keywords?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {renderErrors(errors.meta_keywords)}
              </div>
            </div>

            {/* Images Section - ADDED Partner Image */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#222222] border-b pb-2">Images</h2>
              
              <div>
                <label className="block text-md font-medium [#222222] mb-2">
                  Org. Grid Image *
                </label>
                <input 
                  type="file" 
                  onChange={handleIntroImageChange}
                  accept="image/*"
                  className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#02236e] hover:file:bg-blue-100"
                />
                <p className="text-xs text-[#009dc8] mt-1">Supported formats: <b>(WebP Only)</b> Max size: 5MB</p>
                {renderErrors(errors.introductory_image_base64)}
                {form.introductory_image_base64 && (
                  <div className="mt-3">
                    <p className="text-sm text-[#1c5e20] mb-1">✓ Image Uploaded Successfully</p>
                    <img
                      src={form.introductory_image_base64}
                      alt="Intro Preview"
                      className="h-32 rounded-lg shadow-md border"
                    />
                  </div>
                )}
              </div>

              {/* ADDED: Partner Image Field */}
              <div className="py-3">
                <label className="block text-md font-medium text-[#222222] mb-2">
                  Partner Image 
                </label>
                <input 
                  type="file" 
                  required
                  onChange={handlePartnerImageChange}
                  accept=".webp,image/webp"
                  className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#02236e] hover:file:bg-blue-100"
                />
                <p className="text-xs text-[#009dc8] mt-1">
                  Must Be Exactly 300x300px, Supported Formats: <b>(WebP Only)</b> 
                </p>
                {renderErrors(errors.partner_image)}
                {form.partner_image && (
                  <div className="mt-3">
                    <p className="text-sm text-[#1c5e20] mb-1">✓ Partner Image Uploaded Successfully</p>
                    <div className="relative inline-block group">
                      <img
                        src={form.partner_image}
                        alt="Partner Preview"
                        className="h-32 rounded-lg shadow-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, partner_image: "" }))}
                        title="Remove partner image"
                        className="cursor-pointer absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Images */}
              <div className="py-3">
                <label className="block text-md font-medium text-[#222222] mb-2">
                  Org. Detail Page Slider Images ({form.images_base64.length}/10)
                </label>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleImagesChange}
                  accept="image/*"
                  className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#02236e] hover:file:bg-blue-100"
                />
                <p className="text-xs text-[#009dc8] mt-1">You Can Upload Upto 10 Additional Images</p>
                {form.images_base64.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                    {form.images_base64.map((img, i) => (
                      <div key={i} className="relative group border rounded-lg p-1 bg-white shadow-sm hover:shadow-md transition-all">
                        <img
                          src={img}
                          alt="preview"
                          className="h-28 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...form.images_base64];
                            updated.splice(i, 1);
                            setForm(prev => ({ ...prev, images_base64: updated }));
                          }}
                          title="Remove image"
                          className="cursor-pointer absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rest of your code remains exactly the same... */}
            {/* Socials */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#222222] border-b pb-2">Social Media & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(form.socials).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[#222222] mb-1 capitalize">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={(form.socials[key]) ?? ''}
                      onChange={handleSocialChange}
                      placeholder={`Enter ${key} ${key==='Googlemap'? "(<iframe>...</iframe>)":''}`}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
                        errors.socials?.[key]?.length ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {renderErrors(errors.socials?.[key])}
                  </div>
                ))}
              </div>
            </div>

            {/* Icons */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Icons ({form.icons.length}/10)
              </h2>
              {form.icons.map((icon, i) => (
                <div key={i} className="bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                      <input
                        type="text"
                        value={(icon.name) ?? ''}
                        onChange={(e) => handleIconChange(i, "name", e.target.value)}
                        placeholder="Icon name"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.icons?.[i]?.name?.length ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {renderErrors(errors.icons?.[i]?.name)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICON Code*</label>
                      <input
                        type="text"
                        value={(icon.svg) ?? ''}
                        onChange={(e) => handleIconChange(i, "svg", e.target.value)}
                        placeholder="&lt;i&gt;...&lt;/i&gt;"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.icons?.[i]?.svg?.length ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {renderErrors(errors.icons?.[i]?.svg)}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="text"
                          value={(icon.qty) ?? ''}
                          onChange={(e) => handleIconChange(i, "qty", e.target.value)}
                          placeholder="Number"
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.icons?.[i]?.qty?.length ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {renderErrors(errors.icons?.[i]?.qty)}
                      </div>
                      {form.icons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIconField(i)}
                          className="text-red-600 hover:text-red-800 font-bold p-2 rounded hover:bg-red-50 transition-colors self-end mb-1"
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {form.icons.length < 10 && (
                <button
                  type="button"
                  onClick={addIconField}
                  className="cursor-pointer flex items-center gap-2 text-[#e7001e] hover:text-[#e7001e] font-medium text-sm"
                >
                  <span className="text-lg">+</span> Add Icon
                </button>
              )}
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#1c5e20] hover:bg-[#247b2a] focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Organization'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}