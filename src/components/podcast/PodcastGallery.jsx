'use client';
import CmsPageLayout from '@/components/CmsPageLayout';
import PageHeader from '@/legacy/public/componets/PageHeader/PageHeader';
import PodcastCollection from './PodcastCollection';
export default function PodcastGallery(){return <CmsPageLayout slug="/podcast"><PageHeader title="Podcast" breadcrumbs={[{label:'Home',link:'/'},{label:'Podcast'}]}/><PodcastCollection/></CmsPageLayout>;}
