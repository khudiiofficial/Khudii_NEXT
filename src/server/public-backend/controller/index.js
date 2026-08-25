import db from "../Database/db.js"
import { DtoArr } from "../Dto/Dto.js";
const getAllorganization = (req,res) => {
  const sql = `
    SELECT i.id, i.name, i.deletestatus, i.description, i.youtube_video_url, i.introductory_image_path,
        i.partner_image,i.slug, i.meta_title, i.meta_description, i.meta_keywords,
           GROUP_CONCAT(DISTINCT img.image_path) AS images
    FROM items i
    LEFT JOIN item_images img ON i.id = img.item_id WHERE i.deletestatus = 0
    GROUP BY i.id ORDER BY i.id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Convert images string → array
    let items = rows.map((row) => ({
      ...row,
      images: row.images ? row.images.split(",") : [],
      urls: [],
      // Include SEO fields
      slug: row.slug || "",
      meta_title: row.meta_title || "",
      meta_description: row.meta_description || "",
      meta_keywords: row.meta_keywords || "",
    }));

  res.status(200).json(items)
  });
};

export { getAllorganization };


const getSpecificItem = (req, res) => {
  const { slug } = req.params;
let id;
  const sql = `
    SELECT i.id, i.name, i.description, i.deletestatus, i.category, i.youtube_video_url, i.introductory_image_path,
           i.slug, i.meta_title, i.meta_description, i.meta_keywords,
           GROUP_CONCAT(DISTINCT img.image_path) AS images
    FROM items i
    LEFT JOIN item_images img ON i.id = img.item_id
    WHERE i.slug = ? AND i.deletestatus = 0
    GROUP BY i.id;
  `;

  db.query(sql, [slug], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    id=rows[0].id
    if (rows[0].deletestatus === 1) {
      return res.status(404).json({ message: "Item not found" });
    }

    let item = {
      ...rows[0],
      images: rows[0].images ? rows[0].images.split(",") : [],
      urls: [],
      // Include SEO fields
      slug: rows[0].slug || "",
      meta_title: rows[0].meta_title || "",
      meta_description: rows[0].meta_description || "",
      meta_keywords: rows[0].meta_keywords || "",
    };

    // Fetch URLs for this item
    db.query(
      "SELECT CAST(urls AS CHAR) AS urls FROM item_urls WHERE item_id = ?",
      [id],
      (err, urlRows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (urlRows.length > 0) {
          try {
            item.urls = JSON.parse(urlRows[0].urls);
          } catch (e) {
            item.urls = urlRows[0].urls.split(",").map((u) => u.trim());
          }
        }

        res.status(200).json(item);
      }
    );
  });
}
export { getSpecificItem }
const getAllIcons=(req,res)=>{
const {id}=req.params
db.query('SELECT * FROM icons where item_id=?',[id],(err,rows)=>{
  if(err){
    return res.status(500).json({error:err.message})
  }
if(rows.length===0){
  return res.status(200).json([])
}

  res.status(200).json(rows)

})
}

export {getAllIcons}


export const getSocials=(req,res)=>{
  const { item_id } = req.params;
  db.query(
    "SELECT * FROM socials WHERE item_id = ?",
    [item_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results[0]); // return single row
    }
  );
}



// Helper for unique image name
function uniqueImageName(extension = "png") {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${extension}`;
}

// // ---------- INSERT ----------
// export const CreateBlog=(req, res) => {
//   const { Intro, Conclusion, ImageBase64, Arr, NGOs ,Name} = req.body;

//   db.beginTransaction((err) => {
//     if (err) return res.status(500).json({ error: err.message });

//     // Handle image
//     let imageUrl = null;
//     if (ImageBase64) {
//       try {
//         const matches = ImageBase64.match(/^data:image\/(\w+);base64,/);
//         const ext = matches ? matches[1] : "png";
//         const base64Data = ImageBase64.replace(/^data:image\/\w+;base64,/, "");
//         const fileName = uniqueImageName(ext);
//         fs.writeFileSync(path.join(storagePath, fileName), base64Data, "base64");
//         imageUrl = `http://localhost:5000/storage/${fileName}`;
//       } catch (e) {
//         return db.rollback(() =>
//           res.status(500).json({ error: "Image saving failed", details: e.message })
//         );
//       }
//     }

//     // Insert Document
//     db.query(
//       "INSERT INTO Document (intro, conclusion, image_path,Name) VALUES (?, ?, ?, ?)",
//       [Intro, Conclusion, imageUrl,Name],
//       (err, result) => {
//         if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

//         const documentId = result.insertId;

//         // Insert Arr
//         if (Arr && Arr.length > 0) {
//           Arr.forEach((section) => {
//             db.query(
//               "INSERT INTO DocumentArr (document_id, heading, start, bullet_header, end) VALUES (?, ?, ?, ?, ?)",
//               [documentId, section.Heading, section.Start, section.Bullet_Header, section.End],
//               (err, arrRes) => {
//                 if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

//                 const arrId = arrRes.insertId;
//                 if (section.Bullets && section.Bullets.length > 0) {
//                   section.Bullets.forEach((b) => {
//                     db.query(
//                       "INSERT INTO DocumentArrBullets (arr_id, bullet) VALUES (?, ?)",
//                       [arrId, b]
//                     );
//                   });
//                 }
//               }
//             );
//           });
//         }

//         // Insert NGOs
//         db.query(
//           "INSERT INTO NGOs (document_id, intro) VALUES (?, ?)",
//           [documentId, NGOs.INTRO],
//           (err, ngoRes) => {
//             if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

