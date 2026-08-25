import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db1 from '../Database/oldDB.js';
import { uploadToFTP, deleteFromFTP, uploadVideoToFTP, deleteVideoFromFTP } from "../utils/ftpUpload.js";
import { DtoArr } from "../Dto/objectDto.js";
// // Utility Functions
// function uniqueImageName(extension = "png") {
//   return `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${extension}`;
// }

// const deleteImageFile = async (imageUrl) => {
//   try {
//     if (!imageUrl) return;
//     await deleteFromFTP(imageUrl);
//     console.log(`Requested deletion of: ${imageUrl}`);
//   } catch (error) {
//     console.error('Error deleting image file from FTP:', error);
//   }
// };




// // Auth Controllers
// export const login = (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   const query = "SELECT * FROM users WHERE email = ?";
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       console.error("❌ DB Error:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
//       expiresIn: "6d",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     delete user.password;
//     const auth = { auth: true };
//     return res.status(200).json({ message: "Login successful", user: { ...user, ...auth } });
//   });
// };

// export const logout = (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logged out" });
// };

// // Organization Controllers
// export const getAllOrganizations = (req, res) => {
//   const query = `
//     SELECT 
//       i.id, 
//       i.name,
//       i.deletestatus, 
//       i.description, 
//       i.category, 
//       i.introductory_image_path,
//       GROUP_CONCAT(DISTINCT ii.image_path) AS images,
//       GROUP_CONCAT(DISTINCT iu.urls) AS urls,
//       JSON_OBJECT(
//         'phone', s.phone,
//         'facebook', s.facebook,
//         'twitter', s.twitter,
//         'instagram', s.instagram,
//         'location', s.location,
//         'googlemap', s.googlemap,
//         'mobile', s.Mobile_number
//       ) AS socials,
//       JSON_ARRAYAGG(
//         JSON_OBJECT(
//           'name', ic.name,
//           'svg', ic.svg,
//           'qty', ic.qty
//         )
//       ) AS icons
//     FROM items i
//     LEFT JOIN item_images ii ON i.id = ii.item_id
//     LEFT JOIN item_urls iu ON i.id = iu.item_id
//     LEFT JOIN socials s ON i.id = s.item_id
//     LEFT JOIN icons ic ON i.id = ic.item_id
//     GROUP BY i.id
//   `;

//   db1.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching organizations:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     const formatted = results.map((row) => ({
//       id: row.id,
//       deletestatus: row.deletestatus,
//       name: row.name,
//       description: row.description,
//       category: row.category,
//       introductory_image_path: row.introductory_image_path,
//       images: row.images ? [...new Set(row.images.split(","))] : [],
//       urls: row.urls ? [...new Set(row.urls.split(","))] : [],
//       socials: row.socials || {},
//       icons: row.icons || [],
//     }));

//     res.status(200).json(DtoArr(formatted));
//   });
// };

// export const createOrganization = async (req, res) => {
//   const {
//     name,
//     description,
//     category,
//     introductory_image_base64,
//     youtube_video_url,
//     images_base64,
//     urls,
//     socials,
//     icons,
//   } = req.body;

//   const conn = db1.promise();

//   try {
//     await conn.beginTransaction();

//     let introImagePath = null;
//     if (introductory_image_base64) {
//       const matches = introductory_image_base64.match(/^data:(.+);base64,(.+)$/);
//       if (matches) {
//         const ext = matches[1].split("/")[1] || "png";
//         const fileName = uniqueImageName(ext);
//         const fileBuffer = Buffer.from(matches[2], "base64");
//         const uploadedUrl = await uploadToFTP(fileName, fileBuffer);
//         introImagePath = uploadedUrl;
//       }
//     }

//     const [result] = await conn.query(
//       `INSERT INTO items (name, description, category, introductory_image_path, youtube_video_url) VALUES (?, ?, ?, ?, ?)`,
//       [name, description, category, introImagePath, youtube_video_url]
//     );

//     const itemId = result.insertId;

//     if (images_base64 && images_base64.length > 0) {
//       for (const imgBase64 of images_base64) {
//         const matches = imgBase64.match(/^data:(.+);base64,(.+)$/);
//         if (matches) {
//           const ext = matches[1].split("/")[1] || "png";
//           const fileName = uniqueImageName(ext);
//           const fileBuffer = Buffer.from(matches[2], "base64");
//           const fileUrl = await uploadToFTP(fileName, fileBuffer);
//           await conn.query("INSERT INTO item_images (item_id, image_path) VALUES (?, ?)", [
//             itemId,
//             fileUrl,
//           ]);
//         }
//       }
//     }

//     if (urls && urls.length > 0) {
//       for (const u of urls) {
//         await conn.query("INSERT INTO item_urls (item_id, urls) VALUES (?, ?)", [
//           itemId,
//           JSON.stringify([u]),
//         ]);
//       }
//     }

//     if (socials) {
//       await conn.query(
//         "INSERT INTO socials (item_id, phone, facebook, twitter, instagram, location, googlemap, Mobile_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           itemId,
//           socials.phone || null,
//           socials.facebook || null,
//           socials.twitter || null,
//           socials.instagram || null,
//           socials.location || null,
//           socials.googlemap || "",
//           socials.mobile || null,
//         ]
//       );
//     }

//     if (icons && icons.length > 0) {
//       for (const icon of icons) {
//         await conn.query(
//           "INSERT INTO icons (item_id, name, svg, qty) VALUES (?, ?, ?, ?)",
//           [itemId, icon.name, icon.svg, icon.qty]
//         );
//       }
//     }

//     await conn.commit();
//     res.status(201).json({ message: "✅ Organization created successfully", id: itemId });
//   } catch (error) {
//     await db1.promise().rollback();
//     res.status(500).json({ message: "Failed to create organization", error: error.message });
//   }
// };

// export const getOrganizationById = (req, res) => {
//   const { id } = req.params;

//   const getItemQuery = "SELECT * FROM items WHERE id = ?";
//   db1.query(getItemQuery, [id], (err, itemResults) => {
//     if (err) {
//       console.error("❌ Error fetching organization:", err);
//       return res.status(500).json({ message: "Failed to fetch organization" });
//     }

//     if (itemResults.length === 0) {
//       return res.status(404).json({ message: "Organization not found" });
//     }

//     const organization = itemResults[0];
//     if (organization.deletestatus === 1) {
//       return res.status(404).json({ message: "Organization not found" });
//     }

//     const getImagesQuery = "SELECT image_path FROM item_images WHERE item_id = ?";
//     db1.query(getImagesQuery, [id], (err, imageResults) => {
//       if (err) {
//         console.error("Error fetching images:", err);
//         return res.status(500).json({ message: "Failed to fetch images" });
//       }

//       const getUrlsQuery = "SELECT urls FROM item_urls WHERE item_id = ?";
//       db1.query(getUrlsQuery, [id], (err, urlResults) => {
//         if (err) {
//           console.error("Error fetching URLs:", err);
//           return res.status(500).json({ message: "Failed to fetch URLs" });
//         }

//         let urls1 = [];
//         for (let i = 0; i < urlResults.length; i++) {
//           urls1 = [...urls1, ...urlResults[i].urls];
//         }
//         const urls = urls1;

//         const getSocialsQuery = "SELECT * FROM socials WHERE item_id = ?";
//         db1.query(getSocialsQuery, [id], (err, socialResults) => {
//           if (err) {
//             console.error("Error fetching socials:", err);
//             return res.status(500).json({ message: "Failed to fetch socials" });
//           }

//           const getIconsQuery = "SELECT * FROM icons WHERE item_id = ?";
//           db1.query(getIconsQuery, [id], (err, iconResults) => {
//             if (err) {
//               console.error("Error fetching icons:", err);
//               return res.status(500).json({ message: "Failed to fetch icons" });
//             }

//             const response = {
//               ...organization,
//               images: imageResults.map((img) => img.image_path),
//               urls,
//               socials: socialResults.length > 0 ? {
//                 phone: socialResults[0].phone,
//                 facebook: socialResults[0].facebook,
//                 twitter: socialResults[0].twitter,
//                 instagram: socialResults[0].instagram,
//                 location: socialResults[0].location,
//                 googlemap: socialResults[0].googlemap,
//                 mobile: socialResults[0].Mobile_number,
//               } : {},
//               icons: iconResults.map((icon) => ({
//                 name: icon.name,
//                 svg: icon.svg,
//                 qty: icon.qty,
//               })),
//             };

//             res.json(response);
//           });
//         });
//       });
//     });
//   });
// };

// export const updateOrganization = (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     description,
//     category,
//     introductory_image_base64,
//     youtube_video_url,
//     images_base64,
//     urls,
//     socials,
//     icons,
//   } = req.body;

//   db1.beginTransaction(async (err) => {
//     if (err) {
//       console.error("❌ Error starting transaction:", err);
//       return res.status(500).json({ message: "Failed to start transaction" });
//     }

//     try {
//       const [rows] = await db1.promise().query("SELECT * FROM items WHERE id = ?", [id]);

//       if (rows.length === 0) {
//         await db1.promise().rollback();
//         return res.status(404).json({ message: "Organization not found" });
//       }

//       let introImagePath = rows[0].introductory_image_path;

//       if (introductory_image_base64) {
//         const matches = introductory_image_base64.match(/^data:(.+);base64,(.+)$/);
//         if (matches) {
//           const ext = matches[1].split("/")[1] || "png";
//           const fileName = uniqueImageName(ext);
//           const fileBuffer = Buffer.from(matches[2], "base64");
//           const uploadedUrl = await uploadToFTP(fileName, fileBuffer);

//           if (introImagePath) {
//             await deleteImageFile(introImagePath);
//           }

//           introImagePath = uploadedUrl;
//         }
//       }

//       await db1.promise().query(
//         `UPDATE items SET name = ?, description = ?, category = ?, introductory_image_path = ?, youtube_video_url = ? WHERE id = ?`,
//         [name, description, category, introImagePath, youtube_video_url, id]
//       );

//       if (images_base64 && images_base64.length > 0) {
//         for (const imgBase64 of images_base64) {
//           const matches = imgBase64.match(/^data:(.+);base64,(.+)$/);
//           if (matches) {
//             const ext = matches[1].split("/")[1] || "png";
//             const fileName = uniqueImageName(ext);
//             const fileBuffer = Buffer.from(matches[2], "base64");
//             const fileUrl = await uploadToFTP(fileName, fileBuffer);

//             await db1.promise().query("INSERT INTO item_images (item_id, image_path) VALUES (?, ?)", [id, fileUrl]);
//           }
//         }
//       }

//       await db1.promise().query("DELETE FROM item_urls WHERE item_id = ?", [id]);
//       if (urls && urls.length > 0) {
//         for (const u of urls) {
//           if (u.trim()) {
//             await db1.promise().query("INSERT INTO item_urls (item_id, urls) VALUES (?, ?)", [
//               id,
//               JSON.stringify([u]),
//             ]);
//           }
//         }
//       }

//       await db1.promise().query("DELETE FROM socials WHERE item_id = ?", [id]);
//       if (socials) {
//         await db1.promise().query(
//           "INSERT INTO socials (item_id, phone, facebook, twitter, instagram, location, googlemap, Mobile_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//           [
//             id,
//             socials.phone || null,
//             socials.facebook || null,
//             socials.twitter || null,
//             socials.instagram || null,
//             socials.location || null,
//             socials.googlemap || "",
//             socials.mobile || null,
//           ]
//         );
//       }

//       await db1.promise().query("DELETE FROM icons WHERE item_id = ?", [id]);
//       if (icons && icons.length > 0) {
//         for (const icon of icons) {
//           if (icon.name.trim() && icon.svg.trim()) {
//             await db1.promise().query("INSERT INTO icons (item_id, name, svg, qty) VALUES (?, ?, ?, ?)", [
//               id,
//               icon.name,
//               icon.svg,
//               icon.qty,
//             ]);
//           }
//         }
//       }

//       await db1.promise().commit();
//       res.json({ message: "✅ Organization updated successfully", id });
//     } catch (error) {
//       console.error("❌ Transaction error:", error);
//       await db1.promise().rollback();
//       res.status(500).json({ message: "Failed to update organization", error: error.message });
//     }
//   });
// };

// export const deleteOrganizationImage = async (req, res) => {
//   const { id } = req.params;
//   const { imagePath } = req.body;

//   const deleteQuery = "DELETE FROM item_images WHERE item_id = ? AND image_path = ?";
//   db1.query(deleteQuery, [id, imagePath], async (err, result) => {
//     if (err) {
//       console.error("Error deleting image from database:", err);
//       return res.status(500).json({ message: "Failed to delete image" });
//     }
//     await deleteImageFile(imagePath);
//     res.json({ message: "Image deleted successfully" });
//   });
// };

// export const softDeleteOrganization = (req, res) => {
//   const { id } = req.params;

//   const query = "UPDATE items SET deletestatus = 1 WHERE id = ?";
//   db1.query(query, [id], (err, result) => {
//     if (err) {
//       console.error("❌ Error soft deleting organization:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Organization not found" });
//     }

//     res.status(200).json({ message: "✅ Organization soft deleted successfully" });
//   });
// };

// // Blog Controllers
// export const getAllDocuments = (req, res) => {
//   const sql = "SELECT * FROM document";
//   db1.query(sql, (err, results) => {
//     if (err) {
//       console.error("Error fetching documents:", err);
//       return res.status(500).json({ error: "Database query failed" });
//     }
//     res.json(DtoArr(results));
//   });
// };

// export const getBlogById = (req, res) => {
//   const { id } = req.params;

//   const documentQuery = "SELECT * FROM document WHERE id = ?";
//   db1.query(documentQuery, [id], (err, documentResults) => {
//     if (err) {
//       console.error("❌ Error fetching document:", err);
//       return res.status(500).json({ message: "Failed to fetch document" });
//     }

//     if (documentResults.length === 0) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     const document = documentResults[0];
//     if (document.deletestatus === 1) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     const sectionsQuery = `SELECT da.* FROM documentarr da WHERE da.document_id = ? ORDER BY da.id`;
//     db1.query(sectionsQuery, [id], (err, sectionsResults) => {
//       if (err) {
//         console.error("❌ Error fetching document sections:", err);
//         return res.status(500).json({ message: "Failed to fetch document sections" });
//       }

//       const sectionsWithBullets = [];
//       let processedSections = 0;

//       if (sectionsResults.length === 0) {
//         return res.json({
//           ...document,
//           sections: [],
//           ngos: null
//         });
//       }

//       sectionsResults.forEach((section, index) => {
//         const bulletsQuery = `SELECT dab.bullet FROM documentarrbullets dab WHERE dab.arr_id = ? ORDER BY dab.id`;
        
//         db1.query(bulletsQuery, [section.id], (err, bulletsResults) => {
//           if (err) {
//             console.error("❌ Error fetching bullets:", err);
//             return res.status(500).json({ message: "Failed to fetch bullets" });
//           }

//           sectionsWithBullets.push({
//             ...section,
//             bullets: bulletsResults.map(b => b.bullet)
//           });

//           processedSections++;

//           if (processedSections === sectionsResults.length) {
//             const ngoQuery = "SELECT * FROM ngos WHERE document_id = ?";
//             db1.query(ngoQuery, [id], (err, ngoResults) => {
//               if (err) {
//                 console.error("❌ Error fetching NGO:", err);
//                 return res.status(500).json({ message: "Failed to fetch NGO data" });
//               }

//               if (ngoResults.length === 0) {
//                 return res.json({
//                   ...document,
//                   sections: sectionsWithBullets,
//                   ngos: { categories: [] }
//                 });
//               }

//               const ngo = ngoResults[0];
//               const ngoCategoriesQuery = `SELECT na.* FROM ngosarr na WHERE na.ngos_id = ? ORDER BY na.id`;
//               db1.query(ngoCategoriesQuery, [ngo.id], (err, categoriesResults) => {
//                 if (err) {
//                   console.error("❌ Error fetching NGO categories:", err);
//                   return res.status(500).json({ message: "Failed to fetch NGO categories" });
//                 }

//                 const categoriesWithValues = [];
//                 let processedCategories = 0;

//                 if (categoriesResults.length === 0) {
//                   return res.json({
//                     ...document,
//                     sections: sectionsWithBullets,
//                     ngos: { ...ngo, categories: [] }
//                   });
//                 }

//                 categoriesResults.forEach((category, index) => {
//                   const ngoValuesQuery = `SELECT naf.value FROM ngosarrof naf WHERE naf.ngos_arr_id = ? ORDER BY naf.id`;
                  
//                   db1.query(ngoValuesQuery, [category.id], (err, valuesResults) => {
//                     if (err) {
//                       console.error("❌ Error fetching NGO values:", err);
//                       return res.status(500).json({ message: "Failed to fetch NGO values" });
//                     }

//                     categoriesWithValues.push({
//                       ...category,
//                       values: valuesResults.map(v => v.value)
//                     });

//                     processedCategories++;

//                     if (processedCategories === categoriesResults.length) {
//                       res.json({
//                         ...document,
//                         sections: sectionsWithBullets,
//                         ngos: {
//                           ...ngo,
//                           categories: categoriesWithValues
//                         }
//                       });
//                     }
//                   });
//                 });
//               });
//             });
//           }
//         });
//       });
//     });
//   });
// };

// export const createBlog = (req, res) => {
//   const {
//     Name,
//     intro,
//     conclusion,
//     image_base64,
//     sections,
//     ngos
//   } = req.body;

//   db1.beginTransaction(async (err) => {
//     if (err) {
//       console.error("❌ Transaction start error:", err);
//       return res.status(500).json({ message: "Failed to start transaction" });
//     }

//     try {
//       let imagePath = null;
//       if (image_base64) {
//         const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
//         if (matches) {
//           const ext = matches[1].split("/")[1] || "png";
//           const fileName = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
//           const fileBuffer = Buffer.from(matches[2], "base64");
//           imagePath = await uploadToFTP(fileName, fileBuffer);
//         }
//       }

//       const insertDocumentQuery = `INSERT INTO document (Name, intro, conclusion, image_path) VALUES (?, ?, ?, ?)`;
//       const documentParams = [Name, intro, conclusion, imagePath];

//       const documentResult = await new Promise((resolve, reject) => {
//         db1.query(insertDocumentQuery, documentParams, (err, result) => {
//           if (err) reject(new Error(`Document insertion failed: ${err.message}`));
//           else resolve(result);
//         });
//       });

//       const documentId = documentResult.insertId;

//       if (sections && sections.length > 0) {
//         for (const section of sections) {
//           const insertSectionQuery = `INSERT INTO documentarr (document_id, heading, start, bullet_header, end) VALUES (?, ?, ?, ?, ?)`;
//           const sectionParams = [
//             documentId,
//             section.heading || null,
//             section.start || null,
//             section.bullet_header || null,
//             section.end || null
//           ];

//           const sectionResult = await new Promise((resolve, reject) => {
//             db1.query(insertSectionQuery, sectionParams, (err, result) => {
//               if (err) reject(new Error(`Section insertion failed: ${err.message}`));
//               else resolve(result);
//             });
//           });

//           if (section.bullets && section.bullets.length > 0) {
//             for (const bullet of section.bullets) {
//               if (bullet && bullet.trim()) {
//                 const insertBulletQuery = `INSERT INTO documentarrbullets (arr_id, bullet) VALUES (?, ?)`;
//                 await new Promise((resolve, reject) => {
//                   db1.query(insertBulletQuery, [sectionResult.insertId, bullet], (err) => {
//                     if (err) reject(new Error(`Bullet insertion failed: ${err.message}`));
//                     else resolve();
//                   });
//                 });
//               }
//             }
//           }
//         }
//       }

//       if (ngos && (ngos.intro || (ngos.categories && ngos.categories.length > 0))) {
//         const insertNgoQuery = "INSERT INTO ngos (document_id, intro) VALUES (?, ?)";
//         const ngoResult = await new Promise((resolve, reject) => {
//           db1.query(insertNgoQuery, [documentId, ngos.intro || null], (err, result) => {
//             if (err) reject(new Error(`NGO insertion failed: ${err.message}`));
//             else resolve(result);
//           });
//         });

//         const ngoId = ngoResult.insertId;

//         if (ngos.categories && ngos.categories.length > 0) {
//           for (const category of ngos.categories) {
//             if (category.h1 || (category.values && category.values.length > 0)) {
//               const insertCategoryQuery = "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)";
//               const categoryResult = await new Promise((resolve, reject) => {
//                 db1.query(insertCategoryQuery, [ngoId, category.h1 || null], (err, result) => {
//                   if (err) reject(new Error(`NGO category insertion failed: ${err.message}`));
//                   else resolve(result);
//                 });
//               });

//               if (category.values && category.values.length > 0) {
//                 for (const value of category.values) {
//                   if (value && value.trim()) {
//                     const insertValueQuery = "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)";
//                     await new Promise((resolve, reject) => {
//                       db1.query(insertValueQuery, [categoryResult.insertId, value], (err) => {
//                         if (err) reject(new Error(`NGO value insertion failed: ${err.message}`));
//                         else resolve();
//                       });
//                     });
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }

//       await new Promise((resolve, reject) => {
//         db1.commit((err) => {
//           if (err) {
//             db1.rollback(() => {
//               reject(new Error(`Transaction commit failed: ${err.message}`));
//             });
//           } else {
//             resolve();
//           }
//         });
//       });

//       res.status(201).json({ 
//         message: "Blog created successfully",
//         id: documentId
//       });

