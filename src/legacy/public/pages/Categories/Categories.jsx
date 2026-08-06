import React from 'react'
import { useParams } from '@/lib/router-compat'
import PageHeader from '../../componets/PageHeader/PageHeader'
import OrganizationBycategory from '../../componets/FindByCategories/OrganizationBycategory'
import SEO from '../../componets/Helmet/Helmet'
import { useState,useEffect } from 'react'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from 'axios'
const Categories = ({cat = {},url}) => {
    // const [cat,setcat]=useState({})

    // let {slug}=useParams()
    // name=name.replace(/-/g,' ')
//     useEffect(()=>{
// const func=async()=>{
// try {
//     const res=await axios.get(`${APIPath}/CBN/${slug}`)
//    if(res.status===200){
// setcat(res.data.data)
// console.log(res.data)

// // console.log(res.data.data)
//    }
    
// } catch (error) {
//     console.log(error)
// }

// }
// func()
//     },[slug])   
   
    //    const getCategorySEODetails = (categoryName) => {
    //     const categoryMap = {
    //         'health': {
    //             title: 'Healthcare Welfare Organizations - Khudii Pakistan | Medical Support',
    //             description: 'Find healthcare and medical welfare organizations in Pakistan. Support hospitals, clinics, and health initiatives providing affordable medical care and treatment.',
    //             keywords: 'healthcare welfare pakistan, medical charities, health NGOs, hospital support, khudii health, pakistan medical aid, affordable healthcare'
    //         },
    //         'autism': {
    //             title: 'Autism Support Organizations - Khudii Pakistan | Autism Care',
    //             description: 'Discover autism support and welfare organizations in Pakistan. Find centers and programs empowering autistic individuals with love, acceptance, and inclusion.',
    //             keywords: 'autism support pakistan, autistic individuals, autism centers, special needs care, khudii autism, pakistan autism awareness'
    //         },
    //         'orphanage': {
    //             title: 'Orphanage Support - Khudii Pakistan | Child Welfare Organizations',
    //             description: 'Find orphanages and child welfare organizations in Pakistan. Support homes providing love, care, education, and shelter for orphaned children.',
    //             keywords: 'orphanage pakistan, child welfare, orphan support, children homes, khudii orphanage, pakistan child care, orphan education'
    //         },
    //         'thalassemia': {
    //             title: 'Thalassemia Support Organizations - Khudii Pakistan',
    //             description: 'Discover Thalassemia welfare organizations in Pakistan. Support treatment centers, awareness programs, and care for Thalassemia patients.',
    //             keywords: 'thalassemia support pakistan, blood disorder care, thalassemia treatment, khudii thalassemia, pakistan health awareness'
    //         },
    //         'visually impaired': {
    //             title: 'Visually Impaired Support - Khudii Pakistan | Blind Welfare',
    //             description: 'Find organizations supporting visually impaired individuals in Pakistan. Discover programs providing technology, education, and opportunities for the blind.',
    //             keywords: 'visually impaired pakistan, blind support, vision impairment, khudii visually impaired, pakistan disability support'
    //         },
    //         'education': {
    //             title: 'Education Welfare Organizations - Khudii Pakistan | Schools & Learning',
    //             description: 'Discover education-focused welfare organizations in Pakistan. Support schools, learning programs, and educational initiatives for underprivileged communities.',
    //             keywords: 'education welfare pakistan, schools charity, educational NGOs, learning programs, khudii education, pakistan education support'
    //         },
    //         'differently abled': {
    //             title: 'Differently Abled Support - Khudii Pakistan | Disability Welfare',
    //             description: 'Find disability support organizations in Pakistan. Support programs empowering differently-abled individuals with dignity, confidence, and opportunities.',
    //             keywords: 'differently abled pakistan, disability support, special needs welfare, khudii disability, pakistan empowerment'
    //         },
    //         'water and food': {
    //             title: 'Water & Food Security - Khudii Pakistan | Hunger Relief',
    //             description: 'Discover water and food welfare organizations in Pakistan. Support clean water initiatives, food distribution, and hunger relief programs.',
    //             keywords: 'water food security pakistan, hunger relief, clean water NGOs, food distribution, khudii water food, pakistan nutrition'
    //         }
    //     }

    //     // Default SEO for unknown categories
    //     const defaultSEO = {
    //         title: `${categoryName} Welfare Organizations - Khudii Pakistan`,
    //         description: `Find and support ${categoryName.toLowerCase()} welfare organizations in Pakistan through Khudii's digital platform. Discover NGOs making a difference in communities.`,
    //         keywords: `${categoryName.toLowerCase()} welfare pakistan, ${categoryName.toLowerCase()} NGOs, khudii ${categoryName.toLowerCase()}, pakistan ${categoryName.toLowerCase()} support`
    //     }

    //     return categoryMap[categoryName.toLowerCase()] || defaultSEO
    // }

    // const seoDetails = getCategorySEODetails(name)

  return (
    <>
      
{
  Object.keys(cat).length!==0 &&
    <> 
   <SEO 
            title={cat.meta_title}
            description={cat.meta_description}
            keywords={cat.meta_keywords}
            url={`${url}/${cat.slug || cat.name}`}
            type="website"
        />
        

    <PageHeader 
                        title={`${cat.name}`}
                        breadcrumbs={[
                          { label: "Home", link: "/" },
                          { label: cat.name }
                        ]}
                      />


<OrganizationBycategory name={cat.name}/>
   

   </>
  }
    </>
  )
}

export default Categories