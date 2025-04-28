// ========== Khai báo ==========
let budget = 0;
let remainingMoney = 0;
let categories = [];
let transactions = [];
let selectedMonth = "";


const overlayDelete = document.getElementById("overlayDelete");

// ----------------------------//




// ---------------------------- khi trang này được load --------------------------//
window.onload = function () {
    const userLogin = JSON.parse(localStorage.getItem("UserLogin"));
    if (!userLogin) {
        window.location.href = "../pages/login.html";
    }
    const dateInput = document.getElementById("input_date");
    dateInput.addEventListener("change", changeMonth);
    if (dateInput.value) {
        selectedMonth = dateInput.value;
        loadData();
    }
};

// ---------------------------------------------------------------------------------//




//----------------------- các hàm đăng nhập đăng xuất --------------------------//

function log_Out() {
    document.getElementById("Comfi_logOut").classList.remove("d-none");
    document.getElementById("overlay").classList.remove("d-none");
}

function Comfi_logOut() {
    localStorage.removeItem("UserLogin")
    window.location.href = "../pages/login.html";
}

function close_logOut() {
    document.getElementById("Comfi_logOut").classList.add("d-none");
    document.getElementById("overlay").classList.add("d-none");

}
////-------------------------------------------------------------------------///








// // ========== Khai báo các biến cho phân trang giao dịch ==========
let overlay = document.getElementById("overlay");
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 5; // Số giao dịch trên mỗi trang
//-----------------------------------------------------------------------------------//




// ========== Hàm load dữ liệu ==========
function loadData() {
    selectedMonth = document.getElementById("input_date").value;
    if (!selectedMonth) return;

    const allData = JSON.parse(localStorage.getItem("financeData")) || {};
    const data = allData[selectedMonth];

    if (data) {
        budget = data.budget || 0;
        remainingMoney = data.remainingMoney || 0;
        categories = data.categories || [];
        transactions = data.transactions || [];
    } else {
        budget = 0;
        remainingMoney = 0;
        categories = [];
        transactions = [];
    }

    document.getElementById("input_value").value = budget || "";
    document.getElementById("remainingMoney").innerText = remainingMoney.toLocaleString();

    renderCategories();
    renderTransactions();
}

// ========== Hàm lưu dữ liệu ==========
function saveData() {
    const allData = JSON.parse(localStorage.getItem("financeData")) || {};
    allData[selectedMonth] = {
        budget,
        remainingMoney,
        categories,
        transactions
    };
    localStorage.setItem("financeData", JSON.stringify(allData));
}




// ---------- thay đổi sang tháng mới --------------//
function changeMonth() {
    loadData();
}
//------------------------------------------------//





// ------------------------------------ lưu tháng đó và ngân sách tháng đó ----------------------//

function save1() {
    const moneyInput = parseFloat(document.getElementById("input_value").value);
    const dateInput = document.getElementById("input_date").value;

    let valid = true;

    // Kiểm tra tháng
    if (!dateInput) {
        document.getElementById("errorDate").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("errorDate").classList.add("d-none");
    }

    // Kiểm tra số tiền
    if (isNaN(moneyInput) || moneyInput <= 0) {
        document.getElementById("errorBudget").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("errorBudget").classList.add("d-none");
    }

    if (!valid) {
        return;
    }

    // Lưu ngân sách
    budget = moneyInput;
    remainingMoney = moneyInput;
    selectedMonth = dateInput;

    document.getElementById("remainingMoney").innerText = remainingMoney.toLocaleString();
    saveData();
}

//----------------------------------------------------------------------------------------///









// ======================= Các hàm danh mục(category) ====================//

