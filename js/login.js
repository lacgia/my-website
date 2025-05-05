function login() {
  const email = document.getElementById("input_Email").value.trim();
  const password = document.getElementById("input_Password").value.trim();

  const emailError = document.getElementById("Error_Email");
  const passError = document.getElementById("Error_Pass");
  const loginError = document.getElementById("Login_Error");

  let isValid = true;

  // Ẩn lỗi cũ
  emailError.classList.add("d-none");
  passError.classList.add("d-none");
  loginError.classList.add("d-none");

  // Kiểm tra Email
  if (!email) {
    emailError.textContent = "Email đăng nhập không được để trống";
    emailError.classList.remove("d-none");
    isValid = false;
  }else if (!isValidEmail(email)) {
    emailError.textContent = "Email không hợp lệ";
    emailError.classList.remove("d-none");
    isValid = false;
  }

   
  // Kiểm tra mật khẩu
  if (!password) {
    passError.textContent = "Mật khẩu không được để trống";
    passError.classList.remove("d-none");
    isValid = false;
  }

  if (!isValid) return;

  const data = JSON.parse(localStorage.getItem("UserSystems")) || { users: [] };

  const foundUser = data.users.find(user => user.username === email && user.password === password);

  if (foundUser) {
    localStorage.setItem("UserLogin", email);
    window.location.href = "./dashboard.html";
  } else {
    loginError.textContent = "Email đăng nhập hoặc mật khẩu không đúng!";
    loginError.classList.remove("d-none");
  }
}

// Hàm kiểm tra định dạng email 
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
