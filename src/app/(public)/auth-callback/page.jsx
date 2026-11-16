import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {title:'Authentication callback',robots:{index:false,follow:false}};}
export default function Page(){return <ClientPage/>;}