//     } catch (error) {
//       db1.rollback(() => {
//         console.error("❌ Transaction rolled back:", error.message);
//         res.status(500).json({ 
//           message: "Failed to create blog",
//           error: error.message 
//         });
//       });
//     }
//   });
// };

// export const updateBlog = (req, res) => {
//   const { id } = req.params;
//   const {
//     Name,
//     intro,
//     conclusion,
//     image_base64,
//     sections,
//     ngos
//   } = req.body;

//   db1.beginTransaction(async (err) => {
//     if (err) {
//       console.error("❌ Transaction start error:", err);
//       return res.status(500).json({ message: "Failed to start transaction" });
//     }

//     try {
//       let imagePath = null;
      
//       if (image_base64) {
//         const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
//         if (matches) {
//           const ext = matches[1].split("/")[1] || "png";
//           const fileName = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
//           const fileBuffer = Buffer.from(matches[2], "base64");
//           const uploadedUrl = await uploadToFTP(fileName, fileBuffer);
//           imagePath = uploadedUrl;
//         }
//       }

//       await new Promise((resolve, reject) => {
//         db1.query('SELECT * FROM document WHERE id=?', [id], (err1, results) => {
//           if (err1) {
//             return reject(err1);
//           }
//           const get = results[0].image_path;
//           (async () => {
//             try {
//               await deleteImageFile(get);
//             } catch (e) {
//               console.error("Error deleting old blog image:", e);
//             } finally {
//               resolve();
//             }
//           })();
//         });
//       });

//       let updateDocumentQuery;
//       let documentParams;

//       if (imagePath) {
//         updateDocumentQuery = `UPDATE document SET Name = ?, intro = ?, conclusion = ?, image_path = ? WHERE id = ?`;
//         documentParams = [Name, intro, conclusion, imagePath, id];
//       } else {
//         updateDocumentQuery = `UPDATE document SET Name = ?, intro = ?, conclusion = ? WHERE id = ?`;
//         documentParams = [Name, intro, conclusion, id];
//       }

//       await new Promise((resolve, reject) => {
//         db1.query(updateDocumentQuery, documentParams, (err, result) => {
//           if (err) {
//             reject(new Error(`Document update failed: ${err.message}`));
//           } else if (result.affectedRows === 0) {
//             reject(new Error("Document not found"));
//           } else {
//             resolve(result);
//           }
//         });
//       });

//       await new Promise((resolve, reject) => {
//         const deleteBulletsQuery = `DELETE dab FROM documentarrbullets dab INNER JOIN documentarr da ON dab.arr_id = da.id WHERE da.document_id = ?`;
//         db1.query(deleteBulletsQuery, [id], (err) => {
//           if (err) reject(new Error(`Bullets deletion failed: ${err.message}`));
//           else resolve();
//         });
//       });

//       await new Promise((resolve, reject) => {
//         const deleteSectionsQuery = "DELETE FROM documentarr WHERE document_id = ?";
//         db1.query(deleteSectionsQuery, [id], (err) => {
//           if (err) reject(new Error(`Sections deletion failed: ${err.message}`));
//           else resolve();
//         });
//       });

//       if (sections && sections.length > 0) {
//         for (const section of sections) {
//           const insertSectionQuery = `INSERT INTO documentarr (document_id, heading, start, bullet_header, end) VALUES (?, ?, ?, ?, ?)`;
//           const sectionParams = [
//             id,
//             section.heading || null,
//             section.start || null,
//             section.bullet_header || null,
//             section.end || null
//           ];

//           const sectionResult = await new Promise((resolve, reject) => {
//             db1.query(insertSectionQuery, sectionParams, (err, result) => {
//               if (err) reject(new Error(`Section insertion failed: ${err.message}`));
//               else resolve(result);
//             });
//           });

//           if (section.bullets && section.bullets.length > 0) {
//             for (const bullet of section.bullets) {
//               if (bullet.trim()) {
//                 const insertBulletQuery = `INSERT INTO documentarrbullets (arr_id, bullet) VALUES (?, ?)`;
//                 await new Promise((resolve, reject) => {
//                   db1.query(insertBulletQuery, [sectionResult.insertId, bullet], (err) => {
//                     if (err) reject(new Error(`Bullet insertion failed: ${err.message}`));
//                     else resolve();
//                   });
//                 });
//               }
//             }
//           }
//         }
//       }

//       const checkNgoQuery = "SELECT id FROM ngos WHERE document_id = ?";
//       const ngoResults = await new Promise((resolve, reject) => {
//         db1.query(checkNgoQuery, [id], (err, results) => {
//           if (err) reject(new Error(`NGO check failed: ${err.message}`));
//           else resolve(results);
//         });
//       });

//       if (ngos) {
//         if (ngoResults.length > 0) {
//           const ngoId = ngoResults[0].id;
          
//           const updateNgoQuery = "UPDATE ngos SET intro = ? WHERE id = ?";
//           await new Promise((resolve, reject) => {
//             db1.query(updateNgoQuery, [ngos.intro || null, ngoId], (err) => {
//               if (err) reject(new Error(`NGO update failed: ${err.message}`));
//               else resolve();
//             });
//           });

//           await new Promise((resolve, reject) => {
//             const deleteNgoValuesQuery = `DELETE naf FROM ngosarrof naf INNER JOIN ngosarr na ON naf.ngos_arr_id = na.id WHERE na.ngos_id = ?`;
//             db1.query(deleteNgoValuesQuery, [ngoId], (err) => {
//               if (err) reject(new Error(`NGO values deletion failed: ${err.message}`));
//               else resolve();
//             });
//           });

//           await new Promise((resolve, reject) => {
//             const deleteNgoCategoriesQuery = "DELETE FROM ngosarr WHERE ngos_id = ?";
//             db1.query(deleteNgoCategoriesQuery, [ngoId], (err) => {
//               if (err) reject(new Error(`NGO categories deletion failed: ${err.message}`));
//               else resolve();
//             });
//           });

//           if (ngos.categories && ngos.categories.length > 0) {
//             for (const category of ngos.categories) {
//               const insertCategoryQuery = "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)";
//               const categoryResult = await new Promise((resolve, reject) => {
//                 db1.query(insertCategoryQuery, [ngoId, category.h1 || null], (err, result) => {
//                   if (err) reject(new Error(`NGO category insertion failed: ${err.message}`));
//                   else resolve(result);
//                 });
//               });

//               if (category.values && category.values.length > 0) {
//                 for (const value of category.values) {
//                   if (value.trim()) {
//                     const insertValueQuery = "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)";
//                     await new Promise((resolve, reject) => {
//                       db1.query(insertValueQuery, [categoryResult.insertId, value], (err) => {
//                         if (err) reject(new Error(`NGO value insertion failed: ${err.message}`));
//                         else resolve();
//                       });
//                     });
//                   }
//                 }
//               }
//             }
//           }

//         } else {
//           const insertNgoQuery = "INSERT INTO ngos (document_id, intro) VALUES (?, ?)";
//           const ngoResult = await new Promise((resolve, reject) => {
//             db1.query(insertNgoQuery, [id, ngos.intro || null], (err, result) => {
//               if (err) reject(new Error(`NGO insertion failed: ${err.message}`));
//               else resolve(result);
//             });
//           });

//           if (ngos.categories && ngos.categories.length > 0) {
//             for (const category of ngos.categories) {
//               const insertCategoryQuery = "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)";
//               const categoryResult = await new Promise((resolve, reject) => {
//                 db1.query(insertCategoryQuery, [ngoResult.insertId, category.h1 || null], (err, result) => {
//                   if (err) reject(new Error(`NGO category insertion failed: ${err.message}`));
//                   else resolve(result);
//                 });
//               });

//               if (category.values && category.values.length > 0) {
//                 for (const value of category.values) {
//                   if (value.trim()) {
//                     const insertValueQuery = "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)";
//                     await new Promise((resolve, reject) => {
//                       db1.query(insertValueQuery, [categoryResult.insertId, value], (err) => {
//                         if (err) reject(new Error(`NGO value insertion failed: ${err.message}`));
//                         else resolve();
//                       });
//                     });
//                   }
//                 }
//               }
//             }
//           }
//         }
//       } else {
//         if (ngoResults.length > 0) {
//           const ngoId = ngoResults[0].id;
          
//           await new Promise((resolve, reject) => {
//             const deleteNgoValuesQuery = `DELETE naf FROM ngosarrof naf INNER JOIN ngosarr na ON naf.ngos_arr_id = na.id WHERE na.ngos_id = ?`;
//             db1.query(deleteNgoValuesQuery, [ngoId], (err) => {
//               if (err) reject(new Error(`NGO values deletion failed: ${err.message}`));
//               else resolve();
//             });
//           });

//           await new Promise((resolve, reject) => {
//             const deleteNgoCategoriesQuery = "DELETE FROM ngosarr WHERE ngos_id = ?";
//             db1.query(deleteNgoCategoriesQuery, [ngoId], (err) => {
//               if (err) reject(new Error(`NGO categories deletion failed: ${err.message}`));
//               else resolve();
//             });
//           });

//           await new Promise((resolve, reject) => {
//             const deleteNgoQuery = "DELETE FROM ngos WHERE id = ?";
//             db1.query(deleteNgoQuery, [ngoId], (err) => {
//               if (err) reject(new Error(`NGO deletion failed: ${err.message}`));
//               else resolve();
//             });
//           });
//         }
//       }

//       await new Promise((resolve, reject) => {
//         db1.commit((err) => {
//           if (err) {
//             db1.rollback(() => {
//               reject(new Error(`Transaction commit failed: ${err.message}`));
//             });
//           } else {
//             resolve();
//           }
//         });
//       });

//       res.status(200).json({ 
//         message: "Blog updated successfully",
//         id: id
//       });

//     } catch (error) {
//       db1.rollback(() => {
//         console.error("❌ Transaction rolled back:", error.message);
//         res.status(500).json({ 
//           message: "Failed to update blog",
//           error: error.message 
//         });
//       });
//     }
//   });
// };

// export const deleteBlog = (req, res) => {
//   const id = req.params.id;
//   const query = 'UPDATE document SET deletestatus=1 WHERE id=?';

//   db1.query(query, [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: "could not delete" });
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "Organization not found" });
//     }
//     db1.query('SELECT * FROM document WHERE id=?', [id], async (err1, results) => {
//       if (err1) {
//         return res.status(500).json({ message: "could not delete" });
//       }
//       const get = results[0].image_path;
//       await deleteImageFile(get);
//       return res.status(200).json({ message: "Blog deleted Successfully" });
//     });
//   });
// };

// // Success Story Controllers
// export const getAllSuccessStories = (req, res) => {
//   const query = "SELECT * FROM successstories WHERE deletestatus = 0 ORDER BY id DESC";
  
//   db1.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching success stories:", err);
//       return res.status(500).json({ error: "Failed to fetch success stories" });
//     }
//     res.status(200).json(DtoArr(results));
//   });
// };

// export const createSuccessStory = (req, res) => {
//   const { title, urdu_title, link, youtube_id, description } = req.body;
  
//   if (!title || !youtube_id) {
//     return res.status(400).json({ error: "Title and YouTube ID are required" });
//   }
  
//   const query = `INSERT INTO successstories (title, urdu_title, link, youtube_id, description, deletestatus) VALUES (?, ?, ?, ?, ?, 0)`;
  
//   db1.query(query, [title, urdu_title || null, link || null, youtube_id, description || null], (err, results) => {
//     if (err) {
//       console.error("Error creating success story:", err);
//       return res.status(500).json({ error: "Failed to create success story" });
//     }
    
//     res.status(201).json({
//       id: results.insertId,
//       message: "Success story created successfully"
//     });
//   });
// };

// export const updateSuccessStory = (req, res) => {
//   const { id } = req.params;
//   const { title, urdu_title, link, youtube_id, description } = req.body;
  
//   if (!title || !youtube_id) {
//     return res.status(400).json({ error: "Title and YouTube ID are required" });
//   }
  
//   const query = `UPDATE successstories SET title = ?, urdu_title = ?, link = ?, youtube_id = ?, description = ? WHERE id = ? AND deletestatus = 0`;
  
//   db1.query(query, [title, urdu_title || null, link || null, youtube_id, description || null, id], (err, results) => {
//     if (err) {
//       console.error("Error updating success story:", err);
//       return res.status(500).json({ error: "Failed to update success story" });
//     }
    
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ error: "Success story not found" });
//     }
    
//     res.json({ message: "Success story updated successfully" });
//   });
// };

// export const deleteSuccessStory = (req, res) => {
//   const { id } = req.params;
//   const query = "UPDATE successstories SET deletestatus = 1 WHERE id = ?";
  
//   db1.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error deleting success story:", err);
//       return res.status(500).json({ error: "Failed to delete success story" });
//     }
    
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ error: "Success story not found" });
//     }
    
//     res.json({ message: "Success story deleted successfully" });
//   });
// };

// // Video Controllers
// const saveBase64Image = async (image_base64) => {
//   let imagePath = null;
  
//   if (image_base64) {
//     const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
//     if (matches) {
//       const ext = matches[1].split("/")[1] || "png";
//       const fileName = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
//       const fileBuffer = Buffer.from(matches[2], "base64");
//       imagePath = await uploadToFTP(fileName, fileBuffer);
//     }
//   }
  
//   return imagePath;
// };

// export const getAllVideos = (req, res) => {
//   const query = "SELECT * FROM videos WHERE deletestatus = 0 ORDER BY id DESC";
  
//   db1.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching videos:", err);
//       return res.status(500).json({ error: "Failed to fetch videos" });
//     }
//     res.json(results);
//   });
// };

// export const createVideo = async (req, res) => {
//   const { title, youtube_id, thumbnail, description } = req.body;
  
//   if (!title || !youtube_id || !thumbnail) {
//     return res.status(400).json({ error: "Title, YouTube ID, and thumbnail are required" });
//   }

//   let imagePath = null;
  
//   try {
//     imagePath = await saveBase64Image(thumbnail);
    
//     if (!imagePath) {
//       return res.status(400).json({ error: "Failed to process thumbnail image" });
//     }
//   } catch (error) {
//     console.error("Error saving image:", error);
//     return res.status(500).json({ error: "Failed to save thumbnail image" });
//   }
  
//   const query = `INSERT INTO videos (title, youtube_id, thumbnail, description, deletestatus) VALUES (?, ?, ?, ?, 0)`;
  
//   db1.query(query, [title, youtube_id, imagePath, description || null], (err, results) => {
//     if (err) {
//       console.error("Error creating video:", err);
//       return res.status(500).json({ error: "Failed to create video" });
//     }
    
//     res.status(201).json({
//       id: results.insertId,
//       message: "Video created successfully",
//       thumbnail: imagePath
//     });
//   });
// };

// export const updateVideo = (req, res) => {
//   const { id } = req.params;
//   const { title, youtube_id, thumbnail, description } = req.body;
  
//   if (!title || !youtube_id) {
//     return res.status(400).json({ error: "Title and YouTube ID are required" });
//   }

//   const getQuery = "SELECT thumbnail FROM videos WHERE id = ? AND deletestatus = 0";
  
//   db1.query(getQuery, [id], async (err, results) => {
//     if (err) {
//       console.error("Error fetching video for update:", err);
//       return res.status(500).json({ error: "Failed to fetch video" });
//     }
    
//     if (results.length === 0) {
//       return res.status(404).json({ error: "Video not found" });
//     }

//     const currentVideo = results[0];
//     let imagePath = currentVideo.thumbnail;

//     if (thumbnail && thumbnail.startsWith('data:image')) {
//       try {
//         if (currentVideo.thumbnail) {
//           await deleteImageFile(currentVideo.thumbnail);
//         }
        
//         imagePath = await saveBase64Image(thumbnail);
        
//         if (!imagePath) {
//           return res.status(400).json({ error: "Failed to process thumbnail image" });
//         }
//       } catch (error) {
//         console.error("Error saving image:", error);
//         return res.status(500).json({ error: "Failed to save thumbnail image" });
//       }
//     }
    
//     const updateQuery = `UPDATE videos SET title = ?, youtube_id = ?, thumbnail = ?, description = ? WHERE id = ? AND deletestatus = 0`;
    
//     db1.query(updateQuery, [title, youtube_id, imagePath, description || null, id], (err, results) => {
//       if (err) {
//         console.error("Error updating video:", err);
//         return res.status(500).json({ error: "Failed to update video" });
//       }
      
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ error: "Video not found" });
//       }
      
//       res.json({ 
//         message: "Video updated successfully",
//         thumbnail: imagePath
//       });
//     });
//   });
// };

// export const deleteVideo = (req, res) => {
//   const { id } = req.params;
  
//   const getQuery = "SELECT thumbnail FROM videos WHERE id = ? AND deletestatus = 0";
  
//   db1.query(getQuery, [id], async (err, results) => {
//     if (err) {
//       console.error("Error fetching video for deletion:", err);
//       return res.status(500).json({ error: "Failed to fetch video" });
//     }
    
//     if (results.length === 0) {
//       return res.status(404).json({ error: "Video not found" });
//     }

//     const video = results[0];
//     if (video.thumbnail) {
//       await deleteImageFile(video.thumbnail);
//     }

//     const deleteQuery = "UPDATE videos SET deletestatus = 1 WHERE id = ?";
    
//     db1.query(deleteQuery, [id], (err, results) => {
//       if (err) {
//         console.error("Error deleting video:", err);
//         return res.status(500).json({ error: "Failed to delete video" });
//       }
      
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ error: "Video not found" });
//       }
      
//       res.json({ message: "Video deleted successfully" });
//     });
//   });
// };




// // Change Password Controller
// export const changePassword = async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = req.user.id; // From auth middleware

//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({ error: "Current password and new password are required" });
//   }

//   if (newPassword.length < 6) {
//     return res.status(400).json({ error: "New password must be at least 6 characters long" });
//   }

//   try {
//     // Get user current password from database
//     const getUserQuery = "SELECT password FROM users WHERE id = ?";
    
//     db.query(getUserQuery, [userId], async (err, results) => {
//       if (err) {
//         console.error("Error fetching user:", err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       const user = results[0];

//       // Verify current password
//       const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
//       if (!isCurrentPasswordValid) {
//         return res.status(400).json({ error: "Current password is incorrect" });
//       }

//       // Hash new password
//       const saltRounds = 10;
//       const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

//       // Update password in database
//       const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";
      
//       db.query(updatePasswordQuery, [hashedNewPassword, userId], (updateErr, updateResults) => {
//         if (updateErr) {
//           console.error("Error updating password:", updateErr);
//           return res.status(500).json({ error: "Failed to update password" });
//         }

//         res.status(200).json({ message: "Password changed successfully" });
//       });
//     });
//   } catch (error) {
//     console.error("Change password error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



// Imports are at the top of this file (ESM requires top-level imports)

