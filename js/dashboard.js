function log_Out(){
   document.getElementById("Comfi_logOut").classList.remove("d-none");
}

function Comfi_logOut(){
    localStorage.removeItem("UserLogin");
   document.getElementById("Comfi_logOut").classList.add("d-none");
   window.location.href = "login.html";
}

window.onload = function () {
    const user = localStorage.getItem("UserLogin");
    if (!user) {
      window.location.href = "login.html";
    }
  };