//lưu danh mục mới
function saveCategory() {
    const name = document.getElementById("input_name").value.trim();
    const limit = parseFloat(document.getElementById("input_value_category").value);

    let valid = true;


    if (!name) {
        document.getElementById("errorNameCategory").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("errorNameCategory").classList.add("d-none");
    }

    // Kiểm tra giới hạn danh mục
    if (isNaN(limit) || limit <= 0) {
        document.getElementById("errorValueCategory").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("errorValueCategory").classList.add("d-none");
    }

    if (!valid) {
        return;
    }

    // Thêm danh mục
    categories.push({ name, limit, spent: 0 });
    renderCategories();
    saveData();

    // Reset form
    document.getElementById("input_name").value = "";
    document.getElementById("input_value_category").value = "";
}

// hiển thị danh mục mới lưu
function renderCategories() {
    const table = document.getElementById("table_Category");
    table.innerHTML = "";

    categories.forEach((cat, index) => {
        const isOverLimit = cat.spent > cat.limit; // Kiểm tra nếu vượt giới hạn
        table.innerHTML += `
            <tr>
                <td style="color: ${isOverLimit ? 'red' : 'green'};">
                    ${cat.name} - giới hạn: ${cat.limit.toLocaleString()} VND - đã chi: ${cat.spent.toLocaleString()} VND
                </td>
                <td class="text-center">
                    <button onclick="showModalCategory(${index})" class="btn btn-primary">Sửa</button>
                    <button onclick="showModelDelete(${index}, 'category')" class="btn btn-danger">Xóa</button>
                </td>
            </tr>
        `;
    });

    const select = document.getElementById("input_ChoseCategory");
    select.innerHTML = '<option value="" disabled selected hidden>Chọn danh mục</option>';
    categories.forEach((cat, index) => {
        select.innerHTML += `<option value="${index}">${cat.name}</option>`;
    });

    // Hiển thị thông báo nếu có danh mục vượt giới hạn
    const resultDiv = document.querySelector(".result");
    const overLimitCategories = categories.filter(cat => cat.spent > cat.limit);
    if (overLimitCategories.length > 0) {
        resultDiv.innerHTML = overLimitCategories
            .map(cat => `<p style="color: red;">Danh mục "${cat.name}" đã vượt giới hạn: ${cat.spent.toLocaleString()} / ${cat.limit.toLocaleString()} VND</p>`)
            .join("");
    } else {
        resultDiv.innerHTML = "<p style='color: green;'>Không có danh mục nào vượt giới hạn.</p>";
    }
}
//-------------------------------------------------------------------------------------------------------------------------///






// ------------------------các hàm liên quan lịch sử giao dịch-------------------------------------------------------------------//
function addTransaction() {
    const amountInput = parseFloat(document.getElementById("input_money").value);
    const categoryValue = document.getElementById("input_ChoseCategory").value;
    const note = document.getElementById("note").value.trim();
    let errorMoneyTransaction = document.getElementById("errorMoneyTransaction");
    let errorCategoryTransaction = document.getElementById("errorCategoryTransaction");

    let valid = true;

    // Kiểm tra số tiền
    if (!amountInput || amountInput <= 0) {
        errorMoneyTransaction.classList.remove("d-none");
        valid = false;
    } else {
        errorMoneyTransaction.classList.add("d-none");
    }

    if (!categoryValue) {
        errorCategoryTransaction.classList.remove("d-none");
        valid = false;
    } else {
        errorCategoryTransaction.classList.add("d-none");
    }


    if (!valid) {
        return;
    }

    // Thêm giao dịch
    const category = categories[categoryValue];
    remainingMoney -= amountInput;
    category.spent += amountInput;

    transactions.push({ amount: amountInput, category: category.name, note });
    saveData(); // Lưu dữ liệu vào localStorage
    renderTransactions(); // Hiển thị lại giao dịch
    renderCategories(); // Cập nhật danh mục

    // Cập nhật số tiền còn lại
    document.getElementById("remainingMoney").innerText = remainingMoney.toLocaleString();

    // Reset form
    document.getElementById("input_money").value = "";
    document.getElementById("input_ChoseCategory").value = "";
    document.getElementById("note").value = "";
}