//             const ngosId = ngoRes.insertId;

//             if (NGOs.Arr && NGOs.Arr.length > 0) {
//               NGOs.Arr.forEach((n) => {
//                 db.query(
//                   "INSERT INTO NGOsArr (ngos_id, h1) VALUES (?, ?)",
//                   [ngosId, n.h1],
//                   (err, ngosArrRes) => {
//                     if (err)
//                       return db.rollback(() => res.status(500).json({ error: err.message }));

//                     const ngosArrId = ngosArrRes.insertId;
//                     if (n.OF && n.OF.length > 0) {
//                       n.OF.forEach((val) => {
//                         db.query("INSERT INTO NGOsArrOF (ngos_arr_id, value) VALUES (?, ?)", [
//                           ngosArrId,
//                           val,
//                         ]);
//                       });
//                     }
//                   }
//                 );
//               });
//             }

//             db.commit((err) => {
//               if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
//               res.json({ message: "Blog inserted successfully", documentId });
//             });
//           }
//         );
//       }
//     );
//   });
// };
// finished creating a blog

// reading a specific blog
// export const getSpecificBlog = (req, res) => {
//   const { id } = req.params;

//   db.query("SELECT * FROM document WHERE id = ?", [id], (err, docRows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (docRows.length === 0) return res.status(404).json({ message: "Not found" });
//     if (docRows[0].deletestatus === 1) { return res.status(404).json({ message: "Not Found" }) }
    
//     const document = {
//       Intro: docRows[0].intro,
//       Name: docRows[0].Name,
//       Conclusion: docRows[0].conclusion,
//       Image: docRows[0].image_path,
//       // Include SEO fields
//       slug: docRows[0].slug || "",
//       meta_title: docRows[0].meta_title || "",
//       meta_description: docRows[0].meta_description || "",
//       meta_keywords: docRows[0].meta_keywords || "",
//       Arr: [],
//       NGOs: { INTRO: "", Arr: [] },
//     };

//     db.query("SELECT * FROM documentarr WHERE document_id = ?", [id], (err, arrRows) => {
//       if (err) return res.status(500).json({ error: err.message });
// console.log(arrRows)
//       let arrCount = arrRows.length;
//       if (arrCount === 0) return fetchNGOs(document);

//       arrRows.forEach((arr) => {
//         db.query("SELECT bullet FROM documentarrbullets WHERE arr_id = ?", [arr.id], (err, bRows) => {
//           if (err) return res.status(500).json({ error: err.message });

//           document.Arr.push({
//             Heading: arr.heading,
//             Start: arr.start,
//             Bullet_Header: arr.bullet_header,
//             Bullets: bRows.map((b) => b.bullet),
//             End: arr.end,
//           });

//           arrCount--;
//           if (arrCount === 0) fetchNGOs(document);
//         });
//       });
//     });

//     function fetchNGOs(document) {
//       db.query("SELECT * FROM ngos WHERE document_id = ?", [id], (err, ngoRows) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (ngoRows.length === 0) return res.status(200).json(document);

//         document.NGOs.INTRO = ngoRows[0].intro;

//         db.query("SELECT * FROM ngosarr WHERE ngos_id = ?", [ngoRows[0].id], (err, ngosArrRows) => {
//           if (err) return res.status(500).json({ error: err.message });

//           let ngosArrCount = ngosArrRows.length;
//           if (ngosArrCount === 0) return res.status(200).json(document);

//           ngosArrRows.forEach((n) => {
//             db.query("SELECT value FROM ngosarrof WHERE ngos_arr_id = ?", [n.id], (err, ofRows) => {
//               if (err) return res.status(500).json({ error: err.message });

//               document.NGOs.Arr.push({
//                 h1: n.h1,
//                 OF: ofRows.map((o) => o.value),
//               });

//               ngosArrCount--;
//               if (ngosArrCount === 0) res.status(200).json(document);
//             });
//           });
//         });
//       });
//     }
//   });
// };

// reading a specific blog finished


