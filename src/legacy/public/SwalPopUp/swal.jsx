import Swal from "sweetalert2";

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

export const showSuccessAlert = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success!",
    html: "<p>"+message+"</p>",
    iconColor: "#1c5e20",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      title: "text-[#1c5e20] text-2xl font-semibold",
      confirmButton:
        "cursor-pointer px-6 h-10 rounded-[15px] bg-[#1c5e20] text-white font-semibold",
      popup: "rounded-2xl",
    },
  });
};