// Utility Functions
function uniqueImageName(extension = "png") {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${extension}`;
}

const deleteImageFile = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    await deleteFromFTP(imageUrl);
    console.log(`Requested deletion of: ${imageUrl}`);
  } catch (error) {
    console.error('Error deleting image file from FTP:', error);
  }
};

const MEDIA_BASE_URL = (process.env.FTP_BASE_URL || 'https://media.khudii.com').replace(/\/$/, '');
const isUploadedMediaUrl = (value) =>
  typeof value === 'string' && value.startsWith(`${MEDIA_BASE_URL}/`);

// Auth Controllers
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db1.query(query, [email], async (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "6d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete user.password;
    const auth = { auth: true };
    return res.status(200).json({ message: "Login successful", user: { ...user, ...auth } });
  });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};

export const changePassword = async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long" });
  }

  try {
    const [users] = await db1.promise().query(
      "SELECT password FROM users WHERE id = ?",
      [userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, users[0].password);
    if (!valid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db1.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
    );
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};

// Organization Controllers
export const getAllOrganizations = (req, res) => {
  const query = `
    SELECT 
      i.id, 
      i.name,
      i.deletestatus, 
      i.description, 
      i.category, 
      i.introductory_image_path
      FROM items i
  `;

  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching organizations:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map((row) => ({
      id: row.id,
      deletestatus: row.deletestatus,
      name: row.name,
      description: row.description,
      category: row.category,
      introductory_image_path: row.introductory_image_path,
      images: row.images ? [...new Set(row.images.split(","))] : [],
      urls: row.urls ? [...new Set(row.urls.split(","))] : [],
      socials: row.socials || {},
      icons: row.icons || [],
    }));

    res.status(200).json(DtoArr(formatted));
  });
};


// export const createOrganization = async (req, res) => {
//   const {
//     name,
//     description,
//     category, // This is now an array
//     introductory_image_base64,
//     youtube_video_url,
//     slug,
//     search_tags,
//     meta_title,
//     meta_description,
//     meta_keywords,
//     images_base64,
//     socials,
//     icons,
//   } = req.body;

//   const conn = await db1.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     // Validate required fields - category is now an array
//     if (!name || !description || !category || category.length === 0 || !introductory_image_base64 || !slug) {
//       await conn.rollback();
//       conn.release();
//       return res.status(400).json({
//         message: "Missing required fields: name, description, at least one category, introductory_image_base64, and Slug are required"
//       });
//     }

//     // Check if slug already exists
//     const [existingSlug] = await conn.query(
//       `SELECT id FROM items WHERE slug = ? AND deletestatus = 0`,
//       [slug]
//     );

//     if (existingSlug.length > 0) {
//       await conn.rollback();
//       conn.release();
//       return res.status(400).json({
//         message: "Slug already exists. Please choose a different one."
//       });
//     }

//     // 1. Process introductory image first (if exists)
//     const introImagePath = await createProcessIntroImage(introductory_image_base64);

//     // 2. Convert category array to JSON string for database storage
//     const categoryJson = JSON.stringify(category);

//     // 3. Insert main organization record with SEO fields
//     const [result] = await conn.query(
//       `INSERT INTO items 
//        (name, description, category, introductory_image_path, youtube_video_url, slug, meta_title, meta_description, meta_keywords,search_tags) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         name, 
//         description, 
//         categoryJson, // Store as JSON string
//         introImagePath, 
//         youtube_video_url,
//         slug,
//         meta_title || null,
//         meta_description || null,
//         meta_keywords || null,
//         search_tags ||null
//       ]
//     );

//     const itemId = result.insertId;

//     // 4. Process all related data in parallel
//     await Promise.all([
//       createProcessAdditionalImages(conn, itemId, images_base64),
//       createProcessSocials(conn, itemId, socials),
//       createProcessIcons(conn, itemId, icons)
//     ]);

//     await conn.commit();
//     conn.release();
    
//     res.status(201).json({ 
//       message: "✅ Organization created successfully", 
//       id: itemId,
//       slug: slug
//     });
//   } catch (error) {
//     console.error("❌ Organization creation error:", error);
//     await conn.rollback();
//     conn.release();
    
//     // Handle duplicate slug error (if unique constraint exists in database)
//     if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
//       return res.status(400).json({ 
//         message: "Slug already exists. Please choose a different one.",
//         error: "DUPLICATE_SLUG"
//       });
//     }
    
//     res.status(500).json({ 
//       message: "Failed to create organization", 
//       error: error.message 
//     });
//   }
// };

export const createOrganization = async (req, res) => {
  const {
    name,
    description,
    category,
    introductory_image_base64,
    partner_image, // ADDED: partner_image
    youtube_video_url,
    slug,
    search_tags,
    meta_title,
    meta_description,
    meta_keywords,
    images_base64,
    socials,
    icons,
    urls // ADDED: urls array if needed
  } = req.body;

  const conn = await db1.promise().getConnection();

  try {
    await conn.beginTransaction();

    // Validate required fields
    if (!name || !description || !category || category.length === 0 || !introductory_image_base64 || !slug) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "Missing required fields: name, description, at least one category, introductory_image_base64, and Slug are required"
      });
    }

    // Check if slug already exists
    const [existingSlug] = await conn.query(
      `SELECT id FROM items WHERE slug = ? AND deletestatus = 0`,
      [slug]
    );

    if (existingSlug.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "Slug already exists. Please choose a different one."
      });
    }

    // 1. Process introductory image
    const introImagePath = await createProcessIntroImage(introductory_image_base64);

    // 2. Process partner image if provided
    let partnerImagePath = null;
    if (partner_image) {
      // Validate partner image dimensions (300x300)
      // You should add this validation in the createProcessIntroImage function or create a separate one
      partnerImagePath = await createProcessIntroImage(partner_image); // You need to create this function
    }

    // 3. Convert category array to JSON string
    const categoryJson = JSON.stringify(category);

    // 4. Insert main organization record with partner_image
    const [result] = await conn.query(
      `INSERT INTO items 
       (name, description, category, introductory_image_path, partner_image, youtube_video_url, slug, meta_title, meta_description, meta_keywords, search_tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        description, 
        categoryJson,
        introImagePath, 
        partnerImagePath, // ADDED: partner_image
        youtube_video_url,
        slug,
        meta_title || null,
        meta_description || null,
        meta_keywords || null,
        search_tags || null
      ]
    );

    const itemId = result.insertId;

    // 5. Process all related data in parallel
    await Promise.all([
      createProcessAdditionalImages(conn, itemId, images_base64),
      createProcessSocials(conn, itemId, socials),
      createProcessIcons(conn, itemId, icons),
      createProcessUrls(conn, itemId, urls) // ADDED: process URLs if you have this function
    ]);

    await conn.commit();
    conn.release();
    
    res.status(201).json({ 
      message: "✅ Organization created successfully", 
      id: itemId,
      slug: slug
    });
  } catch (error) {
    console.error("❌ Organization creation error:", error);
    await conn.rollback();
    conn.release();
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(400).json({ 
        message: "Slug already exists. Please choose a different one.",
        error: "DUPLICATE_SLUG"
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create organization", 
      error: error.message 
    });
  }
};

// Helper Functions for Create Organization (Unique names)
async function createProcessIntroImage(introductory_image_base64) {
  if (!introductory_image_base64) return null;
  if (isUploadedMediaUrl(introductory_image_base64)) return introductory_image_base64;

  const matches = introductory_image_base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid  image format');
  }

  const ext = matches[1].split("/")[1] || "webp";
  const fileName = uniqueImageName(ext);
  const fileBuffer = Buffer.from(matches[2], "base64");
  
  return await uploadToFTP(fileName, fileBuffer);
}

async function createProcessAdditionalImages(conn, itemId, images_base64) {
  if (!images_base64 || !Array.isArray(images_base64) || images_base64.length === 0) {
    return;
  }

  // Filter and validate base64 images
  const validImages = images_base64.filter(img => 
    typeof img === 'string' && (isUploadedMediaUrl(img) || img.match(/^data:(.+);base64,(.+)$/))
  );

  if (validImages.length === 0) return;

  // Process images in parallel with concurrency control
  const BATCH_SIZE = 3;
  const imageBatches = [];
  
  for (let i = 0; i < validImages.length; i += BATCH_SIZE) {
    imageBatches.push(validImages.slice(i, i + BATCH_SIZE));
  }

  for (const batch of imageBatches) {
    const imageUploadPromises = batch.map(imgBase64 => 
      createUploadSingleImage(imgBase64)
    );

    const uploadedUrls = await Promise.all(imageUploadPromises);
    
    // Batch insert all images from this batch
    if (uploadedUrls.length > 0) {
      const values = uploadedUrls.map(url => [itemId, url]);
      await conn.query(
        "INSERT INTO item_images (item_id, image_path) VALUES ?",
        [values]
      );
    }
  }
}

async function createUploadSingleImage(imageBase64) {
  if (isUploadedMediaUrl(imageBase64)) return imageBase64;
  const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image format');
  }

  const ext = matches[1].split("/")[1] || "png";
  const fileName = uniqueImageName(ext);
  const fileBuffer = Buffer.from(matches[2], "base64");
  
  return await uploadToFTP(fileName, fileBuffer);
}

async function createProcessUrls(conn, itemId, urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return;
  }

  const validUrls = urls
    .filter(u => u && typeof u === 'string' && u.trim())
    .map(u => u.trim());

  if (validUrls.length === 0) return;

  // Batch insert all URLs
  const values = validUrls.map(u => [itemId, JSON.stringify([u])]);
  await conn.query(
    "INSERT INTO item_urls (item_id, urls) VALUES ?",
    [values]
  );
}

async function createProcessSocials(conn, itemId, socials) {
  if (!socials || typeof socials !== 'object') {
    return;
  }

  // Check if we have at least one non-empty social value
  const hasValidSocials = Object.values(socials).some(val => 
    val !== null && val !== undefined && val !== ''
  );

  if (hasValidSocials) {
    await conn.query(
      "INSERT INTO socials (item_id, phone, facebook, twitter, instagram, location, googlemap, Mobile_number,website,youtubechannel,email,linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        itemId,
        socials.phone || null,
        socials.facebook || null,
        socials.twitter || null,
        socials.instagram || null,
        socials.location || null,
        socials.googlemap || "",
        socials.mobile || null,
        socials.website || null,
        socials.youtubechannel || null,
        socials.email || null,
        socials.linkedin || null
      ]
    );
  }
}

async function createProcessIcons(conn, itemId, icons) {
  if (!icons || !Array.isArray(icons) || icons.length === 0) {
    return;
  }

  const validIcons = icons.filter(icon => 
    icon && 
    icon.name && typeof icon.name === 'string' && icon.name.trim() &&
    icon.svg && typeof icon.svg === 'string' && icon.svg.trim()
  );

  if (validIcons.length === 0) return;

  // Batch insert all icons
  const values = validIcons.map(icon => [
    itemId, 
    icon.name.trim(), 
    icon.svg.trim(), 
    icon.qty || 0
  ]);

  await conn.query(
    "INSERT INTO icons (item_id, name, svg, qty) VALUES ?",
    [values]
  );
}

export const getOrganizationById = (req, res) => {
  const { id } = req.params;

  const getItemQuery = "SELECT * FROM items WHERE id = ?";
  db1.query(getItemQuery, [id], (err, itemResults) => {
    if (err) {
      console.error("❌ Error fetching organization:", err);
      return res.status(500).json({ message: "Failed to fetch organization" });
    }

    if (itemResults.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const organization = itemResults[0];
    if (organization.deletestatus === 1) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const getImagesQuery = "SELECT image_path FROM item_images WHERE item_id = ?";
    db1.query(getImagesQuery, [id], (err, imageResults) => {
      if (err) {
        console.error("Error fetching images:", err);
        return res.status(500).json({ message: "Failed to fetch images" });
      }

      const getUrlsQuery = "SELECT urls FROM item_urls WHERE item_id = ?";
      db1.query(getUrlsQuery, [id], (err, urlResults) => {
        if (err) {
          console.error("Error fetching URLs:", err);
          return res.status(500).json({ message: "Failed to fetch URLs" });
        }

        // let urls1 = [];
        // for (let i = 0; i < urlResults.length; i++) {
        //   urls1 = [...urls1, ...urlResults[i].urls];
        // }
    
        const urls = []
        
        const getSocialsQuery = "SELECT * FROM socials WHERE item_id = ?";
        db1.query(getSocialsQuery, [id], (err, socialResults) => {
          if (err) {
            console.error("Error fetching socials:", err);
            return res.status(500).json({ message: "Failed to fetch socials" });
          }

          const getIconsQuery = "SELECT * FROM icons WHERE item_id = ?";
          db1.query(getIconsQuery, [id], (err, iconResults) => {
            if (err) {
              console.error("Error fetching icons:", err);
              return res.status(500).json({ message: "Failed to fetch icons" });
            }

            const response = {
              ...organization,
              // Include SEO fields in the response
              slug: organization.slug || "",
              meta_title: organization.meta_title || "",
              meta_description: organization.meta_description || "",
              meta_keywords: organization.meta_keywords || "",
              images: imageResults.map((img) => img.image_path),
              urls,
              socials: socialResults.length > 0 ? {
                phone: socialResults[0].phone,
                facebook: socialResults[0].facebook,
                twitter: socialResults[0].twitter,
                instagram: socialResults[0].instagram,
                location: socialResults[0].location,
                googlemap: socialResults[0].googlemap,
                mobile: socialResults[0].Mobile_number,
                website:socialResults[0].website,
                youtubechannel:socialResults[0].youtubechannel,
                email:socialResults[0].email,
                linkedin:socialResults[0].linkedin
              } : {},
              icons: iconResults.map((icon) => ({
                name: icon.name,
                svg: icon.svg,
                qty: icon.qty,
              })),
            };

            res.status(200).json(response);
          });
        });
      });
    });
  });
};








// export const updateOrganization = async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     description,
//     category, // This is now an array
//     introductory_image_base64,
//     youtube_video_url,
//     slug,
//     search_tags,
//     meta_title,
//     meta_description,
//     meta_keywords,
//     images_base64,
//     urls,
//     socials,
//     icons,
//   } = req.body;

//   const conn = await db1.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     // 1. Check if organization exists first and get current slug
//     const [rows] = await conn.query("SELECT id, introductory_image_path, slug FROM items WHERE id = ?", [id]);
//     if (rows.length === 0) {
//       conn.release();
//       return res.status(404).json({ message: "Organization not found" });
//     }

//     // 2. Check if slug is being changed and if new slug already exists (excluding current organization)
//   if (slug && slug !== rows[0].slug) {
//   const [existingSlug] = await conn.query(
//     "SELECT id FROM items WHERE slug = ? AND id != ? AND deletestatus = 0",
//     [slug, id]
//   );


//       if (existingSlug.length > 0) {
//         await conn.rollback();
//         conn.release();
//         return res.status(400).json({
//           message: "slug already exists. Please choose a different one.",
//           error: "DUPLICATE_SLUG"
//         });
//       }
//     }

//     let introImagePath = rows[0].introductory_image_path;

//     // 3. Process introductory image only if provided and valid
//     if (introductory_image_base64) {
//       introImagePath = await processSingleImage(introductory_image_base64, introImagePath);
//     }

//     // 4. Convert category array to JSON string for database storage
//     const categoryJson = JSON.stringify(category);

//     // 5. Update main item with SEO fields in single query
//     await conn.query(
//       `UPDATE items SET 
//         name = ?, 
//         description = ?, 
//         category = ?, 
//         introductory_image_path = ?, 
//         youtube_video_url = ?,
//         slug = ?,
//         meta_title = ?,
//         meta_description = ?,
//         meta_keywords = ?,
//         search_tags = ?
//        WHERE id = ?`,
//       [
//         name, 
//         description, 
//         categoryJson, // Store as JSON string
//         introImagePath, 
//         youtube_video_url,
//         slug || null,
//         meta_title || null,
//         meta_description || null,
//         meta_keywords || null,
//         search_tags || null,
//         id
//       ]
//     );

//     // 6. Process all operations in parallel where possible
//     await Promise.all([
//       processAdditionalImages(conn, id, images_base64),
//       processUrls(conn, id, urls),
//       processSocials(conn, id, socials),
//       processIcons(conn, id, icons)
//     ]);

//     await conn.commit();
//     conn.release();
    
//     res.json({ 
//       message: "✅ Organization updated successfully", 
//       id,
//       slug: slug 
//     });
//   } catch (error) {
//     console.error("❌ Transaction error:", error);
//     await conn.rollback();
//     conn.release();
    
//     // Handle duplicate slug error (if unique constraint exists in database)
//     if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
//       return res.status(400).json({ 
//         message: "Slug already exists. Please choose a different one.",
//         error: "DUPLICATE_SLUG"
//       });
//     }
    
//     res.status(500).json({ 
//       message: "Failed to update organization", 
//       error: error.message 
//     });
//   }
// };



export const updateOrganization = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    introductory_image_base64,
    partner_image, // ADDED: partner_image field
    youtube_video_url,
    slug,
    search_tags,
    meta_title,
    meta_description,
    meta_keywords,
    images_base64,
    urls,
    socials,
    icons,
  } = req.body;

  const conn = await db1.promise().getConnection();

  try {
    await conn.beginTransaction();

    // 1. Check if organization exists first and get current slug and partner_image
    const [rows] = await conn.query("SELECT id, introductory_image_path, partner_image, slug FROM items WHERE id = ?", [id]);
    if (rows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "Organization not found" });
    }

    // 2. Check if slug is being changed and if new slug already exists (excluding current organization)
    if (slug && slug !== rows[0].slug) {
      const [existingSlug] = await conn.query(
        "SELECT id FROM items WHERE slug = ? AND id != ? AND deletestatus = 0",
        [slug, id]
      );

      if (existingSlug.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: "slug already exists. Please choose a different one.",
          error: "DUPLICATE_SLUG"
        });
      }
    }

    let introImagePath = rows[0].introductory_image_path;
    let partnerImagePath = rows[0].partner_image; // Get current partner image

    // 3. Process introductory image only if provided and valid
    if (introductory_image_base64) {
      introImagePath = await processSingleImage(introductory_image_base64, introImagePath);
    }

    // 4. Process partner image if provided
    if (partner_image !== undefined) { // Check if partner_image field is sent (could be empty string to remove)
      if (partner_image) {
        // New partner image provided - process it
        partnerImagePath = await processSingleImage(partner_image, partnerImagePath);
      } else if (partner_image === "" && partnerImagePath) {
        // Empty string means remove existing partner image
        await deleteImageFile(partnerImagePath); // Helper function to delete file
        partnerImagePath = null;
      }
      // If partner_image is undefined, keep the existing one
    }

    // 5. Convert category array to JSON string for database storage
    const categoryJson = JSON.stringify(category);

    // 6. Update main item with partner_image and SEO fields
    await conn.query(
      `UPDATE items SET 
        name = ?, 
        description = ?, 
        category = ?, 
        introductory_image_path = ?, 
        partner_image = ?, 
        youtube_video_url = ?,
        slug = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        search_tags = ?
       WHERE id = ?`,
      [
        name, 
        description, 
        categoryJson,
        introImagePath, 
        partnerImagePath, // ADDED: partner_image
        youtube_video_url,
        slug || null,
        meta_title || null,
        meta_description || null,
        meta_keywords || null,
        search_tags || null,
        id
      ]
    );

    // 7. Process all operations in parallel where possible
    await Promise.all([
      processAdditionalImages(conn, id, images_base64),
      processUrls(conn, id, urls),
      processSocials(conn, id, socials),
      processIcons(conn, id, icons)
    ]);

    await conn.commit();
    conn.release();
    
    res.json({ 
      message: "✅ Organization updated successfully", 
      id,
      slug: slug 
    });
  } catch (error) {
    console.error("❌ Transaction error:", error);
    await conn.rollback();
    conn.release();
    
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(400).json({ 
        message: "Slug already exists. Please choose a different one.",
        error: "DUPLICATE_SLUG"
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update organization", 
      error: error.message 
    });
  }
};


// Helper functions for parallel processing
async function processSingleImage(imageBase64, existingImagePath) {
  if (isUploadedMediaUrl(imageBase64)) {
    if (existingImagePath && existingImagePath !== imageBase64) await deleteImageFile(existingImagePath);
    return imageBase64;
  }
  const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return existingImagePath;

  const ext = matches[1].split("/")[1] || "png";
  const fileName = uniqueImageName(ext);
  const fileBuffer = Buffer.from(matches[2], "base64");
  
  // Delete old image only after successful upload
  const uploadedUrl = await uploadToFTP(fileName, fileBuffer);
  
  if (existingImagePath) {
    try {
      await deleteImageFile(existingImagePath);
    } catch (deleteError) {
      console.warn("Failed to delete old image:", deleteError);
    }
  }
  
  return uploadedUrl;
}

async function processAdditionalImages(conn, itemId, imagesBase64) {
  if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
    return;
  }

  // Filter valid base64 images first
  const validImages = imagesBase64.filter(img => 
    typeof img === 'string' && (isUploadedMediaUrl(img) || img.match(/^data:(.+);base64,(.+)$/))
  );

  if (validImages.length === 0) return;

  // Process images in parallel with limit to avoid overloading
  const imageUploadPromises = validImages.map(imgBase64 => 
    processSingleImage(imgBase64, null)
  );

  const uploadedUrls = await Promise.all(imageUploadPromises);

  // Batch insert all images in single query
  if (uploadedUrls.length > 0) {
    const values = uploadedUrls.map(url => [itemId, url]);
    await conn.query(
      "INSERT INTO item_images (item_id, image_path) VALUES ?",
      [values]
    );
  }
}

async function processUrls(conn, itemId, urls) {
  await conn.query("DELETE FROM item_urls WHERE item_id = ?", [itemId]);
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return;
  }

  const validUrls = urls.filter(u => u && typeof u === 'string' && u.trim());
  if (validUrls.length === 0) return;

  const values = validUrls.map(u => [itemId, JSON.stringify([u.trim()])]);
  await conn.query(
    "INSERT INTO item_urls (item_id, urls) VALUES ?",
    [values]
  );
}

async function processSocials(conn, itemId, socials) {
  await conn.query("DELETE FROM socials WHERE item_id = ?", [itemId]);
  
  if (!socials || typeof socials !== 'object') {
    return;
  }

  // Validate socials has at least one non-null value
  const hasValidSocials = Object.values(socials).some(val => 
    val !== null && val !== undefined && val !== ''
  );

  if (hasValidSocials) {
    await conn.query(
      "INSERT INTO socials (item_id, phone, facebook, twitter, instagram, location, googlemap, Mobile_number,website,youtubechannel,email,linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        itemId,
        socials.phone || null,
        socials.facebook || null,
        socials.twitter || null,
        socials.instagram || null,
        socials.location || null,
        socials.googlemap || "",
        socials.mobile || null,
        socials.website || null,
        socials.youtubechannel || null,
        socials.email || null,
        socials.linkedin || null
      ]
    );
  }
}

async function processIcons(conn, itemId, icons) {
  await conn.query("DELETE FROM icons WHERE item_id = ?", [itemId]);
  
  if (!icons || !Array.isArray(icons) || icons.length === 0) {
    return;
  }

  const validIcons = icons.filter(icon => 
    icon && 
    icon.name && typeof icon.name === 'string' && icon.name.trim() &&
    icon.svg && typeof icon.svg === 'string' && icon.svg.trim()
  );

  if (validIcons.length === 0) return;

  const values = validIcons.map(icon => [
    itemId, 
    icon.name.trim(), 
    icon.svg.trim(), 
    icon.qty || 0
  ]);

  await conn.query(
    "INSERT INTO icons (item_id, name, svg, qty) VALUES ?",
    [values]
  );
}


export const deleteOrganizationImage = async (req, res) => {
  const { id } = req.params;
  const { imagePath } = req.body;

  const deleteQuery = "DELETE FROM item_images WHERE item_id = ? AND image_path = ?";
  db1.query(deleteQuery, [id, imagePath], async (err, result) => {
    if (err) {
      console.error("Error deleting image from database:", err);
      return res.status(500).json({ message: "Failed to delete image" });
    }
    await deleteImageFile(imagePath);
    res.json({ message: "Image deleted successfully" });
  });
};

