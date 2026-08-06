import React, { useEffect, useState } from 'react';
import styles from './AboutUs.module.css';
import axios from 'axios';
import { useNavigate } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const AboutUs = () => {
  const nav=useNavigate()
  const teamMembers = [
    {
      id: 1,
      name: 'Atif Zia',
      position: 'Director',
      image: '/atif-zia-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nKnown for his Energetic and Uplifting Motivational Speeches since 15 Years',
    },
    {
      id: 2,
      name: 'Farrukh Obaid',
      position: 'Director',
      image: '/farrukh-obaid-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nC.E.O. Farrukh\'s Photography & Vlogs (FPVL) | 14+ Years Experience',
    },
    {
      id: 3,
      name: 'Anjum Majeed',
      position: 'Admin Head',
      image: '/anjum-majeed-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nExpert in Translating and Delivering High-Quality Subtitles for Videos',
    },
    {
      id: 4,
      name: 'Muhammad Zubair',
      position: 'Admin Head',
      image: '/muahmmad-zubair-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nEngaged in various Charity Organizations',
    },
    {
      id: 5,
      name: 'Faisal Zafar',
      position: 'I.T Head',
      image: '/faisal-zafar-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nC.E.O Digital Konnecter Systems (DKS)',
    },
    {
      id: 6,
      name: 'Usman Aziz',
      position: 'Social Media Dept.',
      image: '/usman-aziz-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nC.E.O YKOP Solutions (Media Agency)',
    },
    {
      id: 7,
      name: 'Allah Rakha',
      position: 'I.T & Back Office Manager',
      image: '/allah-rakha-khudii-expert-team.webp',
      desc: 'Khudii Welfare Organization\nWith 8+ Years of experience, he oversee Technical Support and I.T System Operations',
    },
  ];

  const bulletPoints = [
    'Between donors who want to give and welfare organizations that desperately need resources.',
    'Between volunteers searching for a cause and communities longing for their support.',
    'Between professionals willing to lend their skills and organizations hungry for guidance.',
  ];

  const joinUsPoints = [
    'If you are a donor, Khudii helps your generosity travel safely into trusted hands.',
    'If you are a volunteer, Khudii helps you find the cause that needs your time and skills.',
    'If you are a welfare organization, Khudii gives you a voice, a stage, and a community that believes in you.',
  ];

  // Optional: Use state to trigger initial render animation (if needed for hydration)
  const [mounted, setMounted] = useState(false);

const [contentdata,setContentData]=useState({})
const [loading,setLoading]=useState(false)

 const fetchAllContent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${APIPath}/api/getabout`);
      if (response.data.success) {
        setContentData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // showMessage('Error fetching content', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAllContent();
  }, []);



  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply fade-in class after mount (optional — pure CSS version below also works without this)
  const sectionClass = `${styles.section} ${mounted ? styles.fadeIn : ''}`;

  return (
    <>
    {loading ? 
    
  // <div className="flex justify-center items-center h-64">
  //       <div className="loader"></div>
  //     </div>
   <div className="flex items-center justify-center h-90 ">
     
      {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
        <img src="/siteicon.png" alt="" width={200} height={200}/>
      {/* </div> */}
    </div>
    :
    <div className={styles.aboutUs}>
      {/* HERO */}
      <section className={`${styles.hero} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.heroTitle}>{contentdata?.who_we_are?.heading}</h2>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <p className={styles.who_ceo} dangerouslySetInnerHTML={{__html:contentdata?.who_we_are?.paragraph1}}>   
              </p>
              <p className={styles.who_ceo}  dangerouslySetInnerHTML={{__html:contentdata?.who_we_are?.paragraph2}}>
                {/* Across Pakistan, thousands of welfare groups work tirelessly to bring hope — some provide food, others run schools, some build wells, and others bring healthcare to those who cannot afford it. Yet, many of these efforts remain invisible, hidden in the shadows. Donors do not always know where to give, and volunteers often do not know where to serve. Khudii steps in to <strong>connect the dots.</strong> We give these organizations a voice, a platform, and a chance to shine — so their impact can grow, and so no life in need is left behind. */}
              </p>
            </div>
            <div className={styles.heroVideoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${contentdata?.who_we_are?.youtube_video_id}`}
                title="KHUDII || WELFARE ORGANIZATION"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.video}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* DREAM & PURPOSE */}
      <section className={`${styles.dream} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{contentdata?.dream_and_purpose?.heading}</h2>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.dream_and_purpose?.paragraph}}>  
          </p>
          <div className={styles.purposeBox}>
            <h3 className={styles.purposeTitle} dangerouslySetInnerHTML={{__html:contentdata?.dream_and_purpose?.bullets_header}}></h3>
      <ul className={styles.bulletList}>
  {contentdata?.dream_and_purpose?.bullets && 
    JSON.parse(contentdata.dream_and_purpose.bullets)?.map((point, i) => (
      <li key={i} className={styles.bulletItem}>
        <span className={styles.bullet}>•</span> {point}
      </li>
    ))
  }
