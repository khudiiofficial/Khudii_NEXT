import Swal from 'sweetalert2';

export async function adminConfirm(message, title='Confirm action') {
  const response=await Swal.fire({title,text:String(message||''),icon:'warning',showCancelButton:true,confirmButtonText:'Confirm',cancelButtonText:'Cancel',confirmButtonColor:'#2563eb',reverseButtons:true});
  return response.isConfirmed;
}
export const adminNotify=(message,icon='info') => Swal.fire({title:String(message||''),icon,confirmButtonColor:'#2563eb'});
