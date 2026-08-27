// import React, { useState,useEffect } from "react";
// import styles from "./Navbar.module.css";
// import "./Navbar.css";
// import { Link } from '@/lib/router-compat';
// import axios from "axios";
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// import { useNavigate } from '@/lib/router-compat';
// import { div } from "framer-motion/client";
// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [counter,setcounter]=useState(true)
//   const [isMobile, setIsMobile] = useState(false)
//   const [footer,setFooterData]=useState({})
//   const [load,setload]=useState(false)
//   const nav=useNavigate()
//  const[err,seterr]=useState('')


//   const fetchFooterData = async () => {
//     try {

//       const response = await cachedPublicGet(`${APIPath}/api/footer`, {
//         withCredentials: true
//       });

//       if (response.data.success) {
//         setFooterData(response.data.data);

//       }
//     } catch (error) {
//       console.error('Error fetching footer data:', error);
//     } finally {

//     }
//   };
//   useEffect(()=>{
// fetchFooterData();    

//   },[])


//    useEffect(() => {
//      const checkScreenSize = () => {
//        setIsMobile(window.innerWidth < 600)
//      }

//      // Check initially
//      checkScreenSize()

//      // Add event listener
//      window.addEventListener('resize', checkScreenSize)

//      // Cleanup
//      return () => window.removeEventListener('resize', checkScreenSize)
//    }, [])

// useEffect(()=>{
//   setResults([])
//   if(!search){
//     setload(false)
//   }
//   const handler=setTimeout(()=>{handleSearch(search,true)},1500)
//   return ()=> clearTimeout(handler)
// },[search])

//   // Fetch organizations from backend
//   const handleSearch = async (value) => {
//     // if(!add){
//     //  setcounter(false)
//     // }
//     // setSearch(value);
//     setload(true)
//     if (value.length > 1) {
//       try {
//         const res = await fetch(
//           `${APIPath}/getSimilarItem?search=${value}`
//         );
//         const data = await res.json();
//         setResults(data);
//         // console.log(data)
//         seterr('')
//       } catch (err) {
//         console.error("Search error:", err.message);
//         seterr(err.message)
//       }
//     } else {
//       setResults([]);
//     }
//     setload(false)
//   };
// // console.log("hey abu",err)
//   return (
//     <div>
//       {/* 🔎 Top Search For Mobile */}
//       <div className={`${styles.newclass} relative`}>
//         <div className={styles.pos1}>
//           <i className={`fas fa-search ${styles.ss1}`}></i>
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {setSearch(e.target.value);setcounter(false); setload(true)}}
//             placeholder="Search Organization"
//             className={styles.bgcolor}
//           />
//            {search && <i onClick={()=>{setSearch(''),setload(false)}} className={`fa-solid fa-x ${styles.cross}`}></i>} 
//         </div>

//         {/* Results Dropdown for top search desktop */}
//         {err ?<>{search && <div className={`${styles.searchResults} ${styles.helper_class}`}>Netwrok Error</div>}</>:<>
//         {load ? <div className={`${styles.searchResults} ${styles.helper_class}`}>  <div className="flex items-center justify-center w-full h-full py-1">
//       <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-5 md:h-5 border-4 border-[#e7001e] border-t-transparent rounded-full animate-spin" />
//     </div></div>: results.length===0 &&  search && <div className={`${styles.searchResults} ${styles.helper_class}`}>No Results</div> }

//         {results.length > 0 && search && (
//           <div className={styles.searchResults}>
//             {results.map((org) => (
//               <div key={org.id} onClick={()=>{setSearch(''),nav(`/${org.slug}`,{state:{id:org.id}})}}  className={styles.resultCard}>
//                 <img
//                   src={org.introductory_image_path}
//                   alt={org.name}
//                   className={styles.resultImage}
//                 />
//                 <div>
//                   <b>{org.name}</b>

//                  <p dangerouslySetInnerHTML={{ __html: org.description.slice(0, 95) + "..." }} />