export const softDeleteOrganization = (req, res) => {
  const { id } = req.params;

  const query = "UPDATE items SET deletestatus = 1 WHERE id = ?";
  db1.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error soft deleting organization:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({ message: "✅ Organization soft deleted successfully" });
  });
};

// Blog Controllers
export const getAllDocuments = (req, res) => {
  const sql = "SELECT * FROM document";
  db1.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching documents:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(DtoArr(results));
  });
};

export const getBlogById = (req, res) => {
  const { id } = req.params;

  const documentQuery = "SELECT * FROM document WHERE id = ?";
  db1.query(documentQuery, [id], (err, documentResults) => {
    if (err) {
      console.error("❌ Error fetching document:", err);
      return res.status(500).json({ message: "Failed to fetch document" });
    }

    if (documentResults.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = documentResults[0];
    if (document.deletestatus === 1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const sectionsQuery = `SELECT da.* FROM documentarr da WHERE da.document_id = ? ORDER BY da.id ASC`;
    db1.query(sectionsQuery, [id], (err, sectionsResults) => {
      if (err) {
        console.error("❌ Error fetching document sections:", err);
        return res.status(500).json({ message: "Failed to fetch document sections" });
      }

      const sectionsWithBullets = [];
      let processedSections = 0;

      if (sectionsResults.length === 0) {
        return res.json({
          ...document,
          sections: [],
          ngos: null
        });
      }

      sectionsResults.forEach((section, index) => {
        const bulletsQuery = `SELECT dab.bullet FROM documentarrbullets dab WHERE dab.arr_id = ? ORDER BY dab.id ASC`;
        
        db1.query(bulletsQuery, [section.id], (err, bulletsResults) => {
          if (err) {
            console.error("❌ Error fetching bullets:", err);
            return res.status(500).json({ message: "Failed to fetch bullets" });
          }

          sectionsWithBullets.push({
            ...section,
            bullets: bulletsResults.map(b => b.bullet)
          });

          processedSections++;

          if (processedSections === sectionsResults.length) {
            const ngoQuery = "SELECT * FROM ngos WHERE document_id = ?";
            db1.query(ngoQuery, [id], (err, ngoResults) => {
              if (err) {
                console.error("❌ Error fetching NGO:", err);
                return res.status(500).json({ message: "Failed to fetch NGO data" });
              }

              if (ngoResults.length === 0) {
                return res.json({
                  ...document,
                  sections: sectionsWithBullets,
                  ngos: { categories: [] }
                });
              }

              const ngo = ngoResults[0];
              const ngoCategoriesQuery = `SELECT na.* FROM ngosarr na WHERE na.ngos_id = ? ORDER BY na.id ASC`;
              db1.query(ngoCategoriesQuery, [ngo.id], (err, categoriesResults) => {
                if (err) {
                  console.error("❌ Error fetching NGO categories:", err);
                  return res.status(500).json({ message: "Failed to fetch NGO categories" });
                }

                const categoriesWithValues = [];
                let processedCategories = 0;

                if (categoriesResults.length === 0) {
                  return res.json({
                    ...document,
                    sections: sectionsWithBullets,
                    ngos: { ...ngo, categories: [] }
                  });
                }

                categoriesResults.forEach((category, index) => {
                  const ngoValuesQuery = `SELECT naf.value FROM ngosarrof naf WHERE naf.ngos_arr_id = ? ORDER BY naf.id ASC`;
                  
                  db1.query(ngoValuesQuery, [category.id], (err, valuesResults) => {
                    if (err) {
                      console.error("❌ Error fetching NGO values:", err);
                      return res.status(500).json({ message: "Failed to fetch NGO values" });
                    }

                    categoriesWithValues.push({
                      ...category,
                      values: valuesResults.map(v => v.value)
                    });

                    processedCategories++;

                    if (processedCategories === categoriesResults.length) {
                      res.json({
                        ...document,
                        sections: sectionsWithBullets,
                        ngos: {
                          ...ngo,
                          categories: categoriesWithValues
                        }
                      });
                    }
                  });
                });
              });
            });
          }
        });
      });
    });
  });
};

export const createBlog = async (req, res) => {
  const {
    Name,
    intro,
    conclusion,
    image_base64,
    slug,
    meta_title,
    meta_description,
    meta_keywords,
    sections,
    ngos
  } = req.body;

  const conn = await db1.promise().getConnection();

  try {
    await conn.beginTransaction();

    // Validate required fields
    if (!Name || !intro || !slug) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "Missing required fields: Name, intro, and Slug are required"
      });
    }

    // Check if slug already exists
    const [existingSlug] = await conn.query(
      `SELECT id FROM document WHERE slug = ?`,
      [slug]
    );

    if (existingSlug.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "Slug already exists. Please choose a different one."
      });
    }

    let imagePath = null;
    if (image_base64) {
      if (isUploadedMediaUrl(image_base64)) {
        imagePath = image_base64;
      } else {
        const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1].split("/")[1] || "png";
          const fileName = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
          const fileBuffer = Buffer.from(matches[2], "base64");
          imagePath = await uploadToFTP(fileName, fileBuffer);
        }
      }
    }

    // Insert main document with SEO fields
    const [documentResult] = await conn.query(
      `INSERT INTO document 
       (Name, intro, conclusion, image_path, slug, meta_title, meta_description, meta_keywords) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Name, 
        intro, 
        conclusion, 
        imagePath,
        slug,
        meta_title || null,
        meta_description || null,
        meta_keywords || null
      ]
    );

    const documentId = documentResult.insertId;

    // Process sections (documentarr)
    if (sections && sections.length > 0) {
      for (const section of sections) {
        const [sectionResult] = await conn.query(
          `INSERT INTO documentarr (document_id, heading, start, bullet_header, end) VALUES (?, ?, ?, ?, ?)`,
          [
            documentId,
            section.heading || null,
            section.start || null,
            section.bullet_header || null,
            section.end || null
          ]
        );

        // Process bullets for each section
        if (section.bullets && section.bullets.length > 0) {
          for (const bullet of section.bullets) {
            if (bullet && bullet.trim()) {
              await conn.query(
                `INSERT INTO documentarrbullets (arr_id, bullet) VALUES (?, ?)`,
                [sectionResult.insertId, bullet]
              );
            }
          }
        }
      }
    }

    // Process NGO data
    if (ngos && (ngos.intro || (ngos.categories && ngos.categories.length > 0))) {
      const [ngoResult] = await conn.query(
        "INSERT INTO ngos (document_id, intro) VALUES (?, ?)",
        [documentId, ngos.intro || null]
      );

      const ngoId = ngoResult.insertId;

      // Process NGO categories
      if (ngos.categories && ngos.categories.length > 0) {
        for (const category of ngos.categories) {
          if (category.h1 || (category.values && category.values.length > 0)) {
            const [categoryResult] = await conn.query(
              "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)",
              [ngoId, category.h1 || null]
            );

            // Process category values
            if (category.values && category.values.length > 0) {
              for (const value of category.values) {
                if (value && value.trim()) {
                  await conn.query(
                    "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)",
                    [categoryResult.insertId, value]
                  );
                }
              }
            }
          }
        }
      }
    }

    await conn.commit();
    conn.release();
    
    res.status(201).json({ 
      message: "✅ Blog created successfully",
      id: documentId,
      slug: slug
    });

  } catch (error) {
    await conn.rollback();
    conn.release();
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(400).json({ 
        message: "Slug already exists. Please choose a different one.",
        error: "DUPLICATE_SLUG"
      });
    }
    
    console.error("❌ Transaction rolled back:", error.message);
    res.status(500).json({ 
      message: "Failed to create blog",
      error: error.message 
    });
  }
};

export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const {
    Name,
    intro,
    conclusion,
    image_base64,
    slug,
    meta_title,
    meta_description,
    meta_keywords,
    sections,
    ngos
  } = req.body;

  const conn = await db1.promise().getConnection();

  try {
    await conn.beginTransaction();

    // Get current document to check for existing image and slug
    const [currentDoc] = await conn.query('SELECT * FROM document WHERE id = ?', [id]);
    
    if (currentDoc.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if slug is being changed and if new slug already exists (excluding current blog)
    if (slug && slug !== currentDoc[0].slug) {
      const [existingSlug] = await conn.query(
        "SELECT id FROM document WHERE slug = ? AND id != ?",
        [slug, id]
      );

      if (existingSlug.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: "Slug already exists. Please choose a different one.",
          error: "DUPLICATE_SLUG"
        });
      }
    }

    let imagePath = currentDoc[0].image_path;
    
    if (image_base64) {
      let uploadedUrl = null;
      if (isUploadedMediaUrl(image_base64)) {
        uploadedUrl = image_base64;
      } else {
        const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1].split("/")[1] || "png";
          const fileName = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
          const fileBuffer = Buffer.from(matches[2], "base64");
          uploadedUrl = await uploadToFTP(fileName, fileBuffer);
        }
      }
      if (uploadedUrl) {
        if (imagePath && imagePath !== uploadedUrl) await deleteImageFile(imagePath);
        imagePath = uploadedUrl;
      }
    }

    // Update document with SEO fields
    if (imagePath) {
      await conn.query(
        `UPDATE document SET 
         Name = ?, intro = ?, conclusion = ?, image_path = ?, 
         slug = ?, meta_title = ?, meta_description = ?, meta_keywords = ? 
         WHERE id = ?`,
        [
          Name, 
          intro, 
          conclusion, 
          imagePath,
          slug || null,
          meta_title || null,
          meta_description || null,
          meta_keywords || null,
          id
        ]
      );
    } else {
      await conn.query(
        `UPDATE document SET 
         Name = ?, intro = ?, conclusion = ?, 
         slug = ?, meta_title = ?, meta_description = ?, meta_keywords = ? 
         WHERE id = ?`,
        [
          Name, 
          intro, 
          conclusion,
          slug || null,
          meta_title || null,
          meta_description || null,
          meta_keywords || null,
          id
        ]
      );
    }

    // Delete existing sections and bullets
    await conn.query(`DELETE dab FROM documentarrbullets dab INNER JOIN documentarr da ON dab.arr_id = da.id WHERE da.document_id = ?`, [id]);
    await conn.query("DELETE FROM documentarr WHERE document_id = ?", [id]);

    // Insert new sections and bullets
    if (sections && sections.length > 0) {
      for (const section of sections) {
        const [sectionResult] = await conn.query(
          `INSERT INTO documentarr (document_id, heading, start, bullet_header, end) VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            section.heading || null,
            section.start || null,
            section.bullet_header || null,
            section.end || null
          ]
        );

        if (section.bullets && section.bullets.length > 0) {
          for (const bullet of section.bullets) {
            if (bullet.trim()) {
              await conn.query(
                `INSERT INTO documentarrbullets (arr_id, bullet) VALUES (?, ?)`,
                [sectionResult.insertId, bullet]
              );
            }
          }
        }
      }
    }

    // Handle NGO data
    const [ngoResults] = await conn.query("SELECT id FROM ngos WHERE document_id = ?", [id]);

    if (ngos) {
      if (ngoResults.length > 0) {
        const ngoId = ngoResults[0].id;
        
        await conn.query("UPDATE ngos SET intro = ? WHERE id = ?", [ngos.intro || null, ngoId]);

        // Delete existing NGO categories and values
        await conn.query(`DELETE naf FROM ngosarrof naf INNER JOIN ngosarr na ON naf.ngos_arr_id = na.id WHERE na.ngos_id = ?`, [ngoId]);
        await conn.query("DELETE FROM ngosarr WHERE ngos_id = ?", [ngoId]);

        // Insert new NGO categories and values
        if (ngos.categories && ngos.categories.length > 0) {
          for (const category of ngos.categories) {
            const [categoryResult] = await conn.query(
              "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)",
              [ngoId, category.h1 || null]
            );

            if (category.values && category.values.length > 0) {
              for (const value of category.values) {
                if (value.trim()) {
                  await conn.query(
                    "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)",
                    [categoryResult.insertId, value]
                  );
                }
              }
            }
          }
        }

      } else {
        const [ngoResult] = await conn.query(
          "INSERT INTO ngos (document_id, intro) VALUES (?, ?)",
          [id, ngos.intro || null]
        );

        const ngoId = ngoResult.insertId;

        if (ngos.categories && ngos.categories.length > 0) {
          for (const category of ngos.categories) {
            const [categoryResult] = await conn.query(
              "INSERT INTO ngosarr (ngos_id, h1) VALUES (?, ?)",
              [ngoId, category.h1 || null]
            );

            if (category.values && category.values.length > 0) {
              for (const value of category.values) {
                if (value.trim()) {
                  await conn.query(
                    "INSERT INTO ngosarrof (ngos_arr_id, value) VALUES (?, ?)",
                    [categoryResult.insertId, value]
                  );
                }
              }
            }
          }
        }
      }
    } else {
      // If no NGO data provided, delete existing NGO data
      if (ngoResults.length > 0) {
        const ngoId = ngoResults[0].id;
        
        await conn.query(`DELETE naf FROM ngosarrof naf INNER JOIN ngosarr na ON naf.ngos_arr_id = na.id WHERE na.ngos_id = ?`, [ngoId]);
        await conn.query("DELETE FROM ngosarr WHERE ngos_id = ?", [ngoId]);
        await conn.query("DELETE FROM ngos WHERE id = ?", [ngoId]);
      }
    }

    await conn.commit();
    conn.release();

    res.status(200).json({ 
      message: "✅ Blog updated successfully",
      id: id,
      slug: slug
    });

  } catch (error) {
    await conn.rollback();
    conn.release();
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(400).json({ 
        message: "Slug already exists. Please choose a different one.",
        error: "DUPLICATE_SLUG"
      });
    }
    
    console.error("❌ Transaction rolled back:", error.message);
    res.status(500).json({ 
      message: "Failed to update blog",
      error: error.message 
    });
  }
};
export const deleteBlog = (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE document SET deletestatus=1 WHERE id=?';

  db1.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "could not delete" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }
    db1.query('SELECT * FROM document WHERE id=?', [id], async (err1, results) => {
      if (err1) {
        return res.status(500).json({ message: "could not delete" });
      }
      const get = results[0].image_path;
      await deleteImageFile(get);
      return res.status(200).json({ message: "Blog deleted Successfully" });
    });
  });
};

// Success Story Controllers
export const getAllSuccessStories = (req, res) => {
  const query = "SELECT * FROM successstories WHERE deletestatus = 0 ORDER BY id DESC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching success stories:", err);
      return res.status(500).json({ error: "Failed to fetch success stories" });
    }
    res.status(200).json(DtoArr(results));
  });
};

export const createSuccessStory = (req, res) => {
  const { title, urdu_title, link, youtube_id, description,slug } = req.body;
  
  if (!title || !youtube_id) {
    return res.status(400).json({ error: "Title and YouTube ID are required" });
  }
  
  const query = `INSERT INTO successstories (title, urdu_title, link, youtube_id, description, deletestatus,slug) VALUES (?, ?, ?, ?, ?, 0, ?)`;
  
  db1.query(query, [title, urdu_title || null, link || null, youtube_id, description || null,slug || null], (err, results) => {
    if (err) {
      console.error("Error creating success story:", err);
      return res.status(500).json({ error: "Failed to create success story" });
    }
    
    res.status(201).json({
      id: results.insertId,
      message: "Success story created successfully"
    });
  });
};

export const updateSuccessStory = (req, res) => {
  const { id } = req.params;
  const { title, urdu_title, link, youtube_id, description,slug } = req.body;
  
  if (!title || !youtube_id) {
    return res.status(400).json({ error: "Title and YouTube ID are required" });
  }
  
  const query = `UPDATE successstories SET title = ?, urdu_title = ?, link = ?, youtube_id = ?, description = ?, slug =? WHERE id = ? AND deletestatus = 0`;
  
  db1.query(query, [title, urdu_title || null, link || null, youtube_id, description || null,slug || null, id], (err, results) => {
    if (err) {
      console.error("Error updating success story:", err);
      return res.status(500).json({ error: "Failed to update success story" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Success story not found" });
    }
    
    res.json({ message: "Success story updated successfully" });
  });
};

export const deleteSuccessStory = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE successstories SET deletestatus = 1 WHERE id = ?";
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting success story:", err);
      return res.status(500).json({ error: "Failed to delete success story" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Success story not found" });
    }
    
    res.json({ message: "Success story deleted successfully" });
  });
};

// Video Controllers
const saveBase64Image = async (image_base64) => {
  let imagePath = null;
  if (isUploadedMediaUrl(image_base64)) return image_base64;
  
  if (image_base64) {
    const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1].split("/")[1] || "png";
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const fileBuffer = Buffer.from(matches[2], "base64");
      imagePath = await uploadToFTP(fileName, fileBuffer);
    }
  }
  
  return imagePath;
};

export const getAllVideos = (req, res) => {
  const query = "SELECT * FROM videos WHERE deletestatus = 0 ORDER BY id DESC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching videos:", err);
      return res.status(500).json({ error: "Failed to fetch videos" });
    }
    res.json(results);
  });
};

export const createVideo = async (req, res) => {
  const { title, youtube_id, thumbnail, description } = req.body;
  
  if (!title || !youtube_id || !thumbnail) {
    return res.status(400).json({ error: "Title, YouTube ID, and thumbnail are required" });
  }

  let imagePath = null;
  
  try {
    imagePath = await saveBase64Image(thumbnail);
    
    if (!imagePath) {
      return res.status(400).json({ error: "Failed to process thumbnail image" });
    }
  } catch (error) {
    console.error("Error saving image:", error);
    return res.status(500).json({ error: "Failed to save thumbnail image" });
  }
  
  const query = `INSERT INTO videos (title, youtube_id, thumbnail, description, deletestatus) VALUES (?, ?, ?, ?, 0)`;
  
  db1.query(query, [title, youtube_id, imagePath, description || null], (err, results) => {
    if (err) {
      console.error("Error creating video:", err);
      return res.status(500).json({ error: "Failed to create video" });
    }
    
    res.status(201).json({
      id: results.insertId,
      message: "Video created successfully",
      thumbnail: imagePath
    });
  });
};

export const updateVideo = (req, res) => {
  const { id } = req.params;
  const { title, youtube_id, thumbnail, description } = req.body;
  
  if (!title || !youtube_id) {
    return res.status(400).json({ error: "Title and YouTube ID are required" });
  }

  const getQuery = "SELECT thumbnail FROM videos WHERE id = ? AND deletestatus = 0";
  
  db1.query(getQuery, [id], async (err, results) => {
    if (err) {
      console.error("Error fetching video for update:", err);
      return res.status(500).json({ error: "Failed to fetch video" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const currentVideo = results[0];
    let imagePath = currentVideo.thumbnail;

    if (thumbnail && (thumbnail.startsWith('data:image') || isUploadedMediaUrl(thumbnail))) {
      try {
        if (currentVideo.thumbnail && currentVideo.thumbnail !== thumbnail) {
          await deleteImageFile(currentVideo.thumbnail);
        }
        
        imagePath = await saveBase64Image(thumbnail);
        
        if (!imagePath) {
          return res.status(400).json({ error: "Failed to process thumbnail image" });
        }
      } catch (error) {
        console.error("Error saving image:", error);
        return res.status(500).json({ error: "Failed to save thumbnail image" });
      }
    }
    
    const updateQuery = `UPDATE videos SET title = ?, youtube_id = ?, thumbnail = ?, description = ? WHERE id = ? AND deletestatus = 0`;
    
    db1.query(updateQuery, [title, youtube_id, imagePath, description || null, id], (err, results) => {
      if (err) {
        console.error("Error updating video:", err);
        return res.status(500).json({ error: "Failed to update video" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      res.json({ 
        message: "Video updated successfully",
        thumbnail: imagePath
      });
    });
  });
};

export const deleteVideo = (req, res) => {
  const { id } = req.params;
  
  const getQuery = "SELECT thumbnail FROM videos WHERE id = ? AND deletestatus = 0";
  
  db1.query(getQuery, [id], async (err, results) => {
    if (err) {
      console.error("Error fetching video for deletion:", err);
      return res.status(500).json({ error: "Failed to fetch video" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = results[0];
    if (video.thumbnail) {
      await deleteImageFile(video.thumbnail);
    }

    const deleteQuery = "UPDATE videos SET deletestatus = 1 WHERE id = ?";
    
    db1.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting video:", err);
        return res.status(500).json({ error: "Failed to delete video" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      res.json({ message: "Video deleted successfully" });
    });
  });
};




export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user info from auth middleware
    
    const [users] = await db1.promise().query(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile' 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, currentPassword, newPassword, name } = req.body;

    // First, get current user data
    const [users] = await db1.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];
    let updateFields = [];
    let updateValues = [];

    // Check if email is being updated and if it's unique
    if (email && email !== user.email) {
      const [existingUsers] = await db1.promise().query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      updateFields.push('email = ?');
      updateValues.push(email);
    }

    // Update name if provided
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    // If there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(userId);
      
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await db1.promise().query(query, updateValues);

      // Get updated user data
      const [updatedUsers] = await db1.promise().query(
        'SELECT id, email  FROM users WHERE id = ?',
        [userId]
      );
console.log(updatedUsers[0])
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id:updatedUsers[0].id,
          email:updatedUsers[0].email,
          auth:true
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No changes made',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        }
      });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
  }
};






// Get all contact inquiries
export const getInquiries = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM contact_inquiries 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR org_id LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM contact_inquiries 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR org_id LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        inquiries: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};


// Get inquiry by ID
export const getInquiryById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM contact_inquiries WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Inquiry query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    res.json(results[0]);
  });
};


// Get owner information
export const getOwner = (req, res) => {
  const query = `SELECT id, name, email, smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, smtp_from FROM owners LIMIT 1`;
  
  db1.query(query, (error, results) => {
    if (error) {
      console.error("Owner query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.json({
        id: null,
        name: "",
        email: "",
        smtp_host: "smtp.hostinger.com",
        smtp_port: 465,
        smtp_secure: 1,
        smtp_username: "",
        smtp_password: "",
        smtp_from: "",
      });
    }

    res.json(results[0]);
  });
};

