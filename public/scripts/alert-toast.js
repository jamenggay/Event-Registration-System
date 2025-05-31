const toastData = {
  success: {
    icon: "far fa-check-circle fa-beat",
    title: "Success:",
    message: "",
    class: "alert-success",
    closeIcon: "greencross",
  },
  warning: {
    icon: "fa fa-exclamation-triangle fa-fade",
    title: "Warning:",
    message: "",
    class: "alert-warning",
    closeIcon: "warning",
  },
  info: {
    icon: "fa fa-info-circle fa-bounce",
    title: "Heads Up!",
    message: "",
    class: "alert-info",
    closeIcon: "blue-cross",
  },
  danger: {
    icon: "far fa-times-circle fa-beat-fade",
    title: "Error: ",
    message: "",
    class: "alert-danger",
    closeIcon: "danger",
  },
  successalternate: {
    icon: "fa fa-thumbs-up fa-beat",
    title: "Registration Completed",
    message: "",
    class: "alert-primary",
    closeIcon: "alertprimary",
  },
};

let toastId = 0;
const toastTimers = {};

function showToast(type) {
  const container = document.getElementById("toastContainer");
  const data = toastData[type];
  toastId++;
  const currentToastId = `toast-${toastId}`;

  const toast = document.createElement("div");
  toast.className = `toast alert alert-simple ${data.class} snake-border`;
  toast.id = currentToastId;

  toast.innerHTML = `
  <button class="close" onclick="hideToast('${currentToastId}')">
    <i class="fa fa-times ${data.closeIcon}"></i>
  </button>
  <i class="start-icon ${data.icon}"></i>
  <strong>${data.title}</strong> ${data.message}
`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  toastTimers[currentToastId] = setTimeout(() => {
    hideToast(currentToastId);
  }, 5000);

  return currentToastId;
}

function hideToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    if (toastTimers[toastId]) {
      clearTimeout(toastTimers[toastId]);
      delete toastTimers[toastId];
    }

    toast.classList.remove("show");
    toast.classList.add("hide");

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }
}

export { toastData, showToast }
