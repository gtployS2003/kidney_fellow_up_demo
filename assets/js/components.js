/**
 * UI — Helper กลาง: Modal / Tabs / Toast / Dropdown ใช้ร่วมกันทุกหน้า
 */
window.UI = (function () {
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  // ปิด modal เมื่อคลิก overlay หรือปุ่มที่มี data-close-modal
  function bindModalDismiss() {
    document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.add("hidden"), document.body.classList.remove("overflow-hidden");
      });
    });
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close-modal")));
    });
    document.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-modal")));
    });
  }

  // Tabs: กลุ่มปุ่มมี data-tab-btn="key" คู่กับ panel data-tab-panel="key" ภายใน container เดียวกัน [data-tabs]
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const buttons = group.querySelectorAll("[data-tab-btn]");
      const panelWrap = document.querySelector(group.getAttribute("data-tabs-target") || "body");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-tab-btn");
          buttons.forEach((b) => b.classList.remove("tab-active"));
          btn.classList.add("tab-active");
          panelWrap.querySelectorAll("[data-tab-panel]").forEach((p) => {
            p.classList.toggle("hidden", p.getAttribute("data-tab-panel") !== key);
          });
        });
      });
    });
  }

  let toastTimer = null;
  function toast(message, type) {
    type = type || "success";
    const colors = {
      success: { bg: "bg-white", border: "border-green-200", icon: "check-circle-2", iconColor: "text-green-600" },
      error: { bg: "bg-white", border: "border-red-200", icon: "x-circle", iconColor: "text-red-600" },
      info: { bg: "bg-white", border: "border-blue-200", icon: "info", iconColor: "text-blue-600" },
    };
    const c = colors[type] || colors.success;
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "fixed top-5 right-5 z-[100] space-y-2";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `toast-in flex items-center gap-2.5 ${c.bg} ${c.border} border shadow-lg rounded-xl px-4 py-3 text-sm font-medium text-slate-700`;
    el.innerHTML = `<i data-lucide="${c.icon}" class="w-5 h-5 ${c.iconColor}"></i><span>${message}</span>`;
    host.appendChild(el);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      el.style.transition = "opacity .2s ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, 3000);
  }

  // เติม data-label ให้ทุก td ของ .table-modern อัตโนมัติ (จาก text ของ thead th)
  // แล้วเปิดใช้ .table-responsive-cards เพื่อให้ตารางกลายเป็น Card List บนมือถือ
  // ทำงานผ่าน MutationObserver เพื่อรองรับตารางที่ render ทีหลังด้วย JS โดยไม่ต้องแก้ทีละหน้า
  function enhanceResponsiveTables() {
    document.querySelectorAll(".table-modern").forEach((table) => {
      table.classList.add("table-responsive-cards");
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
      if (!headers.length) return;
      table.querySelectorAll("tbody tr").forEach((tr) => {
        Array.from(tr.children).forEach((td, i) => {
          if (headers[i] && !td.hasAttribute("data-label")) td.setAttribute("data-label", headers[i]);
        });
      });
    });
  }

  function watchResponsiveTables() {
    enhanceResponsiveTables();
    const observer = new MutationObserver(() => enhanceResponsiveTables());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    bindModalDismiss();
    initTabs();
    watchResponsiveTables();
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { openModal, closeModal, toast, initTabs, enhanceResponsiveTables };
})();

/**
 * Components — Reusable UI markup builders (คืนค่าเป็น HTML string) สำหรับ Stat / Patient / Alert / Timeline / Medical Data
 * ใช้งาน: document.getElementById(id).innerHTML = Components.statCard({...}) แล้วเรียก lucide.createIcons()
 */