// Update owner information
export const updateOwner = (req, res) => {
  const {
    name,
    email,
    smtp_host,
    smtp_port,
    smtp_secure,
    smtp_username,
    smtp_password,
    smtp_from,
  } = req.body;

  if (!name || !email || !smtp_host || !smtp_port || !smtp_username || !smtp_password || !smtp_from) {
    return res.status(400).json({ error: "All SMTP fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || !emailRegex.test(smtp_username) || !emailRegex.test(smtp_from)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const secureValue = smtp_secure === true || smtp_secure === 1 || smtp_secure === '1' || smtp_secure === 'true' ? 1 : 0;

  const query = `
    INSERT INTO owners (
      id, name, email, smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, smtp_from
    )
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      email = VALUES(email),
      smtp_host = VALUES(smtp_host),
      smtp_port = VALUES(smtp_port),
      smtp_secure = VALUES(smtp_secure),
      smtp_username = VALUES(smtp_username),
      smtp_password = VALUES(smtp_password),
      smtp_from = VALUES(smtp_from)
  `;

  db1.query(
    query,
    [
      name.trim(),
      email.trim().toLowerCase(),
      smtp_host.trim(),
      Number(smtp_port),
      secureValue,
      smtp_username.trim().toLowerCase(),
      smtp_password,
      smtp_from.trim().toLowerCase(),
    ],
    (error) => {
      if (error) {
        console.error("Update owner error:", error);
        return res.status(500).json({ error: "Failed to update owner" });
      }

      res.json({
        message: "Owner SMTP information updated successfully",
        success: true
      });
    }
  );
};

// Delete an inquiry
export const deleteInquiry = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM contact_inquiries WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete inquiry error:", error);
      return res.status(500).json({ error: "Failed to delete inquiry" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    res.json({
      message: "Inquiry deleted successfully",
      success: true
    });
  });
};




// Get all donations
export const getDonations = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM donations 
    WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ? OR donationType LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM donations 
    WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ? OR donationType LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json({
        donations: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get donation by ID
export const getDonationById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM donations WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Donation query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(results[0]);
  });
};

// Delete a donation
export const deleteDonation = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM donations WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete donation error:", error);
      return res.status(500).json({ error: "Failed to delete donation" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({
      message: "Donation deleted successfully",
      success: true
    });
  });
};

// Update donation status
export const updateDonationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const query = `UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db1.query(query, [status, id], (error, results) => {
    if (error) {
      console.error("Update donation status error:", error);
      return res.status(500).json({ error: "Failed to update donation status" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({
      message: "Donation status updated successfully",
      success: true
    });
  });
};




// Get all stories
export const getStories = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM contribute_stories 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR entityType LIKE ? OR company LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM contribute_stories 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR entityType LIKE ? OR company LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        stories: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get story by ID
export const getStoryById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM contribute_stories WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Story query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json(results[0]);
  });
};

// Delete a story
export const deleteStory = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM contribute_stories WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete story error:", error);
      return res.status(500).json({ error: "Failed to delete story" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json({
      message: "Story deleted successfully",
      success: true
    });
  });
};




// Get all job applications
export const getJobApplications = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM job_applications 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR interestedPost LIKE ? OR qualification LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM job_applications 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR interestedPost LIKE ? OR qualification LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        applications: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get job application by ID
export const getJobApplicationById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM job_applications WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Job application query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Job application not found" });
    }

    res.json(results[0]);
  });
};

// Delete a job application
export const deleteJobApplication = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM job_applications WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete job application error:", error);
      return res.status(500).json({ error: "Failed to delete job application" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Job application not found" });
    }

    res.json({
      message: "Job application deleted successfully",
      success: true
    });
  });
};





// Get all volunteers
export const getVolunteers = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM volunteers 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR country LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM volunteers 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR country LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        volunteers: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get volunteer by ID
export const getVolunteerById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM volunteers WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Volunteer query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    res.json(results[0]);
  });
};

// Delete a volunteer
export const deleteVolunteer = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM volunteers WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete volunteer error:", error);
      return res.status(500).json({ error: "Failed to delete volunteer" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    res.json({
      message: "Volunteer deleted successfully",
      success: true
    });
  });
};





// Get all contact messages
export const getContactMessages = (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM contact_messages 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ?
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total FROM contact_messages 
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ?
  `;

  const searchTerm = `%${search}%`;
  const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
  const countParams = [searchTerm, searchTerm, searchTerm, searchTerm];

  db1.query(countQuery, countParams, (countError, countResults) => {
    if (countError) {
      console.error("Count query error:", countError);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0]?.total || 0;

    db1.query(query, queryParams, (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        messages: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get contact message by ID
export const getContactMessageById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM contact_messages WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Contact message query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Contact message not found" });
    }

    res.json(results[0]);
  });
};

