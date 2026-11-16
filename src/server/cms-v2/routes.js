import { listV2,getV2,createV2,updateV2,deleteV2,reorderV2,publicV2Page,publicV2Navigation,listV2Permissions,grantV2Role,listV2UserRoles,revokeV2Role,duplicateV2Page } from './controller.js';
import { auth } from '../admin-backend/middleware/auth.js';
const admin = (method,path,action)=>({method,path,handlers:[auth,action]});
const publicRoute=(method,path,action)=>({method,path,handlers:[action]});
export const adminCmsV2Routes = [
  admin('GET','/admin/v2/permissions',listV2Permissions),
  admin('GET','/admin/v2/users/roles',listV2UserRoles),
  admin('DELETE','/admin/v2/roles/revoke',revokeV2Role),
  admin('POST','/admin/v2/roles/grant',grantV2Role),
  admin('PUT','/admin/v2/:resource/reorder',reorderV2),
  admin('POST','/admin/v2/pages/:id/duplicate',duplicateV2Page),
  admin('GET','/admin/v2/:resource',listV2),
  admin('POST','/admin/v2/:resource',createV2),
  admin('GET','/admin/v2/:resource/:id',getV2),
  admin('PUT','/admin/v2/:resource/:id',updateV2),
  admin('PATCH','/admin/v2/:resource/:id',updateV2),
  admin('DELETE','/admin/v2/:resource/:id',deleteV2),
];
export const publicCmsV2Routes = [
  publicRoute('GET','/cms/v2/page',publicV2Page),
  publicRoute('GET','/cms/v2/navigation',publicV2Navigation),
];
