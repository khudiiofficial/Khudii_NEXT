
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from '@/lib/router-compat';
// import RichTextEditor from "../../components/editor/TextEditor";
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// export default function EditOrganizationPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     category: [], // Changed to array
//     search_tags: "", // ADDED: New search_tags field
//     youtube_video_url: "",
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
//   const [existingImages, setExistingImages] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [cap,setcap]=useState('');
//   const [availableCategories ,setcat]=useState([])

//   useEffect(()=>{
// const func=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/sectors/admin`,{withCredentials:true})
//     if(res.status===200){
//       setcat(res.data.data)
//     }
    
//   } catch (error) {
//     console.log(error)
//   }
// }
// func()
// },[])

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
//       required: false // Not required for edit
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

//   // Fetch organization data
//   useEffect(() => {
//     const fetchOrganization = async () => {
//       try {
//         setIsLoading(true);
//         const res = await axios.get(`${APIPath}/api/organizations/${id}`,{withCredentials:true});
//         const org = res.data;
        
//         // Parse category from JSON string to array
//         let categoryArray = [];
//         if (org.category) {
//           try {
//             // If category is stored as JSON array, parse it
//             if (typeof org.category === 'string' && org.category.startsWith('[')) {
//               categoryArray = JSON.parse(org.category);
//             } else {
//               // If it's a single string, convert to array
//               categoryArray = [org.category];
//             }
//           } catch (e) {
//             // If parsing fails, use as single item array
//             categoryArray = [org.category];
//           }
//         }

//         setForm({
//           name: org.name || "",
//           description: org.description || "",
//           category: categoryArray, // Set as array
//           search_tags: org.search_tags || "", // ADDED: Set search_tags from API
//           youtube_video_url: org.youtube_video_url || "",
//           introductory_image_base64: org.introductory_image_path,
//           slug: org.slug || "",
//           meta_title: org.meta_title || "",
//           meta_description: org.meta_description || "",
//           meta_keywords: org.meta_keywords || "",
//           images_base64: [],
//           urls: org.urls && org.urls.length > 0 ? org.urls : [""],
//           socials: {
//             phone: org.socials?.phone || "",
//             facebook: org.socials?.facebook || "",
//             twitter: org.socials?.twitter || "",
//             instagram: org.socials?.instagram || "",
//             location: org.socials?.location || "",
//             googlemap: org.socials?.googlemap || "",
//             mobile: org.socials?.mobile || "",
//             website:org.socials?.website || "",
//             youtubechannel:org.socials?.youtubechannel || "",
//             email:org.socials?.email || "",
//             linkedin:org.socials?.linkedin || ""
//           },
//           icons: org.icons && org.icons.length > 0 ? org.icons : [{ name: "", svg: "", qty: "" }],
//         });

//         setExistingImages(org.images || []);
        
//       } catch (err) {
//         console.error("Error fetching organization:", err);
//         alert("Failed to load organization data");
//         navigate("/dashboard/OrganizationPage");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (id) {
//       fetchOrganization();
//     }
//   }, [id, navigate]);

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

//     return fieldErrors;
//   };

//   // Validate entire form - ADDED search_tags validation
//   const validateForm = () => {
//     const newErrors = {};

//     // Basic fields validation
//     newErrors.name = validateField("name", form.name, validationRules.name);
//     newErrors.category = validateField("category", form.category, validationRules.category);
//     newErrors.search_tags = validateField("search_tags", form.search_tags, validationRules.search_tags); // ADDED
//     newErrors.youtube_video_url = validateField('youtube_video_url', form.youtube_video_url, validationRules.youtube_video_url);
    
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

//   // Remove existing image
//   const removeExistingImage = async (imagePath) => {
//     if (window.confirm("Are you sure you want to remove this image?")) {
//       try {
//         await axios.delete(`${APIPath}/api/organizations/${id}/images`, {
//           data: { imagePath },
//           withCredentials: true,
//         });
//         setExistingImages(prev => prev.filter(img => img !== imagePath));
//         alert("Image removed successfully");
//       } catch (err) {
//         console.error("Error removing image:", err);
//         alert("Failed to remove image");
//       }
//     }
//   };

//   // Remove new image
//   const removeNewImage = (index) => {
//     const updated = [...form.images_base64];
//     updated.splice(index, 1);
//     setForm({ ...form, images_base64: updated });
//   };

//   // Handle socials
//   const handleSocialChange = (e) => {
//     const { name, value } = e.target;
//     setForm({
//       ...form,
//       socials: { ...form.socials, [name]: value },
//     });

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
    
