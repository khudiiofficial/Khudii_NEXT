import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import PodcastGallery from '@/components/podcast/PodcastGallery';

export async function generateMetadata(){return generateKhudiiPageMetadata('/podcast','Podcast');}

export const dynamic='force-dynamic';
export default async function PodcastPage() { const r=await resolveRedirect('/podcast');if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <PodcastGallery />; }