window.Components = (function () {
  function icon(name, cls) {
    return `<i data-lucide="${name}" class="${cls || ""}"></i>`;
  }

  // 1. Stat Card — icon, title, value, trend (gradient ตัวเลือกได้)
  function statCard({ icon: iconName, title, value, trend, trendDirection = "up", gradient, iconBg = "bg-blue-50 text-primary" }) {
    const isGradient = !!gradient;
    const trendHtml = trend
      ? `<span class="stat-card-trend ${trendDirection}">${icon(trendDirection === "up" ? "trending-up" : "trending-down", "w-3 h-3")}${trend}</span>`
      : "";
    return `
      <div class="card card-hover stat-card ${isGradient ? `card-gradient ${gradient}` : ""}">
        <div class="stat-card-top">
          <div class="stat-card-icon ${isGradient ? "bg-white/20 text-white" : iconBg}">${icon(iconName, "w-5 h-5")}</div>
          ${trendHtml}
        </div>
        <div>
          <p class="stat-card-value">${value}</p>
          <p class="text-xs mt-0.5 ${isGradient ? "card-gradient-sub" : "text-slate-500"}">${title}</p>
        </div>
      </div>`;
  }

  // 2. Patient Card — HN, Name, Risk, Status
  function patientCard({ hn, name, risk = "low", status, href, avatarBg = "bg-blue-100 text-primary" }) {
    const riskBadge = { low: '<span class="badge badge-green">Low Risk</span>', medium: '<span class="badge badge-amber">Medium Risk</span>', high: '<span class="badge badge-red">High Risk</span>' }[risk] || "";
    const inner = `
        <div class="patient-card-avatar ${avatarBg}">${name.slice(0, 2)}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">${name}</p>
          <p class="text-xs text-slate-500">${hn}${status ? " · " + status : ""}</p>
        </div>
        ${riskBadge}
        ${href ? icon("chevron-right", "w-4 h-4 text-slate-300 shrink-0") : ""}`;
    return href
      ? `<a href="${href}" class="patient-card">${inner}</a>`
      : `<div class="patient-card">${inner}</div>`;
  }

  // 3. Alert Card — Critical / Warning / Normal (มี action ปุ่มเลือกได้ เช่น "View Patient")
  function alertCard({ level = "warning", title, desc, time, action }) {
    const map = {
      critical: { cls: "level-critical", icon: "alert-octagon", color: "text-red-600" },
      warning: { cls: "level-warning", icon: "alert-triangle", color: "text-amber-600" },
      normal: { cls: "level-normal", icon: "check-circle-2", color: "text-green-600" },
    };
    const m = map[level] || map.warning;
    return `
      <div class="alert-card ${m.cls} ${action ? "items-center justify-between gap-3" : ""}">
        <div class="flex items-start gap-2.5 min-w-0">
          ${icon(m.icon, `w-4 h-4 mt-0.5 shrink-0 ${m.color}`)}
          <div class="min-w-0">
            <p class="text-xs font-semibold text-slate-800">${title}</p>
            ${desc ? `<p class="text-[11px] text-slate-500 mt-0.5">${desc}</p>` : ""}
            ${time ? `<p class="text-[10px] text-slate-400 mt-0.5">${time}</p>` : ""}
          </div>
        </div>
        ${action ? `<a href="${action.href}" class="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-primary hover:bg-blue-50 transition whitespace-nowrap">${action.label}</a>` : ""}
      </div>`;
  }

  // 4. Timeline Component — ใช้กับ Treatment Timeline / Waiting Timeline
  // ส่ง `color` ต่อ step เพื่อกำหนดสีไอคอนเอง (เช่น จำแนกตามประเภทเหตุการณ์) ถ้าไม่ส่งจะใช้สีตาม state แทน
  function timeline(steps) {
    const iconColor = { done: "#16a34a", active: "#2563eb", pending: "#94a3b8" };
    return `
      <div class="timeline-line space-y-6">
        ${steps
          .map(
            (s) => `
          <div class="relative">
            <div class="timeline-node" style="background:${s.color || iconColor[s.state] || iconColor.pending}">${icon(s.icon || "circle", "w-4 h-4")}</div>
            <p class="text-sm font-semibold text-slate-800">${s.title}</p>
            ${s.date ? `<p class="text-xs text-slate-400">${s.date}</p>` : ""}
            ${s.desc ? `<p class="text-xs text-slate-500 mt-1">${s.desc}</p>` : ""}
          </div>`
          )
          .join("")}
      </div>`;
  }

  // 5. Medical Data Card — Lab / Medication
  // ส่ง `range` สำหรับใช้เป็นการ์ดค่า Lab ทั่วไป หรือส่ง `previous` เพื่อแสดง Trend Arrow เทียบค่าก่อนหน้า (ใช้ใน Patient Summary)
  function medicalDataCard({ name, value, unit, range, previous, status = "normal" }) {
    const statusBadge = { high: '<span class="badge badge-red">สูง</span>', low: '<span class="badge badge-blue">ต่ำ</span>', normal: '<span class="badge badge-green">ปกติ</span>', na: '<span class="badge badge-slate">N/A</span>' }[status] || "";
    let subLine = range ? `ค่าปกติ ${range}` : "";
    let trendHtml = "";
    if (previous !== undefined && previous !== null) {
      subLine = `ก่อนหน้า ${previous} ${unit || ""}`;
      if (typeof value === "number" && typeof previous === "number") {
        const diff = +(value - previous).toFixed(2);
        const arrowIcon = diff > 0 ? "arrow-up-right" : diff < 0 ? "arrow-down-right" : "minus";
        const arrowColor = diff === 0 ? "text-slate-400" : status === "high" || status === "low" ? "text-red-500" : "text-teal";
        trendHtml = `<span class="flex items-center gap-0.5 text-xs font-semibold ${arrowColor}">${icon(arrowIcon, "w-3.5 h-3.5")}${Math.abs(diff)}</span>`;
      }
    }
    return `
      <div class="medical-data-card status-${status}">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800">${name}</p>
            <p class="text-xs text-slate-400 mt-0.5">${subLine}</p>
          </div>
          <div class="text-right shrink-0">
            <div class="flex items-center justify-end gap-1.5">
              <p class="text-lg font-bold text-slate-800">${value} <span class="text-xs font-normal text-slate-400">${unit || ""}</span></p>
              ${trendHtml}
            </div>
            <div class="mt-1">${statusBadge}</div>
          </div>
        </div>
      </div>`;
  }

  // Task Card (Nurse workflow) — Priority Badge + Follow-up Status
  function taskCard({ priority = "medium", title, patient, hn, dueLabel, href }) {
    const inner = `
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-semibold text-slate-800">${title}</p>
            <span class="priority-badge priority-${priority}">${priority === "high" ? "ด่วน" : priority === "low" ? "ทั่วไป" : "ปานกลาง"}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${patient ? patient + " · " : ""}${hn || ""}</p>
        </div>
        ${dueLabel ? `<span class="text-xs font-medium text-slate-500 shrink-0">${dueLabel}</span>` : ""}`;
    return href
      ? `<a href="${href}" class="task-card priority-${priority}">${inner}</a>`
      : `<div class="task-card priority-${priority}">${inner}</div>`;
  }

  // Patient Priority Badge — Urgent / High / Normal
  function priorityBadge(priority = "normal") {
    const map = {
      urgent: { cls: "priority-high", label: "Urgent" },
      high: { cls: "priority-medium", label: "High" },
      normal: { cls: "priority-low", label: "Normal" },
    };
    const m = map[priority] || map.normal;
    return `<span class="priority-badge ${m.cls}">${m.label}</span>`;
  }

  // Status Pipeline Component — Kanban board แบบ column ตาม stage
  // columns: [{ key, label }] , items: array ของ object ที่มี field ตาม stageField
  // cardRenderer(item) -> HTML string ของการ์ดในแต่ละคอลัมน์ (ถ้าไม่ส่งจะใช้ default: name/hn/blood/duration/priority)
  function statusPipeline({ columns, items, stageField = "stage", cardRenderer }) {
    const renderCard =
      cardRenderer ||
      ((it) => `
      <div class="kanban-card">
        <div class="flex items-center justify-between gap-2 mb-1">
          <p class="text-sm font-semibold text-slate-800 truncate">${it.name}</p>
          ${priorityBadge(it.priority)}
        </div>
        <p class="text-xs text-slate-500">${it.hn} · ${it.blood}</p>
        <p class="text-[11px] text-slate-400 mt-1">${icon("clock", "w-3 h-3 inline -mt-0.5")} รอมาแล้ว ${it.duration}</p>
      </div>`);

    return `
      <div class="kanban-board">
        ${columns
          .map((col) => {
            const colItems = items.filter((it) => it[stageField] === col.key);
            return `
          <div class="kanban-column">
            <div class="kanban-column-header">
              <span>${col.label}</span>
              <span class="badge badge-slate">${colItems.length}</span>
            </div>
            <div class="kanban-column-body">
              ${colItems.map(renderCard).join("") || `<p class="text-xs text-slate-400 text-center py-6">ไม่มีรายการ</p>`}
            </div>
          </div>`;
          })
          .join("")}
      </div>`;
  }

  // Matching Score Component — Circular progress พร้อมข้อความสรุประดับความเข้ากันได้
  function matchingScore({ score, size = 96, stroke = 9 }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);
    const color = score >= 85 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
    const label = score >= 85 ? "Excellent Match" : score >= 60 ? "Acceptable Match" : "Poor Match";
    return `
      <div class="text-center">
        <div class="score-ring-wrap" style="width:${size}px;height:${size}px">
          <svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="${stroke}" />
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset .6s ease" />
          </svg>
          <div class="score-ring-value">
            <span class="text-xl font-bold text-slate-800">${score}%</span>
          </div>
        </div>
        <p class="text-xs font-semibold mt-2" style="color:${color}">${label}</p>
      </div>`;
  }

  // Clinical Assessment Card — การ์ดเลือกผลประเมิน (ใช้ใน Suitability Assessment)
  function clinicalAssessmentCard({ value, title, desc, iconName }) {
    const meta = {
      suitable: { iconBg: "bg-green-100 text-green-600", icon: iconName || "check-circle-2" },
      risk: { iconBg: "bg-amber-100 text-amber-600", icon: iconName || "alert-triangle" },
      "not-suitable": { iconBg: "bg-red-100 text-red-600", icon: iconName || "x-circle" },
    }[value] || { iconBg: "bg-slate-100 text-slate-600", icon: iconName || "circle" };
    return `
      <label class="assessment-card rounded-xl border-2 border-slate-200 p-4 cursor-pointer transition text-center" data-value="${value}">
        <input type="radio" name="assessment" value="${value}" class="hidden" />
        <div class="w-11 h-11 mx-auto rounded-full ${meta.iconBg} flex items-center justify-center mb-2">${icon(meta.icon, "w-6 h-6")}</div>
        <p class="text-sm font-bold text-slate-800">${title}</p>
        <p class="text-xs text-slate-500 mt-0.5">${desc}</p>
      </label>`;
  }

  // Task Queue Card — ใช้ใน Nurse Dashboard (Today Task Queue)
  // priority รับค่าได้ทั้ง 3 ระดับ (urgent/high/normal) หรือ 4 ระดับ (urgent/high/medium/low) — จะ map ลง priority-badge 3 ระดับให้อัตโนมัติ
  function taskQueueCard({ time, patient, hn, task, priority = "normal", href, done = false }) {
    const badgeLevel = { urgent: "urgent", high: "high", medium: "normal", low: "normal", normal: "normal" }[priority] || "normal";
    const cardTier = { urgent: "high", high: "medium", medium: "low", low: "low", normal: "low" }[priority] || "low";
    return `
      <a href="${href || "#"}" class="task-card priority-${cardTier} ${done ? "opacity-60" : ""}">
        <div class="w-12 h-12 rounded-lg bg-slate-50 flex flex-col items-center justify-center shrink-0 text-slate-600">
          <span class="text-xs font-bold leading-none">${time}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-semibold text-slate-800">${task}</p>
            ${priorityBadge(badgeLevel)}
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${patient} · ${hn}</p>
        </div>
        <span class="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-primary hover:bg-blue-50 transition">${done ? "เสร็จแล้ว" : "Open"}</span>
      </a>`;
  }

  // Risk Patient Card — ใช้ใน Patient Risk Overview (Nurse Dashboard)
  function riskPatientCard({ name, hn, risk = "low", metric, href }) {
    const ring = { low: "border-green-100 bg-green-50/40", medium: "border-amber-100 bg-amber-50/40", high: "border-red-100 bg-red-50/40" }[risk] || "";
    const inner = `
        <div class="patient-card-avatar ${risk === "high" ? "bg-red-100 text-red-700" : risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}">${name.slice(0, 2)}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">${name}</p>
          <p class="text-xs text-slate-500">${hn}${metric ? " · " + metric : ""}</p>
        </div>
        ${(() => {
          const map = { low: '<span class="badge badge-green">Low Risk</span>', medium: '<span class="badge badge-amber">Medium Risk</span>', high: '<span class="badge badge-red">High Risk</span>' };
          return map[risk] || "";
        })()}`;
    return href
      ? `<a href="${href}" class="patient-card ${ring}">${inner}</a>`
      : `<div class="patient-card ${ring}">${inner}</div>`;
  }

  // Communication Status Badge — Contacted / Pending / No Answer
  function commStatusBadge(status) {
    const map = {
      contacted: '<span class="badge badge-green"><i data-lucide="phone-outgoing" class="w-3 h-3"></i> Contacted</span>',
      pending: '<span class="badge badge-amber"><i data-lucide="clock" class="w-3 h-3"></i> Pending</span>',
      "no-answer": '<span class="badge badge-red"><i data-lucide="phone-missed" class="w-3 h-3"></i> No Answer</span>',
    };
    return map[status] || map.pending;
  }

  // Medication Reminder Card — ใช้ใน LIFF Home + Medication (มือถือ)
  // taken=true แสดง badge "กินแล้ว", taken=false แสดงปุ่ม "กินยาแล้ว" ให้กดยืนยัน (onclick รับชื่อฟังก์ชัน global เป็น string)
  function medicationReminderCard({ drug, dose, mealTime, time, taken = false, onTakenClick, detailHref }) {
    return `
      <div class="card p-4">
        <div class="flex items-start gap-3">
          <div class="w-14 h-14 rounded-xl ${taken ? "bg-green-50" : "bg-blue-50"} flex items-center justify-center shrink-0">${icon("pill", `w-7 h-7 ${taken ? "text-green-600" : "text-primary"}`)}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800">${drug}</p>
            <p class="text-xs text-slate-500 mt-0.5">ขนาด ${dose}${mealTime ? " · " + mealTime : ""}</p>
            <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1">${icon("clock", "w-3 h-3")} เวลาทาน ${time}</p>
          </div>
          ${detailHref ? `<a href="${detailHref}" class="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 liff-tap">${icon("chevron-right", "w-4 h-4 text-slate-300")}</a>` : ""}
        </div>
        <div class="mt-3">
          ${
            taken
              ? `<span class="badge badge-green w-full justify-center py-2.5 text-xs">${icon("check-circle-2", "w-3.5 h-3.5")} กินยาแล้ว</span>`
              : `<button type="button" ${onTakenClick ? `onclick="${onTakenClick}"` : ""} class="liff-tap w-full py-2.5 rounded-lg text-xs font-semibold bg-primary text-white">${icon("check", "w-3.5 h-3.5")} กินยาแล้ว</button>`
          }
        </div>
      </div>`;
  }

  // Article Card — ใช้ใน Knowledge Center list และ Related Article ในหน้า Article Detail
  function articleCard({ title, summary, cover, category, href = "knowledge-detail.html", compact = false }) {
    const catStyle = {
      "การดูแลทั่วไป": "background:#dbeafe;color:#2563eb",
      "ยา": "background:#ccfbf1;color:#0f766e",
      "โภชนาการ": "background:#dcfce7;color:#15803d",
      "การออกกำลังกาย": "background:#fef3c7;color:#b45309",
      "อาการอันตราย": "background:#ffe4e6;color:#be123c",
    }[category] || "";
    return `
      <a href="${href}" class="card card-hover liff-tap block ${compact ? "p-3" : "p-4"}">
        <div class="flex items-start gap-3.5">
          <div class="${compact ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl"} rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">${cover}</div>
          <div class="flex-1 min-w-0">
            ${category ? `<span class="badge badge-slate mb-1.5" style="${catStyle}">${category}</span>` : ""}
            <p class="text-sm font-bold text-slate-800 leading-snug">${title}</p>
            ${summary ? `<p class="text-xs text-slate-500 mt-1 leading-relaxed">${summary}</p>` : ""}
          </div>
          ${icon("chevron-right", "w-5 h-5 text-slate-300 shrink-0 mt-1")}
        </div>
      </a>`;
  }

  // ---------- Loading State (Skeleton) ----------
  // ใช้ระหว่างรอโหลดข้อมูลจริงจาก backend — ปัจจุบัน mock data โหลดทันที จึงยังไม่ได้ผูกใช้งานจริงในหน้าใด
  // เตรียมไว้สำหรับขั้นตอนต่อ backend (แสดงระหว่างรอ fetch)
  function skeletonCard({ withAvatar = true } = {}) {
    return `
      <div class="card p-4">
        <div class="flex items-center gap-3">
          ${withAvatar ? `<div class="skeleton w-11 h-11 rounded-full shrink-0"></div>` : ""}
          <div class="flex-1 min-w-0 space-y-2">
            <div class="skeleton h-3.5 rounded w-2/3"></div>
            <div class="skeleton h-3 rounded w-1/3"></div>
          </div>
        </div>
      </div>`;
  }

  function skeletonTable(rows = 5, cols = 4) {
    const row = `<tr>${Array.from({ length: cols }).map(() => `<td><div class="skeleton h-3.5 rounded w-full"></div></td>`).join("")}</tr>`;
    return Array.from({ length: rows }).map(() => row).join("");
  }

  function skeletonChart(height = 220) {
    return `<div class="skeleton rounded-xl w-full" style="height:${height}px"></div>`;
  }

  // ---------- Empty State ----------
  // ใช้เมื่อไม่มีข้อมูล (เช่น ค้นหา/กรองแล้วไม่พบผลลัพธ์, ยังไม่มีนัดหมาย/Lab/Chat)
  function emptyState({ icon: iconName = "inbox", title, desc, action } = {}) {
    return `
      <div class="text-center py-10 px-4">
        <div class="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">${icon(iconName, "w-7 h-7")}</div>
        <p class="text-sm font-semibold text-slate-600">${title || "ไม่มีข้อมูล"}</p>
        ${desc ? `<p class="text-xs text-slate-400 mt-1">${desc}</p>` : ""}
        ${action ? `<a href="${action.href}" class="liff-tap inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition">${icon("plus", "w-3.5 h-3.5")}${action.label}</a>` : ""}
      </div>`;
  }

  // ---------- Error State ----------
  // ใช้เมื่อโหลดข้อมูลจากระบบจริงไม่สำเร็จ (เตรียมไว้สำหรับขั้นตอนต่อ backend — retryFnName รับชื่อฟังก์ชัน global เป็น string)
  function errorState({ message = "ไม่สามารถโหลดข้อมูลได้", retryFnName } = {}) {
    return `
      <div class="text-center py-10 px-4">
        <div class="w-14 h-14 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-3">${icon("wifi-off", "w-7 h-7")}</div>
        <p class="text-sm font-semibold text-slate-600">${message}</p>
        ${retryFnName ? `<button type="button" onclick="${retryFnName}()" class="liff-tap inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition">${icon("refresh-cw", "w-3.5 h-3.5")}ลองใหม่อีกครั้ง</button>` : ""}
      </div>`;
  }

  return {
    statCard, patientCard, alertCard, timeline, medicalDataCard, taskCard, priorityBadge, statusPipeline, matchingScore, clinicalAssessmentCard,
    taskQueueCard, riskPatientCard, commStatusBadge, medicationReminderCard, articleCard,
    skeletonCard, skeletonTable, skeletonChart, emptyState, errorState,
  };
})();
