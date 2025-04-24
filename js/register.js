const usersData = {
    users: [
      { id: 1, username: "1", password: "1" },
      { id: 2, username: "user2", password: "password456" }
    ]
  };
  
  // Lưu dữ liệu mẫu nếu chưa có
  function saveToLocalStore() {
    if (!localStorage.getItem("UserSystems")) {
      localStorage.setItem("UserSystems", JSON.stringify(usersData));
    }
  }
  saveToLocalStore();
  
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Hàm xử lý đăng ký
  function register() {
    const email = document.getElementById("input_Email").value.trim();
    const password = document.getElementById("input_Password").value.trim();
    const confirmPassword = document.getElementById("confirm-Password").value.trim();
  
    const emailError = document.getElementById("Error_Email");
    const passError = document.getElementById("Eror_pass");
    const confirmError = document.getElementById("Eror_ComfiPass");
  
    let isValid = true;
  
    // Ẩn lỗi cũ
    emailError.classList.add("d-none");
    passError.classList.add("d-none");
    confirmError.classList.add("d-none");
  
    // Kiểm tra dữ liệu
    if (!email) {
      emailError.textContent = "Email không được để trống";
      emailError.classList.remove("d-none");
      isValid = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = "Email không hợp lệ";
      emailError.classList.remove("d-none");
      isValid = false;
    }
  
    if (!password) {
      passError.textContent = "Mật khẩu không được để trống";
      passError.classList.remove("d-none");
      isValid = false;
    }
  
    if (password && password !== confirmPassword) {
      confirmError.textContent = "Mật khẩu xác nhận không khớp";
      confirmError.classList.remove("d-none");
      isValid = false;
    }
  
    if (!isValid) return;
  
    const data = JSON.parse(localStorage.getItem("UserSystems")) || { users: [] };
  
    const userExists = data.users.some(user => user.username === email);
    if (userExists) {
      emailError.textContent = "Email đã tồn tại";
      emailError.classList.remove("d-none");
      return;
    }
  
    const newUser = {
      id: Date.now(),
      username: email,
      password: password
    };
  
    data.users.push(newUser);
    localStorage.setItem("UserSystems", JSON.stringify(data));
  
    showSuccessPopup();
  }
  
  function showSuccessPopup() {
    document.getElementById("successPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }
  
  function redirectToLogin() {
    window.location.href = "../pages/login.html";
  }
  