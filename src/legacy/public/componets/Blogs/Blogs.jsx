// import React, { useState, useEffect } from 'react';
// import './Blogs.css';
// // import axios from 'axios';
// import { useLocation } from '@/lib/router-compat';
// import { useNavigate } from '@/lib/router-compat';
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');


// const Blog = ({loader1=false}) => {
//   const [visiblePosts, setVisiblePosts] = useState([]);
//   const [err,seterr]=useState(null)
//   const [loader,setloader]=useState(false)
//   const nav=useNavigate()
// const location=useLocation()


//    function Loader() {
//   return (
   
//     ""
//   );
// }


//   useEffect(()=>{
// (async ()=>{
//   setloader(true)
//   try {
//     const res=await axios.get(`${APIPath}/getAllBlogs`,{withCredentials:true})
//     setVisiblePosts(res.data)
    
//   } catch (error) {
//     seterr(error.message)
//   }
//   setloader(false)
// })()
//   },[])


//   if(loader || loader1){
//     return <Loader/>
//   }
// if(err){
// return (

//     <div className={`errorContainer`}>
//           <div className={`errorIcon`}>⚠️</div>
//           <h2 className={`errorTitle`}>Unable to Load Content</h2>
//           <p className={`errorMessage`}>{err}</p>
//           <button 
//             className={`bg-[#e7001e] retryButton`}
//             onClick={() => window.location.reload()}
//           >
//             Retry
//           </button>
//         </div>
// )
// }


//   return (
  

    
//     <div className="w-full">
//   <div className="max-w-[1240px] w-full mx-auto">
  
//     <div className="text-center">
//       {location.pathname !== '/blogs' && (
//         <h2 className="text-2xl sm:text-3xl font-bold text-[#02236e] p-4 md:p-8 lg:p-10">Blogs</h2>
//       )}
//     </div>

   
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:px-4 sm:px-6 gap-6 pb-8">
//       {visiblePosts.map((post, index) => (
//         <article
//         onClick={() => nav(`/${post.slug}`, { state: { id: post.id } })}
//           key={post.id}
//           className="cursor-pointer group bg-white rounded-xl shadow-md transition-all duration-300"
//           style={{ animationDelay: `${index * 0.2}s` }}
//         >
//           <div className="relative">
          
//             <div className="aspect-video">
//               <img
//                 src={post.Image}
//                 alt={post.Name}
//                 className="rounded-2xl w-full transition-transform duration-500"
//               />
//             </div>

            
//             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
//               <button
//                 aria-label="Read more about this blog post"
//                 className="flex items-center justify-center w-12 h-12 bg-white text-[#222222] rounded-full shadow-lg hover:bg-blue-50 transition-colors"
//               >
//               </button>
//             </div>
//           </div>

         
//           <div className="p-5 sm:p-6">
//             <header>
//               <h3 className={`blog_title text-lg sm:text-xl font-semibold text-black-700 mb-0 line-clamp-2 lg:h-[55px]`}>
//                 <button
//                   aria-label="Read more about this blog post"
//                   className="transition-colors text-left block"
//                 >
//                   {post.Name}
//                 </button>
//               </h3>
//             </header>

//             <div className="text-sm text-gray-500 mb-3">
//               <time dateTime={post.date}>{post.date}</time>
//             </div>
            
//             <div class="flex flex-col space-y-4">
//   <p class="text-gray-700 line-clamp-3">{post.Intro}</p>
//   <button aria-label="Read more about this blog post" class="bg-[#E3001C] cursor-pointer font-medium items-center justify-center px-5 py-2.5 rounded-[25px] mx-auto sm:w-auto text-sm text-white w-50">Explore Blog</button>
// </div>
//           </div>
//         </article>
//       ))}
//     </div>
//   </div>
// </div>
//   );

// };

import React, { useState, useEffect } from 'react';
import './Blogs.css';
import axios from 'axios';
import { useLocation } from '@/lib/router-compat';
import { useNavigate } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');


const Blog = ({loader1=false}) => {
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [err,seterr]=useState(null)
  const [loader,setloader]=useState(false)
  const nav=useNavigate()
const location=useLocation()


   function Loader() {
  return (
   
    ""
  );
}


  useEffect(()=>{
(async ()=>{
  setloader(true)
  try {
    const res=await axios.get(`${APIPath}/getAllBlogs`,{withCredentials:true})
    setVisiblePosts(res.data)
    
  } catch (error) {
    seterr(error.message)
  }
  setloader(false)
})()
  },[])


  if(loader || loader1){
    return <Loader/>
  }
if(err){
return (

    <div className={`errorContainer`}>
          <div className={`errorIcon`}>⚠️</div>
          <h2 className={`errorTitle`}>Unable to Load Content</h2>
          <p className={`errorMessage`}>{err}</p>
          <button 
            className={`bg-[#e7001e] retryButton`}
            onClick={() => window.location.reload()}
            aria-label="Retry loading blog posts"
          >
            Retry
          </button>
        </div>
)
}


  return (
  

    
    <div className="w-full">
  <div className="max-w-[1240px] w-full mx-auto">
  
    <div className="text-center">
      {location.pathname !== '/blogs' && (
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0033A0] p-4 md:p-8 lg:p-10">Blogs</h2>
      )}
    </div>

   
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:px-4 sm:px-6 gap-6 pb-8">
      {visiblePosts.map((post, index) => (
        <article
        onClick={() => nav(`/${post.slug}`, { state: { id: post.id } })}
          key={post.id}
          className="cursor-pointer group bg-white rounded-xl shadow-md transition-all duration-300"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className="relative">
          
            <div className="aspect-video">
              <img
                src={post.Image}
                alt={post.Name}
                className="rounded-2xl w-full transition-transform duration-500"
              />
            </div>

            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
              <button
                aria-label="Read more about this blog post"
                className="flex items-center justify-center w-12 h-12 bg-white text-[#222222] rounded-full shadow-lg hover:bg-blue-50 transition-colors"
              >
              </button>
            </div>
          </div>

         
          <div className="p-5 sm:p-6">
            <header>
              <h3 className={`blog_title text-lg sm:text-xl font-semibold text-black-700 mb-0 line-clamp-2 lg:h-[55px]`}>
                <button
                  aria-label={`Read more about ${post.Name}`}
                  className="transition-colors text-left block"
                >
                  {post.Name}
                </button>
              </h3>
            </header>

            <div className="text-sm text-gray-500 mb-3">
              <time dateTime={post.date}>{post.date}</time>
            </div>
            
            <div className="flex flex-col space-y-4">
  <p className="text-gray-700 line-clamp-3">{post.Intro}</p>
  <button aria-label={`Read more about ${post.Name}`} className="bg-[#CC0000] cursor-pointer font-medium items-center justify-center px-5 py-2.5 rounded-[25px] mx-auto sm:w-auto text-sm text-white w-50">Explore Blog</button>
</div>
          </div>
        </article>
      ))}
    </div>
  </div>
</div>
  );

};


export default Blog;