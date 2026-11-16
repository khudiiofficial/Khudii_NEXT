// Avoid sending read-only API response columns to the strict CMS write validator.
export const NAVIGATION_WRITE_FIELDS = Object.freeze(['item_key','location','parent_id','page_id','label','link_type','url','sort_order','is_visible','open_new_tab','icon_name','css_class']);
export function navigationWritePayload(row) {
  return Object.fromEntries(NAVIGATION_WRITE_FIELDS.filter(key => row[key] !== undefined).map(key => [key,
    ['is_visible','open_new_tab'].includes(key) ? Boolean(row[key]) :
    ['parent_id','page_id'].includes(key) ? (row[key] ? Number(row[key]) : null) : row[key],
  ]));
}