// Delete a contact message
export const deleteContactMessage = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM contact_messages WHERE id = ?`;
  
  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Delete contact message error:", error);
      return res.status(500).json({ error: "Failed to delete contact message" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Contact message not found" });
    }

    res.json({
      message: "Contact message deleted successfully",
      success: true
    });
  });
};

export const authlogin = async (req, res) => {
  const token = req.cookies.token;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Fetch fresh user data from DB to ensure up-to-date profile info
  try {
    const [rows] = await db1.promise().query(
      'SELECT id, email FROM users WHERE id = ? LIMIT 1',
      [decoded.id],
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    const user = { ...rows[0], auth: true };
    return res.status(200).json({ message: 'success', user });
  } catch (err) {
    console.error('authlogin DB error:', err.message);
    if (decoded && decoded.id && decoded.email) {
      return res.status(200).json({
        message: 'success',
        user: { id: decoded.id, email: decoded.email, auth: true },
        warning: 'Served from valid verified token during temporary DB connection reset'
      });
    }
    return res.status(500).json({ message: 'Database error' });
  }
};




// Get all topbar contents
export const getAllTopbarContents = (req, res) => {
  const query = 'SELECT * FROM topbarcontent ORDER BY created_at DESC';
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching topbar contents:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching topbar contents',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Get single topbar content by ID
export const getTopbarContentById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM topbarcontent WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching topbar content:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching topbar content',
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topbar content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

// Create new topbar content
export const createTopbarContent = (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text content is required'
    });
  }
  
  const query = 'INSERT INTO topbarcontent (text) VALUES (?)';
  
  db1.query(query, [text], (err, results) => {
    if (err) {
      console.error('Error creating topbar content:', err);
      return res.status(500).json({
        success: false,
        message: 'Error creating topbar content',
        error: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Topbar content created successfully',
      data: {
        id: results.insertId,
        text
      }
    });
  });
};

// Update topbar content
export const updateTopbarContent = (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text content is required'
    });
  }
  
  const query = 'UPDATE topbarcontent SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db1.query(query, [text, id], (err, results) => {
    if (err) {
      console.error('Error updating topbar content:', err);
      return res.status(500).json({
        success: false,
        message: 'Error updating topbar content',
        error: err.message
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topbar content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Topbar content updated successfully',
      data: {
        id,
        text
      }
    });
  });
};

// Delete topbar content
export const deleteTopbarContent = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM topbarcontent WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting topbar content:', err);
      return res.status(500).json({
        success: false,
        message: 'Error deleting topbar content',
        error: err.message
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topbar content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Topbar content deleted successfully'
    });
  });
};




// Get all certifications
export const getAllCertifications = async (req, res) => {
  try {
    const query = 'SELECT * FROM certifications ORDER BY display_order ASC, created_at DESC';
    
    db1.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching certifications:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching certifications',
          error: err.message
        });
      }
      
      res.status(200).json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error('Error in getAllCertifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single certification by ID
export const getCertificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM certifications WHERE id = ?';
    
    db1.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching certification:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching certification',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Certification not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: results[0]
      });
    });
  } catch (error) {
    console.error('Error in getCertificationById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new certification with base64
export const createCertification = async (req, res) => {
  try {
    const { title, description, display_order, image_base64 } = req.body;

    if (!title || !image_base64) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required'
      });
    }

    let imageUrl;
    if (isUploadedMediaUrl(image_base64)) {
      imageUrl = image_base64;
    } else {
      const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format'
        });
      }
      const ext = matches[1].split("/")[1] || "png";
      const fileName = `cert_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
      const fileBuffer = Buffer.from(matches[2], "base64");
      imageUrl = await uploadToFTP(fileName, fileBuffer);
    }

    const query = `
      INSERT INTO certifications (title, description, image_url, display_order) 
      VALUES (?, ?, ?, ?)
    `;
    
    db1.query(query, [title, description, imageUrl, display_order || 0], (err, results) => {
      if (err) {
        console.error('Error creating certification:', err);
        // Delete uploaded file if DB operation fails
        deleteFromFTP(imageUrl);
        return res.status(500).json({
          success: false,
          message: 'Error creating certification',
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Certification created successfully',
        data: {
          id: results.insertId,
          title,
          description,
          image_url: imageUrl,
          display_order: display_order || 0
        }
      });
    });
  } catch (error) {
    console.error('Error in createCertification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update certification with base64
export const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, display_order, image_base64 } = req.body;

    // First get the current certification
    const getQuery = 'SELECT * FROM certifications WHERE id = ?';
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error('Error fetching certification for update:', err);
        return res.status(500).json({
          success: false,
          message: 'Error updating certification',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Certification not found'
        });
      }
      
      const currentCert = results[0];
      let imageUrl = currentCert.image_url;

      if (image_base64) {
        let nextImageUrl;
        if (isUploadedMediaUrl(image_base64)) {
          nextImageUrl = image_base64;
        } else {
          const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
          if (!matches) {
            return res.status(400).json({
              success: false,
              message: 'Invalid image format'
            });
          }
          const ext = matches[1].split("/")[1] || "png";
          const fileName = `cert_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
          const fileBuffer = Buffer.from(matches[2], "base64");
          nextImageUrl = await uploadToFTP(fileName, fileBuffer);
        }
        if (currentCert.image_url && currentCert.image_url !== nextImageUrl) {
          await deleteFromFTP(currentCert.image_url);
        }
        imageUrl = nextImageUrl;
      }

      const updateQuery = `
        UPDATE certifications 
        SET title = ?, description = ?, image_url = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db1.query(updateQuery, [
        title || currentCert.title,
        description || currentCert.description,
        imageUrl,
        display_order !== undefined ? display_order : currentCert.display_order,
        id
      ], (err, results) => {
        if (err) {
          console.error('Error updating certification:', err);
          return res.status(500).json({
            success: false,
            message: 'Error updating certification',
            error: err.message
          });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Certification not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Certification updated successfully',
          data: {
            id: parseInt(id),
            title: title || currentCert.title,
            description: description || currentCert.description,
            image_url: imageUrl,
            display_order: display_order !== undefined ? display_order : currentCert.display_order
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in updateCertification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete certification
export const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the certification to get image URL
    const getQuery = 'SELECT * FROM certifications WHERE id = ?';
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error('Error fetching certification for deletion:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting certification',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Certification not found'
        });
      }
      
      const certification = results[0];
      
      // Delete from FTP
      await deleteFromFTP(certification.image_url);
      
      // Delete from database
      const deleteQuery = 'DELETE FROM certifications WHERE id = ?';
      
      db1.query(deleteQuery, [id], (err, results) => {
        if (err) {
          console.error('Error deleting certification:', err);
          return res.status(500).json({
            success: false,
            message: 'Error deleting certification',
            error: err.message
          });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Certification not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Certification deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error in deleteCertification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// Get all testimonials
export const getAllTestimonials = (req, res) => {
  const query = 'SELECT * FROM testimonials ORDER BY created_at DESC';
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching testimonials:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching testimonials',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Get testimonial by ID
export const getTestimonialById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM testimonials WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching testimonial:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching testimonial',
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

// Create new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { name, position, role, video_base64, thumbnail_base64 } = req.body;

    if (!name || !position || !role || !video_base64) {
      return res.status(400).json({
        success: false,
        message: 'Name, position, role, and video are required'
      });
    }

    let videoUrl = '';
    let thumbnailUrl = '';

    if (isUploadedMediaUrl(video_base64)) {
      videoUrl = video_base64;
    } else {
      const videoMatches = video_base64.match(/^data:(.+);base64,(.+)$/);
      if (!videoMatches) {
        return res.status(400).json({
          success: false,
          message: 'Invalid video format'
        });
      }
      const videoExt = videoMatches[1].split("/")[1] || "mp4";
      const videoFileName = `testimonial_video_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${videoExt}`;
      const videoBuffer = Buffer.from(videoMatches[2], "base64");
      videoUrl = await uploadVideoToFTP(videoFileName, videoBuffer);
    }

    if (thumbnail_base64) {
      if (isUploadedMediaUrl(thumbnail_base64)) {
        thumbnailUrl = thumbnail_base64;
      } else {
        const thumbnailMatches = thumbnail_base64.match(/^data:(.+);base64,(.+)$/);
        if (thumbnailMatches) {
          const thumbnailExt = thumbnailMatches[1].split("/")[1] || "png";
          const thumbnailFileName = `testimonial_thumb_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${thumbnailExt}`;
          const thumbnailBuffer = Buffer.from(thumbnailMatches[2], "base64");
          thumbnailUrl = await uploadToFTP(thumbnailFileName, thumbnailBuffer);
        }
      }
    }

    const query = 'INSERT INTO testimonials (name, position, thumbnail, video_url, role) VALUES (?, ?, ?, ?, ?)';
    
    db1.query(query, [name, position, thumbnailUrl, videoUrl, role], (err, results) => {
      if (err) {
        console.error('Error creating testimonial:', err);
        // Delete uploaded files if DB operation fails
        deleteVideoFromFTP(videoUrl);
        if (thumbnailUrl) deleteFromFTP(thumbnailUrl);
        return res.status(500).json({
          success: false,
          message: 'Error creating testimonial',
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Testimonial created successfully',
        data: {
          id: results.insertId,
          name,
          position,
          thumbnail: thumbnailUrl,
          video_url: videoUrl,
          role
        }
      });
    });
  } catch (error) {
    console.error('Error in createTestimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, role, video_base64, thumbnail_base64 } = req.body;

    // First get the current testimonial
    const getQuery = 'SELECT * FROM testimonials WHERE id = ?';
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error('Error fetching testimonial for update:', err);
        return res.status(500).json({
          success: false,
          message: 'Error updating testimonial',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }
      
      const currentTestimonial = results[0];
      let videoUrl = currentTestimonial.video_url;
      let thumbnailUrl = currentTestimonial.thumbnail;
      let updateName = name !== undefined ? name : currentTestimonial.name;
      let updatePosition = position !== undefined ? position : currentTestimonial.position;
      let updateRole = role !== undefined ? role : currentTestimonial.role;

      if (video_base64) {
        let nextVideoUrl;
        if (isUploadedMediaUrl(video_base64)) {
          nextVideoUrl = video_base64;
        } else {
          const matches = video_base64.match(/^data:(.+);base64,(.+)$/);
          if (!matches) {
            return res.status(400).json({
              success: false,
              message: 'Invalid video format'
            });
          }
          const ext = matches[1].split("/")[1] || "mp4";
          const fileName = `testimonial_video_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
          const fileBuffer = Buffer.from(matches[2], "base64");
          nextVideoUrl = await uploadVideoToFTP(fileName, fileBuffer);
        }
        if (currentTestimonial.video_url && currentTestimonial.video_url !== nextVideoUrl) {
          await deleteVideoFromFTP(currentTestimonial.video_url);
        }
        videoUrl = nextVideoUrl;
      }

      if (thumbnail_base64) {
        let nextThumbnailUrl = null;
        if (isUploadedMediaUrl(thumbnail_base64)) {
          nextThumbnailUrl = thumbnail_base64;
        } else {
          const matches = thumbnail_base64.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1].split("/")[1] || "png";
            const fileName = `testimonial_thumb_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
            const fileBuffer = Buffer.from(matches[2], "base64");
            nextThumbnailUrl = await uploadToFTP(fileName, fileBuffer);
          }
        }
        if (nextThumbnailUrl) {
          if (currentTestimonial.thumbnail && currentTestimonial.thumbnail !== nextThumbnailUrl) {
            await deleteFromFTP(currentTestimonial.thumbnail);
          }
          thumbnailUrl = nextThumbnailUrl;
        }
      }

      const updateQuery = 'UPDATE testimonials SET name = ?, position = ?, thumbnail = ?, video_url = ?, role = ? WHERE id = ?';
      
      db1.query(updateQuery, [updateName, updatePosition, thumbnailUrl, videoUrl, updateRole, id], (err, results) => {
        if (err) {
          console.error('Error updating testimonial:', err);
          return res.status(500).json({
            success: false,
            message: 'Error updating testimonial',
            error: err.message
          });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Testimonial not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Testimonial updated successfully',
          data: {
            id: parseInt(id),
            name: updateName,
            position: updatePosition,
            thumbnail: thumbnailUrl,
            video_url: videoUrl,
            role: updateRole
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in updateTestimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the testimonial to get video URL
    const getQuery = 'SELECT * FROM testimonials WHERE id = ?';
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error('Error fetching testimonial for deletion:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting testimonial',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }
      
      const testimonial = results[0];
      
      // Delete from FTP
      await deleteVideoFromFTP(testimonial.video_url);
      if (testimonial.thumbnail) {
        await deleteFromFTP(testimonial.thumbnail);
      }
      
      // Delete from database
      const deleteQuery = 'DELETE FROM testimonials WHERE id = ?';
      
      db1.query(deleteQuery, [id], (err, results) => {
        if (err) {
          console.error('Error deleting testimonial:', err);
          return res.status(500).json({
            success: false,
            message: 'Error deleting testimonial',
            error: err.message
          });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Testimonial not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Testimonial deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error in deleteTestimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// Get all events
export const getAllEvents = (req, res) => {
  const query = 'SELECT * FROM events ORDER BY created_at DESC';
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching events' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Get single event by ID
export const getEventById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM events WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching event' 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

// Create new event
export const createEvent = (req, res) => {
  const { title, url, videoId } = req.body;
  
  if (!title || !url || !videoId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, URL, and videoId are required' 
    });
  }
  
  const query = 'INSERT INTO events (title, url, videoId) VALUES (?, ?, ?)';
  
  db1.query(query, [title, url, videoId], (err, results) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating event' 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { id: results.insertId, title, url, videoId }
    });
  });
};

// Update event
export const updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, url, videoId } = req.body;
  
  if (!title || !url || !videoId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, URL, and videoId are required' 
    });
  }
  
  const query = 'UPDATE events SET title = ?, url = ?, videoId = ? WHERE id = ?';
  
  db1.query(query, [title, url, videoId, id], (err, results) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating event' 
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  });
};

// Delete event
export const deleteEvent = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM events WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting event' 
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  });
};





//sectors

// controllers/sectorsController.js

// Helper function to upload image from base64
const uploadImageFromBase64 = async (base64String, fileName) => {
  if (!base64String || !fileName) return null;
  if (isUploadedMediaUrl(base64String)) return base64String;

  try {
    // Extract base64 data
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload to FTP
    const fileUrl = await uploadToFTP(fileName, fileBuffer);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

// Helper function to update category in items table
const updateItemsCategory = async (oldName, newName) => {
  return new Promise((resolve, reject) => {
    // Get all items that have the old category name in their category array
    const selectQuery = 'SELECT id, category FROM items WHERE JSON_CONTAINS(category, ?)';
    
    db1.query(selectQuery, [JSON.stringify(oldName)], (err, results) => {
      if (err) {
        console.error('Error fetching items for category update:', err);
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve({ updated: 0 }); // No items to update
        return;
      }

      let updatedCount = 0;
      let updatePromises = [];

      // Update each item
      results.forEach(item => {
        const updatePromise = new Promise((itemResolve, itemReject) => {
          try {
            // Parse the category array
            const categories = JSON.parse(item.category);
            
            // Replace the old category name with new one
            const updatedCategories = categories.map(cat => 
              cat === oldName ? newName : cat
            );
            
            // Update the item
            const updateQuery = 'UPDATE items SET category = ? WHERE id = ?';
            db1.query(updateQuery, [JSON.stringify(updatedCategories), item.id], (updateErr) => {
              if (updateErr) {
                console.error(`Error updating item ${item.id}:`, updateErr);
                itemReject(updateErr);
              } else {
                updatedCount++;
                itemResolve();
              }
            });
          } catch (parseError) {
            console.error(`Error parsing categories for item ${item.id}:`, parseError);
            itemResolve(); // Continue with other items even if one fails
          }
        });
        
        updatePromises.push(updatePromise);
      });

      // Wait for all updates to complete
      Promise.all(updatePromises)
        .then(() => resolve({ updated: updatedCount }))
        .catch(reject);
    });
  });
};

// Get all sectors (including deleted for admin)
export const getAllSectors = (req, res) => {
  const query = 'SELECT * FROM sectors ORDER BY id DESC';
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching sectors:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Get active sectors only
export const getActiveSectors = (req, res) => {
  const query = 'SELECT * FROM sectors WHERE deletestatus = 0 ORDER BY name';
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching active sectors:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
};

// Get sector by ID
export const getSectorById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM sectors WHERE id = ?';
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching sector:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Sector not found' });
    }
    
    res.json({ success: true, data: results[0] });
  });
};

// Create new sector
export const createSector = async (req, res) => {
  try {
    const { 
      name, 
      slug, 
      description, 
      meta_title, 
      meta_description, 
      meta_keywords,
      imageBase64, 
      fileName 
    } = req.body;
    
    if (!name || !slug || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields (name, slug, description) are required' 
      });
    }

    let imageUrl = '';

    // Upload image if provided
    if (imageBase64 && fileName) {
      try {
        imageUrl = await uploadImageFromBase64(imageBase64, fileName);
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to upload image: ' + uploadError.message
        });
      }
    }

    const query = `
      INSERT INTO sectors 
      (src, name, slug, description, meta_title, meta_description, meta_keywords) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db1.query(query, [
      imageUrl, 
      name, 
      slug, 
      description, 
      meta_title || null, 
      meta_description || null, 
      meta_keywords || null
    ], (err, result) => {
      if (err) {
        console.error('❌ Error creating sector:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            success: false, 
            error: 'Sector with this slug already exists' 
          });
        }
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Sector created successfully', 
        data: {
          id: result.insertId,
          src: imageUrl,
          name,
          slug,
          description,
          meta_title,
          meta_description,
          meta_keywords,
          deletestatus: 0
        }
      });
    });
  } catch (error) {
    console.error('❌ Error in create sector:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update sector
export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      slug, 
      description, 
      meta_title, 
      meta_description, 
      meta_keywords,
      imageBase64, 
      fileName 
    } = req.body;
    
    if (!name || !slug || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields (name, slug, description) are required' 
      });
    }

    // First get the old sector data to check if name changed and for image handling
    const getOldDataQuery = 'SELECT name, src FROM sectors WHERE id = ?';
    
    db1.query(getOldDataQuery, [id], async (err, results) => {
      if (err) {
        console.error('❌ Error fetching old sector data:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, error: 'Sector not found' });
      }
      
      const oldSector = results[0];
      const oldName = oldSector.name;
      let newImageUrl = oldSector.src;

      // If name changed, update all items that reference this category
      let categoryUpdateResult = { updated: 0 };
      if (oldName !== name) {
        try {
          categoryUpdateResult = await updateItemsCategory(oldName, name);
          console.log(`✅ Updated ${categoryUpdateResult.updated} items with new category name`);
        } catch (categoryError) {
          console.error('❌ Error updating items categories:', categoryError);
          // Continue with sector update even if category update fails
        }
      }

      // If new image is provided, upload it
      if (imageBase64 && fileName) {
        try {
          // Delete old image if it exists and is from our FTP
          if (oldSector.src && oldSector.src.includes('media.khudii.com')) {
            try {
              await deleteFromFTP(oldSector.src);
            } catch (deleteError) {
              console.error('Error deleting old FTP image:', deleteError);
              // Continue with upload even if delete fails
            }
          }
          
          // Upload new image
          newImageUrl = await uploadImageFromBase64(imageBase64, fileName);
        } catch (uploadError) {
          return res.status(400).json({
            success: false,
            error: 'Failed to upload new image: ' + uploadError.message
          });
        }
      }
      
      // Update the sector
      const updateQuery = `
        UPDATE sectors 
        SET src = ?, name = ?, slug = ?, description = ?, 
            meta_title = ?, meta_description = ?, meta_keywords = ? 
        WHERE id = ?
      `;
      
      db1.query(updateQuery, [
        newImageUrl, 
        name, 
        slug, 
        description, 
        meta_title || null, 
        meta_description || null, 
        meta_keywords || null, 
        id
      ], (err, result) => {
        if (err) {
          console.error('❌ Error updating sector:', err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
              success: false, 
              error: 'Sector with this slug already exists' 
            });
          }
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, error: 'Sector not found' });
        }
        
        res.json({ 
          success: true, 
          message: `Sector updated successfully${categoryUpdateResult.updated > 0 ? ` and ${categoryUpdateResult.updated} items updated` : ''}`,
          data: { 
            id: parseInt(id), 
            src: newImageUrl, 
            name, 
            slug, 
            description,
            meta_title,
            meta_description,
            meta_keywords
          },
          itemsUpdated: categoryUpdateResult.updated
        });
      });
    });
  } catch (error) {
    console.error('❌ Error in update sector:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Delete sector (soft delete)
export const deleteSector = (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE sectors SET deletestatus = 1 WHERE id = ?';
  
  db1.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error deleting sector:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sector not found' });
    }
    
    res.json({ success: true, message: 'Sector deleted successfully' });
  });
};

// Restore sector
export const restoreSector = (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE sectors SET deletestatus = 0 WHERE id = ?';
  
  db1.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error restoring sector:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sector not found' });
    }
    
    res.json({ success: true, message: 'Sector restored successfully' });
  });
};

// Permanent delete sector
export const permanentDeleteSector = (req, res) => {
  const { id } = req.params;
  
  // First get the sector data to delete the image from FTP and get the name for category cleanup
  const getSectorQuery = 'SELECT name, src FROM sectors WHERE id = ?';
  
  db1.query(getSectorQuery, [id], async (err, results) => {
    if (err) {
      console.error('❌ Error fetching sector for deletion:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Sector not found' });
    }
    
    const sector = results[0];
    const sectorName = sector.name;
    
    // Remove this category from all items
    try {
      await removeCategoryFromItems(sectorName);
      console.log(`✅ Removed category "${sectorName}" from all items`);
    } catch (categoryError) {
      console.error('❌ Error removing category from items:', categoryError);
      // Continue with deletion even if category cleanup fails
    }
    
    // Delete image from FTP if it's from our server
    if (sector.src && sector.src.includes('media.khudii.com')) {
      try {
        await deleteFromFTP(sector.src);
      } catch (ftpError) {
        console.error('Error deleting FTP image:', ftpError);
        // Continue with database deletion even if FTP delete fails
      }
    }
    
    // Delete from database
    const deleteQuery = 'DELETE FROM sectors WHERE id = ?';
    
    db1.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('❌ Error permanently deleting sector:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Sector not found' });
      }
      
      res.json({ success: true, message: 'Sector permanently deleted and removed from all items' });
    });
  });
};

// Helper function to remove category from all items when sector is deleted
const removeCategoryFromItems = async (categoryName) => {
  return new Promise((resolve, reject) => {
    // Get all items that have this category
    const selectQuery = 'SELECT id, category FROM items WHERE JSON_CONTAINS(category, ?)';
    
    db1.query(selectQuery, [JSON.stringify(categoryName)], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve({ removed: 0 });
        return;
      }

      let removedCount = 0;
      let updatePromises = [];

      // Update each item to remove the category
      results.forEach(item => {
        const updatePromise = new Promise((itemResolve, itemReject) => {
          try {
            // Parse the category array
            const categories = JSON.parse(item.category);
            
            // Remove the category
            const updatedCategories = categories.filter(cat => cat !== categoryName);
            
            // If no categories left, we might want to handle this differently
            // For now, just update with remaining categories
            const updateQuery = 'UPDATE items SET category = ? WHERE id = ?';
            db1.query(updateQuery, [JSON.stringify(updatedCategories), item.id], (updateErr) => {
              if (updateErr) {
                itemReject(updateErr);
              } else {
                removedCount++;
                itemResolve();
              }
            });
          } catch (parseError) {
            console.error(`Error parsing categories for item ${item.id}:`, parseError);
            itemResolve(); // Continue with other items
          }
        });
        
        updatePromises.push(updatePromise);
      });

      Promise.all(updatePromises)
        .then(() => resolve({ removed: removedCount }))
        .catch(reject);
    });
  });
};




//crousel -images



// Helper function to convert base64 to buffer
function base64ToBuffer(base64String) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, 'base64');
}

// Helper functions for image inputs used by the admin CMS.
function generateUniqueFileName(base64String, prefix = 'media') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const mime = typeof base64String === 'string' ? base64String.match(/^data:([^;,]+);base64,/)?.[1] : null;
  const fileType = mime?.split('/')[1]?.split('+')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'webp';
  return `${prefix}-${timestamp}-${random}.${fileType}`;
}

async function resolveImageInput(value, prefix = 'media') {
  if (!value) return null;
  if (isUploadedMediaUrl(value)) return value;
  if (typeof value !== 'string' || !value.startsWith('data:')) {
    throw new Error('Invalid image input');
  }
  const fileName = generateUniqueFileName(value, prefix);
  const fileBuffer = base64ToBuffer(value);
  return uploadToFTP(fileName, fileBuffer);
}




// Get all carousel images
// export const getAllCarouselImages = (req, res) => {
//   const query = "SELECT * FROM crousel_images ORDER BY created_at DESC";
  
//   db1.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching carousel images:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch carousel images",
//         error: err.message
//       });
//     }
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length
//     });
//   });
// };

// // Get single carousel image by ID
// export const getCarouselImageById = (req, res) => {
//   const { id } = req.params;
//   const query = "SELECT * FROM crousel_images WHERE id = ?";
  
//   db1.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching carousel image:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch carousel image",
//         error: err.message
//       });
//     }
    
//     if (results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Carousel image not found"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: results[0]
//     });
//   });
// };

// // Create new carousel image
// export const createCarouselImage = async (req, res) => {
//   try {
//     const { imageBase64, description } = req.body;

//     // Validate required fields
//     if (!imageBase64) {
//       return res.status(400).json({
//         success: false,
//         message: "Image base64 data is required"
//       });
//     }

//     // Generate unique filename
//     const fileName = generateUniqueFileName(imageBase64);
    
//     // Convert base64 to buffer
//     const fileBuffer = base64ToBuffer(imageBase64);

//     // Upload to FTP
//     const imageUrl = await uploadToFTP(fileName, fileBuffer);

//     // Insert into database
//     const query = "INSERT INTO crousel_images (image_path, description) VALUES (?, ?)";
    
//     db1.query(query, [imageUrl, description || null], (err, results) => {
//       if (err) {
//         console.error("❌ Error creating carousel image:", err);
        
//         // Delete from FTP if database insert fails
//         deleteFromFTP(imageUrl);
        
//         return res.status(500).json({
//           success: false,
//           message: "Failed to create carousel image",
//           error: err.message
//         });
//       }
      
//       res.status(201).json({
//         success: true,
//         message: "Carousel image created successfully",
//         data: {
//           id: results.insertId,
//           image_path: imageUrl,
//           description: description || null
//         }
//       });
//     });
    
//   } catch (error) {
//     console.error("❌ Error in createCarouselImage:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create carousel image",
//       error: error.message
//     });
//   }
// };

// // Update carousel image
// export const updateCarouselImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { description, imageBase64 } = req.body;

//     // First, get the current image data
//     const getQuery = "SELECT * FROM crousel_images WHERE id = ?";
    
//     db1.query(getQuery, [id], async (err, results) => {
//       if (err) {
//         console.error("❌ Error fetching carousel image for update:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to fetch carousel image",
//           error: err.message
//         });
//       }
      
//       if (results.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Carousel image not found"
//         });
//       }

//       const currentImage = results[0];
//       let newImagePath = currentImage.image_path;

//       // If new image is provided, upload it and delete old one
//       if (imageBase64) {
//         try {
//           // Generate unique filename for new image
//           const fileName = generateUniqueFileName(imageBase64);
          
//           // Convert base64 to buffer
//           const fileBuffer = base64ToBuffer(imageBase64);

//           // Upload new image to FTP
//           newImagePath = await uploadToFTP(fileName, fileBuffer);

//           // Delete old image from FTP
//           await deleteFromFTP(currentImage.image_path);
          
//         } catch (ftpError) {
//           console.error("❌ FTP error during update:", ftpError);
//           return res.status(500).json({
//             success: false,
//             message: "Failed to update image file",
//             error: ftpError.message
//           });
//         }
//       }

//       // Update database
//       const updateQuery = "UPDATE crousel_images SET image_path = ?, description = ? WHERE id = ?";
//       const updateParams = [
//         newImagePath,
//         description !== undefined ? description : currentImage.description,
//         id
//       ];

//       db1.query(updateQuery, updateParams, (err, updateResults) => {
//         if (err) {
//           console.error("❌ Error updating carousel image:", err);
//           return res.status(500).json({
//             success: false,
//             message: "Failed to update carousel image",
//             error: err.message
//           });
//         }
        
//         res.json({
//           success: true,
//           message: "Carousel image updated successfully",
//           data: {
//             id: parseInt(id),
//             image_path: newImagePath,
//             description: description !== undefined ? description : currentImage.description
//           }
//         });
//       });
//     });
    
//   } catch (error) {
//     console.error("❌ Error in updateCarouselImage:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update carousel image",
//       error: error.message
//     });
//   }
// };

// // Delete carousel image
// export const deleteCarouselImage = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // First, get the image data
//     const getQuery = "SELECT * FROM crousel_images WHERE id = ?";
    
//     db1.query(getQuery, [id], async (err, results) => {
//       if (err) {
//         console.error("❌ Error fetching carousel image for deletion:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to fetch carousel image",
//           error: err.message
//         });
//       }
      
//       if (results.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Carousel image not found"
//         });
//       }

//       const image = results[0];

//       // Delete from FTP
//       await deleteFromFTP(image.image_path);

//       // Delete from database
//       const deleteQuery = "DELETE FROM crousel_images WHERE id = ?";
      
//       db1.query(deleteQuery, [id], (err, deleteResults) => {
//         if (err) {
//           console.error("❌ Error deleting carousel image:", err);
//           return res.status(500).json({
//             success: false,
//             message: "Failed to delete carousel image",
//             error: err.message
//           });
//         }
        
//         res.json({
//           success: true,
//           message: "Carousel image deleted successfully",
//           data: {
//             id: parseInt(id),
//             image_path: image.image_path
//           }
//         });
//       });
//     });
    
//   } catch (error) {
//     console.error("❌ Error in deleteCarouselImage:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete carousel image",
//       error: error.message
//     });
//   }
// };





// Helper functions


// Get all carousel images (BOTH mobile and desktop - NO filtering)
export const getAllCarouselImages = (req, res) => {
  const query = "SELECT * FROM crousel_images ORDER BY created_at DESC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching carousel images:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch carousel images",
        error: err.message
      });
    }
    
    // Return ALL images (both mobile and desktop)
    res.json({
      success: true,
      data: results,
      count: results.length,
      stats: {
        total: results.length,
        mobile: results.filter(img => img.isMobile === 1 || img.isMobile === true).length,
        desktop: results.filter(img => img.isMobile === 0 || img.isMobile === false).length
      }
    });
  });
};

// Get desktop images only (separate endpoint if needed)
export const getDesktopImages = (req, res) => {
  const query = "SELECT * FROM crousel_images WHERE isMobile = FALSE ORDER BY created_at DESC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching desktop images:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch desktop images",
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
};

// Get mobile images only (separate endpoint if needed)
export const getMobileImages = (req, res) => {
  const query = "SELECT * FROM crousel_images WHERE isMobile = TRUE ORDER BY created_at DESC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching mobile images:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch mobile images",
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
};

// Get single carousel image by ID
export const getCarouselImageById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM crousel_images WHERE id = ?";
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching carousel image:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch carousel image",
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Carousel image not found"
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
};

// Create new carousel image
export const createCarouselImage = async (req, res) => {
  try {
    const { imageBase64, description, isMobile = false } = req.body;

    // Validate required fields
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: "Image base64 data is required"
      });
    }

    const imageUrl = await resolveImageInput(imageBase64, 'carousel');

    // Insert into database
    const query = "INSERT INTO crousel_images (image_path, description, isMobile) VALUES (?, ?, ?)";
    
    db1.query(query, [imageUrl, description || null, isMobile], (err, results) => {
      if (err) {
        console.error("❌ Error creating carousel image:", err);
        
        // Delete from FTP if database insert fails
        deleteFromFTP(imageUrl);
        
        return res.status(500).json({
          success: false,
          message: "Failed to create carousel image",
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        message: "Carousel image created successfully",
        data: {
          id: results.insertId,
          image_path: imageUrl,
          description: description || null,
          isMobile: Boolean(isMobile)
        }
      });
    });
    
  } catch (error) {
    console.error("❌ Error in createCarouselImage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create carousel image",
      error: error.message
    });
  }
};

// Update carousel image
export const updateCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageBase64, isMobile } = req.body;

    // First, get the current image data
    const getQuery = "SELECT * FROM crousel_images WHERE id = ?";
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error("❌ Error fetching carousel image for update:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch carousel image",
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Carousel image not found"
        });
      }

      const currentImage = results[0];
      let newImagePath = currentImage.image_path;

      // If new image is provided, upload it and delete old one
      if (imageBase64) {
        try {
          newImagePath = await resolveImageInput(imageBase64, 'carousel');

          // Delete the previous file only after the replacement is available.
          if (currentImage.image_path && currentImage.image_path !== newImagePath) {
            await deleteFromFTP(currentImage.image_path);
          }
          
        } catch (ftpError) {
          console.error("❌ FTP error during update:", ftpError);
          return res.status(500).json({
            success: false,
            message: "Failed to update image file",
            error: ftpError.message
          });
        }
      }

      // Prepare update values
      const updateValues = {
        image_path: newImagePath,
        description: description !== undefined ? description : currentImage.description,
        isMobile: isMobile !== undefined ? isMobile : currentImage.isMobile
      };

      // Update database
      const updateQuery = "UPDATE crousel_images SET image_path = ?, description = ?, isMobile = ? WHERE id = ?";
      const updateParams = [
        updateValues.image_path,
        updateValues.description,
        updateValues.isMobile,
        id
      ];

      db1.query(updateQuery, updateParams, (err, updateResults) => {
        if (err) {
          console.error("❌ Error updating carousel image:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update carousel image",
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: "Carousel image updated successfully",
          data: {
            id: parseInt(id),
            image_path: updateValues.image_path,
            description: updateValues.description,
            isMobile: Boolean(updateValues.isMobile)
          }
        });
      });
    });
    
  } catch (error) {
    console.error("❌ Error in updateCarouselImage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update carousel image",
      error: error.message
    });
  }
};

// Delete carousel image
export const deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the image data
    const getQuery = "SELECT * FROM crousel_images WHERE id = ?";
    
    db1.query(getQuery, [id], async (err, results) => {
      if (err) {
        console.error("❌ Error fetching carousel image for deletion:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch carousel image",
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Carousel image not found"
        });
      }

      const image = results[0];

      // Delete from FTP
      await deleteFromFTP(image.image_path);

      // Delete from database
      const deleteQuery = "DELETE FROM crousel_images WHERE id = ?";
      
      db1.query(deleteQuery, [id], (err, deleteResults) => {
        if (err) {
          console.error("❌ Error deleting carousel image:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to delete carousel image",
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: "Carousel image deleted successfully",
          data: {
            id: parseInt(id),
            image_path: image.image_path,
            wasMobile: Boolean(image.isMobile)
          }
        });
      });
    });
    
  } catch (error) {
    console.error("❌ Error in deleteCarouselImage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete carousel image",
      error: error.message
    });
  }
};



//welcome section




// Get welcome section data
export const getWelcomeSection = (req, res) => {
  const query = "SELECT * FROM welcomesection LIMIT 1";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching welcome section:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch welcome section",
        error: err.message
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : {
      id: null,
      welcome_title: "",
      welcome_description: "",
      youtube_video_id: "",
      created_at: null,
      updated_at: null
    };
    
    res.json({
      success: true,
      data: data
    });
  });
};

// Update welcome section data
export const updateWelcomeSection = async (req, res) => {
  try {
    const { welcome_title, welcome_description, youtube_video_id } = req.body;

    // Validate required fields
    if (!welcome_title) {
      return res.status(400).json({
        success: false,
        message: "Welcome title is required"
      });
    }

    // First check if data exists
    const checkQuery = "SELECT id FROM welcomesection LIMIT 1";
    
    db1.query(checkQuery, (err, results) => {
      if (err) {
        console.error("❌ Error checking welcome section:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update welcome section",
          error: err.message
        });
      }

      if (results.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE welcomesection 
          SET welcome_title = ?, welcome_description = ?, youtube_video_id = ? 
          WHERE id = ?
        `;
        
        db1.query(updateQuery, [
          welcome_title,
          welcome_description || null,
          youtube_video_id || null,
          results[0].id
        ], (err, updateResults) => {
          if (err) {
            console.error("❌ Error updating welcome section:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to update welcome section",
              error: err.message
            });
          }
          
          res.json({
            success: true,
            message: "Welcome section updated successfully",
            data: {
              id: results[0].id,
              welcome_title,
              welcome_description,
              youtube_video_id
            }
          });
        });
      } else {
        // Insert new record (first time setup)
        const insertQuery = `
          INSERT INTO welcomesection (welcome_title, welcome_description, youtube_video_id) 
          VALUES (?, ?, ?)
        `;
        
        db1.query(insertQuery, [
          welcome_title,
          welcome_description || null,
          youtube_video_id || null
        ], (err, insertResults) => {
          if (err) {
            console.error("❌ Error creating welcome section:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to create welcome section",
              error: err.message
            });
          }
          
          res.status(201).json({
            success: true,
            message: "Welcome section created successfully",
            data: {
              id: insertResults.insertId,
              welcome_title,
              welcome_description,
              youtube_video_id
            }
          });
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error in updateWelcomeSection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update welcome section",
      error: error.message
    });
  }
};



