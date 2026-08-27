'use client';
import PublicPage from '@/components/PublicPage';
import Component from '@/legacy/public/pages/Home/Home';
export default function Page() { return <PublicPage component={Component} seoPath="/" passSeo={true} />; }
