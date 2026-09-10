/**
 * LiffLayout — ฉีด Header + Bottom Nav สำหรับหน้า Patient LINE LIFF (มือถือ)
 * ใช้งาน: วางตำแหน่ง <div id="liff-header"></div> ... <div id="liff-bottomnav"></div>
 * เรียก LiffLayout.init({ variant: 'home'|'plain', active, title, backHref })
 * - variant 'home': แสดง header ทักทายแบบ gradient (ใช้เฉพาะหน้า home.html)
 * - variant 'plain': แสดง header ปุ่มย้อนกลับ + หัวข้อ (ใช้ทุกหน้าอื่น)
 * - active: 'home'|'appointment'|'medication'|'chat'|'profile' -> แสดง Bottom Nav ไฮไลท์ตามค่านี้
 *           ถ้าไม่ส่ง active (undefined) จะไม่แสดง Bottom Nav (ใช้กับหน้าย่อยที่ไม่ใช่แท็บหลัก)
 */
(function () {
  const TABS = [
    { key: "home", label: "หน้าแรก", icon: "home", href: "home.html" },
    { key: "appointment", label: "นัดหมาย", icon: "calendar-days", href: "appointment.html" },
    { key: "medication", label: "ยาของฉัน", icon: "pill", href: "medication.html" },
    { key: "health", label: "สุขภาพ", icon: "activity", href: "lab-result.html" },
    { key: "profile", label: "โปรไฟล์", icon: "user", href: "profile.html" },
  ];

  function renderHeader({ variant, title, backHref }) {
    if (variant === "home") {
      const p = window.MOCK_DATA.primaryPatient;
      return `
      <header class="gradient-mesh sticky top-0 z-20 px-5 pt-6 pb-8 text-white" style="background: var(--gradient-primary);">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-100">สวัสดี 👋</p>
            <p class="font-bold text-lg leading-tight">${p.name}</p>
            <p class="text-[11px] text-blue-100 mt-0.5">HN: ${p.hn} · ${p.hospital}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center liff-tap"><i data-lucide="bell" class="w-4.5 h-4.5"></i><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 pulse-dot"></span></button>
            <a href="profile.html" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold liff-tap">${p.name.slice(0, 2)}</a>
          </div>
        </div>
      </header>`;
    }
    return `
      <header class="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 h-14 flex items-center gap-1 px-2 shrink-0">
        <a href="${backHref || "home.html"}" class="p-2.5 rounded-full hover:bg-slate-100 active:bg-slate-200 liff-tap"><i data-lucide="chevron-left" class="w-5 h-5 text-slate-700"></i></a>
        <h1 class="text-[15px] font-bold text-slate-800">${title || ""}</h1>
      </header>`;
  }

  function renderBottomNav(active) {
    if (!active) return "";
    return `
      <nav class="liff-bottom-nav grid grid-cols-5 shrink-0">
        ${TABS.map(
          (t) => `
          <a href="${t.href}" class="relative flex flex-col items-center justify-center gap-0.5 py-2.5 liff-tap ${t.key === active ? "text-primary" : "text-slate-400"}">
            ${t.key === active ? '<span class="absolute top-0 w-8 h-0.5 rounded-full" style="background: var(--gradient-primary);"></span>' : ""}
            <i data-lucide="${t.icon}" class="w-5 h-5"></i>
            <span class="text-[10px] font-medium">${t.label}</span>
          </a>`
        ).join("")}
      </nav>`;
  }

  // ปุ่มโทรฉุกเฉิน — แสดงลอยอยู่ทุกหน้าของ LIFF (มุมขวาล่าง เหนือ Bottom Nav)
  function ensureEmergencyButton() {
    if (document.getElementById("liff-emergency-fab")) return;
    const shell = document.querySelector(".liff-shell");
    if (!shell) return;
    const btn = document.createElement("a");
    btn.id = "liff-emergency-fab";
    btn.href = "tel:1669";
    btn.title = "โทรฉุกเฉิน (สายด่วนการแพทย์ฉุกเฉิน 1669)";
    btn.className = "liff-emergency-fab liff-tap";
    btn.innerHTML = '<i data-lucide="phone-call" class="w-5 h-5"></i>';
    shell.appendChild(btn);
  }

  window.LiffLayout = {
    init({ variant = "plain", active, title = "", backHref } = {}) {
      const header = document.getElementById("liff-header");
      const nav = document.getElementById("liff-bottomnav");
      if (header) header.outerHTML = renderHeader({ variant, title, backHref });
      if (nav) nav.outerHTML = renderBottomNav(active);
      ensureEmergencyButton();
      if (window.lucide) window.lucide.createIcons();
    },
  };
})();