//     if (!validateForm()) {
//       alert("Please fix the validation errors before submitting.");
//       return;
//     }
//     if(cap){
//       console.log('bot detected')
//       setcap('')
//       return
//     }
//     setIsSubmitting(true);
//     try {
//       await axios.put(`${APIPath}/api/organizations/${id}`, form, {
//         withCredentials: true,
//       });
//       alert("✅ Organization updated successfully!");
//       navigate("/dashboard/OrganizationPage");
//     } catch (err) {
//       console.error(err);
//       if (err.response?.data?.error === "DUPLICATE_SLUG") {
//         alert("❌ Slug already exists. Please choose a different one.");
//       } else {
//         alert("❌ Error updating organization");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

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

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading organization data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Organization</h1>
//               <p className="text-gray-600">Update the details of your organization</p>
//             </div>
//             <button
//               onClick={() => navigate("/dashboard/OrganizationPage")}
//               className="cursor-pointer bg-[#fcdd2d] text-[#222222] px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover:text-white"
//             >
//               ← Back
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Basic Fields */}
//             <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Organization Name *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter organization name"
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
//                   placeholder="organization-slug"
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
//                   placeholder="Enter search tags separated by commas (e.g., charity, donation, help)"
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
//                   placeholder="Enter organization Video content (<iframe>...</iframe>)"
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
//                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                         <span className="text-sm text-gray-700">{cat.name}</span>
//                       </label>
//                     ))}
//                   </div>
                  
//                   {/* Selected categories display */}
//                   {form.category.length > 0 && (
//                     <div className="mt-4 pt-3 border-t border-gray-200">
//                       <p className="text-sm font-medium text-gray-700 mb-2">Selected categories:</p>
//                       <div className="flex flex-wrap gap-2">
//                         {form.category.map((cat) => (
//                           <span 
//                             key={cat} 
//                             className="cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                           >
//                             {cat}
//                             <button
//                               type="button"
//                               onClick={() => handleCategoryChange(cat)}
//                               className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
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
//                   You can select multiple categories for this organization
//                 </p>
//               </div>
//             </div>

//             {/* Rest of the form remains the same */}
//             {/* SEO Fields */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">SEO Information</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Title
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter meta title for SEO"
//                   value={form.meta_title}
//                   onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.meta_title?.length ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   {/* <span>{form.meta_title.length}/60 characters</span>
//                   <span>Recommended for search engines</span> */}
//                 </div>
//                 {renderErrors(errors.meta_title)}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Meta Description
//                 </label>
//                 <textarea
//                   placeholder="Enter meta description for SEO"
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
//                 {/* <p className="text-xs text-gray-500 mt-1">
//                   Separate keywords with commas. Maximum 255 characters.
//                 </p> */}
//                 {renderErrors(errors.meta_keywords)}
//               </div>
//             </div>

//             {/* Rest of your existing code remains exactly the same... */}
//             {/* Intro Image */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Images</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Introductory Image
//                 </label>
//                 <input 
//                   type="file" 
//                   onChange={handleIntroImageChange}
//                   accept="image/*"
//                   className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Supported formats: WebP Only Max size: 5MB</p>
//                 {renderErrors(errors.introductory_image_base64)}
//                 {form.introductory_image_base64 && (
//                   <div className="mt-3">
//                     <p className="text-sm text-[#1c5e20] mb-1">✓ New Image Selected</p>
//                     <img
//                       src={form.introductory_image_base64}
//                       alt="Intro Preview"
//                       className="h-32 rounded-lg shadow-md border"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Existing Images */}
//               {existingImages.length > 0 && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Existing Images
//                   </label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                     {existingImages.map((img, i) => (
//                       <div key={i} className="relative group">
//                         <img
//                           src={img}
//                           alt="existing"
//                           className="h-24 w-full object-cover rounded-lg shadow border"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => removeExistingImage(img)}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           ✖
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* New Images */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Additional Images ({form.images_base64.length}/10)
//                 </label>
//                 <input 
//                   type="file" 
//                   multiple 
//                   onChange={handleImagesChange}
//                   accept="image/*"
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">You can upload up to 10 additional images</p>
//                 {form.images_base64.length > 0 && (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
//                     {form.images_base64.map((img, i) => (
//                       <div key={i} className="relative group">
//                         <img
//                           src={img}
//                           alt="preview"
//                           className="h-24 w-full object-cover rounded-lg shadow border"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => removeNewImage(i)}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           ✖
//                         </button>
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
//                       placeholder={`Enter ${key}  ${key==='googlemap'? "(<iframe>...</iframe>)":''}`}
//                       className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
//                 <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-3">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
//                       <label className="block text-sm font-medium text-gray-700 mb-1">ICON Code *</label>
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
//                           className={`cursor-pointer w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
//                   className="cursor-pointer flex items-center gap-2 text-[#009dc8] font-medium text-sm"
//                 >
//                   <span className="text-lg">+</span> Add Icon
//                 </button>
//               )}
//             </div>