</ul>
            <p className={styles.purposeConclusion} dangerouslySetInnerHTML={{__html:contentdata?.dream_and_purpose?.conclusion}}>
              
            </p>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* IMPACT */}
      <section className={`${styles.impact} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{contentdata?.impact?.heading}</h2>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.impact?.paragraph1}}>
           
          </p>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.impact?.paragraph2}}>
           
          </p>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.impact?.paragraph3}}>
            
          </p>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* CEO */}
      <section className={`${styles.ceo} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <div className={styles.ceoGrid}>
            <div className={styles.ceoText}>
              <h2 className={styles.ceoName}>{contentdata?.ceo?.name}</h2>
              <p className={styles.ceoTitle}>{contentdata?.ceo?.title}</p>
              <p className={styles.who_ceo} dangerouslySetInnerHTML={{__html:contentdata?.ceo?.paragraph1}} >
              
              </p>
              <p className={styles.who_ceo} dangerouslySetInnerHTML={{__html:contentdata?.ceo?.paragraph2}}>

              </p>
              <p className={styles.who_ceo}   dangerouslySetInnerHTML={{__html:contentdata?.ceo?.paragraph3}}>
           
              </p>
            </div>
            <div className={styles.ceoImage}>
              <img src={contentdata?.ceo?.image_path} alt="ceo image" />
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* TEAM INTRO */}
      <section className={`${styles.teamIntro} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{contentdata?.people_behind?.heading}</h2>
          <p className={styles.paragraph}  dangerouslySetInnerHTML={{__html:contentdata?.people_behind?.paragraph1}}>
           
          </p>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.people_behind?.paragraph2}}>
           
          </p>
          <p className={styles.paragraph} dangerouslySetInnerHTML={{__html:contentdata?.people_behind?.paragraph3}}>
          
          </p>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* EXPERT TEAM */}
      <section className={`${styles.team} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>EXPERT TEAM</h2>
          <div className={styles.teamGrid}>
            {contentdata?.expert_team?.map((member) => (
              <div key={member.id} className={styles.teamCard}>
                <img src={member.image_path} alt={member.name} className={styles.teamImg} />
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamPos}>{member.position}</p>
                  <p className={styles.teamDesc}>
                    {member.description.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* JOIN US */}
      <section className={`${styles.joinSection} ${styles.fadeIn}`}>
        <div className={styles.container}>
          <h2 className={styles.joinTitle}>{contentdata?.join_us?.heading}</h2>
          <div className={styles.joinGrid}>
            <div className={styles.joinText}>
              <p className={styles.joinIntro} dangerouslySetInnerHTML={{__html:contentdata?.join_us?.paragraph}}>
              
              </p>
              <ul className={styles.joinList}>
                { contentdata?.join_us?.bullets &&
                JSON.parse(contentdata.join_us.bullets)?.map((point, i) => (
                  <li key={i} className={styles.joinItem}>
                    <span className={styles.bullet}>•</span> {point}
                  </li>
                ))}
              </ul>
              <p className={styles.joinConclusion} dangerouslySetInnerHTML={{__html:contentdata?.join_us?.paragraph2}} >
               
              </p>
              <p className={styles.tagline} dangerouslySetInnerHTML={{__html:contentdata?.join_us?.paragraph3}}>
               
              </p>
            </div>
            <div className={styles.joinContentWrapper}>
  {/* Video Wrapper (now safe from overlap) */}
  <div className={styles.joinVideoWrapper}>
    <iframe
      src={`https://www.youtube.com/embed/${contentdata?.join_us?.youtube_video_id}`}
      title="Join Khudii"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={styles.video}
    ></iframe>
  </div>

  {/* Centered Button */}
  <div className={styles.joinButtonContainer}>
    <button
      onClick={()=>{nav('/volunteer/')}}
      className="cursor-pointer inline-flex items-center justify-center rounded-[25px] w-full sm:w-auto px-6 py-3 text-sm font-medium bg-[#E3001C] text-white transition-all duration-300 focus:outline-none shadow-md hover:shadow-lg"
      aria-label="Join Us as Volunteer"
    >

      Join Us as Volunteer
    </button>
  </div>
</div>
          </div>
        </div>
      </section>
    </div>
    }
</>
  );
};

export default AboutUs;