export const getSpecificBlog = async (req, res) => {
  const { slug } = req.params;
  let id;
  try {
    // 1️⃣ Fetch the main document
    const [docRows] = await db.promise().query("SELECT * FROM document WHERE slug = ?", [slug]);
    if (docRows.length === 0) return res.status(404).json({ message: "Not found" });
    id = docRows[0].id;
    if (docRows[0].deletestatus === 1) return res.status(404).json({ message: "Not Found" });

    const doc = docRows[0];

    const document = {
      Intro: doc.intro,
      Name: doc.Name,
      Conclusion: doc.conclusion,
      Image: doc.image_path,
      slug: doc.slug || "",
      meta_title: doc.meta_title || "",
      meta_description: doc.meta_description || "",
      meta_keywords: doc.meta_keywords || "",
      Arr: [],
      NGOs: { INTRO: "", Arr: [] },
    };

    // 2️⃣ Fetch document sections (ordered by id)
    const [arrRows] = await db.promise().query(
      "SELECT * FROM documentarr WHERE document_id = ? ORDER BY id ASC",
      [id]
    );

    for (const arr of arrRows) {
      const [bRows] = await db.promise().query(
        "SELECT bullet FROM documentarrbullets WHERE arr_id = ? ORDER BY id ASC",
        [arr.id]
      );

      document.Arr.push({
        Heading: arr.heading,
        Start: arr.start,
        Bullet_Header: arr.bullet_header,
        Bullets: bRows.map((b) => b.bullet),
        End: arr.end,
      });
    }

    // 3️⃣ Fetch NGOs (ordered by id)
    const [ngoRows] = await db.promise().query(
      "SELECT * FROM ngos WHERE document_id = ? ORDER BY id ASC",
      [id]
    );

    if (ngoRows.length > 0) {
      const ngo = ngoRows[0];
      document.NGOs.INTRO = ngo.intro;

      const [ngosArrRows] = await db.promise().query(
        "SELECT * FROM ngosarr WHERE ngos_id = ? ORDER BY id ASC",
        [ngo.id]
      );

      for (const n of ngosArrRows) {
        const [ofRows] = await db.promise().query(
          "SELECT value FROM ngosarrof WHERE ngos_arr_id = ? ORDER BY id ASC",
          [n.id]
        );

        document.NGOs.Arr.push({
          h1: n.h1,
          OF: ofRows.map((o) => o.value),
        });
      }
    }

    // ✅ Return the structured document
    res.status(200).json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};




//getAllBlogs

// Add this to your server.js (assumes `db` connection exists)
export const getAllBlogs = (req, res) => {
  db.query("SELECT * FROM document", (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!docs || docs.length === 0) return res.json([]);

    const results = [];
    let processedDocs = 0;
    let hasErrored = false;

    function handleError(err) {
      if (!hasErrored) {
        hasErrored = true;
        return res.status(500).json({ error: err.message || err });
      }
    }

    docs.forEach((doc) => {
      // Build the object to return
      const fullDoc = {
        id: doc.id,
        Name: doc.Name,
        deletestatus: doc.deletestatus,
        Intro: doc.intro,
        Conclusion: doc.conclusion,
        Image: doc.image_path,
        // Include SEO fields
        slug: doc.slug || "",
        meta_title: doc.meta_title || "",
        meta_description: doc.meta_description || "",
        meta_keywords: doc.meta_keywords || "",
        Arr: [],
        NGOs: { INTRO: "", Arr: [] },
      };

      let arrDone = false;
      let ngosDone = false;

      function checkDocDoneAndPush() {
        if (arrDone && ngosDone) {
          results.push(fullDoc);
          processedDocs++;
          if (processedDocs === docs.length) {
            return res.status(200).json(DtoArr(results));
          }
        }
      }

      // ---------- Fetch Arr and Bullets ----------
      db.query(
        "SELECT * FROM documentarr WHERE document_id = ?",
        [doc.id],
        (err, arrRows) => {
          if (err) return handleError(err);

          if (!arrRows || arrRows.length === 0) {
            arrDone = true;
            checkDocDoneAndPush();
          } else {
            let remainingArr = arrRows.length;

            arrRows.forEach((arr) => {
              db.query(
                "SELECT bullet FROM documentarrbullets WHERE arr_id = ?",
                [arr.id],
                (err, bulletRows) => {
                  if (err) return handleError(err);

                  fullDoc.Arr.push({
                    Heading: arr.heading,
                    Start: arr.start,
                    Bullet_Header: arr.bullet_header,
                    Bullets: (bulletRows || []).map((b) => b.bullet),
                    End: arr.end,
                  });

                  remainingArr--;
                  if (remainingArr === 0) {
                    arrDone = true;
                    checkDocDoneAndPush();
                  }
                }
              );
            });
          }
        }
      );

      // ---------- Fetch NGOs -> NGOsArr -> NGOsArrOF ----------
      db.query(
        "SELECT * FROM ngos WHERE document_id = ?",
        [doc.id],
        (err, ngoRows) => {
          if (err) return handleError(err);

          if (!ngoRows || ngoRows.length === 0) {
            ngosDone = true;
            checkDocDoneAndPush();
          } else {
            // Use first NGOs row as the root for this document (matches previous code)
            fullDoc.NGOs.INTRO = ngoRows[0].intro || "";

            db.query(
              "SELECT * FROM ngosarr WHERE ngos_id = ?",
              [ngoRows[0].id],
              (err, ngosArrRows) => {
                if (err) return handleError(err);

                if (!ngosArrRows || ngosArrRows.length === 0) {
                  ngosDone = true;
                  checkDocDoneAndPush();
                } else {
                  let remainingNGOArr = ngosArrRows.length;

                  ngosArrRows.forEach((n) => {
                    db.query(
                      "SELECT value FROM ngosarrof WHERE ngos_arr_id = ?",
                      [n.id],
                      (err, ofRows) => {
                        if (err) return handleError(err);

                        fullDoc.NGOs.Arr.push({
                          h1: n.h1,
                          OF: (ofRows || []).map((o) => o.value),
                        });

                        remainingNGOArr--;
                        if (remainingNGOArr === 0) {
                          ngosDone = true;
                          checkDocDoneAndPush();
                        }
                      }
                    );
                  });
                }
              }
            );
          }
        }
      );
    });
  });
};


// export const getSmilarItems=(req,res)=>{

//     const search = req.query.search || "";
//   const sql = "SELECT * FROM items WHERE name LIKE ?";
//   db.query(sql, [`%${search}%`], (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching organizations:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.status(200).json(DtoArr(results));
//   });
// }
// export const getSmilarItems = (req, res) => {
//     const search = req.query.search || "";
    
//  db.query('SELECT * FROM items WHERE JSON_CONTAINS(category, ?)', [JSON.stringify(search)], (err, result) => {
//     if (err) {
//       console.error("Database Error:", err);
//       res.status(500).json({ error: "Database Error" });
//       return;
//     }
//     console.log(result)
//     if(DtoArr(result).length!==0){
//  return res.status(200).json(DtoArr(result));
//     }
  
//   });


//     // Search in both name and search_tags fields
//     const sql = "SELECT * FROM items WHERE name LIKE ? OR search_tags LIKE ?";
    
