'use client';
import PublicPage from '@/components/PublicPage';
import Component from '@/legacy/public/pages/Blogs/Blogs';
export default function Page() { return <PublicPage component={Component} seoPath="/blogs" passSeo={true} />; }
