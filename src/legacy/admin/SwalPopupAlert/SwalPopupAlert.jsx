import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Function to show success alert
export const showSuccessAlert = (message = "Organization Updated Successfully!") => {
  return MySwal.fire({
    title: <strong>Success!</strong>,
    html: <span>{message}</span>,
    icon: 'success',
    iconColor: "#1c5e20",
    confirmButtonText: 'OK',
    buttonsStyling: false,
    customClass: {
      popup: "rounded-2xl shadow-xl p-6 border border-gray-100",
      title: "text-[#1c5e20] text-2xl font-bold mb-2",
      htmlContainer: "text-gray-600 text-base",
      confirmButton: "cursor-pointer px-8 h-10 rounded-[12px] bg-[#1c5e20] hover:bg-[#144717] text-white font-semibold shadow-md transition-all",
    },
  });
};

// Function to show error alert
export const showError = (message = "Something went Wrong!") => {
  return Swal.fire({
    icon: "error",
    title: "Error!",
    text: message,
    iconColor: "#e7001e",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-2xl shadow-xl p-6 border border-gray-100",
      title: "text-[#e7001e] text-2xl font-bold mb-2",
      htmlContainer: "text-gray-600 text-base",
      confirmButton: "cursor-pointer px-8 h-10 rounded-[12px] bg-[#e7001e] hover:bg-[#c20019] text-white font-semibold shadow-md transition-all focus:outline-none",
    },
  });
};

// Function to show warning alert
export const showWarning = (message = "Warning") => {
  return Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    iconColor: "#eab308",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-2xl shadow-xl p-6 border border-gray-100",
      title: "text-yellow-600 text-2xl font-bold mb-2",
      htmlContainer: "text-gray-600 text-base",
      confirmButton: "cursor-pointer px-8 h-10 rounded-[12px] bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition-all",
    },
  });
};

// Function to show custom confirmation dialog with Cancel & Confirm buttons
export const confirmAction = async ({
  title = "Are you sure?",
  text = "Are you sure you want to remove this item?",
  confirmButtonText = "Yes, Remove",
  cancelButtonText = "Cancel",
  icon = "warning",
  iconColor = "#e7001e",
  confirmButtonColor = "#e7001e",
} = {}) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    iconColor: iconColor,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-2xl shadow-2xl p-6 border border-gray-100",
      title: "text-gray-800 text-2xl font-bold mb-1",
      htmlContainer: "text-gray-600 text-sm sm:text-base mb-4",
      confirmButton: "cursor-pointer px-6 h-10 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all ml-3",
      cancelButton: "cursor-pointer px-6 h-10 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all",
    },
  });

  return result.isConfirmed;
};