//vision


// Get all vision mission items
export const getAllVisionMissionItems = (req, res) => {
  const query = "SELECT * FROM vision_mission_items ORDER BY sort_order ASC, created_at ASC";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching vision mission items:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vision mission items",
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
};

// Get single vision mission item by ID
export const getVisionMissionItemById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM vision_mission_items WHERE id = ?";
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching vision mission item:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vision mission item",
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vision mission item not found"
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
};

// Create new vision mission item
export const createVisionMissionItem = (req, res) => {
  const { icon, title, description, sort_order, is_active } = req.body;

  // Validate required fields
  if (!icon || !title || !description) {
    return res.status(400).json({
      success: false,
      message: "Icon, title, and description are required"
    });
  }

  const query = "INSERT INTO vision_mission_items (icon, title, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)";
  
  db1.query(query, [
    icon,
    title,
    description,
    sort_order || 0,
    is_active !== undefined ? is_active : true
  ], (err, results) => {
    if (err) {
      console.error("❌ Error creating vision mission item:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to create vision mission item",
        error: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Vision mission item created successfully",
      data: {
        id: results.insertId,
        icon,
        title,
        description,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }
    });
  });
};

// Update vision mission item
export const updateVisionMissionItem = (req, res) => {
  const { id } = req.params;
  const { icon, title, description, sort_order, is_active } = req.body;

  // First, check if item exists
  const checkQuery = "SELECT * FROM vision_mission_items WHERE id = ?";
  
  db1.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching vision mission item for update:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vision mission item",
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vision mission item not found"
      });
    }

    // Update query
    const updateQuery = `
      UPDATE vision_mission_items 
      SET icon = ?, title = ?, description = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `;
    
    const currentItem = results[0];
    
    db1.query(updateQuery, [
      icon !== undefined ? icon : currentItem.icon,
      title !== undefined ? title : currentItem.title,
      description !== undefined ? description : currentItem.description,
      sort_order !== undefined ? sort_order : currentItem.sort_order,
      is_active !== undefined ? is_active : currentItem.is_active,
      id
    ], (err, updateResults) => {
      if (err) {
        console.error("❌ Error updating vision mission item:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update vision mission item",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: "Vision mission item updated successfully",
        data: {
          id: parseInt(id),
          icon: icon !== undefined ? icon : currentItem.icon,
          title: title !== undefined ? title : currentItem.title,
          description: description !== undefined ? description : currentItem.description,
          sort_order: sort_order !== undefined ? sort_order : currentItem.sort_order,
          is_active: is_active !== undefined ? is_active : currentItem.is_active
        }
      });
    });
  });
};

// Delete vision mission item
export const deleteVisionMissionItem = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM vision_mission_items WHERE id = ?";
  
  db1.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error deleting vision mission item:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete vision mission item",
        error: err.message
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Vision mission item not found"
      });
    }
    
    res.json({
      success: true,
      message: "Vision mission item deleted successfully"
    });
  });
};

// Update sort order for multiple items
export const updateSortOrder = (req, res) => {
  const { items } = req.body; // Array of { id, sort_order }

  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: "Items array is required"
    });
  }

  const promises = items.map(item => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE vision_mission_items SET sort_order = ? WHERE id = ?";
      db1.query(query, [item.sort_order, item.id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({
        success: true,
        message: "Sort order updated successfully"
      });
    })
    .catch(err => {
      console.error("❌ Error updating sort order:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update sort order",
        error: err.message
      });
    });
};






// Get stories data (single instance)
export const getStoriesData = (req, res) => {
  const query = "SELECT * FROM stories_description LIMIT 1";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching stories data:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch stories data",
        error: err.message
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : {
      id: null,
      title: "",
      description: "",
      image_path: "",
      created_at: null,
      updated_at: null
    };
    
    res.json({
      success: true,
      data: data
    });
  });
};

// Update stories data (single instance)
export const updateStoriesData = async (req, res) => {
  try {
    const { title, description, imageBase64 } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    // First check if data exists
    const checkQuery = "SELECT id, image_path FROM stories_description LIMIT 1";
    
    db1.query(checkQuery, async (err, results) => {
      if (err) {
        console.error("❌ Error checking stories data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update stories data",
          error: err.message
        });
      }

      let imageUrl = null;

      // Upload image if provided
      if (imageBase64) {
        try {
          imageUrl = await resolveImageInput(imageBase64);

          // Delete old image from FTP if it exists and new image is uploaded
          if (results.length > 0 && results[0].image_path) {
            await deleteFromFTP(results[0].image_path);
          }
        } catch (ftpError) {
          console.error("❌ FTP upload error:", ftpError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      } else if (results.length > 0) {
        // Keep existing image if no new image provided
        imageUrl = results[0].image_path;
      }

      if (results.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE stories_description 
          SET title = ?, description = ?, image_path = ? 
          WHERE id = ?
        `;
        
        db1.query(updateQuery, [
          title,
          description,
          imageUrl,
          results[0].id
        ], (err, updateResults) => {
          if (err) {
            console.error("❌ Error updating stories data:", err);
            // Delete uploaded image if database update fails
            if (imageBase64 && imageUrl) {
              deleteFromFTP(imageUrl);
            }
            return res.status(500).json({
              success: false,
              message: "Failed to update stories data",
              error: err.message
            });
          }
          
          res.json({
            success: true,
            message: "Stories data updated successfully",
            data: {
              id: results[0].id,
              title,
              description,
              image_path: imageUrl
            }
          });
        });
      } else {
        // Insert new record (first time setup)
        const insertQuery = `
          INSERT INTO stories_description (title, description, image_path) 
          VALUES (?, ?, ?)
        `;
        
        db1.query(insertQuery, [
          title,
          description,
          imageUrl
        ], (err, insertResults) => {
          if (err) {
            console.error("❌ Error creating stories data:", err);
            // Delete uploaded image if database insert fails
            if (imageBase64 && imageUrl) {
              deleteFromFTP(imageUrl);
            }
            return res.status(500).json({
              success: false,
              message: "Failed to create stories data",
              error: err.message
            });
          }
          
          res.status(201).json({
            success: true,
            message: "Stories data created successfully",
            data: {
              id: insertResults.insertId,
              title,
              description,
              image_path: imageUrl
            }
          });
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error in updateStoriesData:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stories data",
      error: error.message
    });
  }
};


// events description 

// Get event data (single instance)
export const getEventData = (req, res) => {
  const query = "SELECT * FROM event_description LIMIT 1";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching event data:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch event data",
        error: err.message
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : {
      id: null,
      description: "",
      imagepath1: "",
      imagepath2: "",
      created_at: null,
      updated_at: null
    };
    
    res.json({
      success: true,
      data: data
    });
  });
};

// Update event data (single instance)
export const updateEventData = async (req, res) => {
  try {
    const { description, imageBase641, imageBase642 } = req.body;

    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required"
      });
    }

    // First check if data exists
    const checkQuery = "SELECT id, imagepath1, imagepath2 FROM event_description LIMIT 1";
    
    db1.query(checkQuery, async (err, results) => {
      if (err) {
        console.error("❌ Error checking event data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update event data",
          error: err.message
        });
      }

      let imageUrl1 = null;
      let imageUrl2 = null;

      // Upload image1 if provided
      if (imageBase641) {
        try {
          imageUrl1 = await resolveImageInput(imageBase641, 'event1');

          // Delete old image1 from FTP if it exists and new image is uploaded
          if (results.length > 0 && results[0].imagepath1) {
            await deleteFromFTP(results[0].imagepath1);
          }
        } catch (ftpError) {
          console.error("❌ FTP upload error for image1:", ftpError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image 1",
            error: ftpError.message
          });
        }
      } else if (results.length > 0) {
        // Keep existing image1 if no new image provided
        imageUrl1 = results[0].imagepath1;
      }

      // Upload image2 if provided
      if (imageBase642) {
        try {
          imageUrl2 = await resolveImageInput(imageBase642, 'event2');

          // Delete old image2 from FTP if it exists and new image is uploaded
          if (results.length > 0 && results[0].imagepath2) {
            await deleteFromFTP(results[0].imagepath2);
          }
        } catch (ftpError) {
          console.error("❌ FTP upload error for image2:", ftpError);
          // Delete image1 if it was uploaded but image2 failed
          if (imageBase641 && imageUrl1) {
            deleteFromFTP(imageUrl1);
          }
          return res.status(500).json({
            success: false,
            message: "Failed to upload image 2",
            error: ftpError.message
          });
        }
      } else if (results.length > 0) {
        // Keep existing image2 if no new image provided
        imageUrl2 = results[0].imagepath2;
      }

      if (results.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE event_description 
          SET description = ?, imagepath1 = ?, imagepath2 = ? 
          WHERE id = ?
        `;
        
        db1.query(updateQuery, [
          description,
          imageUrl1,
          imageUrl2,
          results[0].id
        ], (err, updateResults) => {
          if (err) {
            console.error("❌ Error updating event data:", err);
            // Delete uploaded images if database update fails
            if (imageBase641 && imageUrl1) {
              deleteFromFTP(imageUrl1);
            }
            if (imageBase642 && imageUrl2) {
              deleteFromFTP(imageUrl2);
            }
            return res.status(500).json({
              success: false,
              message: "Failed to update event data",
              error: err.message
            });
          }
          
          res.json({
            success: true,
            message: "Event data updated successfully",
            data: {
              id: results[0].id,
              description,
              imagepath1: imageUrl1,
              imagepath2: imageUrl2
            }
          });
        });
      } else {
        // Insert new record (first time setup)
        const insertQuery = `
          INSERT INTO event_description (description, imagepath1, imagepath2) 
          VALUES (?, ?, ?)
        `;
        
        db1.query(insertQuery, [
          description,
          imageUrl1,
          imageUrl2
        ], (err, insertResults) => {
          if (err) {
            console.error("❌ Error creating event data:", err);
            // Delete uploaded images if database insert fails
            if (imageBase641 && imageUrl1) {
              deleteFromFTP(imageUrl1);
            }
            if (imageBase642 && imageUrl2) {
              deleteFromFTP(imageUrl2);
            }
            return res.status(500).json({
              success: false,
              message: "Failed to create event data",
              error: err.message
            });
          }
          
          res.status(201).json({
            success: true,
            message: "Event data created successfully",
            data: {
              id: insertResults.insertId,
              description,
              imagepath1: imageUrl1,
              imagepath2: imageUrl2
            }
          });
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error in updateEventData:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event data",
      error: error.message
    });
  }
};



// Get telephone data (single instance)
export const getTelephoneData = (req, res) => {
  const query = "SELECT * FROM telephone LIMIT 1";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching telephone data:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch telephone data",
        error: err.message
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : {
      id: null,
      phone_number: "",
      icon_name: "",
      created_at: null,
      updated_at: null
    };
    
    res.json({
      success: true,
      data: data
    });
  });
};

// Update telephone data (single instance)
export const updateTelephoneData = (req, res) => {
  const { phone_number, icon_name } = req.body;

  // Validate required fields
  if (!phone_number || !icon_name) {
    return res.status(400).json({
      success: false,
      message: "Phone number and icon name are required"
    });
  }

  // First check if data exists
  const checkQuery = "SELECT id FROM telephone LIMIT 1";
  
  db1.query(checkQuery, (err, results) => {
    if (err) {
      console.error("❌ Error checking telephone data:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update telephone data",
        error: err.message
      });
    }

    if (results.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE telephone 
        SET phone_number = ?, icon_name = ? 
        WHERE id = ?
      `;
      
      db1.query(updateQuery, [
        phone_number,
        icon_name,
        results[0].id
      ], (err, updateResults) => {
        if (err) {
          console.error("❌ Error updating telephone data:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update telephone data",
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: "Telephone data updated successfully",
          data: {
            id: results[0].id,
            phone_number,
            icon_name
          }
        });
      });
    } else {
      // Insert new record (first time setup)
      const insertQuery = `
        INSERT INTO telephone (phone_number, icon_name) 
        VALUES (?, ?)
      `;
      
      db1.query(insertQuery, [
        phone_number,
        icon_name
      ], (err, insertResults) => {
        if (err) {
          console.error("❌ Error creating telephone data:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create telephone data",
            error: err.message
          });
        }
        
        res.status(201).json({
          success: true,
          message: "Telephone data created successfully",
          data: {
            id: insertResults.insertId,
            phone_number,
            icon_name
          }
        });
      });
    }
  });
};




//About page


// Helper functions




// Get all content data
export const getAllContent = (req, res) => {
  const queries = {
    who_we_are: "SELECT * FROM who_we_are LIMIT 1",
    dream_and_purpose: "SELECT * FROM dream_and_purpose LIMIT 1",
    impact: "SELECT * FROM impact LIMIT 1",
    ceo: "SELECT * FROM ceo LIMIT 1",
    people_behind: "SELECT * FROM people_behind LIMIT 1",
    expert_team: "SELECT * FROM expert_team ORDER BY sort_order ASC",
    join_us: "SELECT * FROM join_us LIMIT 1",
    new_section: "SELECT * FROM new_section ORDER BY created_at DESC"
  };

  db1.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.keys(queries).forEach((key) => {
      connection.query(queries[key], (err, data) => {
        if (err) {
          console.error(`❌ Error fetching ${key}:`, err);
          results[key] = null;
        } else {
          if (key === 'expert_team' || key === 'new_section') {
            results[key] = data;
          } else {
            results[key] = data.length > 0 ? data[0] : createEmptyRecord(key);
          }
        }

        completed++;
        if (completed === totalQueries) {
          connection.release();
          res.json({
            success: true,
            data: results
          });
        }
      });
    });
  });
};

function createEmptyRecord(section) {
  const emptyRecords = {
    who_we_are: { heading: "", paragraph1: "", paragraph2: "", youtube_video_id: "" },
    dream_and_purpose: { heading: "", paragraph: "", bullets_header: "", bullets: "[]", conclusion: "" },
    impact: { heading: "", paragraph1: "", paragraph2: "", paragraph3: "" },
    ceo: { name: "", title: "", paragraph1: "", paragraph2: "", paragraph3: "", image_path: "" },
    people_behind: { heading: "", paragraph1: "", paragraph2: "", paragraph3: "" },
    join_us: { heading: "", paragraph: "", bullets: "[]", paragraph2: "", paragraph3: "", youtube_video_id: "" }
  };
  return emptyRecords[section] || {};
}

// UPDATE operations for single-instance sections (Read & Update only)
export const updateSection = async (req, res) => {
  const { section } = req.params;
  const data = req.body;

  const validSections = ['who_we_are', 'dream_and_purpose', 'impact', 'ceo', 'people_behind', 'join_us'];
  
  if (!validSections.includes(section)) {
    return res.status(400).json({
      success: false,
      message: "Invalid section"
    });
  }

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      let imagePath = data.image_path;
      // Handle image upload for CEO section
      if (section === 'ceo' && data.imageBase64) {
        try {
          imagePath = await resolveImageInput(data.imageBase64, 'ceo');

          // Get current image to delete if exists
          const currentQuery = "SELECT image_path FROM ceo LIMIT 1";
          const [current] = await new Promise((resolve, reject) => {
            connection.query(currentQuery, (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });

          if (current && current.image_path) {
            await deleteFromFTP(current.image_path);
          }
        } catch (ftpError) {
          await new Promise((resolve) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      }

      // Prepare update data
      const updateData = { ...data };
      if (imagePath) updateData.image_path = imagePath;
      delete updateData.imageBase64;

      // Handle JSON fields
      if (updateData.bullets && typeof updateData.bullets === 'object') {
        updateData.bullets = JSON.stringify(updateData.bullets);
      }

      // Check if record exists
      const checkQuery = `SELECT id FROM ${section} LIMIT 1`;
      const [existing] = await new Promise((resolve, reject) => {
        connection.query(checkQuery, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      let query, params;
      if (existing) {
        // UPDATE existing record
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        query = `UPDATE ${section} SET ${setClause} WHERE id = ?`;
        params = [...Object.values(updateData), existing.id];
      } else {
        // INSERT new record (shouldn't happen with sample data, but just in case)
        const columns = Object.keys(updateData).join(', ');
        const placeholders = Object.keys(updateData).map(() => '?').join(', ');
        query = `INSERT INTO ${section} (${columns}) VALUES (${placeholders})`;
        params = Object.values(updateData);
      }

      await new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.json({
        success: true,
        message: `${section.replace(/_/g, ' ')} updated successfully`,
        data: updateData
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error(`❌ Error updating ${section}:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to update ${section}`,
        error: error.message
      });
    }
  });
};

// CRUD operations for Expert Team
export const createExpertTeam = async (req, res) => {
  const data = req.body;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      let imagePath = null;
      if (data.imageBase64) {
        try {
          imagePath = await resolveImageInput(data.imageBase64, 'expert');
        } catch (ftpError) {
          await new Promise((resolve) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      }

      const insertData = {
        image_path: imagePath,
        image_alt: data.image_alt,
        name: data.name,
        position: data.position,
        description: data.description,
        sort_order: data.sort_order || 0
      };

      const query = "INSERT INTO expert_team (image_path, image_alt, name, position, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)";
      
      const result = await new Promise((resolve, reject) => {
        connection.query(query, Object.values(insertData), (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.status(201).json({
        success: true,
        message: "Expert team member created successfully",
        data: {
          id: result.insertId,
          ...insertData
        }
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error creating expert team member:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create expert team member",
        error: error.message
      });
    }
  });
};

export const updateExpertTeam = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const [current] = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM expert_team WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (!current) {
        await new Promise((resolve) => {
          connection.rollback(() => {
            connection.release();
            resolve();
          });
        });
        return res.status(404).json({
          success: false,
          message: "Expert team member not found"
        });
      }

      let imagePath = current.image_path;
      if (data.imageBase64) {
        try {
          imagePath = await resolveImageInput(data.imageBase64, 'expert');

          if (current.image_path) {
            await deleteFromFTP(current.image_path);
          }
        } catch (ftpError) {
          await new Promise((resolve) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      }

      const updateData = {
        image_path: imagePath,
        image_alt: data.image_alt !== undefined ? data.image_alt : current.image_alt,
        name: data.name !== undefined ? data.name : current.name,
        position: data.position !== undefined ? data.position : current.position,
        description: data.description !== undefined ? data.description : current.description,
        sort_order: data.sort_order !== undefined ? data.sort_order : current.sort_order
      };

      const query = "UPDATE expert_team SET image_path = ?, image_alt = ?, name = ?, position = ?, description = ?, sort_order = ? WHERE id = ?";
      
      await new Promise((resolve, reject) => {
        connection.query(query, [...Object.values(updateData), id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.json({
        success: true,
        message: "Expert team member updated successfully",
        data: updateData
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error updating expert team member:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update expert team member",
        error: error.message
      });
    }
  });
};

export const deleteExpertTeam = async (req, res) => {
  const { id } = req.params;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const [current] = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM expert_team WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (!current) {
        await new Promise((resolve) => {
          connection.rollback(() => {
            connection.release();
            resolve();
          });
        });
        return res.status(404).json({
          success: false,
          message: "Expert team member not found"
        });
      }

      // Delete image from FTP
      if (current.image_path) {
        await deleteFromFTP(current.image_path);
      }

      await new Promise((resolve, reject) => {
        connection.query("DELETE FROM expert_team WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.json({
        success: true,
        message: "Expert team member deleted successfully"
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error deleting expert team member:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete expert team member",
        error: error.message
      });
    }
  });
};

// CRUD operations for New Section
export const createNewSection = async (req, res) => {
  const data = req.body;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      let imagePath = null;
      if (data.imageBase64) {
        try {
          imagePath = await resolveImageInput(data.imageBase64, 'new-section');
        } catch (ftpError) {
          await new Promise((resolve) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      }

      const insertData = {
        heading: data.heading,
        paragraphs: data.paragraphs ? JSON.stringify(data.paragraphs) : "[]",
        bullets_header: data.bullets_header,
        bullets: data.bullets ? JSON.stringify(data.bullets) : "[]",
        image_path: imagePath,
        youtube_video_id: data.youtube_video_id
      };

      const query = "INSERT INTO new_section (heading, paragraphs, bullets_header, bullets, image_path, youtube_video_id) VALUES (?, ?, ?, ?, ?, ?)";
      
      const result = await new Promise((resolve, reject) => {
        connection.query(query, Object.values(insertData), (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.status(201).json({
        success: true,
        message: "New section created successfully",
        data: {
          id: result.insertId,
          ...insertData
        }
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error creating new section:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create new section",
        error: error.message
      });
    }
  });
};

export const updateNewSection = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const [current] = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM new_section WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (!current) {
        await new Promise((resolve) => {
          connection.rollback(() => {
            connection.release();
            resolve();
          });
        });
        return res.status(404).json({
          success: false,
          message: "Section not found"
        });
      }

      let imagePath = current.image_path;
      if (data.imageBase64) {
        try {
          imagePath = await resolveImageInput(data.imageBase64, 'new-section');

          if (current.image_path) {
            await deleteFromFTP(current.image_path);
          }
        } catch (ftpError) {
          await new Promise((resolve) => {
            connection.rollback(() => {
              connection.release();
              resolve();
            });
          });
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: ftpError.message
          });
        }
      }

      const updateData = {
        heading: data.heading !== undefined ? data.heading : current.heading,
        paragraphs: data.paragraphs ? JSON.stringify(data.paragraphs) : current.paragraphs,
        bullets_header: data.bullets_header !== undefined ? data.bullets_header : current.bullets_header,
        bullets: data.bullets ? JSON.stringify(data.bullets) : current.bullets,
        image_path: imagePath,
        youtube_video_id: data.youtube_video_id !== undefined ? data.youtube_video_id : current.youtube_video_id
      };

      const query = "UPDATE new_section SET heading = ?, paragraphs = ?, bullets_header = ?, bullets = ?, image_path = ?, youtube_video_id = ? WHERE id = ?";
      
      await new Promise((resolve, reject) => {
        connection.query(query, [...Object.values(updateData), id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.json({
        success: true,
        message: "New section updated successfully",
        data: updateData
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error updating new section:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update new section",
        error: error.message
      });
    }
  });
};

export const deleteNewSection = async (req, res) => {
  const { id } = req.params;

  db1.getConnection(async (err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const [current] = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM new_section WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (!current) {
        await new Promise((resolve) => {
          connection.rollback(() => {
            connection.release();
            resolve();
          });
        });
        return res.status(404).json({
          success: false,
          message: "Section not found"
        });
      }

      if (current.image_path) {
        await deleteFromFTP(current.image_path);
      }

      await new Promise((resolve, reject) => {
        connection.query("DELETE FROM new_section WHERE id = ?", [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      connection.release();

      res.json({
        success: true,
        message: "New section deleted successfully"
      });

    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => {
          connection.release();
          resolve();
        });
      });

      console.error("❌ Error deleting new section:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete new section",
        error: error.message
      });
    }
  });
};



//seo


// Get all SEO data
export const getSEOData = (req, res) => {
  const query = "SELECT * FROM website_seo LIMIT 1";
  
  db1.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    connection.query(query, (err, results) => {
      connection.release();
      
      if (err) {
        console.error("❌ Error fetching SEO data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch SEO data",
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          data: {
            url: "",
            pages: []
          }
        });
      }

      const data = {
        id: results[0].id,
        url: results[0].url,
        pages: JSON.parse(results[0].pages)
      };

      res.json({
        success: true,
        data: data
      });
    });
  });
};

// Update SEO data
export const updateSEOData = (req, res) => {
  const { url, pages } = req.body;

  if (!url || !Array.isArray(pages)) {
    return res.status(400).json({
      success: false,
      message: "URL and pages array are required"
    });
  }

  db1.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    // Check if record exists
    const checkQuery = "SELECT id FROM website_seo LIMIT 1";
    
    connection.query(checkQuery, (err, results) => {
      if (err) {
        connection.release();
        console.error("❌ Error checking SEO data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update SEO data",
          error: err.message
        });
      }

      let query, params;
      
      if (results.length > 0 && results.length===1) {
        // Update existing record
        query = "UPDATE website_seo SET url = ?, pages = ? WHERE id = ?";
        params = [url, JSON.stringify(pages), results[0].id];
      } else {
        // Insert new record
        // query = "INSERT INTO website_seo (url, pages) VALUES (?, ?)";
        // params = [url, JSON.stringify(pages)];
        res.status(404).json({
           success: false,
          message: "Not Found",
          error: "data does not exists"
        })
      }

      connection.query(query, params, (err, updateResults) => {
        connection.release();
        
        if (err) {
          console.error("❌ Error updating SEO data:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update SEO data",
            error: err.message
          });
        }

        res.json({
          success: true,
          message: "SEO data updated successfully",
          data: {
            url,
            pages
          }
        });
      });
    });
  });
};

// footer and other images

// Get footer content (single instance)
export const getFooterContent = (req, res) => {
  const query = "SELECT * FROM footercontents LIMIT 1";
  
  db1.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching footer content:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch footer content",
        error: err.message
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : {
      id: null,
      logoimage: "",
      pageimage: "",
      footertext: "",
      email: "",
      location: "",
      created_at: null,
      updated_at: null
    };
    
    res.json({
      success: true,
      data: data
    });
  });
};

// Update footer content (single instance)
export const updateFooterContent = (req, res) => {
  const { footertext, email, location, logoimage_base64,locationinfo, pageimage_base64 } = req.body;

  db1.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    // Get current footer data first
    connection.query("SELECT * FROM footercontents LIMIT 1", async (err, currentResults) => {
      if (err) {
        connection.release();
        console.error("❌ Error fetching current footer data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch current footer data",
          error: err.message
        });
      }

      const currentFooter = currentResults.length > 0 ? currentResults[0] : null;
      let logoimage = currentFooter ? currentFooter.logoimage : "";
      let pageimage = currentFooter ? currentFooter.pageimage : "";

      // Process logo image upload if provided
      const processLogoImage = () => {
        return new Promise(async (resolve, reject) => {
          if (!logoimage_base64) {
            resolve(logoimage);
            return;
          }

          try {
            let uploadedUrl = null;
            if (isUploadedMediaUrl(logoimage_base64)) {
              uploadedUrl = logoimage_base64;
            } else {
              const matches = logoimage_base64.match(/^data:(.+);base64,(.+)$/);
              if (matches) {
                const ext = matches[1].split("/")[1] || "png";
                const fileName = `footer-logo-${uniqueImageName(ext)}`;
                const fileBuffer = Buffer.from(matches[2], "base64");
                uploadedUrl = await uploadToFTP(fileName, fileBuffer);
              }
            }
            if (uploadedUrl) {
              if (currentFooter?.logoimage && currentFooter.logoimage !== uploadedUrl) {
                await deleteImageFile(currentFooter.logoimage);
              }
              logoimage = uploadedUrl;
            }
            resolve(logoimage);
          } catch (ftpError) {
            reject(ftpError);
          }
        });
      };

      // Process page image upload if provided
      const processPageImage = () => {
        return new Promise(async (resolve, reject) => {
          if (!pageimage_base64) {
            resolve(pageimage);
            return;
          }

          try {
            let uploadedUrl = null;
            if (isUploadedMediaUrl(pageimage_base64)) {
              uploadedUrl = pageimage_base64;
            } else {
              const matches = pageimage_base64.match(/^data:(.+);base64,(.+)$/);
              if (matches) {
                const ext = matches[1].split("/")[1] || "png";
                const fileName = `footer-page-${uniqueImageName(ext)}`;
                const fileBuffer = Buffer.from(matches[2], "base64");
                uploadedUrl = await uploadToFTP(fileName, fileBuffer);
              }
            }
            if (uploadedUrl) {
              if (currentFooter?.pageimage && currentFooter.pageimage !== uploadedUrl) {
                await deleteImageFile(currentFooter.pageimage);
              }
              pageimage = uploadedUrl;
            }
            resolve(pageimage);
          } catch (ftpError) {
            reject(ftpError);
          }
        });
      };

      // Process both images in parallel
      Promise.all([processLogoImage(), processPageImage()])
        .then(([finalLogo, finalPage]) => {
          // Prepare update data
          const updateData = {
            logoimage: finalLogo || null,
            pageimage: finalPage || null,
            footertext: footertext || null,
            email: email || null,
            location: location || null,
            locationinfo:locationinfo ||null
          };

          let query, params;

          if (currentFooter) {
            // Update existing record
            query = "UPDATE footercontents SET logoimage = ?, pageimage = ?, footertext = ?, email = ?, location = ?,locationinfo=? WHERE id = ?";
            params = [
              updateData.logoimage,
              updateData.pageimage,
              updateData.footertext,
              updateData.email,
              updateData.location,
              updateData.locationinfo,
              currentFooter.id
            ];
          } else {
            // Insert new record (first time setup)
            query = "INSERT INTO footercontents (logoimage, pageimage, footertext, email, location, locationinfo) VALUES (?, ?, ?, ?, ?, ?)";
            params = [
              updateData.logoimage,
              updateData.pageimage,
              updateData.footertext,
              updateData.email,
              updateData.location,
              updateData.locationinfo
            ];
          }

          // Execute the query
          connection.query(query, params, (err, results) => {
            connection.release();
            
            if (err) {
              console.error("❌ Error updating footer content:", err);
              return res.status(500).json({
                success: false,
                message: "Failed to update footer content",
                error: err.message
              });
            }

            res.json({
              success: true,
              message: "Footer content updated successfully",
              data: updateData
            });
          });
        })
        .catch((ftpError) => {
          connection.release();
          console.error("❌ FTP upload error:", ftpError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload images",
            error: ftpError.message
          });
        });
    });
  });
};

// Delete footer images
export const deleteFooterImage = (req, res) => {
  const { imageType } = req.params;

  db1.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message
      });
    }

    // Get current footer data
    connection.query("SELECT * FROM footercontents LIMIT 1", async (err, currentResults) => {
      if (err) {
        connection.release();
        console.error("❌ Error fetching current footer data:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch footer data",
          error: err.message
        });
      }

      if (currentResults.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: "Footer content not found"
        });
      }

      const currentFooter = currentResults[0];
      let updateQuery;
      let imageUrl;

      if (imageType === 'logo') {
        imageUrl = currentFooter.logoimage;
        updateQuery = "UPDATE footercontents SET logoimage = NULL WHERE id = ?";
      } else if (imageType === 'page') {
        imageUrl = currentFooter.pageimage;
        updateQuery = "UPDATE footercontents SET pageimage = NULL WHERE id = ?";
      } else {
        connection.release();
        return res.status(400).json({
          success: false,
          message: "Invalid image type. Use 'logo' or 'page'"
        });
      }

      // Delete image from FTP if it exists
      if (imageUrl) {
        try {
          await deleteImageFile(imageUrl);
        } catch (ftpError) {
          console.error("❌ Error deleting image from FTP:", ftpError);
          // Continue with database update even if FTP delete fails
        }
      }

      // Update database
      connection.query(updateQuery, [currentFooter.id], (err, results) => {
        connection.release();
        
        if (err) {
          console.error("❌ Error updating footer:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to delete image",
            error: err.message
          });
        }

        res.json({
          success: true,
          message: `${imageType} image deleted successfully`
        });
      });
    });
  });
};




// faqs


// Get all FAQs
export const getAllFAQs = async (req, res) => {
  try {
    const [faqs] = await db1.promise().query(
      'SELECT * FROM faqs ORDER BY display_order, created_at DESC'
    );
    
    res.status(200).json({
      success: true,
      data: faqs,
      count: faqs.length
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get active FAQs (for public display)
export const getActiveFAQs = async (req, res) => {
  try {
    const [faqs] = await db1.promise().query(
      'SELECT id, question, answer, display_order FROM faqs WHERE is_active = TRUE ORDER BY display_order'
    );
    
    res.status(200).json({
      success: true,
      data: faqs,
      count: faqs.length
    });
  } catch (error) {
    console.error('Error fetching active FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get single FAQ by ID
export const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [faq] = await db1.promise().query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );
    
    if (faq.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: faq[0]
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    });
  }
};

// Create new FAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, display_order = 0, is_active = true } = req.body;
    
    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }
    
    const [result] = await db1.promise().query(
      'INSERT INTO faqs (question, answer, display_order, is_active) VALUES (?, ?, ?, ?)',
      [question, answer, display_order, is_active]
    );
    
    // Fetch the created FAQ
    const [newFAQ] = await db1.promise().query(
      'SELECT * FROM faqs WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: newFAQ[0]
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, display_order, is_active } = req.body;
    
    // Check if FAQ exists
    const [existingFAQ] = await db1.promise().query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );
    
    if (existingFAQ.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    // Update FAQ
    await db1.promise().query(
      'UPDATE faqs SET question = ?, answer = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        question || existingFAQ[0].question,
        answer || existingFAQ[0].answer,
        display_order !== undefined ? display_order : existingFAQ[0].display_order,
        is_active !== undefined ? is_active : existingFAQ[0].is_active,
        id
      ]
    );
    
    // Fetch updated FAQ
    const [updatedFAQ] = await db1.promise().query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFAQ[0]
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if FAQ exists
    const [existingFAQ] = await db1.promise().query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );
    
    if (existingFAQ.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    // Delete FAQ
    await db1.promise().query('DELETE FROM faqs WHERE id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

// Bulk update display order
export const updateDisplayOrder = async (req, res) => {
  try {
    const { faqs } = req.body; // Array of {id, display_order}
    
    if (!Array.isArray(faqs)) {
      return res.status(400).json({
        success: false,
        message: 'FAQs array is required'
      });
    }
    
    // Use transaction for multiple updates
    const connection = await db1.promise().getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const faq of faqs) {
        await connection.query(
          'UPDATE faqs SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [faq.display_order, faq.id]
        );
      }
      
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: 'Display order updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating display order',
      error: error.message
    });
  }
};

// Toggle FAQ status (active/inactive)
export const toggleFAQStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [faq] = await db1.promise().query(
      'SELECT is_active FROM faqs WHERE id = ?',
      [id]
    );
    
    if (faq.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    const newStatus = !faq[0].is_active;
    
    await db1.promise().query(
      'UPDATE faqs SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    res.status(200).json({
      success: true,
      message: `FAQ ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus }
    });
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling FAQ status',
      error: error.message
    });
  }
};







