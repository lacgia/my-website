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








// // ========== Khai báo các biến toàn cục có tái sử dụng ==========
let overlay = document.getElementById("overlay");
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 3; // Số giao dịch trên mỗi trang
//-----------------------------------------------------------------------------------//




// ========== Hàm load dữ liệu ==========
function loadData() {
    selectedMonth = document.getElementById("input_date").value;
    if (!selectedMonth) {
        return;
    }
    const allData = JSON.parse(localStorage.getItem("financeData")) || {};
    const data = allData[selectedMonth];

        budget = data.budget || 0;
        remainingMoney = data.remainingMoney || 0;
        categories = data.categories || [];
        transactions = data.transactions || []; 

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
    const moneyInput = parseFloat(document.getElementById("input_value").value.replace(/[^0-9]/g, ""));
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

    let errorNameCategory = document.getElementById("errorNameCategory");
    let errorValueCategory = document.getElementById("errorValueCategory");
    let valid = true;


    if (!name) {
        errorNameCategory.classList.remove("d-none");
        valid = false;
    } else {
        errorNameCategory.classList.add("d-none");
    }

    // Kiểm tra giới hạn danh mục
    if (isNaN(limit) || limit <= 0) {
        errorValueCategory.classList.remove("d-none");
        valid = false;
    } else {
        errorValueCategory.classList.add("d-none");
    }

    if(limit>remainingMoney){
        errorValueCategory.classList.remove("d-none");
        errorValueCategory.innerText = "không được lớn hơn ngân sách còn lại!";
        valid = false;
    }
    

    if (!valid) {
        return;
    }

    categories.push({ name, limit, spent: 0 });
    renderCategories();
    saveData();

    document.getElementById("input_name").value = "";
    document.getElementById("input_value_category").value = "";
}

// hiển thị danh mục category
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

    // Kiểm tra danh mục
    if (!categoryValue) {
        errorCategoryTransaction.classList.remove("d-none");
        valid = false;
    } else {
        errorCategoryTransaction.classList.add("d-none");
    }

    if (!valid) {
        return;
    }

    // Kiểm tra giới hạn danh mục
    const categoryIndex = parseInt(categoryValue);
    const category = categories[categoryIndex];
    if (category.spent + amountInput > category.limit) {
        // Hiển thị modal xác nhận nếu vượt giới hạn
        showOverLimitModal(categoryIndex, amountInput, note);
        return;
    }

    // Thêm giao dịch nếu không vượt giới hạn
    addTransactionToCategory(categoryIndex, amountInput, note);
}


function addTransactionToCategory(categoryIndex, amount, note="") {
    const category = categories[categoryIndex];
    remainingMoney -= amount;
    category.spent += amount;

    transactions.push({
        amount: amount,
        category: category.name,
        note: note || "Không có ghi chú",
    });

    saveData(); 
    renderTransactions(); 
    renderCategories(); 

    // Cập nhật số tiền còn lại
    document.getElementById("remainingMoney").innerText = remainingMoney.toLocaleString();

    
    document.getElementById("input_money").value = "";
    document.getElementById("input_ChoseCategory").value = "";
    document.getElementById("note").value = "";
}


// đóng mở madal giới hạn danh mục khi giao dịch
const modal = document.getElementById("overLimitModal");

function closeOverLimitModal() {
   

    modal.classList.add("d-none");
    overlay.classList.add("d-none");
}