//     db.query(sql, [`%${search}%`, `%${search}%`], (err, results) => {
//         if (err) {
//             console.error("❌ Error fetching items:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         res.status(200).json(DtoArr(results));
//     });
// }

// export const getSmilarItems = (req, res) => {
//   const search = req.query.search || "";

//   const sql1 = "SELECT * FROM items WHERE JSON_CONTAINS(category, ?)";
//   //   const sql1 = `
//   //   SELECT * FROM items
//   //   WHERE JSON_SEARCH(LOWER(category), 'one', LOWER(?)) IS NOT NULL
//   // `;
//   const sql2 = "SELECT * FROM items WHERE name LIKE ? OR search_tags LIKE ?";

//   db.query(sql1, [JSON.stringify(search)], (err, result1) => {
//     if (err) {
//       console.error("❌ Database Error:", err);
//       return res.status(500).json({ error: "Database Error" });
//     }
//     console.log(DtoArr(result1))
//     const arr1 = DtoArr(result1);

//     // if (arr1.length > 0) {
//     //   return res.status(200).json(arr1); // ⬅ response sent here
//     // }

//     // otherwise run second query
//     db.query(sql2, [`%${search}%`, `%${search}%`], (err, result2) => {
//       if (err) {
//         console.error("❌ Database Error:", err);
//         return res.status(500).json({ error: "Database Error" });
//       }
// const newarr=[...result1,...result2]
// const data=[...new Set(newarr)]
//       return res.status(200).json(DtoArr(data)); // ⬅ only sent once
//     });
//   });
// };

export const getSimilarItems = async (req, res) => {
  const search = req.query.search || "";

  if (!search) {
    return res.status(400).json({ error: "Search parameter is required" });
  }

  try {
    // Case insensitive search in JSON category array
    const sql1 = `
      SELECT * FROM items 
      WHERE EXISTS (
        SELECT 1 FROM JSON_TABLE(
          category, 
          '$[*]' COLUMNS (category_name VARCHAR(50) PATH '$')
        ) AS categories 
        WHERE LOWER(categories.category_name) = LOWER(?)
      )
    `;

    // Alternative if JSON_TABLE not supported:
    // const sql1 = `
    //   SELECT * FROM items 
    //   WHERE JSON_SEARCH(LOWER(category), 'all', LOWER(?)) IS NOT NULL
    // `;

    // Case insensitive search in name and search_tags
    const sql2 = "SELECT * FROM items WHERE LOWER(name) LIKE LOWER(?) OR LOWER(search_tags) LIKE LOWER(?)";

    // Execute both queries in parallel for better performance
    const [result1, result2] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(sql1, [search], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(sql2, [`%${search}%`, `%${search}%`], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    ]);

    // Combine results from both queries
    const combinedResults = [...DtoArr(result1), ...DtoArr(result2)];
    
    // Remove duplicates based on item ID (assuming each item has unique 'id')
    const uniqueResults = combinedResults.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );

    // Alternative: Using Map for better performance with large datasets
    // const uniqueResults = Array.from(
    //   new Map(combinedResults.map(item => [item.id, item])).values()
    // );

    // console.log(`Found ${uniqueResults.length} unique items`);
    return res.status(200).json(uniqueResults);

  } catch (err) {
    console.error("❌ Database Error:", err);
    return res.status(500).json({ error: "Database Error" });
  }
};

import { sendContactEmail } from "../utils/emailService.js";
export const saveContacts=(req,res)=>{

  const {
    name,
    subject,
    phone,
    countryCode,
    CountryName,
    country,
    email,
    message,
  } = req.body;
const obj={
   name,
    subject,
    phone,
    countryCode,
    CountryName,
    country,
    email,
    message,
}

  if (!name || !subject || !phone || !email || !message) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const sql = `
    INSERT INTO contact_messages
    (name, subject, phone, countryCode, countryName, country, email, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    subject,
    phone,
    countryCode,
    CountryName,
    country,
    email,
    message,
  ];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("❌ Error inserting contact message:", err);
      return res.status(500).json({ error: "Database error" });
    }
    await sendContactEmail(obj);
    return res.status(200).json({ message: "Contact saved successfully" });
  });


}


import { sendVolunteerEmail } from "../utils/emailService.js";
export const AddVolunteer=(req,res)=>{


  const { name, email, phone, countryCode, CountryName, country, contactTime, message } = req.body;
const obj={
  name, email, phone, countryCode, CountryName, country, contactTime, message
}
  if (!name || !email || !phone || !contactTime) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }

  const sql = `
    INSERT INTO volunteers (name, email, phone, countryCode, CountryName, country, contactTime, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, phone, countryCode, CountryName, country, contactTime, message], async (err, result) => {
    if (err) {
      console.error("❌ Error inserting volunteer:", err);
      return res.status(500).json({ error: "Database error" });
    }
    await sendVolunteerEmail(obj);
    return res.status(200).json({ message: "Volunteer application saved successfully!" });
  });



}

