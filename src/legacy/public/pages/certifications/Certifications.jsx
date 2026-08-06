import { CheckCircle } from "lucide-react";
import PageHeader from "../../componets/PageHeader/PageHeader";
import SEO from "../../componets/Helmet/Helmet";
import axios from "axios";
import { useState, useEffect } from "react";
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
export default function Certification({ con, url }) {
  const [cert, setcert] = useState([])
  const [loader, setloader] = useState(false)
  useEffect(() => {
    const get = async () => {
      setloader(true)
      try {
        const res = await axios.get(`${APIPath}/certifications`)
        if (res.status === 200) {
          setcert(res.data)
        }
      } catch (error) {

      }
      setloader(false)
    }
    get()
  }, [])


  // if(loader){
  //   return (

  //       <div className="flex items-center justify-center h-90 ">

  //       {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
  //         <img src="/siteicon.png" alt="" width={200} height={200}/>
  //       {/* </div> */}
  //     </div>
  //   )
  // }
  return (
    <>
      <SEO
        title={con?.meta_title || "Certifications - Khudii Pakistan | SECP Registered Welfare Organization"}
        description={con?.meta_description || "Khudii is officially certified and licensed by the Securities and Exchange Commission of Pakistan (SECP) under Section 42 of the Companies Act, 2017. View our official certification."}
        keywords={con?.meta_keywords || "khudii certification, SECP registered, pakistan welfare license, section 42 company, khudii legal status, verified charity pakistan, SECP license 2020, registered welfare organization"}
        url={`${url}/certifications`}
        type="website"
      />

      <PageHeader
        title="Certifications"
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "Certifications" }
        ]}
      />
      {loader ? <div className="flex items-center justify-center h-90 ">

        {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
        <img src="/siteicon.png" alt="" width={200} height={200} />
        {/* </div> */}
      </div> :
        <section className="w-full max-w-[1240px] mx-auto flex py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="flex flex-col gap-6 sm:gap-8 w-full">
            {/* Heading */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#222222] leading-tight">
              Securities and Exchange Commission of Pakistan
            </h2>

            {/* Icon List */}
            <ul className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base lg:text-lg font-medium">
              <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#009dc8] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#222222] text-sm sm:text-base lg:text-lg">
                  UNDER SECTION 42 of the Companies Act (XIX), 2017
                </span>
              </li>
              <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#009dc8] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#222222] text-sm sm:text-base lg:text-lg">
                  License No. 2020
                </span>
              </li>
            </ul>

            {/* Certificate Images */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-8 sm:gap-10 lg:gap-20 items-center justify-center">
              {cert.map((ele, idx) => (
                <div key={idx} className="flex justify-center w-full sm:w-auto">
                  <img
                    width={300}
                    height={425}
                    src={ele.image_url}
                    alt="Khudii Certificate"
                    className="object-contain w-full max-w-[250px] sm:max-w-[280px] md:w-52 lg:w-64 xl:w-72"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    </>
  );
}
