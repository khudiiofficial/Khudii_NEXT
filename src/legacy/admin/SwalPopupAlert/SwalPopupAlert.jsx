import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


// function to show confirmation alert
  const MySwal = withReactContent(Swal);
  export const showSuccessAlert = () => {
    MySwal.fire({
      title: <strong>Success!</strong>,
      customClass: {
    title: "text-[#1c5e20] text-2xl font-semibold",
  },
      html: <i>Organization Updated Successfully!</i>,
      icon: 'success', // This displays the animated success icon
      confirmButtonText: 'OK',
      iconColor: "#1c5e20",
      confirmButtonColor: "#1c5e20",
      buttonsStyling: false,
  customClass: {
    confirmButton: "cursor-pointer px-15 rounded-[15px] bg-[#1c5e20] text-white font-semibold h-10",
  },
      // Optional: auto-close after a few seconds
      // timer: 1500, 
      // showConfirmButton: false
    });
  };

  // function to show error alert
export const showError = (message = "Something went Wrong!") => {
  Swal.fire({
    icon: "error",
    title: "Error!",
    text: message,

    // icon & title color
    iconColor: "#e7001e",
    titleColor: "#e7001e",

    confirmButtonText: "OK",

    buttonsStyling: false, // REQUIRED
    customClass: {
      confirmButton:
        "px-15 h-10 rounded-[15px] bg-[#e7001e] text-white font-semibold hover:bg-red-900 focus:outline-none",
      popup: "rounded-2xl",
      title: "text-red-800 text-2xl font-bold",
      htmlContainer: "text-gray-600",
    },
  });
};