import { sendJobApplicationEmail } from "../utils/emailService.js";
export const ApplyForJob=(req,res)=>{

  const {
    name,
    phone,
    email,
    countryCode,
    CountryName,
    country,
    experience,
    qualification,
    interestedPost,
    message,
  } = req.body;
const obj={
   name,
    phone,
    email,
    countryCode,
    CountryName,
    country,
    experience,
    qualification,
    interestedPost,
    message
}
  if (!name || !email || !experience) {
    return res.status(400).json({ error: "Name, email, and experience are required." });
  }

  const sql = `
    INSERT INTO job_applications
    (name, phone, email, countryCode, CountryName, country, experience, qualification, interestedPost, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, phone, email, countryCode, CountryName, country, experience, qualification, interestedPost, message],
    async (err, result) => {
      if (err) {
        console.error("❌ Error inserting job application:", err);
        return res.status(500).json({ error: "Database error" });
      }
      await sendJobApplicationEmail(obj);
      return res.status(200).json({ message: "Job application submitted successfully!" });
    }
  );


}

import { sendStoryEmail } from "../utils/emailService.js";
export const ContributeStory=(req,res)=>{


  const {
    entityType,
    name,
    email,
    phone,
    countryCode,
    CountryName,
    country,
    company,
    story,
  } = req.body;
const obj={
    entityType,
    name,
    email,
    phone,
    countryCode,
    CountryName,
    country,
    company,
    story
}
  if (!entityType || !name || !email || !phone || !story) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  const sql = `
    INSERT INTO contribute_stories
    (entityType, name, email, phone, countryCode, CountryName, country, company, story)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [entityType, name, email, phone, countryCode, CountryName, country, company, story],
    async (err, result) => {
      if (err) {
        console.error("❌ Error inserting story:", err);
        return res.status(500).json({ error: "Database error" });
      }
      await sendStoryEmail(obj);
      return res.status(200).json({ message: "Story submitted successfully!" });
    }
  );



}