function showOverLimitModal(categoryIndex, amount) {

    modal.classList.remove("d-none");
    overlay.classList.remove("d-none");

    document.getElementById("btnContinueOverLimit").onclick = function () {
        addTransactionToCategory(categoryIndex, amount, note); 
        closeOverLimitModal(); 
    };

    document.getElementById("btnCancelOverLimit").onclick = function () {
        closeOverLimitModal(); 
    };
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

    checkNameEdit.classList.add("d-none");
    checkValueEdit.classList.add("d-none");

    let vailed = true;

    if (!newName) {
        checkNameEdit.classList.remove("d-none");
        vailed = false;
    } else {
        checkNameEdit.classList.add("d-none");
    }

    if (!newLimit) {
        checkValueEdit.classList.remove("d-none");
        vailed = false
    } else {
        checkValueEdit.classList.add("d-none");
    }

    if (!vailed) {
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


function showModelDelete(index, deleteType) {
    indexToDelete = index;
    type = deleteType; // Gán loại xóa (transaction hoặc category)
    overlayDelete.classList.remove("d-none");
    deleteModal.classList.remove("d-none");
}

function confirmDeleteTransaction() {
    if (indexToDelete !== -1) {
        if (type === "transaction") {
            // Xóa giao dịch
            const transaction = transactions[indexToDelete];
            const category = categories.find(cat => cat.name === transaction.category);

            remainingMoney += transaction.amount;
            if (category) {
                category.spent -= transaction.amount;
            }

            transactions.splice(indexToDelete, 1);

            renderTransactions();
            renderCategories();
            document.getElementById("remainingMoney").innerText = remainingMoney.toLocaleString();

        } else if (type === "category") {
            const categoryToDelete = categories[indexToDelete];
            const hasTransactions = transactions.some(tran => tran.category === categoryToDelete.name);

            if (hasTransactions) {
                closeModalDelete();
                showModalHasTranSaction();
                return;
            }

            categories.splice(indexToDelete, 1);
            renderCategories();
        }

        saveData();

        closeModalDelete();
    }
}

function showModalHasTranSaction(){
    const modal = document.getElementById("modalHasTransaction");
    modal.classList.remove("d-none");
    overlayDelete.classList.remove("d-none");
}

function closeModalHasTranSaction(){
    const modal = document.getElementById("modalHasTransaction");
    modal.classList.add("d-none");
    overlayDelete.classList.add("d-none");
}

function closeModalDelete() {
    deleteModal.classList.add("d-none");
    overlayDelete.classList.add("d-none");
    indexToDelete = -1;
    type = "";
}
//--------------------------------------------------------------------------------------------------------------//






function formatCurrencyInputDirectly(inputId) {
    const inputElement = document.getElementById(inputId);
    let value = inputElement.value.replace(/[^0-9]/g, "");
    value = new Intl.NumberFormat("vi-VN").format(value);
    inputElement.value = value;
}



















// ------------------------------ Phân trang cho phần lịch sử giao dịch --------------------------------------//

let searchQuery = ""; 
let sortOrder = ""; 



function renderTransactions() {
    const table = document.getElementById("table_Transaction");
    table.innerHTML = "";

    // Lọc giao dịch theo từ khóa tìm kiếm
    let filteredTransactions = transactions.filter(tran =>
        tran.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tran.note.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sắp xếp giao dịch theo thứ tự
    if (sortOrder === "asc") {
        filteredTransactions.sort((a, b) => a.amount - b.amount); // Tăng dần
    } else if (sortOrder === "desc") {
        filteredTransactions.sort((a, b) => b.amount - a.amount); // Giảm dần
    }

    // Kiểm tra nếu không có giao dịch
    if (filteredTransactions.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="text-center">Không tìm thấy giao dịch nào</td></tr>`;
        renderPagination(filteredTransactions); // Cập nhật nút phân trang
        return;
    }

    // Tính toán số trang
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages; // Nếu xóa giao dịch làm giảm số trang

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Hiển thị các giao dịch trong trang hiện tại
    paginatedTransactions.forEach((tran, index) => {
        table.innerHTML += `
            <tr>
                <td>${tran.category}</td>
                <td>${tran.amount.toLocaleString()} VND</td>
                <td>${tran.note}</td>
                               <td>
                    <button onclick="showModelDelete(${index}, 'transaction')" class="btn btn-danger">Xóa</button>
                </td>
            </tr>
        `;
    });

    // Cập nhật phân trang
    renderPagination(filteredTransactions);
}




function renderPagination(filteredTransactions) {
    const paginationDiv = document.querySelector(".pagination ul");
    paginationDiv.innerHTML = "";

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (totalPages <= 1) return; // Không cần phân trang nếu chỉ có 1 trang

    // Nút "Previous"
    paginationDiv.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
        </li>
    `;

    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        paginationDiv.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }

    // Nút "Next"
    paginationDiv.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
        </li>
    `;
}


// hàm sắp xếp giao dịch lấy dữ liệu
function sortTransactions(order) {
    if (order === "asc") {
        transactions.sort((a, b) => a.amount - b.amount);
    } else if (order === "desc") {
        transactions.sort((a, b) => b.amount - a.amount);
    }

    renderTransactions();
}


// Hàm tìm kiếm giao dịch
function searchTransactions() {
    searchQuery = document.getElementById("searchInput").value.trim();
    currentPage = 1; 
    renderTransactions();
}


function changePage(page) {
    currentPage = page;
    renderTransactions();
}

//-----------------------------------------------------------------------------------------------------------------//


