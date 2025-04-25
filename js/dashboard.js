let deleteIndex = null; // Biến lưu trữ index của mục cần xóa

function log_Out() {
  document.getElementById("Comfi_logOut").classList.remove("d-none");
  document.getElementById("overlay").classList.remove("d-none");
}

function Comfi_logOut() {
  localStorage.removeItem("UserLogin");
  document.getElementById("Comfi_logOut").classList.add("d-none");
  document.getElementById("overlay").classList.add("d-none");
  window.location.href = "login.html";
}

window.onload = function () {
  const user = localStorage.getItem("UserLogin");
  if (!user) {
    window.location.href = "login.html";
  }

  showCategory();
  showTransactions();
  showStatistics();
};

function save1() {
  let valueDate = document.getElementById("input_date").value.trim();
  let valueMoney = document.getElementById("input_value").value.trim();

  const checkDate = document.getElementById("errorDate");
  const checkMoney = document.getElementById("errorMoney");
  let valid = true;

  if (!valueDate) {
    checkDate.classList.remove("d-none");
    valid = false;
  } else {
    checkDate.classList.add("d-none");
  }

  if (!valueMoney) {
    checkMoney.classList.remove("d-none");
    valid = false;
  } else {
    checkMoney.classList.add("d-none");
  }

  if (!valid) {
    return;
  }

  // Lưu ngân sách vào localStorage
  const budget = {
    date: valueDate,
    money: parseFloat(valueMoney),
    remaining: parseFloat(valueMoney),
  };
  localStorage.setItem("budget", JSON.stringify(budget));

  document.getElementById("input_date").value = "";
  document.getElementById("input_value").value = "";

  showStatistics();
}

function saveCategory() {
  let nameCategory = document.getElementById("input_name_category").value.trim();
  let valueCategory = document.getElementById("input_value_category").value.trim(); // Đúng id
  let checkNameCategory = document.getElementById("errorNameCategory");
  let checkValueCategory = document.getElementById("errorValueCategory");
  let valid = true;

  if (!nameCategory) {
    checkNameCategory.classList.remove("d-none");
    valid = false;
  } else {
    checkNameCategory.classList.add("d-none");
  }

  if (!valueCategory) {
    checkValueCategory.classList.remove("d-none");
    valid = false;
  } else {
    checkValueCategory.classList.add("d-none");
  }

  if (!valid) {
    return;
  }

  // Lưu danh mục vào localStorage
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  categories.push({ name: nameCategory, value: parseFloat(valueCategory) });
  localStorage.setItem("categories", JSON.stringify(categories));

  document.getElementById("input_name").value = "";
  document.getElementById("input_value_category").value = "";

  showCategory();
}
















function showCategory() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const tableCategory = document.getElementById("table_Catygory");
  const categoryDropdown = document.getElementById("input_ChoseCategory");
  let tableHtml = "";
  let dropdownHtml = '<option value="" disabled selected hidden>Chọn danh mục</option>';

  categories.forEach((category, index) => {
    tableHtml += `
      <tr>
        <td>${category.name} - giới hạn: ${category.value} VND</td>
        <td class="text-center">
          <button type="button" class="btn btn-primary" onclick="editCategory(${index})">Sửa</button>
          <button type="button" class="btn btn-danger" onclick="confirmDeleteCategory(${index})">Xóa</button>
        </td>
      </tr>
    `;
    dropdownHtml += `<option value="${category.name}">${category.name}</option>`;
  });

  tableCategory.innerHTML = tableHtml;
  categoryDropdown.innerHTML = dropdownHtml;
}

function confirmDeleteCategory(index) {
  deleteIndex = index; // Lưu index của mục cần xóa
  document.getElementById("deleteModal").classList.remove("d-none");
  document.getElementById("overlay").classList.remove("d-none");
}

function deleteCategory() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  categories.splice(deleteIndex, 1);
  localStorage.setItem("categories", JSON.stringify(categories));
  closeModal();
  showCategory();
}

function closeModal() {
  document.getElementById("deleteModal").classList.add("d-none");
  document.getElementById("overlay").classList.add("d-none");
}

function editCategory(index) {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const category = categories[index];
  document.getElementById("input_name").value = category.name;
  document.getElementById("input_value").value = category.value;

  // Lưu thay đổi
  document.querySelector(".btn-success").onclick = function () {
    category.name = document.getElementById("input_name").value.trim();
    category.value = parseFloat(document.getElementById("input_value").value.trim());
    categories[index] = category;
    localStorage.setItem("categories", JSON.stringify(categories));
    showCategory();
  };
}

function showTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const table = document.querySelector(".history .table tbody");
  let html = "";

  transactions.forEach((transaction, index) => {
    html += `
      <tr>
        <td>${transaction.category} - ${transaction.amount} VND</td>
        <td>${transaction.note}</td>
        <td>
          <button type="button" class="btn btn-danger" onclick="confirmDeleteTransaction(${index})">Xóa</button>
        </td>
      </tr>
    `;
  });

  table.innerHTML = html;
}

function confirmDeleteTransaction(index) {
  deleteIndex = index; // Lưu index của giao dịch cần xóa
  document.getElementById("deleteModal").classList.remove("d-none");
  document.getElementById("overlay").classList.remove("d-none");
}

function deleteTransaction() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.splice(deleteIndex, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  closeModal();
  showTransactions();
}

function showStatistics() {
  const budget = JSON.parse(localStorage.getItem("budget")) || { money: 0 };
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const table = document.querySelector(".thongke .styled-table tbody");
  let html = `
    <tr>
      <td>${budget.date || "Chưa chọn tháng"}</td>
      <td>${totalSpent} VND</td>
      <td>${budget.money} VND</td>
      <td>${totalSpent <= budget.money ? "Đạt" : "Vượt"}</td>
    </tr>
  `;

  table.innerHTML = html;
}