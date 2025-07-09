// تكوين Firebase - نفس إعدادات العميل
const firebaseConfig = {
  apiKey: "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ12345678",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuv"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// كلمة سر الإدارة
const ADMIN_PASSWORD = "4321";

// تسجيل دخول المدير
function loginAdmin() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadOrders();
    loadWaiterCalls();
    loadMenuItems();
  } else {
    alert("كلمة السر غير صحيحة");
  }
}

// تحميل الطلبات مع التحديث الفوري
function loadOrders() {
  db.ref("orders").orderByChild("timestamp").limitToLast(20).on("value", snapshot => {
    const ordersDiv = document.getElementById('orders');
    ordersDiv.innerHTML = '';
    const orders = snapshot.val() || {};
    
    for (let key in orders) {
      const order = orders[key];
      let html = `
        <div class="item">
          <strong>الطاولة: ${order.table}</strong>
          <p>الحالة: <span class="status-${order.status || 'pending'}">${getStatusName(order.status)}</span></p>
          <p>الوقت: ${new Date(order.timestamp).toLocaleString()}</p>
          <ul>`;
      
      order.items.forEach(i => {
        html += `
          <li>
            ${i.name} - الكمية: ${i.qty} 
            - السعر: ${i.price} جنيه
            ${i.note ? '<br>ملاحظات: ' + i.note : ''}
          </li>`;
      });
      
      html += `
          </ul>
          <p>المجموع: ${calculateOrderTotal(order)} جنيه</p>
          <button onclick="updateOrderStatus('${key}', 'preparing')" style="background-color: #FFA000;">تحضير</button>
          <button onclick="updateOrderStatus('${key}', 'ready')" style="background-color: #388E3C;">جاهز</button>
          <button onclick="updateOrderStatus('${key}', 'delivered')" style="background-color: #1976D2;">تم التوصيل</button>
        </div>`;
      
      ordersDiv.innerHTML += html;
    }
  });
}

// دالة مساعدة لعرض حالة الطلب
function getStatusName(status) {
  const statusNames = {
    "pending": "في الانتظار",
    "preparing": "قيد التحضير",
    "ready": "جاهز للتوصيل",
    "delivered": "تم التوصيل"
  };
  return statusNames[status] || status;
}

// حساب مجموع الطلب
function calculateOrderTotal(order) {
  return order.items.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
}

// تحديث حالة الطلب
function updateOrderStatus(orderId, status) {
  db.ref(`orders/${orderId}/status`).set(status)
    .catch(error => {
      alert("حدث خطأ أثناء تحديث حالة الطلب: " + error.message);
    });
}

// تحميل طلبات استدعاء النادل مع التحديث الفوري
function loadWaiterCalls() {
  db.ref("waiterCalls").orderByChild("timestamp").limitToLast(10).on("value", snapshot => {
    const callsDiv = document.getElementById('waiter-calls');
    callsDiv.innerHTML = '';
    const calls = snapshot.val() || {};
    
    for (let key in calls) {
      const call = calls[key];
      callsDiv.innerHTML += `
        <div class="item">
          <strong>طاولة: ${call.table}</strong>
          <p>الوقت: ${call.time}</p>
          <p>الحالة: ${call.status === 'attended' ? 'تمت الخدمة' : 'في الانتظار'}</p>
          ${call.status !== 'attended' ? 
            `<button onclick="updateCallStatus('${key}', 'attended')" style="background-color: #388E3C;">تمت الخدمة</button>` : ''}
        </div>`;
    }
  });
}

// تحديث حالة استدعاء النادل
function updateCallStatus(callId, status) {
  db.ref(`waiterCalls/${callId}/status`).set(status)
    .catch(error => {
      alert("حدث خطأ أثناء تحديث حالة الاستدعاء: " + error.message);
    });
}

// إضافة صنف جديد
function addMenuItem() {
  const name = document.getElementById('new-item').value;
  const price = document.getElementById('new-price').value;
  const category = document.getElementById('item-category').value;
  
  if (name && price && category) {
    db.ref("menu").push({ name, price, category })
      .then(() => {
        document.getElementById('new-item').value = '';
        document.getElementById('new-price').value = '';
        alert("تمت إضافة الصنف بنجاح");
      })
      .catch(error => {
        alert("حدث خطأ أثناء إضافة الصنف: " + error.message);
      });
  } else {
    alert("الرجاء إدخال جميع البيانات المطلوبة");
  }
}

// تحميل أصناف المنيو مع التحديث الفوري
function loadMenuItems() {
  db.ref("menu").on("value", snapshot => {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    const items = snapshot.val() || {};
    
    for (let key in items) {
      const item = items[key];
      menuDiv.innerHTML += `
        <div class="item">
          <strong>${item.name}</strong><br>
          السعر: ${item.price} جنيه<br>
          التصنيف: ${getCategoryName(item.category)}<br>
          <button onclick="deleteMenuItem('${key}')" class="delete-btn">حذف الصنف</button>
        </div>
      `;
    }
  });
}

// دالة مساعدة للحصول على اسم التصنيف
function getCategoryName(category) {
  const categories = {
    "hot-drinks": "مشروبات ساخنة",
    "cold-drinks": "مشروبات باردة",
    "food": "أطعمة",
    "desserts": "حلويات"
  };
  return categories[category] || category;
}

// حذف صنف من المنيو
function deleteMenuItem(itemId) {
  if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
    db.ref(`menu/${itemId}`).remove()
      .then(() => {
        alert("تم حذف الصنف بنجاح");
      })
      .catch(error => {
        alert("حدث خطأ أثناء حذف الصنف: " + error.message);
      });
  }
}