// Helper function to generate unique filename
const generateUniqueFilename = (base64String) => {
  // Extract image type from base64
  const match = base64String.match(/^data:image\/(\w+);base64,/);
  const extension = match ? match[1] : 'png';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `bank_logo_${timestamp}_${randomString}.${extension}`;
};

// Get bank data (single instance)
export const getBankData = async (req, res) => {
  try {
    const [bankData] = await db1.promise().query(
      'SELECT * FROM bankdata WHERE id = 1'
    );
    
    if (bankData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank data not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bankData[0]
    });
  } catch (error) {
    console.error('Error fetching bank data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank data',
      error: error.message
    });
  }
};

// Update bank data with base64 image (FIXED VERSION)
export const updateBankData = async (req, res) => {
  try {
    const { 
      name, 
      account_title, 
      branch, 
      iban, 
      accountNumber,
      image_base64  // This is the base64 string
    } = req.body;
    
    // Validation
    if (!name || !account_title) {
      return res.status(400).json({
        success: false,
        message: 'Bank name and account title are required'
      });
    }
    
    // Get existing data first
    const [existingData] = await db1.promise().query(
      'SELECT * FROM bankdata WHERE id = 1'
    );
    
    let imagePath = existingData.length > 0 ? existingData[0].imagepath : null;
    
    if (image_base64 && typeof image_base64 === 'string' && (image_base64.startsWith('data:image/') || isUploadedMediaUrl(image_base64))) {
      try {
        let newImagePath;
        if (isUploadedMediaUrl(image_base64)) {
          newImagePath = image_base64;
        } else {
          const imageBuffer = base64ToBuffer(image_base64);
          const fileName = generateUniqueFilename(image_base64);
          newImagePath = await uploadToFTP(fileName, imageBuffer);
        }
        if (imagePath && imagePath !== newImagePath) {
          try {
            await deleteFromFTP(imagePath);
          } catch (deleteError) {
            console.log('Could not delete old image from FTP:', deleteError.message);
          }
        }
        imagePath = newImagePath;
      } catch (uploadError) {
        console.error('Error uploading image to FTP:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to FTP',
          error: uploadError.message
        });
      }
    } 
    // If image_base64 is explicitly null, remove image
    else if (image_base64 === null) {
      // Delete old image if exists
      if (imagePath) {
        try {
          await deleteFromFTP(imagePath);
        } catch (deleteError) {
          console.log('Could not delete old image:', deleteError.message);
        }
      }
      imagePath = null;
    }
    // If image_base64 is undefined (not sent in request), KEEP existing image
    // This is the fix: Don't overwrite image if not provided in request
    
    if (existingData.length === 0) {
      // Create new record
      await db1.promise().query(
        `INSERT INTO bankdata 
        (id, name, imagepath, account_title, branch, iban, accountNumber) 
        VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [name, imagePath, account_title, branch, iban, accountNumber]
      );
    } else {
      // Update existing record - ONLY update imagepath if it was changed
      await db1.promise().query(
        `UPDATE bankdata SET 
        name = ?, 
        ${image_base64 !== undefined ? 'imagepath = ?,' : ''}
        account_title = ?, 
        branch = ?, 
        iban = ?, 
        accountNumber = ?, 
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1`,
        image_base64 !== undefined 
          ? [name, imagePath, account_title, branch, iban, accountNumber]
          : [name, account_title, branch, iban, accountNumber]
      );
    }
    
    // Fetch updated data
    const [updatedData] = await db1.promise().query(
      'SELECT * FROM bankdata WHERE id = 1'
    );
    
    res.status(200).json({
      success: true,
      message: 'Bank data updated successfully',
      data: updatedData[0]
    });
  } catch (error) {
    console.error('Error updating bank data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank data',
      error: error.message
    });
  }
};

// Remove bank logo
export const removeBankLogo = async (req, res) => {
  try {
    // Get existing image path
    const [existingData] = await db1.promise().query(
      'SELECT imagepath FROM bankdata WHERE id = 1'
    );
    
    if (existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank data not found'
      });
    }
    
    // Delete image from FTP if exists
    if (existingData[0].imagepath) {
      try {
        await deleteFromFTP(existingData[0].imagepath);
      } catch (deleteError) {
        console.log('Could not delete image from FTP:', deleteError.message);
      }
    }
    
    // Remove image path from database
    await db1.promise().query(
      'UPDATE bankdata SET imagepath = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
    );
    
    // Fetch updated data
    const [updatedData] = await db1.promise().query(
      'SELECT * FROM bankdata WHERE id = 1'
    );
    
    res.status(200).json({
      success: true,
      message: 'Bank logo removed successfully',
      data: updatedData[0]
    });
  } catch (error) {
    console.error('Error removing bank logo:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing bank logo',
      error: error.message
    });
  }
};





// Get all submissions with their supporting documents
export const getAllSubmissions = (req, res) => {
  const query = `
    SELECT 
      os.*,
      COUNT(sd.id) as documents_count
    FROM organization_submissions os
    LEFT JOIN supporting_documents sd ON os.id = sd.submission_id
    GROUP BY os.id
    ORDER BY os.created_at DESC
  `;

  db1.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, data: results });
  });
};

// Get single submission with all details
export const getSubmissionById = (req, res) => {
  const { id } = req.params;
  
  const submissionQuery = "SELECT * FROM organization_submissions WHERE id = ?";
  
  db1.query(submissionQuery, [id], (err, submissionResults) => {
    if (err) {
      console.error("Error fetching submission:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (submissionResults.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    
    const documentsQuery = "SELECT * FROM supporting_documents WHERE submission_id = ?";
    
    db1.query(documentsQuery, [id], (err, documentsResults) => {
      if (err) {
        console.error("Error fetching documents:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      
      res.json({
        success: true,
        data: {
          ...submissionResults[0],
          documents: documentsResults
        }
      });
    });
  });
};




// Delete submission and associated files from FTP
export const deleteSubmission = (req, res) => {
  const { id } = req.params;
  
  db1.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: "Transaction error" });
      }
      
      // First get all file paths to delete from FTP
      const getFilesQuery = "SELECT file_path FROM supporting_documents WHERE submission_id = ?";
      
      connection.query(getFilesQuery, [id], (err, fileResults) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, message: "Error fetching files" });
          });
        }
        
        // Get logo path
        const getLogoQuery = "SELECT organization_logo_path FROM organization_submissions WHERE id = ?";
        
        connection.query(getLogoQuery, [id], (err, logoResults) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: "Error fetching logo" });
            });
          }
          
          const logoPath = logoResults[0]?.organization_logo_path;
          const documentPaths = fileResults.map(f => f.file_path);
          
          // Delete supporting documents from database
          const deleteDocsQuery = "DELETE FROM supporting_documents WHERE submission_id = ?";
          
          connection.query(deleteDocsQuery, [id], (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: "Error deleting documents" });
              });
            }
            
            // Delete main submission
            const deleteSubmissionQuery = "DELETE FROM organization_submissions WHERE id = ?";
            
            connection.query(deleteSubmissionQuery, [id], (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ success: false, message: "Error deleting submission" });
                });
              }
              
              // Commit transaction first
              connection.commit(async (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ success: false, message: "Commit error" });
                  });
                }
                
                connection.release();
                
                // Now delete files from FTP (after successful DB deletion)
                const ftpDeletePromises = [];
                
                // Delete logo if exists
                if (logoPath) {
                  ftpDeletePromises.push(deleteFromFTP(logoPath));
                }
                
                // Delete all supporting documents
                documentPaths.forEach(path => {
                  ftpDeletePromises.push(deleteFromFTP(path));
                });
                
                // Wait for all FTP deletions to complete (don't wait if you don't want to)
                try {
                  await Promise.all(ftpDeletePromises);
                  console.log(`✅ Deleted ${ftpDeletePromises.length} files from FTP`);
                } catch (ftpError) {
                  console.error("❌ Error deleting some files from FTP:", ftpError);
                  // Don't fail the request if FTP delete fails
                }
                
                res.json({
                  success: true,
                  message: "Submission deleted successfully",
                  filesDeleted: {
                    logo: !!logoPath,
                    documents: documentPaths.length
                  }
                });
              });
            });
          });
        });
      });
    });
  });
};