//                   {/* <Link
//                     to={`/organization/${org.id}`}
//                     className={styles.resultLink}
//                     onClick={()=>setSearch('')}
//                   >
//                     View More
//                   </Link> */}
//                        <br />
//                       <button style={{cursor:'pointer'}} className="org-btn">
//                     View More
//                 </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         </>
//         }
//       </div>

//       <hr style={{ color: "grey" }} />

//       {/* Main Navbar */}
//       <header className="bg-white relative">
//         <div
//           className={`px-4 py-4 flex ${styles.correctedwidth}`}
//         >
//           {/* Logo */}
//           <div className="w-36">
//            <Link to={'/'}> <img src={`${footer.logoimage || '/Khudii.webp'} `} className={`${styles.khudii_logo}`} width="223" height="79" alt="khudii logo" loading="lazy" /></Link>
//           </div>

//           {/* Links */}
//           <div className={`${styles.query} text-gray-700`}>
//             <Link to="/" className="hover:text-gray-900">
//               Home
//             </Link>
//             <Link to="/about-khudii/" className="hover:text-gray-900">
//               About
//             </Link>
//             <Link to="/organizations/" className="hover:text-gray-900">
//               Organizations
//             </Link>
//             <Link to="/golden-people/" className="hover:text-gray-900">
//               Golden People
//             </Link>

//             {/* Media Dropdown */}
//             <span className={styles.gpos}>
//               <Link to="#" className="hover:text-gray-900">
//                 Media <i className={`${styles.fw} fas fa-chevron-down`}></i>
//               </Link>
//               <div className={`${styles.gpa}`}>
//                 <li>
//                   <Link to={"/success-stories/"}>Success Stories</Link>
//                 </li>
//                 <hr />
//                 <li>
//                   <Link to={'/social-media/'}>Social Media</Link>
//                 </li>
//                 <hr />
//                 <li>
//                   <Link to={'/videos/'}>Videos</Link>
//                 </li>
//                 <hr />
//                 <li>
//                   <Link to={'/testimonials/'}>Testimonials</Link>
//                 </li>
//                 <hr />
//                 <li>
//                   <Link to={'/tribute/'}>Tribute</Link>
//                 </li>
//                 <hr />
//                 <li className={`${styles.gp2}`}>
//                   <Link to={"#"}>Registration</Link>
//                   <i className={`${styles.fw} fas fa-chevron-down`}></i>
//                   <div className={`${styles.gp1}`}>
//                     <Link to={'/certifications/'}>Certifications</Link>
//                   </div>
//                 </li>
//               </div>
//             </span>

//             {/* Join Us Dropdown */}
//             <span className={`${styles.gpos}`}>
//               <Link to="#" className="hover:text-gray-900">
//                 Join Us
//               </Link> <i className={`${styles.fw} fas fa-chevron-down`}></i>
//               <div className={`${styles.gpa}`}>
//                 <li>
//                   <Link to={'/volunteer/'}>Volunteer</Link>
//                 </li>
//                 <hr />
//                 <li>
//                   <Link to={'/jobs/'}>Jobs</Link>
//                 </li>
//               </div>
//             </span>

//             <Link to="/contact/" className="hover:text-gray-900">
//               Contact
//             </Link>
//           </div>

//           {/* Right side (search + donate + mobile menu) */}
//           <div className="flex items-center gap-3 relative">
//             <div className={styles.pos}>
//               <i className={`fas fa-search ${styles.ss}`}></i>
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => {setSearch(e.target.value);setcounter(true);setload(true)}}
//                 placeholder="Search Organization"
//                 className={styles.bgcolor}
//               />
//            {search && <i onClick={()=>{setSearch('');setload(false)}} className={`fa-solid fa-x ${styles.cross}`}></i>}   
//             </div>