//             <div className="pt-6 border-t flex gap-4">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`cursor-pointer px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
//                   isSubmitting 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-[#1c5e20] hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Updating...
//                   </span>
//                 ) : (
//                   'Update Organization'
//                 )}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/dashboard/OrganizationPage")}
//                 className="cursor-pointer px-8 py-3 rounded-lg font-semibold bg-[#e7001e] hover:bg-red-700 text-white transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }









import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from '@/lib/router-compat';
import RichTextEditor from "../../components/editor/TextEditor";
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { showError } from "../../SwalPopupAlert/SwalPopupAlert";
import { showSuccessAlert } from "../../SwalPopupAlert/SwalPopupAlert";
export default function EditOrganizationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: [],
    search_tags: "",
    youtube_video_url: "",
    introductory_image_base64: "",
    partner_image: "",
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
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cap, setcap] = useState('');
  const [availableCategories, setcat] = useState([]);
  const [existingIntroImage, setExistingIntroImage] = useState("");
  const [existingPartnerImage, setExistingPartnerImage] = useState("");

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
      required: true // REQUIRED for edit too
    },
    partner_image: {
      dimensions: { width: 300, height: 300 }
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

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${APIPath}/api/organizations/${id}`, { withCredentials: true });
        const org = res.data;
        
        // Parse category from JSON string to array
        let categoryArray = [];
        if (org.category) {
          try {
            if (typeof org.category === 'string' && org.category.startsWith('[')) {
              categoryArray = JSON.parse(org.category);
            } else {
              categoryArray = [org.category];
            }
          } catch (e) {
            categoryArray = [org.category];
          }
        }

        // IMPORTANT: Convert existing image paths to base64 data URLs for display
        // This is needed because the backend returns file paths, not base64
        let introImageBase64 = "";
        let partnerImageBase64 = "";
        
        if (org.introductory_image_path) {
          // This is a file path, not base64. We'll keep it as is for display
          // The backend will handle the file path vs base64 conversion
          introImageBase64 = org.introductory_image_path;
        }
        
        if (org.partner_image) {
          partnerImageBase64 = org.partner_image;
        }

        setForm({
          name: org.name || "",
          description: org.description || "",
          category: categoryArray,
          search_tags: org.search_tags || "",
          youtube_video_url: org.youtube_video_url || "",
          introductory_image_base64: introImageBase64, // Use the existing image
          partner_image: partnerImageBase64, // Use the existing partner image
          slug: org.slug || "",
          meta_title: org.meta_title || "",
          meta_description: org.meta_description || "",
          meta_keywords: org.meta_keywords || "",
          images_base64: [],
          urls: org.urls && org.urls.length > 0
            ? org.urls.map((url) => url ?? "")
            : [""],
          socials: {
            phone: org.socials?.phone || "",
            facebook: org.socials?.facebook || "",
            twitter: org.socials?.twitter || "",
            instagram: org.socials?.instagram || "",
            location: org.socials?.location || "",
            googlemap: org.socials?.googlemap || "",
            mobile: org.socials?.mobile || "",
            website: org.socials?.website || "",
            youtubechannel: org.socials?.youtubechannel || "",
            email: org.socials?.email || "",
            linkedin: org.socials?.linkedin || ""
          },
          icons: org.icons && org.icons.length > 0
            ? org.icons.map((icon) => ({
                ...icon,
                name: icon?.name ?? "",
                svg: icon?.svg ?? "",
                qty: icon?.qty ?? "",
              }))
            : [{ name: "", svg: "", qty: "" }],
        });

        setExistingImages(org.images || []);
        setExistingIntroImage(org.introductory_image_path || "");
        setExistingPartnerImage(org.partner_image || "");
        
      } catch (err) {
        console.error("Error Fetching Organization:", err);
        alert("Failed to Load Organization Data");
        navigate("/admin-app/dashboard/OrganizationPage");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    }
  }, [id, navigate]);

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

  // Validate individual field
  const validateField = (name, value, rules) => {
    const fieldErrors = [];

    if (rules.required) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          fieldErrors.push("This field is required");
        }
      } else if (!value.trim() && !(name === 'introductory_image_base64' && existingIntroImage)) {
        // For intro image, check if we have existing image
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

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Basic fields validation
    newErrors.name = validateField("name", form.name, validationRules.name);
    newErrors.category = validateField("category", form.category, validationRules.category);
    newErrors.search_tags = validateField("search_tags", form.search_tags, validationRules.search_tags);
    newErrors.youtube_video_url = validateField('youtube_video_url', form.youtube_video_url, validationRules.youtube_video_url);
    
    // Intro image validation - check if we have either existing or new image
    if (!form.introductory_image_base64 && !existingIntroImage) {
      newErrors.introductory_image_base64 = ["Introductory image is required"];
    }
    
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
      // Validate file type (only WebP)
      if (!file.type.startsWith('image/') || file.type !== 'image/webp') {
        setErrors(prev => ({
          ...prev,
          introductory_image_base64: ["Please select a valid WebP image file (.webp)"]
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
      // Validate file type (only WebP)
      if (!file.type.startsWith('image/') || file.type !== 'image/webp') {
        setErrors(prev => ({
          ...prev,
          partner_image: ["Please select a valid WebP image file (.webp)"]
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

  // Remove existing intro image
  const removeIntroImage = () => {
    if (window.confirm("Are you sure you want to remove the introductory image?")) {
      setForm(prev => ({ ...prev, introductory_image_base64: "" }));
      setExistingIntroImage("");
    }
  };

  // Remove partner image
  const removePartnerImage = () => {
    if (window.confirm("Are you sure you want to remove the partner image?")) {
      setForm(prev => ({ ...prev, partner_image: "" }));
      setExistingPartnerImage("");
    }
  };

  // Multiple images upload
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (form.images_base64.length + files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/') || file.type !== 'image/webp') {
        alert("Please select valid WebP files only");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Each image must be less than 5MB");
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

  // Remove existing image
  const removeExistingImage = async (imagePath) => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      try {
        await axios.delete(`${APIPath}/api/organizations/${id}/images`, {
          data: { imagePath },
          withCredentials: true,
        });
        setExistingImages(prev => prev.filter(img => img !== imagePath));
        alert("Image removed successfully");
      } catch (err) {
        console.error("Error removing image:", err);
        alert("Failed to remove image");
      }
    }
  };

  // Remove new image
  const removeNewImage = (index) => {
    const updated = [...form.images_base64];
    updated.splice(index, 1);
    setForm({ ...form, images_base64: updated });
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
      alert("Maximum 5 URLs allowed");
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
      alert("Maximum 10 icons allowed");
    }
  };

  const removeIconField = (index) => {
    const updated = [...form.icons];
    updated.splice(index, 1);
    setForm({ ...form, icons: updated.length > 0 ? updated : [{ name: "", svg: "", qty: "" }] });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please Fix The Validation Errors Before Submitting.");
      return;
    }
    if (cap) {
      console.log('bot detected')
      setcap('')
      return
    }
    setIsSubmitting(true);
    try {
      // throw new Error("Testing alerts");
      await axios.put(`${APIPath}/api/organizations/${id}`, form, {
        withCredentials: true,
      });
      // alert("✅ Organization Updated Successfully!");
      showSuccessAlert();
      navigate("/admin-app/dashboard/OrganizationPage");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === "DUPLICATE_SLUG") {
        // alert("❌ Slug Already Exists. Please Choose A Different One.");
        showError ("Slug Already Exists. Please Choose A Different One.");
      } else {
        // alert("❌ Error Updating Organization");
        showError ("Error Updating Organization");
      }
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
          <p key={index} className="text-sm text-[#e7001e] flex items-center">
            <span className="w-1.5 h-1.5 bg-[#e7001e] rounded-full mr-2"></span>
            {error}
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[#222222] font-medium">Loading Organization Data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#222222] mb-2">Edit Organization</h1>
              <p className="text-[#222222] font-medium">Update the Details of Your Organization</p>
            </div>
            <button
              onClick={() => navigate("/admin-app/dashboard/OrganizationPage")}
              className="cursor-pointer bg-[#fcdd2d] text-[#222222] px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover:text-white"
            >
              ← Back
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Fields */}
            <input type="hidden" onChange={(e) => { setcap(e.target.value) }} />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter organization name"
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
                  placeholder="organization-slug"
                  value={(form.slug) ?? ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug?.length ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name. Use lowercase letters, numbers, and hyphens only.
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
                  placeholder="Enter search tags separated by commas (e.g., charity, donation, help)"
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
                  placeholder="Enter organization Video content (<iframe>...</iframe>)"
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  
                  {form.category.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {form.category.map((cat) => (
                          <span 
                            key={cat} 
                            className="cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {cat}
                            <button
                              type="button"
                              onClick={() => handleCategoryChange(cat)}
                              className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
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
                  You can select multiple categories for this organization
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
                  placeholder="Enter meta title for SEO"
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
                  placeholder="Enter meta description for SEO"
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

            {/* Images Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Images</h2>
              
              {/* Introductory Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introductory Image *
                </label>
                <input 
                  type="file" 
                  onChange={handleIntroImageChange}
                  accept=".webp,image/webp"
                  className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Supported format: WebP only. Max size: 5MB</p>
                {renderErrors(errors.introductory_image_base64)}
                
                {/* Existing Intro Image */}
                {existingIntroImage && !form.introductory_image_base64?.startsWith('data:image') && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 mb-1">Current Introductory Image:</p>
                      {/* <button
                        type="button"
                        onClick={removeIntroImage}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button> */}
                    </div>
                    <img
                      src={`${existingIntroImage}`}
                      alt="Existing Intro"
                      className="h-32 rounded-lg shadow-md border"
                    />
                  </div>
                )}
                
                {/* New Intro Image Preview */}
                {form.introductory_image_base64 && form.introductory_image_base64.startsWith('data:image') && (
                  <div className="mt-3">
                    <p className="text-sm text-[#1c5e20] mb-1">✓ New Image Selected</p>
                    <img
                      src={form.introductory_image_base64}
                      alt="Intro Preview"
                      className="h-32 rounded-lg shadow-md border"
                    />
                  </div>
                )}
              </div>

              {/* Partner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Image (must be 300x300 pixels)
                </label>
                <input 
                  type="file" 
                  onChange={handlePartnerImageChange}
                  accept=".webp,image/webp"
                  className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be exactly 300x300 pixels. Supported format: WebP only. Max size: 5MB
                </p>
                {renderErrors(errors.partner_image)}
                
                {/* Existing Partner Image */}
                {existingPartnerImage && !form.partner_image?.startsWith('data:image') && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 mb-1">Current Partner Image:</p>
                      {/* <button
                        type="button"
                        onClick={removePartnerImage}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button> */}
                    
                    </div>
                    <img
                      src={`${existingPartnerImage}`}
                      alt="Existing Partner"
                      className="h-32 rounded-lg shadow-md border"
                    />
                  </div>
                )}
                
                {/* New Partner Image Preview */}
                {form.partner_image && form.partner_image.startsWith('data:image') && (
                  <div className="mt-3">
                    <p className="text-sm text-[#1c5e20] mb-1">✓ New Partner Image Selected</p>
                    <img
                      src={form.partner_image}
                      alt="Partner Preview"
                      className="h-32 rounded-lg shadow-md border"
                    />
                  </div>
                )}
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Images
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt="existing"
                          className="h-24 w-full object-cover rounded-lg shadow border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images ({form.images_base64.length}/10)
                </label>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleImagesChange}
                  accept=".webp,image/webp"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">You can upload up to 10 additional WebP images</p>
                {form.images_base64.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {form.images_base64.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt="preview"
                          className="h-24 w-full object-cover rounded-lg shadow border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Social Media & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(form.socials).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={(form.socials[key]) ?? ''}
                      onChange={handleSocialChange}
                      placeholder={`Enter ${key}  ${key==='googlemap'? "(<iframe>...</iframe>)":''}`}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICON Code *</label>
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
                          className={`cursor-pointer w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.icons?.[i]?.qty?.length ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {renderErrors(errors.icons?.[i]?.qty)}
                      </div>
                      {form.icons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIconField(i)}
                          className="cursor-pointer text-red-600 hover:text-red-800 font-bold p-2 rounded hover:bg-red-50 transition-colors self-end mb-1"
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
                  className="cursor-pointer flex items-center gap-2 text-[#009dc8] font-medium text-sm"
                >
                  <span className="text-lg text-[#009dc8]">+</span> Add Icon
                </button>
              )}
            </div>

            <div className="pt-6 border-t flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#1c5e20] hover:bg-[#247b2a] focus:ring-2 focus:ring-[#247b2a] focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Organization'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-app/dashboard/OrganizationPage")}
                className="cursor-pointer px-8 py-3 rounded-lg font-semibold bg-[#e7001e] hover:bg-red-700 text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}




