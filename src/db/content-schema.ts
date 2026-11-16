import { sql } from 'drizzle-orm';
import {
  mysqlTable, bigint, int, tinyint, varchar, text, char, timestamp,
  datetime, mysqlEnum, json, decimal, index, uniqueIndex, primaryKey,
  check, type AnyMySqlColumn,
} from 'drizzle-orm/mysql-core';

const stamp = () => ({
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const existingKhudiiUsers = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  status: tinyint('status').notNull().default(1),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
});

export const categories = mysqlTable('khudii_content_categories', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  categoryKey: varchar('category_key', { length: 100 }).notNull(),
  name: varchar('name', { length: 180 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull(),
  description: text('description'),
  parentId: bigint('parent_id', { mode: 'number', unsigned: true }).references((): AnyMySqlColumn => categories.id, { onDelete: 'restrict' }),
  sortOrder: int('sort_order', { unsigned: true }).notNull().default(0),
  isPublished: tinyint('is_published').notNull().default(1),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
}, t => [
  uniqueIndex('uq_khudii_category_key').on(t.categoryKey),
  uniqueIndex('uq_khudii_category_slug').on(t.slug),
  index('idx_khudii_categories_parent').on(t.parentId,t.sortOrder),
  check('chk_khudii_category_not_self',sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`),
]);

export const sitePages = mysqlTable('khudii_site_pages', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  pageKey: varchar('page_key', { length: 140 }).notNull(),
  categoryId: bigint('category_id', { mode: 'number', unsigned: true }).references(() => categories.id, {onDelete:'set null'}),
  parentPageId: bigint('parent_page_id', { mode: 'number', unsigned: true }).references((): AnyMySqlColumn => sitePages.id, {onDelete:'restrict'}),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull(),
  path: varchar('path', { length: 700 }).notNull(),
  pageKind: mysqlEnum('page_kind', ['standard','landing','template']).notNull().default('standard'),
  status: mysqlEnum('status', ['draft','published','archived']).notNull().default('draft'),
  showInMenu: tinyint('show_in_menu').notNull().default(0),
  sortOrder: int('sort_order', { unsigned: true }).notNull().default(0),
  bannerSettings: json('banner_settings'),
  layoutSettings: json('layout_settings'),
  revision: int('revision', { unsigned: true }).notNull().default(1),
  publishedAt: datetime('published_at'),
  createdBy: int('created_by').references(() => existingKhudiiUsers.id, {onDelete:'set null'}),
  updatedBy: int('updated_by').references(() => existingKhudiiUsers.id, {onDelete:'set null'}),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
},t=>[
  uniqueIndex('uq_khudii_site_page_key').on(t.pageKey),
  uniqueIndex('uq_khudii_site_page_path').on(t.path),
  index('idx_khudii_site_page_parent').on(t.parentPageId,t.sortOrder),
  index('idx_khudii_site_page_category').on(t.categoryId,t.status),
  index('idx_khudii_site_page_status').on(t.status,t.deletedAt),
  check('chk_khudii_page_not_self',sql`${t.parentPageId} IS NULL OR ${t.parentPageId} <> ${t.id}`),
  check('chk_khudii_page_absolute_path',sql`LEFT(${t.path},1) = '/'`),
]);

export const pageTabs = mysqlTable('khudii_page_tabs', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  pageId: bigint('page_id', { mode: 'number', unsigned: true }).notNull().references(() => sitePages.id, {onDelete:'cascade'}),
  parentTabId: bigint('parent_tab_id', { mode: 'number', unsigned: true }).references((): AnyMySqlColumn => pageTabs.id, {onDelete:'restrict'}),
  parentSlot: bigint('parent_slot', { mode: 'number', unsigned: true }).generatedAlwaysAs(sql`COALESCE(parent_tab_id,0)`, {mode:'stored'}),
  tabKey: varchar('tab_key', { length: 140 }).notNull(),
  label: varchar('label', { length: 180 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull(),
  sortOrder: int('sort_order', { unsigned: true }).notNull().default(0),
  isPublished: tinyint('is_published').notNull().default(1),
  displayMode: mysqlEnum('display_mode', ['tabs','accordion','pills','hidden']).notNull().default('tabs'),
  revision: int('revision', {unsigned:true}).notNull().default(1),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
},t=>[
  uniqueIndex('uq_khudii_tab_key').on(t.pageId,t.tabKey),
  uniqueIndex('uq_khudii_tab_sibling_slug').on(t.pageId,t.parentSlot,t.slug),
  index('idx_khudii_tab_parent').on(t.parentTabId,t.sortOrder),
  check('chk_khudii_tab_not_self',sql`${t.parentTabId} IS NULL OR ${t.parentTabId} <> ${t.id}`),
]);

export const pageSections = mysqlTable('khudii_page_sections', {
  id: bigint('id', { mode:'number', unsigned:true }).autoincrement().primaryKey(),
  pageId: bigint('page_id', {mode:'number',unsigned:true}).notNull().references(()=>sitePages.id,{onDelete:'cascade'}),
  tabId: bigint('tab_id', {mode:'number',unsigned:true}).references(()=>pageTabs.id,{onDelete:'restrict'}),
  sectionKey: varchar('section_key',{length:140}).notNull(),
  sourceKey: varchar('source_key',{length:140}),
  sectionType: varchar('section_type',{length:72}).notNull(),
  title: varchar('title',{length:255}).notNull(),
  payload: json('payload').notNull(),
  sortOrder: int('sort_order',{unsigned:true}).notNull().default(0),
  isPublished: tinyint('is_published').notNull().default(1),
  revision: int('revision',{unsigned:true}).notNull().default(1),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
},t=>[
  uniqueIndex('uq_khudii_section_key').on(t.pageId,t.sectionKey),
  index('idx_khudii_section_location').on(t.pageId,t.tabId,t.isPublished,t.sortOrder),
]);

export const navigationItems = mysqlTable('khudii_navigation_items', {
  id: bigint('id',{mode:'number',unsigned:true}).autoincrement().primaryKey(),
  itemKey: varchar('item_key',{length:140}).notNull(),
  location: mysqlEnum('location',['header','footer','topbar']).notNull(),
  parentId: bigint('parent_id',{mode:'number',unsigned:true}).references((): AnyMySqlColumn => navigationItems.id,{onDelete:'restrict'}),
  pageId: bigint('page_id',{mode:'number',unsigned:true}).references(()=>sitePages.id,{onDelete:'set null'}),
  label: varchar('label',{length:180}).notNull(),
  linkType: mysqlEnum('link_type',['page','internal','external','anchor','group']).notNull().default('page'),
  url: varchar('url',{length:1000}),
  sortOrder: int('sort_order',{unsigned:true}).notNull().default(0),
  isVisible: tinyint('is_visible').notNull().default(1),
  openNewTab: tinyint('open_new_tab').notNull().default(0),
  iconName: varchar('icon_name',{length:100}),
  cssClass: varchar('css_class',{length:100}),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
},t=>[
  uniqueIndex('uq_khudii_navigation_item_key').on(t.itemKey),
  index('idx_khudii_nav_tree').on(t.location,t.parentId,t.isVisible,t.sortOrder),
  index('idx_khudii_nav_page').on(t.pageId),
  check('chk_khudii_nav_not_self',sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`),
]);

export const pageSeo = mysqlTable('khudii_page_seo', {
  id: bigint('id',{mode:'number',unsigned:true}).autoincrement().primaryKey(),
  pageId: bigint('page_id',{mode:'number',unsigned:true}).references(()=>sitePages.id,{onDelete:'set null'}),
  entityType: mysqlEnum('entity_type',['page','organization','blog','podcast','story','category']).notNull(),
  entityKey: varchar('entity_key',{length:180}).notNull(),
  path: varchar('path',{length:700}).notNull(),
  metaTitle: varchar('meta_title',{length:255}),
  metaDescription: varchar('meta_description',{length:500}),
  metaKeywords: text('meta_keywords'),
  canonicalUrl: varchar('canonical_url',{length:1000}),
  ogTitle: varchar('og_title',{length:255}),
  ogDescription: varchar('og_description',{length:500}),
  ogImage: varchar('og_image',{length:1000}),
  ogType: varchar('og_type',{length:40}).notNull().default('website'),
  twitterCard: mysqlEnum('twitter_card',['summary','summary_large_image']).notNull().default('summary_large_image'),
  robotsNoindex: tinyint('robots_noindex').notNull().default(0),
  robotsNofollow: tinyint('robots_nofollow').notNull().default(0),
  includeInSitemap: tinyint('include_in_sitemap').notNull().default(1),
  sitemapPriority: decimal('sitemap_priority',{precision:2,scale:1}).notNull().default('0.5'),
  sitemapChangefreq: mysqlEnum('sitemap_changefreq',['always','hourly','daily','weekly','monthly','yearly','never']).notNull().default('monthly'),
  structuredData: json('structured_data'),
  seoSettings: json('seo_settings'),
  revision: int('revision',{unsigned:true}).notNull().default(1),
  ...stamp(),
  deletedAt: timestamp('deleted_at'),
},t=>[
  uniqueIndex('uq_khudii_seo_entity').on(t.entityType,t.entityKey),
  uniqueIndex('uq_khudii_seo_path').on(t.path),
  index('idx_khudii_seo_sitemap').on(t.includeInSitemap,t.robotsNoindex),
  check('chk_khudii_seo_priority',sql`${t.sitemapPriority} >= 0 AND ${t.sitemapPriority} <= 1`),
]);

export const adminRoles = mysqlTable('khudii_admin_roles', {
  id: int('id',{unsigned:true}).autoincrement().primaryKey(),
  roleKey: varchar('role_key',{length:80}).notNull(),
  label: varchar('label',{length:120}).notNull(),
  description: varchar('description',{length:500}),
  isSystemRole: tinyint('is_system_role').notNull().default(0),
  ...stamp(),
},t=>[uniqueIndex('uq_khudii_role_key').on(t.roleKey)]);

export const adminPermissions = mysqlTable('khudii_admin_permissions', {
  id: int('id',{unsigned:true}).autoincrement().primaryKey(),
  permissionKey: varchar('permission_key',{length:120}).notNull(),
  label: varchar('label',{length:180}).notNull(),
},t=>[uniqueIndex('uq_khudii_permission_key').on(t.permissionKey)]);

export const adminRolePermissions = mysqlTable('khudii_admin_role_permissions', {
  roleId: int('role_id',{unsigned:true}).notNull().references(()=>adminRoles.id,{onDelete:'cascade'}),
  permissionId: int('permission_id',{unsigned:true}).notNull().references(()=>adminPermissions.id,{onDelete:'cascade'}),
},t=>[primaryKey({columns:[t.roleId,t.permissionId]})]);

export const adminUserRoles = mysqlTable('khudii_admin_user_roles', {
  userId: int('user_id').notNull().references(()=>existingKhudiiUsers.id,{onDelete:'cascade'}),
  roleId: int('role_id',{unsigned:true}).notNull().references(()=>adminRoles.id,{onDelete:'cascade'}),
  assignedBy: int('assigned_by').references(()=>existingKhudiiUsers.id,{onDelete:'set null'}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
},t=>[primaryKey({columns:[t.userId,t.roleId]})]);

export const adminSessions = mysqlTable('khudii_admin_sessions', {
  id: char('id',{length:36}).primaryKey(),
  userId: int('user_id').notNull().references(()=>existingKhudiiUsers.id,{onDelete:'cascade'}),
  tokenHash: char('token_hash',{length:64}).notNull(),
  expiresAt: datetime('expires_at').notNull(),
  revokedAt: datetime('revoked_at'),
  lastSeenAt: datetime('last_seen_at'),
  ipHash: char('ip_hash',{length:64}),
  userAgentHash: char('user_agent_hash',{length:64}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
},t=>[
  uniqueIndex('uq_khudii_session_token_hash').on(t.tokenHash),
  index('idx_khudii_session_user_active').on(t.userId,t.expiresAt,t.revokedAt),
]);

export const cmsChangeHistory = mysqlTable('khudii_cms_change_history', {
  id: bigint('id',{mode:'number',unsigned:true}).autoincrement().primaryKey(),
  actorId: int('actor_id').references(()=>existingKhudiiUsers.id,{onDelete:'set null'}),
  entityType: varchar('entity_type',{length:60}).notNull(),
  entityId: varchar('entity_id',{length:180}).notNull(),
  action: mysqlEnum('action',['create','update','delete','publish','reorder','restore']).notNull(),
  oldValue: json('old_value'),
  newValue: json('new_value'),
  requestId: char('request_id',{length:36}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
},t=>[
  index('idx_khudii_cms_audit_entity').on(t.entityType,t.entityId,t.createdAt),
  index('idx_khudii_cms_audit_actor').on(t.actorId,t.createdAt),
]);

export const seoAuditRuns = mysqlTable('khudii_seo_audit_runs_v2', {
  id: bigint('id',{mode:'number',unsigned:true}).autoincrement().primaryKey(),
  requestedBy: int('requested_by').references(()=>existingKhudiiUsers.id,{onDelete:'set null'}),
  scope: varchar('scope',{length:120}).notNull().default('all'),
  checkedPages: int('checked_pages',{unsigned:true}).notNull().default(0),
  failedPages: int('failed_pages',{unsigned:true}).notNull().default(0),
  score: tinyint('score',{unsigned:true}),
  findings: json('findings').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
},t=>[
  index('idx_khudii_seo_audit_date').on(t.createdAt),
  check('chk_khudii_seo_audit_score',sql`${t.score} IS NULL OR ${t.score} <= 100`),
]);
