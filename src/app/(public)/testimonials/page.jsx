'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/testimonial/Testimonial'), { ssr: false });
export default function Page() { return <PublicPage component={Component} seoPath="/testimonials" passSeo={true} />; }
