import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
export const dynamic='force-dynamic';
export async function generateMetadata(){return generateKhudiiPageMetadata('/','Home');}
export default function Page(){return <ClientPage/>;}
