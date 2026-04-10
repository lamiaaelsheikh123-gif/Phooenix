// main.js - Global script for Phoenix
(function() {
  'use strict';

  // ========== ربط أيقونة الرسائل (Message) ==========
  function bindMessageIcon() {
    const messageIcon = document.getElementById('messageIcon');
    if (messageIcon) {
      // إذا كانت الأيقونة داخل رابط <a> نعدل href، وإلا نضيف مستمع حدث
      const parentAnchor = messageIcon.closest('a');
      if (parentAnchor) {
        parentAnchor.href = 'chat.html';
      } else {
        messageIcon.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = 'chat.html';
        });
      }
    }
  }

  // ========== ربط أيقونة الإشعارات (Notification) ==========
  function bindNotificationIcon() {
    const notifIcon = document.getElementById('notificationBell');
    if (!notifIcon) return;
    
    // إنشاء قائمة منسدلة للإشعارات إذا لم تكن موجودة
    let dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'notification-dropdown';
      dropdown.innerHTML = `
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button class="mark-read-btn" id="markAllRead">Mark all as read</button>
        </div>
        <div class="notifications-list" id="notificationsList"></div>
        <div class="dropdown-footer">
          <a href="notifications.html">View all</a>
        </div>
      `;
      document.body.appendChild(dropdown);
    }

    // دالة عرض الإشعارات من localStorage
    function renderNotifications() {
      const list = document.getElementById('notificationsList');
      const badge = document.getElementById('notificationBadge');
      let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
      
      // تحديث العداد
      const unreadCount = notifications.filter(n => n.unread).length;
      if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }

      if (notifications.length === 0) {
        list.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-secondary);">No notifications</div>`;
        return;
      }

      list.innerHTML = notifications.slice(0, 5).map(n => `
        <div class="notification-item" data-id="${n.id}" data-user="${n.requester || ''}">
          <div class="notification-icon"><i class="fas fa-${n.type === 'donation_request' ? 'hand-holding-heart' : 'bell'}"></i></div>
          <div class="notification-content">
            <div class="notification-title">${n.title}</div>
            <div class="notification-desc">${n.description}</div>
            <div class="notification-time">${n.time || 'Just now'}</div>
          </div>
          ${n.unread ? '<span class="unread-dot"></span>' : ''}
        </div>
      `).join('');

      // ربط كل إشعار بالشات مع user parameter
      list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const userId = item.dataset.user;
          const notifId = item.dataset.id;
          
          // تعليم الإشعار كمقروء
          notifications = notifications.map(n => {
            if (n.id == notifId) n.unread = false;
            return n;
          });
          localStorage.setItem('notifications', JSON.stringify(notifications));
          renderNotifications();
          
          // توجيه إلى الشات مع اسم المستخدم
          if (userId) {
            window.location.href = `chat.html?user=${encodeURIComponent(userId)}`;
          } else {
            window.location.href = 'chat.html';
          }
          dropdown.classList.remove('show');
        });
      });
    }

    // فتح/إغلاق القائمة
    notifIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = notifIcon.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + window.scrollY + 5) + 'px';
      dropdown.style.right = (window.innerWidth - rect.right - window.scrollX) + 'px';
      dropdown.classList.toggle('show');
      renderNotifications();
    });

    // إغلاق عند النقر خارجاً
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== notifIcon && !notifIcon.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    // زر "Mark all as read"
    const markBtn = dropdown.querySelector('#markAllRead');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        notifications = notifications.map(n => ({ ...n, unread: false }));
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
      });
    }

    renderNotifications();
  }

  // ========== ربط أيقونة المفضلة (إن وجدت) ==========
  function bindFavouriteIcon() {
    const favIcon = document.querySelector('[data-action="favourite"]');
    if (favIcon) {
      favIcon.addEventListener('click', () => {
        window.location.href = 'favourites.html';
      });
    }
  }

  // ========== Dark Mode (اختياري، يمكن نقله لـ main.js) ==========
  function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    
    function applyTheme() {
      const isDark = document.body.classList.contains('dark');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      applyTheme();
    });
    
    applyTheme();
  }

  // ========== التنفيذ عند تحميل الصفحة ==========
  function init() {
    bindMessageIcon();
    bindNotificationIcon();
    bindFavouriteIcon();
    initDarkMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();