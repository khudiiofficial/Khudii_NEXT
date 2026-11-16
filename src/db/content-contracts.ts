export type SitePageStatus = 'draft' | 'published' | 'archived';
export type SitePageKind = 'standard' | 'landing' | 'template';
export type MenuLocation = 'header' | 'footer' | 'topbar';
export type MenuLinkType = 'page' | 'internal' | 'external' | 'anchor' | 'group';
export type TabDisplayMode = 'tabs' | 'accordion' | 'pills' | 'hidden';
export type CmsAction = 'create' | 'update' | 'delete' | 'publish' | 'reorder' | 'restore';
export type AdminPermission =
  | 'pages.read' | 'pages.write' | 'pages.publish'
  | 'navigation.manage' | 'sections.manage' | 'seo.read' | 'seo.manage'
  | 'settings.manage' | 'users.manage' | 'logs.read' | 'redirects.manage'
  | 'forms.read' | 'forms.manage' | 'media.manage';

export interface ContentCategory {
  id: number;
  categoryKey: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface CmsPage {
  id: number;
  pageKey: string;
  categoryId: number | null;
  parentPageId: number | null;
  title: string;
  slug: string;
  path: string;
  pageKind: SitePageKind;
  status: SitePageStatus;
  showInMenu: boolean;
  sortOrder: number;
  bannerSettings: Record<string, unknown> | null;
  layoutSettings: Record<string, unknown> | null;
  revision: number;
}

export interface CmsTab {
  id: number;
  pageId: number;
  parentTabId: number | null;
  tabKey: string;
  label: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  displayMode: TabDisplayMode;
  revision: number;
}

export type SectionPayload = Record<string, unknown>;
export interface CmsSection {
  id: number;
  pageId: number;
  tabId: number | null;
  sectionKey: string;
  sourceKey: string | null;
  sectionType: string;
  title: string;
  payload: SectionPayload;
  sortOrder: number;
  isPublished: boolean;
  revision: number;
}

export interface NavigationItem {
  id: number;
  itemKey: string;
  location: MenuLocation;
  parentId: number | null;
  pageId: number | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  sortOrder: number;
  isVisible: boolean;
  openNewTab: boolean;
  children?: NavigationItem[];
}

export interface PageSeo {
  id: number;
  pageId: number | null;
  entityType: 'page' | 'organization' | 'blog' | 'podcast' | 'story' | 'category';
  entityKey: string;
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string;
  twitterCard: 'summary' | 'summary_large_image';
  robotsNoindex: boolean;
  robotsNofollow: boolean;
  includeInSitemap: boolean;
  sitemapPriority: string;
  sitemapChangefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  structuredData: Record<string, unknown> | null;
  seoSettings: Record<string, unknown> | null;
  revision: number;
}

export interface CrudSuccess<T> { success: true; data: T; revision?: number; }
export interface CrudFailure { success: false; error: { code: string; message: string; fields?: Record<string,string>; requestId: string; }; }
export type CrudResult<T> = CrudSuccess<T> | CrudFailure;

export interface PageTreeNode extends CmsPage {
  tabs: (CmsTab & { subtabs: CmsTab[] })[];
  sections: CmsSection[];
  children: PageTreeNode[];
}

export interface SavePageInput {
  page: Omit<CmsPage,'id'> & { id?: number };
  sections: Omit<CmsSection,'id'|'pageId'>[];
  tabs: Omit<CmsTab,'id'|'pageId'>[];
  expectedRevision: number;
}