//-----------------------------------------------------------------------------------------------------------------//












//-------------------------- hàm chỉnh sửa(Edit) category----------------------------------------//
let indexToEdit = -1;
let editModalCategory = document.getElementById("editModalCategory");

function showModalCategory(index) {
    indexToEdit = index;
    editModalCategory.classList.remove("d-none");
    overlayDelete.classList.remove("d-none");

}

function ComfiModalCategory() {
    const newName = document.getElementById("editNameCategory").value.trim();
    const newLimit = document.getElementById("editValueCategory").value;

    let checkNameEdit = document.getElementById("errorNameEditCategory");
    let checkValueEdit = document.getElementById("errorValueEditCategory");

    let valid = true;

  if(!newName){
    checkNameEdit.classList.remove("d-none");
    valid = false;
  }else{
    checkNameEdit.classList.add("d-none");
  }

  if(!newLimit){
    checkValueEdit.classList.remove("d-none");
  }

  if(!vailed){
    return;
  }

    if (indexToEdit !== -1) {
        categories[indexToEdit].name = newName;
        categories[indexToEdit].limit = newLimit;

        saveData();
        renderCategories();
        closeModalEditCategory();
    }
}




function closeModalEditCategory() {
    editModalCategory.classList.add("d-none");
    overlayDelete.classList.add("d-none");
    indexToEdit = -1;
}

// ----------------------------------------------------------------------------------------------//














// ------------------------ hàm xóa giao dịch và cattegory --------------------------------//
const deleteModal = document.getElementById("deleteModal");
let indexToDelete = -1;
let type = "";


function showModelDelete(index, type) {
    indexToDelete = index;
    type = type;
    overlayDelete.classList.remove("d-none");
    deleteModal.classList.remove("d-none");
}

function confirmDeleteTransaction() {
    console.log(type);

    if (indexToDelete !== -1) {
        if (type == "transaction") {
            console.log("lac");
            transactions.splice(indexToDelete, 1);
            localStorage.setItem("transaction", JSON.stringify(transactions));
            renderTransactions();
        } else if (type == "category") {
            console.log("huy");
            categories.splice(indexToDelete, 1);
            localStorage.setItem("categories", JSON.stringify(categories));
            renderCategories();
        }
        closeModalDelete();
    }
}



function closeModalDelete() {
    deleteModal.classList.add("d-none");
    overlayDelete.classList.add("d-none");
    indexToDelete = -1;
    type = "";
}

//--------------------------------------------------------------------------------------------------------------//






























// ------------------------------ Phân trang cho phần lịch sử giao dịch --------------------------------------//

function renderTransactions() {
    const table = document.getElementById("table_Transaction");
    table.innerHTML = ""; // Làm mới bảng trước khi hiển thị

    if (transactions.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="text-center">Không có giao dịch nào</td></tr>`;
        renderPagination(); // Cập nhật nút phân trang (ẩn nếu không cần)
        return;
    }

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages; // Nếu xóa giao dịch làm giảm số trang

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    paginatedTransactions.forEach((tran, index) => {
        table.innerHTML += `
            <tr>
                <td>${tran.category}</td>
                <td>${tran.amount.toLocaleString()} VND</td>
                <td>${tran.date}</td>
                <td>${tran.note}</td>
                <td>
                    <button onclick="showModelDelete(${startIndex + index}, 'transaction')" class="btn btn-danger">Xóa</button>
                </td>
            </tr>
        `;
    });

    renderPagination();
}



function renderPagination() {
    const paginationDiv = document.querySelector(".pagination ul");
    paginationDiv.innerHTML = "";

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Previous
    paginationDiv.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
        </li>
    `;

    // Các trang
    for (let i = 1; i <= totalPages; i++) {
        paginationDiv.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }

    // Next
    paginationDiv.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
        </li>
    `;
}


function changePage(page) {
    currentPage = page;
    renderTransactions();
}

//-----------------------------------------------------------------------------------------------------------------//



