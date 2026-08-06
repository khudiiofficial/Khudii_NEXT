
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Styles from './FAQ.module.css'
import PageHeader from "../../componets/PageHeader/PageHeader";
import SEO from "../../componets/Helmet/Helmet";
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from 'axios'
// FAQ Data

function FAQItem({ faq, isOpen, onClick }) {

  return (
    <div className="border-b border-gray-200 px-10">
      <button
        className="w-full flex justify-between items-center py-4 text-left text-lg font-medium text-gray-800 hover:text-indigo-600 transition"
        onClick={onClick}
      >
        {faq.question}
        <ChevronDown
          className={`${Styles.dropdown} text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-gray-600 text-base leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({con,url}) {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs,setFaqs] =useState([]);
useEffect(()=>{
  const call= async()=>{
try {
  const res=await axios.get(`${APIPath}/api/faqs`)
  
  if(res.status===200){
    setFaqs(res.data.data)
   
  }
} catch (error) {
  console.log(error)
}
  }
  call();

},[])
  return (
    <>
  <SEO 
        title={con?.meta_title||"FAQ - Khudii Pakistan | Frequently Asked Questions"}
        description={con?.meta_description||"Find answers to common questions about Khudii Welfare Organization - Pakistan's leading digital welfare platform. Learn about our services, donations, volunteer opportunities, and community impact."}
        keywords={con?.meta_keywords||"khudii faq, welfare organization questions, pakistan charity faq, khudii services, donation queries, volunteer opportunities, healthcare services, education programs, NGO Pakistan"}
        url={`${url}/faqs`}
        type="FAQPage"
      />
    <PageHeader 
                   title="FAQS"
                   breadcrumbs={[
                     { label: "Home", link: "/" },
                     { label: "FAQS" }
                   ]}
                 />

    <section className="w-full flex justify-center py-16 bg-gray-50">
      <div className="max-w-4xl w-full px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Frequently Asked Questions
        </h2>
        <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