//             {/* Results for desktop search */}
//           {err ?<>{search&& counter &&<div className={`${styles.searchResults} ${styles.helper_class}`}>Netwrok Error</div> }</>:<>
//            { load && !isMobile? <div className={`${styles.searchResults} ${styles.helper_class}`}> <div className="flex items-center justify-center w-full h-full py-1">
//       <div className="w-3 h-3 sm:w-5 sm:h-5 md:w-5 md:h-5 border-4 border-[#e7001e] border-t-transparent rounded-full animate-spin" />
//     </div></div>: results.length===0 && counter && search  &&<div className={`${styles.searchResults} ${styles.helper_class}`}>No Results</div> }
//         {results.length > 0 && counter && search && (
//           <div className={styles.searchResults}>
//             {results.map((org) => (
//               <div key={org.id} onClick={()=>{setSearch(''),nav(`/${org.slug}`,{state:{id:org.id}})}}  className={styles.resultCard}>
//                 <div className="flex items-center">
//                 <img
//                   src={org.introductory_image_path}
//                   alt={org.name}
//                   className={styles.resultImage}
//                 />
//                 <b className="text-md font-bold pl-5 leading-5">{org.name}</b>
//                 </div>
//                     <p className="text-sm" dangerouslySetInnerHTML={{ __html: org.description.replace(/<[^>]*>/g, '').slice(0, 95) + "..." }} />
//                   {/* <Link
//                     to={`/organization/${org.id}`}
//                     className={styles.resultLink}
//                         onClick={()=>setSearch('')}
//                   >
//                     View More
//                   </Link> */}
//                   {/* <br />
//                       <button style={{cursor:'pointer'}} className="org-btn">
//                   View More
//                 </button> */}
//               </div>
//             ))}
//           </div>
//         )}
//         </>
//         }

//           { !isMobile && <Link
//               to="/donate-now/"
//               className="bg-[#e7001e] text-white px-4 py-2 rounded-md shadow hover:opacity-95"
//             >
//               Donate Now
//             </Link>}



//             <button
//               className={`${styles.buttonclass} p-2 rounded-md border`}
//               onClick={() => setOpen(!open)}
//               aria-label="Toggle menu"
//             >
//               <svg
//                 className="w-5 h-5"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {open && (
//           <div className="mobile-menu">
//             <div className="mobile-menu-content">
//               <Link  onClick={()=>{setOpen(!open)}} to="/" className="mobile-menu-link">
//                 Home
//               </Link>
//               <Link onClick={()=>{setOpen(!open)}} to="/about-khudii/" className="mobile-menu-link">
//                 About
//               </Link>
//               <Link onClick={()=>{setOpen(!open)}} to="/organizations/" className="mobile-menu-link">
//                 Organizations
//               </Link>
//               <Link onClick={()=>{setOpen(!open)}} to="/golden-people/" className="mobile-menu-link">
//                 Golden People
//               </Link>

//               {/* Media */}
//               <div className="mobile-menu-dropdown">
//                 <span className="mobile-menu-dropdown-title">Media</span>
//                 <ul className="mobile-menu-dropdown-list">
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/success-stories/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Success Stories
//                     </Link>
//                   </li>
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/social-media/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Social Media
//                     </Link>
//                   </li>
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/videos/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Videos
//                     </Link>
//                   </li>
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/testimonials/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Testimonials
//                     </Link>
//                   </li>
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/tribute/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Tribute
//                     </Link>
//                   </li>
//                   <li className="mobile-menu-nested">
//                     <span className="mobile-menu-nested-title">
//                       Registration
//                     </span>
//                     <ul className="mobile-menu-nested-list">
//                       <li>
//                         <Link onClick={()=>{setOpen(!open)}}
//                           to="/certifications/"
//                           className="mobile-menu-nested-link"
//                         >
//                           Certifications
//                         </Link>
//                       </li>
//                     </ul>
//                   </li>
//                 </ul>
//               </div>

//               {/* Join Us */}
//               <div className="mobile-menu-dropdown">
//                 <span className="mobile-menu-dropdown-title">Join Us</span>
//                 <ul className="mobile-menu-dropdown-list">
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/volunteer/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                       Volunteer
//                     </Link>
//                   </li>
//                   <li>
//                     <Link onClick={()=>{setOpen(!open)}}
//                       to="/jobs/"
//                       className="mobile-menu-dropdown-link"
//                     >
//                    Jobs
//                     </Link>
//                   </li>
//                 </ul>
//               </div>

