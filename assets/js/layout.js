/**
 * StaffLayout — ฉีด Topbar + Sidebar สำหรับหน้า Web ของแพทย์/พยาบาล
 * ใช้งาน: วางตำแหน่ง <div id="app-sidebar"></div><div id="app-topbar"></div>
 * แล้วเรียก StaffLayout.init({ role: 'doctor'|'nurse', active: 'dashboard', title: 'ชื่อหน้า' })
 * ทุก href เป็น relative จากโฟลเดอร์ 1 ชั้น (auth/doctor/nurse/liff) กลับไปที่ root ด้วย "../"
 */
(function () {
  const NAV = {
    doctor: [
      { key: "dashboard", label: "แดชบอร์ด", icon: "layout-dashboard", href: "../doctor/dashboard.html" },
      { key: "patients", label: "จัดการผู้ป่วย", icon: "users", href: "../doctor/patient-management.html" },
      { key: "timeline", label: "Timeline การรักษา", icon: "history", href: "../doctor/treatment-timeline.html" },
      { key: "lab", label: "ผลตรวจ Lab", icon: "flask-conical", href: "../doctor/laboratory.html" },
      {
        key: "medication", label: "ยากดภูมิคุ้มกัน", icon: "pill", href: "../doctor/medication-management.html",
        children: [
          { key: "medication", label: "จัดการยา", href: "../doctor/medication-management.html" },
          { key: "compliance", label: "ความร่วมมือการใช้ยา", href: "../doctor/medication-compliance.html" },
        ],
      },
      { key: "appointment", label: "นัดหมาย", icon: "calendar-days", href: "../doctor/appointment-management.html" },
      { key: "alert", label: "แจ้งเตือน", icon: "bell-ring", href: "../doctor/notifications.html" },
      { key: "waitinglist", label: "รายชื่อรอปลูกถ่าย", icon: "list-ordered", href: "../doctor/waiting-list.html" },
      {
        key: "donor", label: "จัดการผู้บริจาค", icon: "heart-handshake", href: "../doctor/donor-dashboard.html",
        children: [
          { key: "donor-dashboard", label: "แดชบอร์ดผู้บริจาค", href: "../doctor/donor-dashboard.html" },
          { key: "donor-registration", label: "ลงทะเบียนผู้บริจาค", href: "../doctor/donor-registration.html" },
          { key: "donor-evaluation", label: "ประเมินสุขภาพผู้บริจาค", href: "../doctor/donor-evaluation.html" },
          { key: "donor-laboratory", label: "ผลตรวจ Lab ผู้บริจาค", href: "../doctor/donor-laboratory.html" },
          { key: "donor-assessment", label: "สรุปผลความเหมาะสม", href: "../doctor/donor-assessment.html" },
          { key: "donor-followup", label: "ติดตามหลังบริจาค", href: "../doctor/donor-followup.html" },
          { key: "donor-reports", label: "รายงานผู้บริจาค", href: "../doctor/donor-reports.html" },
        ],
      },
      {
        key: "matching", label: "จับคู่ผู้บริจาค", icon: "git-compare-arrows", href: "../doctor/kidney-matching.html",
        children: [
          { key: "matching", label: "Kidney Matching", href: "../doctor/kidney-matching.html" },
          { key: "suitability", label: "ประเมินความเหมาะสม", href: "../doctor/kidney-suitability.html" },
        ],
      },
      { key: "reports", label: "รายงาน", icon: "bar-chart-3", href: "../doctor/reports.html" },
      { key: "audit", label: "Audit Log", icon: "shield-check", href: "../doctor/audit-log.html" },
    ],
    nurse: [
      { key: "dashboard", label: "แดชบอร์ด", icon: "layout-dashboard", href: "../nurse/dashboard.html" },
      { key: "patients", label: "ผู้ป่วยในความดูแล", icon: "users", href: "../nurse/patient-management.html" },
      { key: "appointment", label: "นัดหมาย", icon: "calendar-days", href: "../nurse/appointment-management.html" },
      { key: "questionnaire", label: "ติดตามแบบสอบถาม", icon: "clipboard-list", href: "../nurse/questionnaire-monitoring.html" },
      { key: "followup", label: "บันทึกการติดตาม", icon: "phone-call", href: "../nurse/nurse-followup.html" },
      { key: "chat", label: "แชทกับผู้ป่วย", icon: "message-circle", href: "../nurse/chat-system.html" },
    ],
  };

  function iconsHtml(name, cls) {
    return `<i data-lucide="${name}" class="${cls || ""}"></i>`;
  }

  function renderSidebar(role, active) {
    const items = NAV[role] || [];
    const roleLabel = role === "nurse" ? "Nurse Coordinator" : "Clinical Dashboard";
    const brand = `
      <div class="sidebar-brand flex items-center gap-2.5 px-5 h-16 shrink-0">
        <div class="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center text-white font-bold text-sm">KT</div>
        <div class="leading-tight sidebar-brand-text">
          <p class="text-sm font-bold text-white">Kidney Transplant</p>
          <p class="text-[11px] text-white/60">Follow-up System</p>
        </div>
      </div>`;

    const navHtml = items
      .map((item) => {
        const isActiveParent = item.children ? item.children.some((c) => c.key === active) : item.key === active;
        if (item.children) {
          return `
          <div class="mb-0.5">
            <button type="button" class="nav-item w-full justify-between ${isActiveParent ? "active" : ""}" data-submenu-toggle>
              <span class="flex items-center gap-3">${iconsHtml(item.icon, "nav-icon")}<span class="sidebar-label">${item.label}</span></span>
              ${iconsHtml("chevron-down", "sidebar-chevron w-4 h-4 transition-transform " + (isActiveParent ? "rotate-180" : ""))}
            </button>
            <div class="nav-submenu pl-9 ${isActiveParent ? "" : "hidden"} space-y-0.5 mt-0.5" data-submenu>
              ${item.children
                .map(
                  (c) => `<a href="${c.href}" class="block text-sm py-1.5 px-2 rounded-md ${c.key === active ? "active" : ""}">${c.label}</a>`
                )
                .join("")}
            </div>
          </div>`;
        }
        return `<a href="${item.href}" class="nav-item ${item.key === active ? "active" : ""}">${iconsHtml(item.icon, "nav-icon")}<span class="sidebar-label">${item.label}</span></a>`;
      })
      .join("");

    const themeClass = role === "nurse" ? "theme-nurse" : "theme-doctor";

    return `
      <aside class="app-sidebar-shell ${themeClass} hidden md:flex md:flex-col shrink-0 h-screen sticky top-0">
        ${brand}
        <div class="px-5 pb-3 sidebar-brand-text">
          <span class="sidebar-tag inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full">${roleLabel}</span>
        </div>
        <nav class="flex-1 overflow-y-auto px-3 py-2 space-y-1">${navHtml}</nav>
        <div class="p-3 sidebar-footnote">
          <div class="rounded-xl bg-white/10 p-3 text-xs text-white/80 flex items-start gap-2">
            ${iconsHtml("info", "w-4 h-4 shrink-0 mt-0.5")}
            <span>ระบบเวอร์ชันสาธิต (Mockup) เพื่อการนำเสนอ ข้อมูลทั้งหมดเป็นข้อมูลจำลอง</span>
          </div>
        </div>
      </aside>
      <!-- Mobile drawer (< md) -->
      <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-slate-900/50 z-40 hidden md:hidden"></div>
      <aside id="mobile-sidebar" class="app-sidebar-shell ${themeClass} fixed inset-y-0 left-0 z-50 transform -translate-x-full transition-transform duration-200 md:hidden flex flex-col">
        ${brand}
        <div class="px-5 pb-3">
          <span class="sidebar-tag inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full">${roleLabel}</span>
        </div>
        <nav class="flex-1 overflow-y-auto px-3 py-2 space-y-1">${navHtml}</nav>
      </aside>`;
  }

  function renderTopbar(role, title) {
    const person = window.MOCK_DATA.staff[role];
    const notifications = window.MOCK_DATA.notifications;
    const notifDot = notifications.length ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 pulse-dot"></span>` : "";
    const typeColor = { danger: "bg-red-100 text-red-600", warning: "bg-amber-100 text-amber-600", info: "bg-blue-100 text-blue-600" };
    const avatarBg = role === "nurse" ? "#7c3aed" : "#0f766e";

    return `
      <header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 h-16 flex items-center gap-3 px-4 lg:px-6">
        <button id="btn-open-sidebar" class="md:hidden p-2 rounded-lg hover:bg-slate-100">${iconsHtml("menu", "w-5 h-5")}</button>
        <div class="hidden md:block">
          <h1 class="text-base font-bold text-slate-800">${title || ""}</h1>
        </div>
        <div class="flex-1 flex justify-center md:justify-end">
          <div class="topbar-search-wrap relative w-full max-w-sm">
            ${iconsHtml("search", "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400")}
            <input type="text" placeholder="ค้นหาผู้ป่วย ชื่อ หรือ HN..." class="topbar-search w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition" />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btn-mobile-search" class="md:hidden p-2 rounded-lg hover:bg-slate-100">${iconsHtml("search", "w-5 h-5 text-slate-600")}</button>
          <div class="relative">
            <button id="btn-notif" class="relative p-2 rounded-lg hover:bg-slate-100">${iconsHtml("bell", "w-5 h-5 text-slate-600" + (notifications.length ? " notif-ring" : ""))}${notifDot}</button>
            <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div class="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-700 flex items-center justify-between">
                การแจ้งเตือน <span class="badge badge-red">${notifications.length} ใหม่</span>
              </div>
              <div class="max-h-80 overflow-y-auto">
                ${notifications
                  .map(
                    (n) => `
                  <div class="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeColor[n.type]}">${iconsHtml("bell", "w-4 h-4")}</div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-slate-800 truncate">${n.title}</p>
                      <p class="text-xs text-slate-500 line-clamp-2">${n.desc}</p>
                      <p class="text-[11px] text-slate-400 mt-0.5">${n.time}</p>
                    </div>
                  </div>`
                  )
                  .join("")}
              </div>
              <a href="../doctor/notifications.html" class="block text-center text-xs font-semibold text-primary py-2.5 hover:bg-blue-50">ดูการแจ้งเตือนทั้งหมด</a>
            </div>
          </div>
          <div class="relative">
            <button id="btn-profile" class="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg hover:bg-slate-100">
              <div class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold" style="background:${avatarBg}">${person.avatar}</div>
              <div class="hidden md:block text-left leading-tight">
                <p class="text-xs font-semibold text-slate-800">${person.name}</p>
                <p class="text-[11px] text-slate-500">${person.roleLabel}</p>
              </div>
              ${iconsHtml("chevron-down", "w-4 h-4 text-slate-400 hidden md:block")}
            </button>
            <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden text-sm">
              <div class="px-4 py-3 border-b border-slate-100">
                <p class="font-semibold text-slate-800">${person.name}</p>
                <p class="text-xs text-slate-500">${person.department}</p>
              </div>
              <a href="../auth/change-password.html" class="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700">${iconsHtml("key-round", "w-4 h-4")} เปลี่ยนรหัสผ่าน</a>
              <a href="../auth/login.html" class="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-red-600">${iconsHtml("log-out", "w-4 h-4")} ออกจากระบบ</a>
            </div>
          </div>
        </div>
      </header>`;
  }

  function wireEvents() {
    const openBtn = document.getElementById("btn-open-sidebar");
    const drawer = document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("mobile-sidebar-overlay");
    if (openBtn && drawer && overlay) {
      openBtn.addEventListener("click", () => {
        drawer.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
      });
      overlay.addEventListener("click", () => {
        drawer.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
      });
    }

    const mobileSearchBtn = document.getElementById("btn-mobile-search");
    const searchWrap = document.querySelector(".topbar-search-wrap");
    if (mobileSearchBtn && searchWrap) {
      mobileSearchBtn.addEventListener("click", () => {
        const nowOpen = searchWrap.classList.toggle("search-open");
        if (nowOpen) searchWrap.querySelector("input")?.focus();
      });
    }

    document.querySelectorAll("[data-submenu-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const submenu = btn.nextElementSibling;
        const chevron = btn.querySelector("[data-lucide='chevron-down']");
        submenu.classList.toggle("hidden");
        if (chevron) chevron.classList.toggle("rotate-180");
      });
    });

    function toggleDropdown(btnId, ddId) {
      const btn = document.getElementById(btnId);
      const dd = document.getElementById(ddId);
      if (!btn || !dd) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !dd.classList.contains("hidden");
        document.querySelectorAll(".fixed-dropdown-close-target").forEach((d) => d.classList.add("hidden"));
        dd.classList.toggle("hidden", isOpen);
      });
    }
    toggleDropdown("btn-notif", "notif-dropdown");
    toggleDropdown("btn-profile", "profile-dropdown");
    document.addEventListener("click", () => {
      document.getElementById("notif-dropdown")?.classList.add("hidden");
      document.getElementById("profile-dropdown")?.classList.add("hidden");
    });
    document.getElementById("notif-dropdown")?.addEventListener("click", (e) => e.stopPropagation());
    document.getElementById("profile-dropdown")?.addEventListener("click", (e) => e.stopPropagation());
  }

  window.StaffLayout = {
    init({ role = "doctor", active = "dashboard", title = "" }) {
      document.body.classList.add(role === "nurse" ? "theme-nurse" : "theme-doctor");
      const sidebarMount = document.getElementById("app-sidebar");
      const topbarMount = document.getElementById("app-topbar");
      if (sidebarMount) sidebarMount.outerHTML = renderSidebar(role, active);
      if (topbarMount) topbarMount.outerHTML = renderTopbar(role, title);
      wireEvents();
      if (window.lucide) window.lucide.createIcons();
    },
  };
})();
