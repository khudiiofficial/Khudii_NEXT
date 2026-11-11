export const KHUDII_FORMS = [
  {key:'contact',name:'Contact Page - Message Form',path:'/contact',fields:['name','email','phone','subject','message','country','countryCode','CountryName']},
  {key:'inquiry',name:'Organization Profile - Enquiry Form',path:'/organization/[slug]',fields:['name','email','phone','message']},
  {key:'donate',name:'Donation Page - Donation Form',path:'/donate-now',fields:['firstName','lastName','email','phone','donationAmount','donationType','address1','city','state','country','message']},
  {key:'volunteer',name:'Volunteer Page - Application Form',path:'/volunteer',fields:['name','email','phone','country','CountryName','countryCode','city','contactTime','message']},
  {key:'jobs',name:'Jobs Page - Job Application Form',path:'/jobs',fields:['name','email','phone','country','countryCode','CountryName','qualification','experience','interestedPost','message']},
  {key:'story',name:'Contribute Story - Story Submission Form',path:'/contribute-your-story',fields:['name','email','phone','country','CountryName','countryCode','company','entityType','story']},
  {key:'organization',name:'Organization - Registration Form',path:'/organization/registration',fields:['organizationName','contactPersonName','contactPersonMobile','landlineUan','websiteUrl','emailAddress','facebookLink','instagramLink','youtubeLink','linkedinLink','twitterLink','yearEstablished','totalBeneficiariesServed','totalProjectsCompleted','activeProjects']},
];
export const KHUDII_FORM_KEYS = KHUDII_FORMS.map(f => f.key);