import { sendDonationEmail } from "../utils/emailService.js";
export const Donation=(req,res)=>{

  const {
    firstName,
    lastName,
    email,
    phone,
    countryCode,
    CountryName,
    country,
    donationAmount,
    donationType,
    address1,
    city,
    state,
    message,
  } = req.body;
const obj={
      firstName,
    lastName,
    email,
    phone,
    countryCode,
    CountryName,
    country,
    donationAmount,
    donationType,
    address1,
    city,
    state,
    message
}
  if (!firstName || !lastName || !phone || !donationAmount || !donationType || !address1 || !city || !state) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  const sql = `
    INSERT INTO donations 
    (firstName, lastName, email, phone, countryCode, CountryName, country, donationAmount, donationType, address1, city, state, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [firstName, lastName, email, phone, countryCode, CountryName, country, donationAmount, donationType, address1, city, state, message],
    async (err, result) => {
      if (err) {
        console.error("❌ Error inserting donation:", err);
        return res.status(500).json({ error: "Database error" });
      }
      await sendDonationEmail(obj);
      return res.status(200).json({ message: "Donation submitted successfully!" });
    }
  );

}


export const itemByCategory = (req, res) => {
  const { name } = req.params;
  
  // Use JSON_CONTAINS to search within the JSON array
  db.query('SELECT * FROM items WHERE JSON_CONTAINS(category, ?)', [JSON.stringify(name)], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Database Error" });
      return;
    }
    res.status(200).json(DtoArr(result));
  });
};


export const getsuccessstories=(req,res)=>{
db.query('SELECT * FROM successstories WHERE deletestatus = 0 ORDER BY id DESC',(err,results)=>{
if(err){
  return res.status(500).json({message:"could not get"})
}
if(results.length===0){
  return res.status(400).json({message:"Not found"})
}

res.status(200).json(results)

})
}

export const getStoryBySlug=async(req,res)=>{
const {slug}=req.params
db.query('SELECT * FROM successstories WHERE deletestatus = 0 AND slug = ?',[slug],(err,results)=>{
if(err){
  return res.status(500).json({message:"could not get"})
}
if(results.length===0){
  return res.status(404).json({message:"Story not found"})
}
res.status(200).json(results[0])

})
}


export const getAllVideos=(req,res)=>{

db.query('SELECT * FROM videos',(err,results)=>{
  if(err){
    return res.status(500).json({message:"could not get"})
  }
  if(results.length===0){
    return res.status(200).json([])
  }
  return res.status(200).json(DtoArr(results))
})
}

import { sendContactInquiryEmail } from "../utils/emailService.js";


export const createContactInquiry = async (req, res) => {
  const {
    name,
    email,
    phone,
    message,
    OrgId,
    countryCode = "92",
    CountryName = "Pakistan",
    country = "PK"
  } = req.body;

  // Validation
  if (!name || !email || !phone) {
    return res.status(400).json({
      error: "Name, email, and phone are required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email address"
    });
  }

  // Get owner email
  const getOwnerQuery = `SELECT * FROM owners`;
  
  db.query(getOwnerQuery, async (ownerError, ownerResults) => {
    if (ownerError || ownerResults.length === 0) {
      console.error("Error fetching owner:", ownerError);
      // Still save the inquiry even if owner not found
      return saveInquiryWithoutEmail();
    }
    const senderemail=ownerResults[0].sender_email
    const appPassword=ownerResults[0].sender_app_password
    const ownerEmail = ownerResults[0].email;
    saveInquiryWithEmail(ownerEmail);

    function saveInquiryWithEmail(ownerEmail) {
      const insertQuery = `
        INSERT INTO contact_inquiries 
        (name, email, phone, message, org_id, country_code, country_name, country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        message ? message.trim() : null,
        OrgId || null,
        countryCode,
        CountryName,
        country
      ];

      db.query(insertQuery, values, async (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({
            error: "Failed to save inquiry"
          });
        }

        const inquiryId = results.insertId;
        
        // Prepare data for email
        const inquiryData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          message: message ? message.trim() : null,
          org_id: OrgId || null,
          country_code: countryCode,
          country_name: CountryName,
          country: country
        };

        try {
          // Send email to owner
          await sendContactInquiryEmail(senderemail,appPassword,inquiryData, ownerEmail);
          console.log(`✅ New contact inquiry submitted - ID: ${inquiryId}`);
        } catch (emailError) {
          console.error("Email sending failed but inquiry saved:", emailError);
        }

        res.status(201).json({
          message: "Thank you for your inquiry! We'll get back to you soon.",
          inquiryId: inquiryId,
          success: true
        });
      });
    }

    function saveInquiryWithoutEmail() {
      const insertQuery = `
        INSERT INTO contact_inquiries 
        (name, email, phone, message, org_id, country_code, country_name, country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        message ? message.trim() : null,
        OrgId || null,
        countryCode,
        CountryName,
        country
      ];

      db.query(insertQuery, values, (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({
            error: "Failed to save inquiry"
          });
        }

        console.log(`✅ New contact inquiry submitted (no email) - ID: ${results.insertId}`);
        
        res.status(201).json({
          message: "Thank you for your inquiry! We'll get back to you soon.",
          inquiryId: results.insertId,
          success: true
        });
      });
    }
  });
};


export const getAllTopbarContents = (req, res) => {
  const query = 'SELECT * FROM topbarcontent ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching topbar contents:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching topbar contents',
        error: err.message
      });
    }
    
    res.status(200).json(results);
  });
};



export const getAllCertifications = async (req, res) => {
  try {
    const query = 'SELECT * FROM certifications ORDER BY display_order ASC, created_at DESC';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching certifications:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching certifications',
          error: err.message
        });
      }
      
      res.status(200).json(results);
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

// Get all testimonials
export const getAllTestimonials = (req, res) => {
  const query = 'SELECT * FROM testimonials ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
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


// Get all events
export const getAllEvents = (req, res) => {
  const query = 'SELECT * FROM events ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
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

//sector
export const getAllSectors = (req, res) => {
  const query = 'SELECT * FROM sectors ORDER BY id ASC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching sectors:', err.message);
      return res.status(200).json({ success: true, data: [], warning: 'Database query failed, returned empty sectors list.' });
    }
    res.status(200).json({ success: true, data: results });
  });
};

//find category by name

export const getCBN=async(req,res)=>{
  const {slug}=req.params
  // console.log(name)
  const query='SELECT * FROM sectors WHERE slug=?'
    db.query(query,[slug], (err, results) => {
    if (err) {
      console.error('❌ Error fetching sectors:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if(results.length===0){
      return res.status(400).json({ success: false, error: 'Not Found' });
    }
    
    res.status(200).json({ success: true, data: results[0] });
  });
}


//get images
export const getAllCarouselImages = (req, res) => {
  const query = "SELECT * FROM crousel_images ORDER BY created_at ASC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching carousel images:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch carousel images",
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  });
};


export const getWelcomeSection = (req, res) => {
  const query = "SELECT * FROM welcomesection LIMIT 1";
  
  db.query(query, (err, results) => {
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
    
    res.status(200).json({
      success: true,
      data: data
    });
  });
};




export const getAllVisionMissionItems = (req, res) => {
  const query = "SELECT * FROM vision_mission_items ORDER BY sort_order ASC, created_at ASC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching vision mission items:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vision mission items",
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  });
};



export const getStoriesData = (req, res) => {
  const query = "SELECT * FROM stories_description LIMIT 1";
  
  db.query(query, (err, results) => {
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
    
    res.status(200).json({
      success: true,
      data: data
    });
  });
};



export const getEventData = (req, res) => {
  const query = "SELECT * FROM event_description LIMIT 1";
  
  db.query(query, (err, results) => {
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
    
    res.status(200).json({
      success: true,
      data: data
    });
  });
};



// Get telephone data (single instance)
export const getTelephoneData = (req, res) => {
  const query = "SELECT * FROM telephone LIMIT 1";
  
  const fallback = {
    id: null,
    phone_number: "",
    icon_name: "",
    created_at: null,
    updated_at: null
  };

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching telephone data:", err.message);
      return res.status(200).json({
        success: true,
        data: fallback,
        warning: "Database query failed, returned default telephone data."
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : fallback;
    
    res.status(200).json({
      success: true,
      data: data
    });
  });
};



export const getFooterContent = (req, res) => {
  const query = "SELECT * FROM footercontents LIMIT 1";
  
  const fallback = {
    id: null,
    logoimage: "",
    pageimage: "",
    footertext: "",
    email: "",
    location: "",
    created_at: null,
    updated_at: null
  };

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching footer content:", err.message);
      return res.status(200).json({
        success: true,
        data: fallback,
        warning: "Database query failed, returned default footer content."
      });
    }
    
    // If no data exists, return empty object
    const data = results.length > 0 ? results[0] : fallback;
    
    res.status(200).json({
      success: true,
      data: data
    });
  });
};


export const getAllContent = (req, res) => {
  const queries = {
    who_we_are: "SELECT * FROM who_we_are LIMIT 1",
    dream_and_purpose: "SELECT * FROM dream_and_purpose LIMIT 1",
    impact: "SELECT * FROM impact LIMIT 1",
    ceo: "SELECT * FROM ceo LIMIT 1",
    people_behind: "SELECT * FROM people_behind LIMIT 1",
    expert_team: "SELECT * FROM expert_team ORDER BY sort_order ASC",
    join_us: "SELECT * FROM join_us LIMIT 1",
    new_section: "SELECT * FROM new_section ORDER BY created_at DESC",
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach((key) => {
    db.query(queries[key], (err, data) => {
      if (err) {
        console.error(`❌ Error fetching ${key}:`, err);
        results[key] = null;
      } else {
        if (key === "expert_team" || key === "new_section") {
          results[key] = data; // full array
        } else {
          results[key] = data.length > 0 ? data[0] : createEmptyRecord(key);
        }
      }

      completed++;

      if (completed === totalQueries) {
        res.json({
          success: true,
          data: results,
        });
      }
    });
  });
};

const createEmptyRecord = (key) => {
  return {
    id: null,
    title: "",
    description: "",
    image: "",
    created_at: null,
    updated_at: null,
  };
};


export const getSEOData = (req, res) => {
  const query = "SELECT * FROM website_seo LIMIT 1";

  const fallback = {
    id: null,
    url: "",
    pages: [],
  };

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching SEO data:", err.message);
      return res.status(200).json({
        success: true,
        data: fallback,
        warning: "Database query failed, returned default SEO data."
      });
    }

    // If no data exists, return empty default
    let parsedPages = [];
    if (results.length > 0 && results[0].pages) {
      try {
        parsedPages = typeof results[0].pages === 'string' ? JSON.parse(results[0].pages) : results[0].pages;
      } catch (parseErr) {
        console.error("❌ Error parsing SEO pages JSON:", parseErr.message);
      }
    }

    const data =
      results.length > 0
        ? {
            id: results[0].id,
            url: results[0].url || "",
            pages: parsedPages,
          }
        : fallback;

    res.json({
      success: true,
      data: data,
    });
  });
};



export const getActiveFAQs = async (req, res) => {
  try {
    const [faqs] = await db.promise().query(
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


export const getBankData = async (req, res) => {
  try {
    const [bankData] = await db.promise().query(
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



export const DetailForAll = async (req, res) => {
  const { slug } = req.params;

  try {
    // Try to find in items/organizations first
    const sql = `
      SELECT i.id, i.name, i.description, i.deletestatus, i.category, i.youtube_video_url, i.introductory_image_path,
             i.slug, i.meta_title, i.meta_description, i.meta_keywords,
             GROUP_CONCAT(DISTINCT img.image_path) AS images
      FROM items i
      LEFT JOIN item_images img ON i.id = img.item_id
      WHERE i.slug = ? AND i.deletestatus = 0
      GROUP BY i.id;
    `;

    // Using promises for better async handling
    const itemRows = await new Promise((resolve, reject) => {
      db.query(sql, [slug], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // If item found
    if (itemRows.length > 0) {
      const item = {
        ...itemRows[0],
        images: itemRows[0].images ? itemRows[0].images.split(",") : [],
        urls: [],
        slug: itemRows[0].slug || "",
        meta_title: itemRows[0].meta_title || "",
        meta_description: itemRows[0].meta_description || "",
        meta_keywords: itemRows[0].meta_keywords || "",
      };

      // Fetch URLs for the item
      const urlRows = await new Promise((resolve, reject) => {
        db.query(
          "SELECT CAST(urls AS CHAR) AS urls FROM item_urls WHERE item_id = ?",
          [itemRows[0].id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      if (urlRows.length > 0) {
        try {
          item.urls = JSON.parse(urlRows[0].urls);
        } catch (e) {
          item.urls = urlRows[0].urls.split(",").map((u) => u.trim());
        }
      }

      return res.status(200).json({data:item,category:"organization"});
    }

    // If not found in items, try documents/blogs
    const [docRows] = await db.promise().query(
      "SELECT * FROM document WHERE slug = ? AND deletestatus = 0",
      [slug]
    );

    if (docRows.length > 0) {
      const doc = docRows[0];
      const document = {
        Intro: doc.intro,
        Name: doc.Name,
        Conclusion: doc.conclusion,
        Image: doc.image_path,
        slug: doc.slug || "",
        meta_title: doc.meta_title || "",
        meta_description: doc.meta_description || "",
        meta_keywords: doc.meta_keywords || "",
        Arr: [],
        NGOs: { INTRO: "", Arr: [] },
      };

      // Fetch document array data
      const [arrRows] = await db.promise().query(
        "SELECT * FROM documentarr WHERE document_id = ? ORDER BY id ASC",
        [doc.id]
      );

      for (const arr of arrRows) {
        const [bRows] = await db.promise().query(
          "SELECT bullet FROM documentarrbullets WHERE arr_id = ? ORDER BY id ASC",
          [arr.id]
        );

        document.Arr.push({
          Heading: arr.heading,
          Start: arr.start,
          Bullet_Header: arr.bullet_header,
          Bullets: bRows.map((b) => b.bullet),
          End: arr.end,
        });
      }

      // Fetch NGO data
      const [ngoRows] = await db.promise().query(
        "SELECT * FROM ngos WHERE document_id = ? ORDER BY id ASC",
        [doc.id]
      );

      if (ngoRows.length > 0) {
        const ngo = ngoRows[0];
        document.NGOs.INTRO = ngo.intro;

        const [ngosArrRows] = await db.promise().query(
          "SELECT * FROM ngosarr WHERE ngos_id = ? ORDER BY id ASC",
          [ngo.id]
        );

        for (const n of ngosArrRows) {
          const [ofRows] = await db.promise().query(
            "SELECT value FROM ngosarrof WHERE ngos_arr_id = ? ORDER BY id ASC",
            [n.id]
          );

          document.NGOs.Arr.push({
            h1: n.h1,
            OF: ofRows.map((o) => o.value),
          });
        }
      }

      return res.status(200).json({data:document,category:"blog"});
    }

    // If not found in documents, try sectors/categories
    const [sectorRows] = await db.promise().query(
      "SELECT * FROM sectors WHERE  deletestatus = 0 AND slug = ?",
      [slug]
    );

    if (sectorRows.length > 0) {
      return res.status(200).json({ 
        success: true, 
        data: sectorRows[0],
        category:"sectors" 
      });
    }

 
   // If nothing found
    return res.status(404).json({ 
      success: false, 
      message: "Not found" 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};


import { uploadToFTP, deleteFromFTP } from '../utils/ftpUpload.js';
import { sendOrganizationSubmissionEmail } from '../utils/emailService.js';

// Generate unique filename
const generateFileName = (fileType) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileType.split('/')[1] || 'png';
  return `${timestamp}-${randomString}.${extension}`;
};

const MEDIA_BASE_URL = (process.env.FTP_BASE_URL || 'https://media.khudii.com').replace(/\/$/, '');
const isUploadedMediaUrl = (value) =>
  typeof value === 'string' && value.startsWith(`${MEDIA_BASE_URL}/`);

// Convert base64 to buffer
const base64ToBuffer = (base64String) => {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
};

export const submitOrganizationForm = async (req, res) => {
  const connection = await new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });



  let logoPath = null;
  const supportingDocsPaths = [];

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const formData = req.body;
    // Parse form data (if sent as JSON string)
    const parsedData = typeof formData === 'string' ? JSON.parse(formData) : formData;

    // Upload organization logo if present (base64)
    if (parsedData.organizationLogo) {
      try {
        if (isUploadedMediaUrl(parsedData.organizationLogo)) {
          logoPath = parsedData.organizationLogo;
        } else {
          const { type, buffer } = base64ToBuffer(parsedData.organizationLogo);
          const fileName = generateFileName(type);
          logoPath = await uploadToFTP(fileName, buffer);
        }
      } catch (logoError) {
        console.error('Logo upload error:', logoError);
        // Continue without logo if upload fails? Or throw error?
        // Throwing error will rollback transaction
        throw new Error('Failed to upload organization logo');
      }
    }

    // Insert main submission data
    const insertSubmissionQuery = `
      INSERT INTO organization_submissions (
        organization_name, contact_person_name, contact_person_mobile,
        landline_uan, website_url, email_address,
        facebook_link, instagram_link, youtube_link,
        linkedin_link, twitter_link,
        year_established,
        total_beneficiaries_served, total_projects_completed, active_projects,
        organization_logo_path,user_google_email,user_google_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const submissionValues = [
      parsedData.organizationName,
      parsedData.contactPersonName,
      parsedData.contactPersonMobile,
      parsedData.landlineUan || null,
      parsedData.websiteUrl || null,
      parsedData.emailAddress || null,
      parsedData.facebookLink || null,
      parsedData.instagramLink || null,
      parsedData.youtubeLink || null,
      parsedData.linkedinLink || null,
      parsedData.twitterLink || null,
      parsedData.yearEstablished,
      parsedData.totalBeneficiariesServed || null,
      parsedData.totalProjectsCompleted || null,
      parsedData.activeProjects || null,
      logoPath,
      parsedData.user_google_email,
      parsedData.user_google_name
    ];

    const submissionResult = await new Promise((resolve, reject) => {
      connection.query(insertSubmissionQuery, submissionValues, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const submissionId = submissionResult.insertId;

    // Upload and insert supporting documents (base64 array)
    if (parsedData.supportingDocuments && Array.isArray(parsedData.supportingDocuments)) {
      for (const doc of parsedData.supportingDocuments) {
        try {
          let type = 'application/octet-stream';
          let fileName;
          let filePath;
          if (isUploadedMediaUrl(doc)) {
            filePath = doc;
            fileName = decodeURIComponent(new URL(doc).pathname.split('/').pop() || 'document');
            const extension = fileName.split('.').pop()?.toLowerCase();
            const mimeByExtension = {
              pdf: 'application/pdf', doc: 'application/msword',
              docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
            };
            type = mimeByExtension[extension] || type;
          } else {
            const converted = base64ToBuffer(doc);
            type = converted.type;
            fileName = generateFileName(type);
            filePath = await uploadToFTP(fileName, converted.buffer);
          }
          supportingDocsPaths.push(filePath);

          const insertDocQuery = `
            INSERT INTO supporting_documents (submission_id, file_path, file_name, file_type)
            VALUES (?, ?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            connection.query(
              insertDocQuery,
              [submissionId, filePath, fileName, type],
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
        } catch (docError) {
          console.error('Supporting document upload error:', docError);
          // If one document fails, rollback entire transaction
          throw new Error('Failed to upload supporting document');
        }
      }
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Send email notification (don't rollback if email fails)
    try {
      await sendOrganizationSubmissionEmail({
        ...parsedData,
        organizationLogoPath: logoPath,
        supportingDocumentsCount: supportingDocsPaths.length
      });
    } catch (emailError) {
      console.error('Email sending failed but form submission succeeded:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      submissionId: submissionId,
      logoPath: logoPath,
      supportingDocs: supportingDocsPaths
    });

  } catch (error) {
    // Rollback transaction on error
    await new Promise((resolve) => {
      connection.rollback(() => resolve());
    });

    // Clean up uploaded files if any were uploaded before error
    if (req.body.organizationLogo && logoPath) {
      await deleteFromFTP(logoPath);
    }
    if (req.body.supportingDocuments && supportingDocsPaths) {
      for (const path of supportingDocsPaths) {
        await deleteFromFTP(path);
      }
    }

    console.error('Organization form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit organization form',
      error: error.message
    });
  } finally {
    connection.release();
  }
};