//               {/* Contact */}
//               <Link onClick={()=>{setOpen(!open)}} to="/contact/" className="mobile-menu-link">
//                 Contact
//               </Link>
//             </div>
//           </div>
//         )}
//       </header>
//     </div>
//   );
// };

// export default Navbar;
import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import "./Navbar.css";
import { Link } from '@/lib/router-compat';
import axios from "axios";
import { cachedPublicGet } from '@/lib/public-api-cache';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { useNavigate } from '@/lib/router-compat';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [counter, setcounter] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [footer, setFooterData] = useState({});
  const [load, setload] = useState(false);
  const nav = useNavigate();
  const [err, seterr] = useState("");

  const fetchFooterData = async () => {
    try {
      const response = await cachedPublicGet(`${APIPath}/api/footer`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setFooterData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching footer data:", error);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Check initially
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setResults([]);
    if (!search) {
      setload(false);
    }
    const handler = setTimeout(() => {
      handleSearch(search, true);
    }, 1500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch organizations from backend
  const handleSearch = async (value) => {
    setload(true);
    if (value.length > 1) {
      try {
        const res = await fetch(`${APIPath}/getSimilarItem?search=${value}`);
        const data = await res.json();
        setResults(data);
        seterr("");
      } catch (err) {
        console.error("Search error:", err.message);
        seterr(err.message);
      }
    } else {
      setResults([]);
    }
    setload(false);
  };

  return (
    <div>
      <hr style={{ color: "grey" }} />

      {/* Main Navbar */}
      <header className="bg-white relative">
        <div className={`px-4 py-4 flex ${styles.correctedwidth}`}>
          {/* Logo */}
          <div className="w-36">
            <Link to={"/"}>
              {" "}
              <img
                src={`${footer.logoimage || "/Khudii.webp"} `}
                className={`${styles.khudii_logo}`}
                width="223"
                height="79"
                alt="khudii logo"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Links */}
          <div className={`${styles.query} text-gray-700`}>
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <Link to="/about-khudii/" className="hover:text-gray-900">
              About
            </Link>
            <Link to="/organizations/" className="hover:text-gray-900">
              Organizations
            </Link>
            <Link to="/golden-people/" className="hover:text-gray-900">
              Golden People
            </Link>

            {/* Media Dropdown */}
            <span className={styles.gpos}>
              <Link to="#" className="hover:text-gray-900">
                Media <i className={`${styles.fw} fas fa-chevron-down`}></i>
              </Link>
              <div className={`${styles.gpa}`}>
                <li>
                  <Link to={"/success-stories/"}>Success Stories</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/social-media/"}>Social Media</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/videos/"}>Videos</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/testimonials/"}>Testimonials</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/tribute/"}>Tribute</Link>
                </li>
                <hr />
                <li className={`${styles.gp2}`}>
                  <Link to={"#"}>Registration</Link>
                  <i className={`${styles.fw} fas fa-chevron-down`}></i>
                  <div className={`${styles.gp1}`}>
                    <Link to={"/certifications/"}>Certifications</Link>
                  </div>
                </li>
              </div>
            </span>

            {/* Join Us Dropdown */}
            <span className={`${styles.gpos}`}>
              <Link to="#" className="hover:text-gray-900">
                Join Us
              </Link>{" "}
              <i className={`${styles.fw} fas fa-chevron-down`}></i>
              <div className={`${styles.gpa}`}>
                <li>
                  <Link to={"/volunteer/"}>Volunteer</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/jobs/"}>Jobs</Link>
                </li>
                <hr />
                <li>
                  <Link to={"/organization/registration"}>Organization Registration</Link>
                </li>
              </div>
            </span>

            <Link to="/contact/" className="hover:text-gray-900">
              Contact
            </Link>
          </div>

          {/* Right side (search + donate + mobile menu) */}
          <div className="flex items-center gap-3 relative">
            {/* Desktop Search */}
            <div className={styles.pos}>
              <i className={`fas fa-search cursor-pointer ${styles.ss}`}></i>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setcounter(true);
                  setload(true);
                }}
                placeholder="Search Organization"
                className={styles.bgcolor}
              />
              {search && (
                <i
                  onClick={() => {
                    setSearch("");
                    setload(false);
                  }}
                  className={`fa-solid fa-x cursor-pointer ${styles.cross}`}
                ></i>
              )}
            </div>

            {/* Results for desktop search */}
            {err ? (
              <>
                {search && counter && (
                  <div className={`${styles.searchResults} ${styles.helper_class}`}>
                    Network Error
                  </div>
                )}
              </>
            ) : (
              <>
                {load && !isMobile ? (
                  <div className={`${styles.searchResults} ${styles.helper_class}`}>
                    {" "}
                    <div className="flex items-center justify-center w-full h-full py-1">
                      <div className="w-3 h-3 sm:w-5 sm:h-5 md:w-5 md:h-5 border-4 border-[#e7001e] border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                ) : (
                  results.length === 0 &&
                  counter &&
                  search && (
                    <div className={`${styles.searchResults} ${styles.helper_class}`}>
                      No Results
                    </div>
                  )
                )}
                {results.length > 0 && counter && search && (
                  <div className={styles.searchResults}>
                    {results.map((org) => (
                      <div
                        key={org.id}
                        onClick={() => {
                          setSearch(""), nav(`/${org.slug}`, { state: { id: org.id } });
                        }}
                        className={styles.resultCard}
                      >
                        <div className="flex items-center">
                          <img
                            src={org.introductory_image_path}
                            alt={org.name}
                            className={styles.resultImage}
                          />
                          <b className="text-md font-bold pl-5 leading-5">{org.name}</b>
                        </div>
                        <p
                          className="text-sm"
                          dangerouslySetInnerHTML={{
                            __html: org.description.replace(/<[^>]*>/g, "").slice(0, 95) + "...",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {!isMobile && (
              <Link
                to="/donate-now/"
                className="bg-[#e7001e] text-white px-4 py-2 rounded-md shadow hover:opacity-95"
              >
                Donate Now
              </Link>
            )}

            {/* Contribute Story and Donate Now Mobile Buttons */}
            <p className={`${styles.mobileBtns} flex`}>
              <Link to="/contribute-your-story/">
                <button className={`${styles.last} ${styles.iconBtn}`} aria-label="Contribute Your Story">
                  <i className="fa-regular fa-pen-to-square" style={{ color: "#ffffff" }}></i>
                </button>
              </Link>
              {isMobile && (
                <Link to="/donate-now/">
                  <button className={`${styles.last} ${styles.iconBtn}`} aria-label="Donate Now">
                    <i className="fa-solid fa-hand-holding-heart" style={{ color: "#ffffff" }}></i>
                  </button>
                </Link>
              )}
            </p>

            {/* Search Icon For Mobile Only */}
            <>
              {/* Search Icon (always visible) */}
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setcounter(false); // Important for mobile search
                }}
                className={styles.searchIconOnly}
                aria-label="Search"
              >
                <i className={`fas fa-search ${styles.mobs2}`}></i>
              </button>

              {/* Overlay + Popup (only when open) */}
              {isSearchOpen && (
                <>
                  <div
                    className={styles.searchOverlay}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearch("");
                    }}
                  />
                  <div className={styles.searchPopup}>
                    <div className={styles.popupContent}>
                      <i className={`fas fa-search ${styles.popupIcon}`}></i>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setload(true);
                        }}
                        placeholder="Search Organizations"
                        className={styles.popupInput}
                        autoFocus
                      />
                      <i
                        className={`fa-solid fa-x ${styles.popupClose}`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent closing overlay
                          setSearch("");
                          setload(false);
                          setIsSearchOpen(false);
                        }}
                      ></i>
                    </div>

                    {/* Mobile Search Results */}
                    {search && (
                      <div className={styles.mobileResultsContainer}>
                        {err ? (
                          <div className={`${styles.searchResults} ${styles.mobileResults}`}>
                            Network Error
                          </div>
                        ) : (
                          <>
                            {load ? (
                              <div className={`${styles.searchResults} ${styles.mobileResults}`}>
                                <div className="flex items-center justify-center w-full h-full py-3">
                                  <div className="w-6 h-6 border-4 border-[#e7001e] border-t-transparent rounded-full animate-spin" />
                                </div>
                              </div>
                            ) : results.length === 0 ? (
                              <div className={`${styles.searchResults} ${styles.mobileResults}`}>
                                No Results
                              </div>
                            ) : (
                              <div className={`${styles.searchResults} ${styles.mobileResults}`}>
                                {results.map((org) => (
                                  <div
                                    key={org.id}
                                    onClick={() => {
                                      setSearch("");
                                      setIsSearchOpen(false);
                                      nav(`/${org.slug}`, { state: { id: org.id } });
                                    }}
                                    className={styles.resultCard}
                                  >
                                    <img
                                      src={org.introductory_image_path}
                                      alt={org.name}
                                      className={styles.resultImage}
                                    />
                                    <div className="text-center px-2">
                                      <b className="text-lg font-bold text-[#222222]">{org.name}</b>
                                      <p
                                        className="text-sm text-[#222222] mt-1"
                                        dangerouslySetInnerHTML={{
                                          __html: org.description.slice(0, 95) + "...",
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>

            {/* Mobile Hamburger Icon */}
            <button
              className={`${styles.buttonclass} cursor-pointer`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars fa-2xl" style={{ color: "#02236e" }}></i>
              {/* <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg> */}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <Link
                onClick={() => {
                  setOpen(!open);
                }}
                to="/"
                className="mobile-menu-link"
              >
                Home
              </Link>
              <Link
                onClick={() => {
                  setOpen(!open);
                }}
                to="/about-khudii/"
                className="mobile-menu-link"
              >
                About
              </Link>
              <Link
                onClick={() => {
                  setOpen(!open);
                }}
                to="/organizations/"
                className="mobile-menu-link"
              >
                Organizations
              </Link>
              <Link
                onClick={() => {
                  setOpen(!open);
                }}
                to="/golden-people/"
                className="mobile-menu-link"
              >
                Golden People
              </Link>

              {/* Media */}
              <div className="mobile-menu-dropdown">
                <span className="mobile-menu-dropdown-title">Media</span>
                <ul className="mobile-menu-dropdown-list">
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/success-stories/"
                      className="mobile-menu-dropdown-link"
                    >
                      Success Stories
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/social-media/"
                      className="mobile-menu-dropdown-link"
                    >
                      Social Media
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/videos/"
                      className="mobile-menu-dropdown-link"
                    >
                      Videos
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/testimonials/"
                      className="mobile-menu-dropdown-link"
                    >
                      Testimonials
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/tribute/"
                      className="mobile-menu-dropdown-link"
                    >
                      Tribute
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Registration */}
              <div className="mobile-menu-dropdown">
                <span className="mobile-menu-dropdown-title">Registration</span>
                <ul className="mobile-menu-dropdown-list">
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/certifications/"
                      className="mobile-menu-dropdown-link"
                    >
                      Certifications
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Join Us */}
              <div className="mobile-menu-dropdown">
                <span className="mobile-menu-dropdown-title">Join Us</span>
                <ul className="mobile-menu-dropdown-list">
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/volunteer/"
                      className="mobile-menu-dropdown-link"
                    >
                      Volunteer
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/jobs/"
                      className="mobile-menu-dropdown-link"
                    >
                      Jobs
                    </Link>
                  </li>
                    <li>
                    <Link
                      onClick={() => {
                        setOpen(!open);
                      }}
                      to="/organization/registration/"
                      className="mobile-menu-dropdown-link"
                    >
                Organization Registration
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <Link
                onClick={() => {
                  setOpen(!open);
                }}
                to="/contact/"
                className="mobile-menu-link"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;


