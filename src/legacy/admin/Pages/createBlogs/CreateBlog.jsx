// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from '@/lib/router-compat';
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// export default function CreateBlogPage() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     // Document table fields
//     Name: "",
//     intro: "",
//     conclusion: "",
//     image_base64: "",
    
//     // Documentarr sections
//     sections: [],
    
//     // NGO data
//     ngos: {
//       intro: "",
//       categories: []
//     }
//   });
  
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Handle file upload for image
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type
//       if (!file.type.startsWith('image/')) {
//         setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors(prev => ({ ...prev, image: "Image size must be less than 5MB" }));
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setForm(prev => ({
//           ...prev,
//           image_base64: reader.result
//         }));
//         setErrors(prev => ({ ...prev, image: "" }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle main document fields
//   const handleDocumentChange = (field, value) => {
//     setForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     // Clear error when user types
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   // Handle NGO intro
//   const handleNgoIntroChange = (value) => {
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         intro: value
//       }
//     }));
//   };

//   // Handle sections (documentarr)
//   const handleSectionChange = (index, field, value) => {
//     const updatedSections = [...form.sections];
//     updatedSections[index][field] = value;
//     setForm(prev => ({
//       ...prev,
//       sections: updatedSections
//     }));
//   };

//   // Handle bullets in sections
//   const handleBulletChange = (sectionIndex, bulletIndex, value) => {
//     const updatedSections = [...form.sections];
//     if (!updatedSections[sectionIndex].bullets) {
//       updatedSections[sectionIndex].bullets = [""];
//     }
//     updatedSections[sectionIndex].bullets[bulletIndex] = value;
//     setForm(prev => ({
//       ...prev,
//       sections: updatedSections
//     }));
//   };

//   // Handle NGO categories (ngosarr)
//   const handleCategoryChange = (index, field, value) => {
//     const updatedCategories = [...form.ngos.categories];
//     updatedCategories[index][field] = value;
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: updatedCategories
//       }
//     }));
//   };

//   // Handle NGO category values (ngosarrof)
//   const handleCategoryValueChange = (categoryIndex, valueIndex, value) => {
//     const updatedCategories = [...form.ngos.categories];
//     if (!updatedCategories[categoryIndex].values) {
//       updatedCategories[categoryIndex].values = [""];
//     }
//     updatedCategories[categoryIndex].values[valueIndex] = value;
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: updatedCategories
//       }
//     }));
//   };

//   // Add new section
//   const addSection = () => {
//     setForm(prev => ({
//       ...prev,
//       sections: [
//         ...prev.sections,
//         {
//           heading: "",
//           start: "",
//           bullet_header: "",
//           end: "",
//           bullets: [""]
//         }
//       ]
//     }));
//   };

//   // Add bullet to section
//   const addBullet = (sectionIndex) => {
//     const updatedSections = [...form.sections];
//     if (!updatedSections[sectionIndex].bullets) {
//       updatedSections[sectionIndex].bullets = [""];
//     } else {
//       updatedSections[sectionIndex].bullets.push("");
//     }
//     setForm(prev => ({
//       ...prev,
//       sections: updatedSections
//     }));
//   };

//   // Add new NGO category
//   const addCategory = () => {
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: [
//           ...prev.ngos.categories,
//           {
//             h1: "",
//             values: [""]
//           }
//         ]
//       }
//     }));
//   };

//   // Add value to NGO category
//   const addCategoryValue = (categoryIndex) => {
//     const updatedCategories = [...form.ngos.categories];
//     if (!updatedCategories[categoryIndex].values) {
//       updatedCategories[categoryIndex].values = [""];
//     } else {
//       updatedCategories[categoryIndex].values.push("");
//     }
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: updatedCategories
//       }
//     }));
//   };

//   // Remove items
//   const removeSection = (index) => {
//     const updatedSections = form.sections.filter((_, i) => i !== index);
//     setForm(prev => ({ ...prev, sections: updatedSections }));
//   };

//   const removeBullet = (sectionIndex, bulletIndex) => {
//     const updatedSections = [...form.sections];
//     updatedSections[sectionIndex].bullets = updatedSections[sectionIndex].bullets.filter((_, i) => i !== bulletIndex);
//     setForm(prev => ({ ...prev, sections: updatedSections }));
//   };

//   const removeCategory = (index) => {
//     const updatedCategories = form.ngos.categories.filter((_, i) => i !== index);
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: updatedCategories
//       }
//     }));
//   };

//   const removeCategoryValue = (categoryIndex, valueIndex) => {
//     const updatedCategories = [...form.ngos.categories];
//     updatedCategories[categoryIndex].values = updatedCategories[categoryIndex].values.filter((_, i) => i !== valueIndex);
//     setForm(prev => ({
//       ...prev,
//       ngos: {
//         ...prev.ngos,
//         categories: updatedCategories
//       }
//     }));
//   };

//   // Validation
//   const validateForm = () => {
//     const newErrors = {};

//     if (!form.Name.trim()) {
//       newErrors.Name = "Blog title is required";
//     }

//     if (!form.intro.trim()) {
//       newErrors.intro = "Introduction is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       alert("Please fix the validation errors before submitting.");
//       return;
//     }

//     setSaving(true);
    
//     try {
//       await axios.post(`${APIPath}/api/blogs`, form, {
//         withCredentials: true,
//       });
//       alert("✅ Blog created successfully!");
//       navigate("/dashboard/BlogPage");
//     } catch (err) {
//       console.error("Error creating blog:", err);
//       const errorMessage = err.response?.data?.message || "Failed to create blog";
//       alert(`❌ ${errorMessage}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
//               <p className="text-gray-600 mt-2">Add a new blog post with all related content</p>
//             </div>
//             <button
//               onClick={() => navigate("/dashboard/BlogPage")}
//               className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//             >
//               ← Back to Blogs
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Main Document Section */}
//             <div className="space-y-6 p-6 bg-blue-50 rounded-xl">
//               <h2 className="text-2xl font-semibold text-gray-800">Main Blog Content</h2>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Blog Title *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.Name}
//                   onChange={(e) => handleDocumentChange("Name", e.target.value)}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
//                     errors.Name ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter blog title"
//                   required
//                 />
//                 {errors.Name && <p className="text-red-600 text-sm mt-1">{errors.Name}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Introduction *
//                 </label>
//                 <textarea
//                   value={form.intro}
//                   onChange={(e) => handleDocumentChange("intro", e.target.value)}
//                   rows={4}
//                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
//                     errors.intro ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Write the introduction of your blog..."
//                   required
//                 />
//                 {errors.intro && <p className="text-red-600 text-sm mt-1">{errors.intro}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Conclusion
//                 </label>
//                 <textarea
//                   value={form.conclusion}
//                   onChange={(e) => handleDocumentChange("conclusion", e.target.value)}
//                   rows={3}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
//                   placeholder="Write the conclusion of your blog..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Featured Image
//                 </label>
//                 <input
//                   type="file"
//                   onChange={handleImageChange}
//                   accept="image/*"
//                   className="w-full p-3 border border-gray-300 rounded-lg"
//                 />
//                 {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
//                 {form.image_base64 && (
//                   <div className="mt-2">
//                     <p className="text-sm text-green-600">Image preview:</p>
//                     <img src={form.image_base64} alt="Preview" className="h-32 mt-2 rounded" />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Document Sections */}
//             <div className="space-y-6 p-6 bg-green-50 rounded-xl">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-2xl font-semibold text-gray-800">Blog Sections</h2>
//                 <button
//                   type="button"
//                   onClick={addSection}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   + Add Section
//                 </button>
//               </div>

//               {form.sections.map((section, sectionIndex) => (
//                 <div key={sectionIndex} className="p-4 bg-white rounded-lg border border-gray-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-medium text-gray-800">Section {sectionIndex + 1}</h3>
//                     <button
//                       type="button"
//                       onClick={() => removeSection(sectionIndex)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       Remove
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-1 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
//                       <input
//                         type="text"
//                         value={section.heading || ""}
//                         onChange={(e) => handleSectionChange(sectionIndex, "heading", e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                         placeholder="Section heading"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Start Text</label>
//                       <textarea
//                         value={section.start || ""}
//                         onChange={(e) => handleSectionChange(sectionIndex, "start", e.target.value)}
//                         rows={2}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                         placeholder="Introductory text for this section"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Bullet Header</label>
//                       <input
//                         type="text"
//                         value={section.bullet_header || ""}
//                         onChange={(e) => handleSectionChange(sectionIndex, "bullet_header", e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                         placeholder="Header for bullet points"
//                       />
//                     </div>

//                     {/* Bullets */}
//                     <div>
//                       <div className="flex justify-between items-center mb-2">
//                         <label className="block text-sm font-medium text-gray-700">Bullet Points</label>
//                         <button
//                           type="button"
//                           onClick={() => addBullet(sectionIndex)}
//                           className="text-blue-600 hover:text-blue-800 text-sm"
//                         >
//                           + Add Bullet
//                         </button>
//                       </div>
//                       {section.bullets && section.bullets.map((bullet, bulletIndex) => (
//                         <div key={bulletIndex} className="flex gap-2 mb-2">
//                           <input
//                             type="text"
//                             value={bullet}
//                             onChange={(e) => handleBulletChange(sectionIndex, bulletIndex, e.target.value)}
//                             className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                             placeholder="Bullet point content"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeBullet(sectionIndex, bulletIndex)}
//                             className="text-red-600 hover:text-red-800 px-2"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ))}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">End Text</label>
//                       <textarea
//                         value={section.end || ""}
//                         onChange={(e) => handleSectionChange(sectionIndex, "end", e.target.value)}
//                         rows={2}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                         placeholder="Concluding text for this section"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* NGO Section */}
//             <div className="space-y-6 p-6 bg-purple-50 rounded-xl">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-2xl font-semibold text-gray-800">NGO Partners Section (Optional)</h2>
//                 <button
//                   type="button"
//                   onClick={addCategory}
//                   className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                   + Add Category
//                 </button>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   NGO Introduction
//                 </label>
//                 <textarea
//                   value={form.ngos.intro || ""}
//                   onChange={(e) => handleNgoIntroChange(e.target.value)}
//                   rows={3}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
//                   placeholder="Introduction about NGO partners..."
//                 />
//               </div>

//               {form.ngos.categories.map((category, categoryIndex) => (
//                 <div key={categoryIndex} className="p-4 bg-white rounded-lg border border-gray-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-medium text-gray-800">Category {categoryIndex + 1}</h3>
//                     <button
//                       type="button"
//                       onClick={() => removeCategory(categoryIndex)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       Remove
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-1 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
//                       <input
//                         type="text"
//                         value={category.h1 || ""}
//                         onChange={(e) => handleCategoryChange(categoryIndex, "h1", e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                         placeholder="Category title (e.g., Healthcare, Education)"
//                       />
//                     </div>

//                     {/* Category Values */}
//                     <div>
//                       <div className="flex justify-between items-center mb-2">
//                         <label className="block text-sm font-medium text-gray-700">NGO Names</label>
//                         <button
//                           type="button"
//                           onClick={() => addCategoryValue(categoryIndex)}
//                           className="text-blue-600 hover:text-blue-800 text-sm"
//                         >
//                           + Add NGO
//                         </button>
//                       </div>
//                       {category.values && category.values.map((value, valueIndex) => (
//                         <div key={valueIndex} className="flex gap-2 mb-2">
//                           <input
//                             type="text"
//                             value={value}
//                             onChange={(e) => handleCategoryValueChange(categoryIndex, valueIndex, e.target.value)}
//                             className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
//                             placeholder="NGO name and description"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeCategoryValue(categoryIndex, valueIndex)}
//                             className="text-red-600 hover:text-red-800 px-2"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Submit Button */}
//             <div className="flex gap-4 pt-6 border-t">
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {saving ? "Creating..." : "Create Blog"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/dashboard/BlogPage")}
//                 className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
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

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    // Document table fields
    Name: "",
    intro: "",
    conclusion: "",
    image_base64: "",
    
    // SEO fields
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    
    // Documentarr sections
    sections: [],
    
    // NGO data
    ngos: {
      intro: "",
      categories: []
    }
  });
   const [cap,setcap]=useState('')
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle file upload for image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          image_base64: reader.result
        }));
        setErrors(prev => ({ ...prev, image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle main document fields
  const handleDocumentChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle SEO fields
  const handleSeoChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle NGO intro
  const handleNgoIntroChange = (value) => {
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        intro: value
      }
    }));
  };

  // Handle sections (documentarr)
  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...form.sections];
    updatedSections[index][field] = value;
    setForm(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle bullets in sections
  const handleBulletChange = (sectionIndex, bulletIndex, value) => {
    const updatedSections = [...form.sections];
    if (!updatedSections[sectionIndex].bullets) {
      updatedSections[sectionIndex].bullets = [""];
    }
    updatedSections[sectionIndex].bullets[bulletIndex] = value;
    setForm(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle NGO categories (ngosarr)
  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...form.ngos.categories];
    updatedCategories[index][field] = value;
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: updatedCategories
      }
    }));
  };

  // Handle NGO category values (ngosarrof)
  const handleCategoryValueChange = (categoryIndex, valueIndex, value) => {
    const updatedCategories = [...form.ngos.categories];
    if (!updatedCategories[categoryIndex].values) {
      updatedCategories[categoryIndex].values = [""];
    }
    updatedCategories[categoryIndex].values[valueIndex] = value;
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: updatedCategories
      }
    }));
  };

  // Add new section
  const addSection = () => {
    setForm(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          heading: "",
          start: "",
          bullet_header: "",
          end: "",
          bullets: [""]
        }
      ]
    }));
  };

  // Add bullet to section
  const addBullet = (sectionIndex) => {
    const updatedSections = [...form.sections];
    if (!updatedSections[sectionIndex].bullets) {
      updatedSections[sectionIndex].bullets = [""];
    } else {
      updatedSections[sectionIndex].bullets.push("");
    }
    setForm(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Add new NGO category
  const addCategory = () => {
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: [
          ...prev.ngos.categories,
          {
            h1: "",
            values: [""]
          }
        ]
      }
    }));
  };

  // Add value to NGO category
  const addCategoryValue = (categoryIndex) => {
    const updatedCategories = [...form.ngos.categories];
    if (!updatedCategories[categoryIndex].values) {
      updatedCategories[categoryIndex].values = [""];
    } else {
      updatedCategories[categoryIndex].values.push("");
    }
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: updatedCategories
      }
    }));
  };

  // Remove items
  const removeSection = (index) => {
    const updatedSections = form.sections.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, sections: updatedSections }));
  };

  const removeBullet = (sectionIndex, bulletIndex) => {
    const updatedSections = [...form.sections];
    updatedSections[sectionIndex].bullets = updatedSections[sectionIndex].bullets.filter((_, i) => i !== bulletIndex);
    setForm(prev => ({ ...prev, sections: updatedSections }));
  };

  const removeCategory = (index) => {
    const updatedCategories = form.ngos.categories.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: updatedCategories
      }
    }));
  };

  const removeCategoryValue = (categoryIndex, valueIndex) => {
    const updatedCategories = [...form.ngos.categories];
    updatedCategories[categoryIndex].values = updatedCategories[categoryIndex].values.filter((_, i) => i !== valueIndex);
    setForm(prev => ({
      ...prev,
      ngos: {
        ...prev.ngos,
        categories: updatedCategories
      }
    }));
  };

  // Generate slug from title
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.Name.trim()) {
      newErrors.Name = "Blog title is required";
    }

    if (!form.intro.trim()) {
      newErrors.intro = "Introduction is required";
    }

    if (!form.slug.trim()) {
      newErrors.slug = "slug is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

 if(cap){
      console.log('bot detected')
      setcap('')
      return
    }

    setSaving(true);
    
    try {
      await axios.post(`${APIPath}/api/blogs`, form, {
        withCredentials: true,
      });
      alert("✅ Blog created successfully!");
      navigate("/dashboard/BlogPage");
    } catch (err) {
      console.error("Error creating blog:", err);
      const errorMessage = err.response?.data?.message || "Failed to create blog";
      alert(`❌ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
              <p className="text-gray-600 mt-2">Add a New Blog post With All related Content</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/BlogPage")}
              className="bg-[#e7001e] text-white px-4 py-2 rounded-lg hover:bg-[#f80020] transition-colors"
            >
              ← Back to Blogs
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
               <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />
               
            {/* Main Document Section */}
            <div className="space-y-6 p-6 bg-blue-50 rounded-xl">
              <h2 className="text-2xl font-semibold text-[#222222]">Main Blog Content</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Title *
                </label>
                <input
                  type="text"
                  value={(form.Name) ?? ''}
                  onChange={(e) => {
                    handleDocumentChange("Name", e.target.value);
                    // Auto-generate slug from title
                    handleSeoChange("slug", generateSlug(e.target.value));
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
                    errors.Name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Blog Title"
                  required
                />
                {errors.Name && <p className="text-red-600 text-sm mt-1">{errors.Name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={(form.slug) ?? ''}
                  onChange={(e) => handleSeoChange("slug", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Blog URL Slug"
                  required
                />
                <p className="text-xs text-[#009dc8] mt-1">
                  URL-friendly version of the title. Use lowercase letters, numbers, and hyphens only.
                </p>
                {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introduction *
                </label>
                <textarea
                  value={(form.intro) ?? ''}
                  onChange={(e) => handleDocumentChange("intro", e.target.value)}
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] ${
                    errors.intro ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Write the Introduction of Blog..."
                  required
                />
                {errors.intro && <p className="text-red-600 text-sm mt-1">{errors.intro}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conclusion
                </label>
                <textarea
                  value={(form.conclusion) ?? ''}
                  onChange={(e) => handleDocumentChange("conclusion", e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
                  placeholder="Write the Conclusion of Blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="cursor-pointer w-[25%] p-3 border border-gray-300 hover:bg-gray-400 rounded-lg"
                />
                {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                {form.image_base64 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Image Preview:</p>
                    <img src={form.image_base64} alt="Preview" className="h-32 mt-2 rounded" />
                  </div>
                )}
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-6 p-6 bg-yellow-50 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-800">SEO Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={(form.meta_title) ?? ''}
                  onChange={(e) => handleSeoChange("meta_title", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
                  placeholder="Enter Meta Title for SEO"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{form.meta_title.length}/60 characters</span>
                  <span className="text-[#009dc8]">Recommended for search engines</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={(form.meta_description) ?? ''}
                  onChange={(e) => handleSeoChange("meta_description", e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
                  placeholder="Enter Meta Description for SEO"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{form.meta_description.length}/160 characters</span>
                  <span className="text-[#009dc8]">Appears in search results</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={(form.meta_keywords) ?? ''}
                  onChange={(e) => handleSeoChange("meta_keywords", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-[#009dc8] mt-1">
                  Separate keywords with commas. Maximum 255 characters.
                </p>
              </div>
            </div>

            {/* Document Sections */}
            <div className="space-y-6 p-6 bg-green-50 rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Blog Sections</h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Section
                </button>
              </div>

              {form.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Section {sectionIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="cursor-pointer bg-[#e7001e] text-white p-1 px-2 rounded-lg hover:bg-[#f80020] transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                      <input
                        type="text"
                        value={section.heading || ""}
                        onChange={(e) => handleSectionChange(sectionIndex, "heading", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                        placeholder="Section Heading"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Text</label>
                      <textarea
                        value={section.start || ""}
                        onChange={(e) => handleSectionChange(sectionIndex, "start", e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                        placeholder="Introductory Text for this Section"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bullet Header</label>
                      <input
                        type="text"
                        value={section.bullet_header || ""}
                        onChange={(e) => handleSectionChange(sectionIndex, "bullet_header", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                        placeholder="Header for bullet points"
                      />
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Bullet Points</label>
                        <button
                          type="button"
                          onClick={() => addBullet(sectionIndex)}
                          className="cursor-pointer text-[#009dc8] text-sm"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      {section.bullets && section.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={(bullet) ?? ''}
                            onChange={(e) => handleBulletChange(sectionIndex, bulletIndex, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                            placeholder="Bullet point content"
                          />
                          <button
                            type="button"
                            onClick={() => removeBullet(sectionIndex, bulletIndex)}
                            className="cursor-pointer bg-[#e7001e] text-white p-1 px-2 rounded-lg hover:bg-[#f80020] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Text</label>
                      <textarea
                        value={section.end || ""}
                        onChange={(e) => handleSectionChange(sectionIndex, "end", e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                        placeholder="Concluding Text for this Section"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NGO Section */}
            <div className="space-y-6 p-6 bg-purple-50 rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">NGO Partners Section (Optional)</h2>
                <button
                  type="button"
                  onClick={addCategory}
                  className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Add Category
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NGO Introduction
                </label>
                <textarea
                  value={form.ngos.intro || ""}
                  onChange={(e) => handleNgoIntroChange(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e]"
                  placeholder="Introduction About NGO Partners..."
                />
              </div>

              {form.ngos.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Category {categoryIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryIndex)}
                      className="cursor-pointer bg-[#e7001e] text-white p-1 px-2 rounded-lg hover:bg-[#f80020] transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
                      <input
                        type="text"
                        value={category.h1 || ""}
                        onChange={(e) => handleCategoryChange(categoryIndex, "h1", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                        placeholder="Category Title (e.g., Health, Education, Autism etc.)"
                      />
                    </div>

                    {/* Category Values */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">NGO Names</label>
                        <button
                          type="button"
                          onClick={() => addCategoryValue(categoryIndex)}
                          className="cursor-pointer text-[#009dc8] text-sm"
                        >
                          + Add NGO
                        </button>
                      </div>
                      {category.values && category.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={(value) ?? ''}
                            onChange={(e) => handleCategoryValueChange(categoryIndex, valueIndex, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#02236e]"
                            placeholder="NGO Name and Description"
                          />
                          <button
                            type="button"
                            onClick={() => removeCategoryValue(categoryIndex, valueIndex)}
                            className="cursor-pointer bg-[#e7001e] text-white p-1 px-2 rounded-lg hover:bg-[#f80020] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer bg-[#02236e] text-white px-8 py-3 rounded-lg hover:bg-[#0336a9] transition-colors font-semibold disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Blog"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/BlogPage")}
                className="cursor-pointer bg-[#e7001e] text-white px-8 py-3 rounded-lg hover:bg-[#f80120] transition-colors font-semibold"
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