/**
 * Kidney Transplant Follow-up System — Central Dummy Data
 * ข้อมูลจำลองทั้งหมดใช้ร่วมกันทุกหน้า (Doctor / Nurse / Patient LIFF)
 * ห้ามเชื่อมต่อฐานข้อมูลจริง — เป็น Mockup เพื่อการนำเสนอเท่านั้น
 */

window.MOCK_DATA = (function () {
  const staff = {
    doctor: {
      id: "DOC-001",
      name: "นพ.ธนกร วัฒนสิน",
      role: "doctor",
      roleLabel: "แพทย์ผู้เชี่ยวชาญโรคไต",
      department: "หน่วยปลูกถ่ายไต โรงพยาบาลศิริราชปิยมหาราชการุณย์",
      avatar: "ธก",
    },
    nurse: {
      id: "NUR-014",
      name: "พว.สุพัตรา เจริญพร",
      role: "nurse",
      roleLabel: "พยาบาลผู้ประสานงานปลูกถ่ายไต",
      department: "หน่วยปลูกถ่ายไต โรงพยาบาลศิริราชปิยมหาราชการุณย์",
      avatar: "สพ",
    },
  };

  const patients = [
    { hn: "HN-102345", an: "AN-660234", name: "นายสมชาย ใจดี", age: 52, gender: "ชาย", dob: "12 มี.ค. 2516", blood: "O+", hospital: "รพ.ศิริราช", transplantDate: "18 ม.ค. 2566", donorType: "ญาติผู้บริจาค (Living Related)", hla: "5/6 Match", compatibility: "สูง", risk: "low", status: "ติดตามปกติ", phone: "081-234-5678", line: "somchai_jd", creatinine: 1.1, egfr: 78, tac: 6.2, lastVisit: "02 ก.ย. 2569", nextVisit: "16 ก.ย. 2569" },
    { hn: "HN-102346", an: "AN-660512", name: "นางสมหญิง แสงทอง", age: 47, gender: "หญิง", dob: "24 ก.ค. 2521", blood: "A+", hospital: "รพ.ศิริราช", transplantDate: "03 พ.ค. 2565", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "4/6 Match", compatibility: "ปานกลาง", risk: "medium", status: "ติดตามปกติ", phone: "082-345-6789", line: "somying_st", creatinine: 1.6, egfr: 58, tac: 9.4, lastVisit: "28 ส.ค. 2569", nextVisit: "11 ก.ย. 2569" },
    { hn: "HN-102347", an: "AN-660789", name: "นายประเสริฐ มั่นคง", age: 61, gender: "ชาย", dob: "02 พ.ย. 2507", blood: "B+", hospital: "รพ.รามาธิบดี", transplantDate: "20 ก.ย. 2564", donorType: "ญาติผู้บริจาค (Living Related)", hla: "6/6 Match", compatibility: "สูงมาก", risk: "high", status: "เฝ้าระวังใกล้ชิด", phone: "083-456-7890", line: "prasert_mk", creatinine: 2.4, egfr: 34, tac: 4.1, lastVisit: "05 ก.ย. 2569", nextVisit: "09 ก.ย. 2569" },
    { hn: "HN-102348", an: "AN-661023", name: "นางสาวกัลยา รุ่งเรือง", age: 34, gender: "หญิง", dob: "15 ก.พ. 2535", blood: "AB+", hospital: "รพ.จุฬาลงกรณ์", transplantDate: "11 ธ.ค. 2566", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "3/6 Match", compatibility: "ปานกลาง", risk: "medium", status: "ติดตามปกติ", phone: "084-567-8901", line: "kanlaya_rr", creatinine: 1.3, egfr: 71, tac: 7.8, lastVisit: "30 ส.ค. 2569", nextVisit: "13 ก.ย. 2569" },
    { hn: "HN-102349", an: "AN-661144", name: "นายวิชัย ศรีสุข", age: 58, gender: "ชาย", dob: "09 ก.ย. 2510", blood: "O-", hospital: "รพ.ศิริราช", transplantDate: "27 ก.พ. 2565", donorType: "ญาติผู้บริจาค (Living Related)", hla: "5/6 Match", compatibility: "สูง", risk: "low", status: "ติดตามปกติ", phone: "085-678-9012", line: "wichai_ss", creatinine: 1.0, egfr: 84, tac: 5.9, lastVisit: "25 ส.ค. 2569", nextVisit: "22 ก.ย. 2569" },
    { hn: "HN-102350", an: "AN-661267", name: "นางพรทิพย์ อยู่เย็น", age: 55, gender: "หญิง", dob: "30 พ.ค. 2514", blood: "A-", hospital: "รพ.รามาธิบดี", transplantDate: "14 ส.ค. 2566", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "4/6 Match", compatibility: "ปานกลาง", risk: "high", status: "เฝ้าระวังใกล้ชิด", phone: "086-789-0123", line: "porntip_yy", creatinine: 2.1, egfr: 41, tac: 11.2, lastVisit: "06 ก.ย. 2569", nextVisit: "10 ก.ย. 2569" },
    { hn: "HN-102351", an: "AN-661389", name: "นายอนันต์ ทองแท้", age: 44, gender: "ชาย", dob: "18 ต.ค. 2524", blood: "B-", hospital: "รพ.จุฬาลงกรณ์", transplantDate: "05 เม.ย. 2567", donorType: "ญาติผู้บริจาค (Living Related)", hla: "6/6 Match", compatibility: "สูงมาก", risk: "low", status: "ติดตามปกติ", phone: "087-890-1234", line: "anan_tt", creatinine: 0.9, egfr: 91, tac: 6.5, lastVisit: "01 ก.ย. 2569", nextVisit: "15 ก.ย. 2569" },
    { hn: "HN-102352", an: "AN-661456", name: "นางสาวนภัสวรรณ ดวงดี", age: 29, gender: "หญิง", dob: "07 ม.ค. 2540", blood: "O+", hospital: "รพ.ศิริราช", transplantDate: "22 มิ.ย. 2566", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "5/6 Match", compatibility: "สูง", risk: "medium", status: "ติดตามปกติ", phone: "088-901-2345", line: "napat_dd", creatinine: 1.4, egfr: 65, tac: 8.7, lastVisit: "29 ส.ค. 2569", nextVisit: "12 ก.ย. 2569" },
    { hn: "HN-102353", an: "AN-661578", name: "นายสุรชัย พิทักษ์กุล", age: 63, gender: "ชาย", dob: "13 เม.ย. 2506", blood: "A+", hospital: "รพ.รามาธิบดี", transplantDate: "09 ต.ค. 2564", donorType: "ญาติผู้บริจาค (Living Related)", hla: "4/6 Match", compatibility: "ปานกลาง", risk: "high", status: "เฝ้าระวังใกล้ชิด", phone: "089-012-3456", line: "surachai_pk", creatinine: 2.8, egfr: 28, tac: 3.6, lastVisit: "07 ก.ย. 2569", nextVisit: "09 ก.ย. 2569" },
    { hn: "HN-102354", an: "AN-661690", name: "นางวันเพ็ญ สว่างจิต", age: 49, gender: "หญิง", dob: "21 ส.ค. 2520", blood: "AB-", hospital: "รพ.จุฬาลงกรณ์", transplantDate: "30 พ.ย. 2565", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "3/6 Match", compatibility: "ปานกลาง", risk: "medium", status: "ติดตามปกติ", phone: "090-123-4567", line: "wanpen_sj", creatinine: 1.5, egfr: 60, tac: 9.9, lastVisit: "31 ส.ค. 2569", nextVisit: "14 ก.ย. 2569" },
    { hn: "HN-102355", an: "AN-661812", name: "นายกิตติพงษ์ เรืองศรี", age: 39, gender: "ชาย", dob: "27 ธ.ค. 2530", blood: "O+", hospital: "รพ.ศิริราช", transplantDate: "16 ก.ค. 2567", donorType: "ญาติผู้บริจาค (Living Related)", hla: "6/6 Match", compatibility: "สูงมาก", risk: "low", status: "ติดตามปกติ", phone: "091-234-5678", line: "kittipong_rs", creatinine: 1.0, egfr: 88, tac: 6.0, lastVisit: "27 ส.ค. 2569", nextVisit: "10 ก.ย. 2569" },
    { hn: "HN-102356", an: "AN-661933", name: "นางสาวอรทัย บุญมาก", age: 41, gender: "หญิง", dob: "05 มิ.ย. 2528", blood: "B+", hospital: "รพ.รามาธิบดี", transplantDate: "12 ก.พ. 2566", donorType: "ผู้บริจาคสมองตาย (Deceased)", hla: "4/6 Match", compatibility: "ปานกลาง", risk: "low", status: "ติดตามปกติ", phone: "092-345-6789", line: "orathai_bm", creatinine: 1.2, egfr: 75, tac: 7.1, lastVisit: "03 ก.ย. 2569", nextVisit: "17 ก.ย. 2569" },
  ];

  // ค่าดัชนีที่ใช้บ่อยสำหรับผู้ป่วยตัวอย่างหลัก (ใช้ในหน้า Patient Summary / LIFF)
  const primaryPatient = patients[0];

  const labTrend = {
    labels: ["มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."],
    creatinine: [1.4, 1.3, 1.2, 1.3, 1.2, 1.1, 1.1],
    egfr: [62, 66, 70, 68, 74, 77, 78],
    tac: [7.8, 7.2, 6.9, 6.5, 6.4, 6.1, 6.2],
  };

  const labParams = [
    { key: "creatinine", name: "Creatinine", unit: "mg/dL", current: 1.1, previous: 1.2, range: "0.6 - 1.3", status: "normal" },
    { key: "egfr", name: "eGFR", unit: "mL/min/1.73m²", current: 78, previous: 74, range: "> 60", status: "normal" },
    { key: "bun", name: "BUN", unit: "mg/dL", current: 18, previous: 21, range: "7 - 20", status: "normal" },
    { key: "potassium", name: "Potassium (K+)", unit: "mmol/L", current: 5.6, previous: 4.8, range: "3.5 - 5.1", status: "high" },
    { key: "sodium", name: "Sodium (Na+)", unit: "mmol/L", current: 139, previous: 140, range: "135 - 145", status: "normal" },
    { key: "cbc", name: "CBC (Hb)", unit: "g/dL", current: 12.4, previous: 12.1, range: "12 - 16", status: "normal" },
    { key: "urineProtein", name: "Urine Protein", unit: "mg/dL", current: 45, previous: 22, range: "< 30", status: "high" },
    { key: "tac", name: "Tacrolimus Level", unit: "ng/mL", current: 6.2, previous: 8.9, range: "5 - 10", status: "normal" },
    { key: "cyclosporine", name: "Cyclosporine Level", unit: "ng/mL", current: 0, previous: 0, range: "80 - 150", status: "na" },
    { key: "bp", name: "Blood Pressure", unit: "mmHg", current: "128/82", previous: "130/85", range: "< 130/80", status: "high" },
  ];

  const medications = [
    { drug: "Tacrolimus (Prograf)", dose: "2 mg", frequency: "เช้า-เย็น หลังอาหาร", start: "18 ม.ค. 2566", status: "active", pillCount: "1 เม็ด", instructions: "กินพร้อมอาหารหรือหลังอาหารทันที ให้เวลาห่างกันทุก 12 ชั่วโมงเท่าๆ กันทุกวัน (เช่น 08:00 และ 20:00 น.)", warning: "ห้ามหยุดยาหรือปรับขนาดเอง แม้รู้สึกสบายดี อาจทำให้ร่างกายปฏิเสธไตใหม่ได้" },
    { drug: "Mycophenolate mofetil (CellCept)", dose: "500 mg", frequency: "เช้า-เย็น หลังอาหาร", start: "18 ม.ค. 2566", status: "active", pillCount: "1 เม็ด", instructions: "กินหลังอาหารทันที ห่างกันทุก 12 ชั่วโมง", warning: "อาจทำให้ปวดท้องหรือถ่ายเหลว หากอาการรุนแรงให้แจ้งทีมพยาบาล" },
    { drug: "Prednisolone", dose: "5 mg", frequency: "เช้า หลังอาหาร", start: "18 ม.ค. 2566", status: "active", pillCount: "1 เม็ด", instructions: "กินหลังอาหารเช้ามื้อเดียว ห้ามหยุดยาทันทีโดยไม่ปรึกษาแพทย์", warning: "อาจเพิ่มความเสี่ยงติดเชื้อและน้ำตาลในเลือดสูง สังเกตอาการผิดปกติ" },
    { drug: "Valganciclovir", dose: "450 mg", frequency: "วันละครั้ง", start: "18 ม.ค. 2566", status: "stopped", pillCount: "1 เม็ด", instructions: "กินพร้อมอาหาร", warning: "หยุดยาแล้วตามแผนการรักษา (ครบ 6 เดือนหลังปลูกถ่าย)" },
    { drug: "Amlodipine", dose: "5 mg", frequency: "เช้า หลังอาหาร", start: "02 มิ.ย. 2566", status: "active", pillCount: "1 เม็ด", instructions: "กินหลังอาหารเช้ามื้อเดียว เพื่อควบคุมความดันโลหิต", warning: "อาจมีอาการขาบวมหรือหน้ามืดช่วงแรก หากรุนแรงให้แจ้งทีมพยาบาล" },
  ];

  const doseHistory = [
    { date: "18 ม.ค. 2566", drug: "Tacrolimus", change: "เริ่มยาใหม่ 3 mg", doctor: "นพ.ธนกร วัฒนสิน" },
    { date: "15 มี.ค. 2566", drug: "Tacrolimus", change: "ปรับลดจาก 3 mg → 2.5 mg", doctor: "นพ.ธนกร วัฒนสิน" },
    { date: "20 ก.ค. 2566", drug: "Tacrolimus", change: "ปรับลดจาก 2.5 mg → 2 mg", doctor: "นพ.ธนกร วัฒนสิน" },
    { date: "10 พ.ย. 2567", drug: "Valganciclovir", change: "หยุดยา (ครบ 6 เดือน)", doctor: "นพ.ธนกร วัฒนสิน" },
    { date: "02 มิ.ย. 2566", drug: "Amlodipine", change: "เริ่มยาใหม่ 5 mg (ควบคุมความดัน)", doctor: "นพ.ธนกร วัฒนสิน" },
  ];

  const compliance = [
    { name: "นายสมชาย ใจดี", hn: "HN-102345", percent: 96 },
    { name: "นางสมหญิง แสงทอง", hn: "HN-102346", percent: 88 },
    { name: "นายประเสริฐ มั่นคง", hn: "HN-102347", percent: 64 },
    { name: "นางสาวกัลยา รุ่งเรือง", hn: "HN-102348", percent: 91 },
    { name: "นายวิชัย ศรีสุข", hn: "HN-102349", percent: 98 },
    { name: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", percent: 72 },
    { name: "นายอนันต์ ทองแท้", hn: "HN-102351", percent: 95 },
    { name: "นางสาวนภัสวรรณ ดวงดี", hn: "HN-102352", percent: 83 },
  ];

  const appointments = [
    { id: "AP-2311", patient: "นายสมชาย ใจดี", hn: "HN-102345", date: "16 ก.ย. 2569", time: "09:00", doctor: "นพ.ธนกร วัฒนสิน", type: "ติดตามหลังปลูกถ่าย", status: "confirmed", hospital: "รพ.ศิริราช อาคาร 100 ปี ชั้น 3" },
    { id: "AP-2312", patient: "นางสมหญิง แสงทอง", hn: "HN-102346", date: "11 ก.ย. 2569", time: "10:30", doctor: "นพ.ธนกร วัฒนสิน", type: "ตรวจ Lab ประจำเดือน", status: "confirmed", hospital: "รพ.ศิริราช อาคาร 100 ปี ชั้น 3" },
    { id: "AP-2313", patient: "นายประเสริฐ มั่นคง", hn: "HN-102347", date: "09 ก.ย. 2569", time: "13:00", doctor: "นพ.ธนกร วัฒนสิน", type: "เฝ้าระวังภาวะปฏิเสธ", status: "pending", hospital: "รพ.รามาธิบดี" },
    { id: "AP-2314", patient: "นางสาวกัลยา รุ่งเรือง", hn: "HN-102348", date: "13 ก.ย. 2569", time: "14:00", doctor: "นพ.ธนกร วัฒนสิน", type: "ติดตามหลังปลูกถ่าย", status: "confirmed", hospital: "รพ.จุฬาลงกรณ์" },
    { id: "AP-2315", patient: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", date: "10 ก.ย. 2569", time: "09:30", doctor: "นพ.ธนกร วัฒนสิน", type: "เฝ้าระวังภาวะปฏิเสธ", status: "missed", hospital: "รพ.รามาธิบดี" },
    { id: "AP-2316", patient: "นายสุรชัย พิทักษ์กุล", hn: "HN-102353", date: "09 ก.ย. 2569", time: "15:30", doctor: "นพ.ธนกร วัฒนสิน", type: "Urgent Follow-up", status: "confirmed", hospital: "รพ.รามาธิบดี" },
  ];

  const alerts = [
    { type: "Creatinine สูง", patient: "นายสุรชัย พิทักษ์กุล", hn: "HN-102353", value: "2.8 mg/dL", level: "high", time: "2 ชม.ที่แล้ว" },
    { type: "eGFR ลดลง", patient: "นายประเสริฐ มั่นคง", hn: "HN-102347", value: "34 → 28", level: "high", time: "3 ชม.ที่แล้ว" },
    { type: "Tacrolimus สูง", patient: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", value: "11.2 ng/mL", level: "medium", time: "5 ชม.ที่แล้ว" },
    { type: "Tacrolimus ต่ำ", patient: "นายสุรชัย พิทักษ์กุล", hn: "HN-102353", value: "3.6 ng/mL", level: "high", time: "5 ชม.ที่แล้ว" },
    { type: "Miss Medication", patient: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", value: "ขาดยา 2 มื้อ", level: "medium", time: "1 วันที่แล้ว" },
    { type: "Miss Appointment", patient: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", value: "นัด 10 ก.ย. 2569", level: "medium", time: "1 วันที่แล้ว" },
  ];

  // Waiting List — pipeline stage: registered → investigation → matching → evaluation → ready → completed
  // priority: urgent / high / normal
  const waitingList = [
    { hn: "HN-990211", name: "นายเอกชัย พงษ์พันธ์", age: 34, blood: "O+", hla: "A2,A24,B13,B60,DR4,DR15", pra: "4%", registerDate: "05 ม.ค. 2567", duration: "1 ปี 8 เดือน", stage: "matching", priority: "high", waitingNo: "WL-2024-0042", hospital: "รพ.ศิริราช" },
    { hn: "HN-990212", name: "นางสาวรัตนา ทับทิม", age: 47, blood: "B+", hla: "A1,A11,B7,B39,DR1,DR9", pra: "34%", registerDate: "22 พ.ย. 2565", duration: "3 ปี 10 เดือน", stage: "evaluation", priority: "urgent", waitingNo: "WL-2022-0189", hospital: "รพ.รามาธิบดี" },
    { hn: "HN-990213", name: "นายมงคล ศักดิ์สิทธิ์", age: 29, blood: "A+", hla: "A2,A3,B7,B35,DR1,DR15", pra: "8%", registerDate: "14 มิ.ย. 2568", duration: "3 เดือน", stage: "investigation", priority: "normal", waitingNo: "WL-2025-0301", hospital: "รพ.จุฬาลงกรณ์" },
    { hn: "HN-990214", name: "นางสาวปาริชาติ วงศ์งาม", age: 41, blood: "O-", hla: "A2,A24,B13,B60,DR4,DR13", pra: "2%", registerDate: "30 ส.ค. 2567", duration: "1 ปี 1 เดือน", stage: "evaluation", priority: "high", waitingNo: "WL-2024-0207", hospital: "รพ.ศิริราช" },
    { hn: "HN-990215", name: "นายธีรพล แก้วมณี", age: 52, blood: "AB+", hla: "A24,A33,B44,B62,DR9,DR12", pra: "5%", registerDate: "17 ก.พ. 2569", duration: "7 เดือน", stage: "ready", priority: "urgent", waitingNo: "WL-2026-0018", hospital: "รพ.รามาธิบดี" },
    { hn: "HN-990216", name: "นางจินตนา รักษ์ไทย", age: 63, blood: "B-", hla: "A1,A2,B8,B44,DR3,DR7", pra: "18%", registerDate: "03 ต.ค. 2564", duration: "4 ปี 11 เดือน", stage: "evaluation", priority: "urgent", waitingNo: "WL-2021-0088", hospital: "รพ.จุฬาลงกรณ์" },
    { hn: "HN-640001", name: "นายพิพัฒน์ ไชยวงศ์", age: 39, blood: "O+", hla: "A2,A26,B18,B60,DR4,DR13", pra: "6%", registerDate: "12 มี.ค. 2564", duration: "2 ปี 6 เดือน", stage: "matching", priority: "high", waitingNo: "WL-2021-0042", hospital: "รพ.ศิริราช" },
    { hn: "HN-990217", name: "นางสาวสุนิสา ทรงศิริ", age: 26, blood: "A-", hla: "A1,A2,B8,B27,DR3,DR15", pra: "1%", registerDate: "20 ก.ค. 2569", duration: "1 เดือน 2 สัปดาห์", stage: "registered", priority: "normal", waitingNo: "WL-2026-0212", hospital: "รพ.รามาธิบดี" },
    { hn: "HN-990218", name: "นายชัยวัฒน์ บุญเลิศ", age: 57, blood: "AB-", hla: "A3,A11,B7,B44,DR1,DR7", pra: "12%", registerDate: "09 ก.ย. 2568", duration: "1 ปี", stage: "investigation", priority: "normal", waitingNo: "WL-2025-0455", hospital: "รพ.ศิริราช" },
    { hn: "HN-990219", name: "นางประไพ วัฒนวงศ์", age: 60, blood: "O+", hla: "A2,A24,B13,B62,DR4,DR9", pra: "3%", registerDate: "01 ม.ค. 2565", duration: "4 ปี 8 เดือน", stage: "completed", priority: "normal", waitingNo: "WL-2022-0004", hospital: "รพ.จุฬาลงกรณ์" },
  ];

  // Donor Registry — status (coarse, ใช้กับหน้าลงทะเบียน/badge ทั่วไป): registered / screening / approved / rejected / used
  // stage (ละเอียด, ใช้กับ Donor Pipeline Kanban/Report): registered / screening / evaluation / matching / approved / rejected / completed
  // risk: low / medium / high — ระดับความเสี่ยงโดยรวมของผู้บริจาค
  const donors = [
    { id: "DNR-5521", name: "นายวีระ ตั้งสกุล", type: "Deceased Donor", age: 29, gender: "ชาย", blood: "O+", province: "กรุงเทพมหานคร", dob: "14 พ.ค. 2540", idCard: "1-1099-00521-XX-X", phone: "081-552-1001", address: "123 ถ.สุขุมวิท กรุงเทพมหานคร", relationship: "-", recipientHn: "-", recipientName: "-", hla: "A2,A24,B13,B60,DR4,DR15", organ: "ไตซ้าย", hospital: "รพ.ศิริราช", crossmatch: "Negative", pra: "4%", coldIschemic: "6 ชม. 20 นาที", medicalHistory: "ไม่มีโรคประจำตัว", medication: "ไม่มี", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "ไม่สูบบุหรี่", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "Negative (HIV, HBsAg, Anti-HCV)", kidneyCondition: "ปกติดี (eGFR ประเมิน 95)", status: "approved", stage: "approved", risk: "low", registerDate: "01 ก.ย. 2569" },
    { id: "DNR-5522", name: "นางสาวพิมพ์ชนก รุ่งเจริญ", type: "Living Related", age: 45, gender: "หญิง", blood: "A+", province: "นนทบุรี", dob: "20 มี.ค. 2524", idCard: "1-1005-00522-XX-X", phone: "082-663-2002", address: "45/2 ถ.งามวงศ์วาน นนทบุรี", relationship: "พี่น้อง (Sibling)", recipientHn: "HN-990212", recipientName: "นางสาวรัตนา ทับทิม", hla: "A1,A2,B8,B44,DR3,DR7", organ: "ไตขวา", hospital: "รพ.รามาธิบดี", crossmatch: "Negative", pra: "2%", coldIschemic: "2 ชม. 10 นาที", medicalHistory: "ความดันโลหิตสูง ควบคุมได้ดี", medication: "Amlodipine 5 mg (ควบคุมความดัน)", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "ไม่สูบบุหรี่", alcohol: "ดื่มเป็นครั้งคราว", infectionScreening: "Negative", kidneyCondition: "ดี (eGFR 98)", status: "screening", stage: "screening", risk: "medium", registerDate: "02 ก.ย. 2569" },
    { id: "DNR-5523", name: "นายสมพงษ์ ศรีวิไล", type: "Deceased Donor", age: 52, gender: "ชาย", blood: "B+", province: "ชลบุรี", dob: "11 ก.พ. 2517", idCard: "1-2033-00523-XX-X", phone: "083-774-3003", address: "88 ถ.สุขุมวิท ชลบุรี", relationship: "-", recipientHn: "-", recipientName: "-", hla: "A3,A11,B7,B35,DR1,DR15", organ: "ไตซ้าย", hospital: "รพ.จุฬาลงกรณ์", crossmatch: "Positive", pra: "22%", coldIschemic: "10 ชม. 45 นาที", medicalHistory: "เบาหวานชนิดที่ 2", medication: "Metformin 500 mg", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "เลิกสูบบุหรี่ 2 ปี", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "Negative", kidneyCondition: "ปานกลาง (มี fibrosis เล็กน้อย)", status: "rejected", stage: "rejected", risk: "high", registerDate: "28 ส.ค. 2569" },
    { id: "DNR-5524", name: "นางสาวอรุณี ทองสุข", type: "Deceased Donor", age: 34, gender: "หญิง", blood: "O-", province: "เชียงใหม่", dob: "19 ก.ค. 2535", idCard: "1-5011-00524-XX-X", phone: "084-885-4004", address: "12 ถ.นิมมานเหมินท์ เชียงใหม่", relationship: "-", recipientHn: "-", recipientName: "-", hla: "A2,A26,B18,B60,DR4,DR13", organ: "ไตขวา", hospital: "รพ.ศิริราช", crossmatch: "Negative", pra: "6%", coldIschemic: "5 ชม. 55 นาที", medicalHistory: "ไม่มีโรคประจำตัว", medication: "ไม่มี", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "ไม่สูบบุหรี่", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "Negative", kidneyCondition: "ดีมาก (eGFR 110)", status: "used", stage: "completed", risk: "low", registerDate: "12 ส.ค. 2569" },
    { id: "DNR-5525", name: "นายกิตติศักดิ์ แสงอรุณ", type: "Living Related", age: 38, gender: "ชาย", blood: "AB+", province: "กรุงเทพมหานคร", dob: "02 ม.ค. 2531", idCard: "1-1077-00525-XX-X", phone: "085-996-5005", address: "99 ถ.รัชดาภิเษก กรุงเทพมหานคร", relationship: "บิดา/มารดา (Parent)", recipientHn: "HN-990217", recipientName: "นางสาวสุนิสา ทรงศิริ", hla: "A24,A33,B44,B62,DR9,DR12", organ: "ไตซ้าย", hospital: "รพ.รามาธิบดี", crossmatch: "Negative", pra: "0%", coldIschemic: "1 ชม. 40 นาที", medicalHistory: "ไม่มีโรคประจำตัว", medication: "ไม่มี", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "ไม่สูบบุหรี่", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "อยู่ระหว่างตรวจ", kidneyCondition: "รอผลตรวจ", status: "registered", stage: "registered", risk: "low", registerDate: "08 ก.ย. 2569" },
    { id: "DNR-5526", name: "นางสาวธิดารัตน์ มีสุข", type: "Living Related", age: 41, gender: "หญิง", blood: "O+", province: "ปทุมธานี", dob: "09 มิ.ย. 2528", idCard: "1-1088-00526-XX-X", phone: "086-112-6006", address: "20 ถ.รังสิต-นครนายก ปทุมธานี", relationship: "คู่สมรส (Spouse)", recipientHn: "HN-990213", recipientName: "นายมงคล ศักดิ์สิทธิ์", hla: "A2,A3,B7,B44,DR7,DR11", organ: "ไตซ้าย", hospital: "รพ.ธรรมศาสตร์", crossmatch: "Negative", pra: "3%", coldIschemic: "-", medicalHistory: "ไม่มีโรคประจำตัว", medication: "ไม่มี", previousSurgery: "ผ่าตัดไส้ติ่ง (2565)", allergy: "แพ้เพนิซิลลิน", smoking: "ไม่สูบบุหรี่", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "Negative", kidneyCondition: "ดี (eGFR ประเมิน 100)", status: "screening", stage: "evaluation", risk: "medium", registerDate: "28 ส.ค. 2569" },
    { id: "DNR-5527", name: "นายประวิทย์ บุญรอด", type: "Deceased Donor", age: 47, gender: "ชาย", blood: "A-", province: "นครปฐม", dob: "23 ต.ค. 2522", idCard: "1-7302-00527-XX-X", phone: "087-223-7007", address: "5 ถ.เพชรเกษม นครปฐม", relationship: "-", recipientHn: "-", recipientName: "-", hla: "A1,A24,B8,B60,DR3,DR4", organ: "ไตขวา", hospital: "รพ.ศิริราช", crossmatch: "Negative", pra: "5%", coldIschemic: "4 ชม. 30 นาที", medicalHistory: "ไม่มีโรคประจำตัว", medication: "ไม่มี", previousSurgery: "ไม่มี", allergy: "ไม่มี", smoking: "ไม่สูบบุหรี่", alcohol: "ไม่ดื่มแอลกอฮอล์", infectionScreening: "Negative", kidneyCondition: "ดี (eGFR ประเมิน 92)", status: "screening", stage: "matching", risk: "low", registerDate: "04 ก.ย. 2569" },
  ];

  // Donor Evaluation — Clinical Assessment ตามมาตรฐาน Living/Deceased Donor Work-up
  // medicalChecklist/psychological ค่า: normal/abnormal/pending (medical), yes/no/pending, ready/pending, none/some/significant, strong/moderate/weak (psychological)
  // stage: pending / in-progress / completed, result: suitable / risk / not-suitable / pending
  const donorEvaluations = [
    {
      donorId: "DNR-5521", date: "04 ก.ย. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "118/76 mmHg", bmi: 22.4, smoking: "ไม่สูบบุหรี่", comorbidities: [], psychStatus: "ผ่านการประเมินสภาพจิตใจ ไม่มีข้อบ่งชี้ผิดปกติ",
      medicalChecklist: { bloodPressure: "normal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "ปกติ ไม่พบพยาธิสภาพ", renalAnatomy: "Normal anatomy, single renal artery/vein ทั้งสองข้าง", kidneySize: "ซ้าย 10.4 ซม. / ขวา 10.2 ซม." },
      psychological: { donationVoluntary: "yes", mentalReadiness: "ready", familyPressure: "none", socialSupport: "strong" },
      stage: "completed", result: "suitable", note: "สุขภาพร่างกายและจิตใจแข็งแรง ผ่านเกณฑ์ทุกด้าน เหมาะสมเป็นผู้บริจาค",
    },
    {
      donorId: "DNR-5522", date: "07 ก.ย. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "138/88 mmHg", bmi: 25.1, smoking: "ไม่สูบบุหรี่", comorbidities: ["ความดันโลหิตสูง (ควบคุมด้วยยา)"], psychStatus: "อยู่ระหว่างนัดประเมินสภาพจิตใจ",
      medicalChecklist: { bloodPressure: "abnormal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "รอตรวจ", renalAnatomy: "รอตรวจ", kidneySize: "รอตรวจ" },
      psychological: { donationVoluntary: "yes", mentalReadiness: "pending", familyPressure: "none", socialSupport: "strong" },
      stage: "in-progress", result: "pending", note: "พบความดันโลหิตสูง อยู่ระหว่างติดตามผลก่อนสรุปผลการประเมิน",
    },
    {
      donorId: "DNR-5523", date: "31 ส.ค. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "124/80 mmHg", bmi: 27.8, smoking: "เลิกสูบบุหรี่ 2 ปี", comorbidities: ["เบาหวานชนิดที่ 2"], psychStatus: "ผ่านการประเมินสภาพจิตใจ",
      medicalChecklist: { bloodPressure: "normal", diabetesScreening: "abnormal", kidneyFunction: "abnormal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "พบ fibrosis เล็กน้อย", renalAnatomy: "Normal anatomy", kidneySize: "ซ้าย 9.8 ซม. / ขวา 9.9 ซม." },
      psychological: { donationVoluntary: "yes", mentalReadiness: "ready", familyPressure: "none", socialSupport: "moderate" },
      stage: "completed", result: "not-suitable", note: "พบเบาหวานชนิดที่ 2 ร่วมกับผล Crossmatch Positive และ eGFR ต่ำกว่าเกณฑ์ ไม่เหมาะสมสำหรับการบริจาค",
    },
    {
      donorId: "DNR-5524", date: "14 ส.ค. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "112/72 mmHg", bmi: 21.6, smoking: "ไม่สูบบุหรี่", comorbidities: [], psychStatus: "ผ่านการประเมินสภาพจิตใจ",
      medicalChecklist: { bloodPressure: "normal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "ปกติดีมาก", renalAnatomy: "Normal anatomy", kidneySize: "ซ้าย 10.8 ซม. / ขวา 10.6 ซม." },
      psychological: { donationVoluntary: "yes", mentalReadiness: "ready", familyPressure: "none", socialSupport: "strong" },
      stage: "completed", result: "suitable", note: "ผลประเมินทุกด้านอยู่ในเกณฑ์ดีมาก ดำเนินการผ่าตัดบริจาคไตสำเร็จแล้ว",
    },
    {
      donorId: "DNR-5525", date: "08 ก.ย. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "116/74 mmHg", bmi: 23.0, smoking: "ไม่สูบบุหรี่", comorbidities: [], psychStatus: "รอนัดประเมินสภาพจิตใจ",
      medicalChecklist: { bloodPressure: "normal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "pending", cancerScreening: "pending", infectionScreening: "pending" },
      imaging: { ctKidney: "รอตรวจ", renalAnatomy: "รอตรวจ", kidneySize: "รอตรวจ" },
      psychological: { donationVoluntary: "yes", mentalReadiness: "pending", familyPressure: "none", socialSupport: "strong" },
      stage: "pending", result: "pending", note: "เพิ่งลงทะเบียน รอเริ่มกระบวนการตรวจคัดกรองเบื้องต้น",
    },
    {
      donorId: "DNR-5526", date: "05 ก.ย. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "128/84 mmHg", bmi: 24.6, smoking: "ไม่สูบบุหรี่", comorbidities: [], psychStatus: "อยู่ระหว่างประเมินสภาพจิตใจ",
      medicalChecklist: { bloodPressure: "abnormal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "ปกติ ไม่พบพยาธิสภาพ", renalAnatomy: "Normal anatomy", kidneySize: "ซ้าย 10.1 ซม. / ขวา 10.0 ซม." },
      psychological: { donationVoluntary: "yes", mentalReadiness: "ready", familyPressure: "some", socialSupport: "moderate" },
      stage: "in-progress", result: "risk", note: "ความดันโลหิตค่อนข้างสูงเล็กน้อยและมีแรงกดดันจากครอบครัวบางส่วน ต้องติดตามเพิ่มเติมก่อนสรุปผล",
    },
    {
      donorId: "DNR-5527", date: "06 ก.ย. 2569", evaluator: "นพ.ธนกร วัฒนสิน", bp: "122/78 mmHg", bmi: 23.5, smoking: "ไม่สูบบุหรี่", comorbidities: [], psychStatus: "ไม่ระบุ (Deceased Donor)",
      medicalChecklist: { bloodPressure: "normal", diabetesScreening: "normal", kidneyFunction: "normal", cardiacAssessment: "normal", cancerScreening: "normal", infectionScreening: "normal" },
      imaging: { ctKidney: "ปกติ", renalAnatomy: "Normal anatomy", kidneySize: "ซ้าย 10.3 ซม. / ขวา 10.5 ซม." },
      psychological: { donationVoluntary: "n/a", mentalReadiness: "n/a", familyPressure: "n/a", socialSupport: "n/a" },
      stage: "completed", result: "suitable", note: "ผลประเมินทุกด้านผ่านเกณฑ์ อยู่ระหว่างกระบวนการจับคู่กับผู้ป่วยในบัญชีรอคิว",
    },
  ];

  // Donor Laboratory — ผลตรวจ Lab รายผู้บริจาค (key = donor id)
  // group: general (Lab Dashboard: Creatinine/eGFR/BUN/CBC/Blood Sugar/Urine Protein/ACR) / compatibility (ABO/HLA/Crossmatch/PRA) / infection (HIV/HBsAg/Anti-HCV)
  function buildDonorLabPanel(d) {
    return [
      { name: "Creatinine", value: d.creatinine, unit: "mg/dL", range: "0.6 - 1.3", status: d.creatinineStatus, group: "general" },
      { name: "eGFR", value: d.egfr, unit: "mL/min/1.73m²", range: "> 90", status: d.egfrStatus, group: "general" },
      { name: "BUN", value: d.bun, unit: "mg/dL", range: "7 - 20", status: d.bunStatus, group: "general" },
      { name: "CBC (Hb)", value: d.cbc, unit: "g/dL", range: "12 - 17", status: d.cbcStatus, group: "general" },
      { name: "Blood Sugar", value: d.bloodSugar, unit: "mg/dL", range: "70 - 100", status: d.bloodSugarStatus, group: "general" },
      { name: "Urine Protein", value: d.urineProtein, unit: "mg/dL", range: "< 30", status: d.urineProteinStatus, group: "general" },
      { name: "ACR", value: d.acr, unit: "mg/g", range: "< 30", status: d.acrStatus, group: "general" },
      { name: "ABO Blood Group", value: d.abo, unit: "", range: "-", status: "normal", group: "compatibility" },
      { name: "HLA Typing", value: d.hlaTyping, unit: "", range: "-", status: "normal", group: "compatibility" },
      { name: "Crossmatch", value: d.crossmatchVal, unit: "", range: "Negative", status: d.crossmatchStatus, group: "compatibility" },
      { name: "PRA", value: d.praVal, unit: "%", range: "< 10", status: d.praStatus, group: "compatibility" },
      { name: "HIV", value: d.hiv, unit: "", range: "Negative", status: d.infectionStatus, group: "infection" },
      { name: "HBsAg", value: d.hiv, unit: "", range: "Negative", status: d.infectionStatus, group: "infection" },
      { name: "Anti-HCV", value: d.hiv, unit: "", range: "Negative", status: d.infectionStatus, group: "infection" },
    ];
  }

  const donorLabPanels = {
    "DNR-5521": buildDonorLabPanel({ creatinine: 0.9, creatinineStatus: "normal", egfr: 95, egfrStatus: "normal", bun: 14, bunStatus: "normal", cbc: 14.2, cbcStatus: "normal", bloodSugar: 92, bloodSugarStatus: "normal", urineProtein: 8, urineProteinStatus: "normal", acr: 8, acrStatus: "normal", abo: "O+", hlaTyping: "A2,A24,B13,B60,DR4,DR15", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 4, praStatus: "normal", hiv: "Negative", infectionStatus: "normal" }),
    "DNR-5522": buildDonorLabPanel({ creatinine: 1.0, creatinineStatus: "normal", egfr: 98, egfrStatus: "normal", bun: 16, bunStatus: "normal", cbc: 12.8, cbcStatus: "normal", bloodSugar: 98, bloodSugarStatus: "normal", urineProtein: 14, urineProteinStatus: "normal", acr: 12, acrStatus: "normal", abo: "A+", hlaTyping: "A1,A2,B8,B44,DR3,DR7", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 2, praStatus: "normal", hiv: "Negative", infectionStatus: "normal" }),
    "DNR-5523": buildDonorLabPanel({ creatinine: 1.3, creatinineStatus: "high", egfr: 71, egfrStatus: "low", bun: 24, bunStatus: "high", cbc: 12.3, cbcStatus: "low", bloodSugar: 142, bloodSugarStatus: "high", urineProtein: 38, urineProteinStatus: "high", acr: 65, acrStatus: "high", abo: "B+", hlaTyping: "A3,A11,B7,B35,DR1,DR15", crossmatchVal: "Positive", crossmatchStatus: "high", praVal: 22, praStatus: "high", hiv: "Negative", infectionStatus: "normal" }),
    "DNR-5524": buildDonorLabPanel({ creatinine: 0.8, creatinineStatus: "normal", egfr: 110, egfrStatus: "normal", bun: 12, bunStatus: "normal", cbc: 13.5, cbcStatus: "normal", bloodSugar: 88, bloodSugarStatus: "normal", urineProtein: 6, urineProteinStatus: "normal", acr: 5, acrStatus: "normal", abo: "O-", hlaTyping: "A2,A26,B18,B60,DR4,DR13", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 6, praStatus: "normal", hiv: "Negative", infectionStatus: "normal" }),
    "DNR-5525": buildDonorLabPanel({ creatinine: 0.9, creatinineStatus: "normal", egfr: 101, egfrStatus: "normal", bun: 15, bunStatus: "normal", cbc: 14.8, cbcStatus: "normal", bloodSugar: 90, bloodSugarStatus: "normal", urineProtein: 10, urineProteinStatus: "normal", acr: 9, acrStatus: "normal", abo: "AB+", hlaTyping: "A24,A33,B44,B62,DR9,DR12", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 0, praStatus: "normal", hiv: "รอผลตรวจ", infectionStatus: "na" }),
    "DNR-5526": buildDonorLabPanel({ creatinine: 0.85, creatinineStatus: "normal", egfr: 100, egfrStatus: "normal", bun: 13, bunStatus: "normal", cbc: 13.0, cbcStatus: "normal", bloodSugar: 94, bloodSugarStatus: "normal", urineProtein: 9, urineProteinStatus: "normal", acr: 7, acrStatus: "normal", abo: "O+", hlaTyping: "A2,A3,B7,B44,DR7,DR11", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 3, praStatus: "normal", hiv: "Negative", infectionStatus: "normal" }),
    "DNR-5527": buildDonorLabPanel({ creatinine: 0.95, creatinineStatus: "normal", egfr: 92, egfrStatus: "normal", bun: 17, bunStatus: "normal", cbc: 14.0, cbcStatus: "normal", bloodSugar: 96, bloodSugarStatus: "normal", urineProtein: 11, urineProteinStatus: "normal", acr: 10, acrStatus: "normal", abo: "A-", hlaTyping: "A1,A24,B8,B60,DR3,DR4", crossmatchVal: "Negative", crossmatchStatus: "normal", praVal: 5, praStatus: "normal", hiv: "Negative", infectionStatus: "normal" }),
  };

  const donorLabTrend = {
    labels: ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"],
    creatinine: { "DNR-5521": [1.0, 0.95, 0.92, 0.9], "DNR-5522": [1.1, 1.05, 1.02, 1.0], "DNR-5523": [1.35, 1.3, 1.32, 1.3], "DNR-5524": [0.85, 0.82, 0.8, 0.8], "DNR-5525": [0.95, 0.92, 0.9, 0.9], "DNR-5526": [0.9, 0.88, 0.86, 0.85], "DNR-5527": [1.0, 0.98, 0.96, 0.95] },
    egfr: { "DNR-5521": [90, 92, 94, 95], "DNR-5522": [93, 95, 96, 98], "DNR-5523": [74, 73, 72, 71], "DNR-5524": [105, 107, 109, 110], "DNR-5525": [97, 99, 100, 101], "DNR-5526": [95, 97, 99, 100], "DNR-5527": [88, 90, 91, 92] },
  };

  // Donor Timeline — เหตุการณ์ตลอดวงจรชีวิตของผู้บริจาค (state: done / active / pending)
  const donorTimeline = {
    "DNR-5521": [
      { event: "Registered", date: "01 ก.ย. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "02 ก.ย. 2569", state: "done", desc: "ผ่านการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "03 ก.ย. 2569", state: "done", desc: "ตรวจ Lab ครบทุกรายการ" },
      { event: "HLA Tested", date: "03 ก.ย. 2569", state: "done", desc: "ตรวจ HLA Typing เรียบร้อย" },
      { event: "Evaluation Completed", date: "04 ก.ย. 2569", state: "done", desc: "ประเมินสุขภาพและสภาพจิตใจเสร็จสมบูรณ์" },
      { event: "Approved", date: "05 ก.ย. 2569", state: "done", desc: "คณะกรรมการอนุมัติผู้บริจาค" },
      { event: "Surgery", date: "รอกำหนดวันผ่าตัด", state: "active", desc: "รอนัดหมายวันผ่าตัดบริจาคไต" },
      { event: "Follow-up", date: "-", state: "pending", desc: "จะเริ่มติดตามหลังการผ่าตัด" },
    ],
    "DNR-5522": [
      { event: "Registered", date: "02 ก.ย. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "คาดว่าแล้วเสร็จ 09 ก.ย. 2569", state: "active", desc: "อยู่ระหว่างตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "-", state: "pending", desc: "" },
      { event: "HLA Tested", date: "-", state: "pending", desc: "" },
      { event: "Evaluation Completed", date: "-", state: "pending", desc: "" },
      { event: "Approved", date: "-", state: "pending", desc: "" },
      { event: "Surgery", date: "-", state: "pending", desc: "" },
      { event: "Follow-up", date: "-", state: "pending", desc: "" },
    ],
    "DNR-5523": [
      { event: "Registered", date: "28 ส.ค. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "29 ส.ค. 2569", state: "done", desc: "ผ่านการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "30 ส.ค. 2569", state: "done", desc: "ตรวจ Lab ครบทุกรายการ" },
      { event: "HLA Tested", date: "30 ส.ค. 2569", state: "done", desc: "ตรวจ HLA Typing เรียบร้อย" },
      { event: "Evaluation Completed", date: "31 ส.ค. 2569", state: "done", desc: "ประเมินสุขภาพและสภาพจิตใจเสร็จสมบูรณ์" },
      { event: "Rejected", date: "02 ก.ย. 2569", state: "done", color: "#dc2626", icon: "x-circle", desc: "คณะกรรมการปฏิเสธ เนื่องจากพบข้อบ่งชี้ทางการแพทย์ที่ไม่เหมาะสม" },
    ],
    "DNR-5524": [
      { event: "Registered", date: "12 ส.ค. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "13 ส.ค. 2569", state: "done", desc: "ผ่านการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "14 ส.ค. 2569", state: "done", desc: "ตรวจ Lab ครบทุกรายการ" },
      { event: "HLA Tested", date: "14 ส.ค. 2569", state: "done", desc: "ตรวจ HLA Typing เรียบร้อย" },
      { event: "Evaluation Completed", date: "16 ส.ค. 2569", state: "done", desc: "ประเมินสุขภาพและสภาพจิตใจเสร็จสมบูรณ์" },
      { event: "Approved", date: "18 ส.ค. 2569", state: "done", desc: "คณะกรรมการอนุมัติผู้บริจาค" },
      { event: "Surgery", date: "25 ส.ค. 2569", state: "done", desc: "ผ่าตัดบริจาคไตสำเร็จ" },
      { event: "Follow-up", date: "ติดตามต่อเนื่อง", state: "active", desc: "อยู่ระหว่างติดตามอาการหลังบริจาคตามมาตรฐาน" },
    ],
    "DNR-5525": [
      { event: "Registered", date: "08 ก.ย. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "นัดตรวจคัดกรองเบื้องต้น", state: "active", desc: "รอเริ่มกระบวนการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "-", state: "pending", desc: "" },
      { event: "HLA Tested", date: "-", state: "pending", desc: "" },
      { event: "Evaluation Completed", date: "-", state: "pending", desc: "" },
      { event: "Approved", date: "-", state: "pending", desc: "" },
      { event: "Surgery", date: "-", state: "pending", desc: "" },
      { event: "Follow-up", date: "-", state: "pending", desc: "" },
    ],
    "DNR-5526": [
      { event: "Registered", date: "28 ส.ค. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "30 ส.ค. 2569", state: "done", desc: "ผ่านการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "02 ก.ย. 2569", state: "done", desc: "ตรวจ Lab ครบทุกรายการ" },
      { event: "HLA Tested", date: "02 ก.ย. 2569", state: "done", desc: "ตรวจ HLA Typing เรียบร้อย" },
      { event: "Evaluation Completed", date: "อยู่ระหว่างประเมิน", state: "active", desc: "อยู่ระหว่างการประเมินสุขภาพและสภาพจิตใจ" },
      { event: "Approved", date: "-", state: "pending", desc: "" },
      { event: "Surgery", date: "-", state: "pending", desc: "" },
      { event: "Follow-up", date: "-", state: "pending", desc: "" },
    ],
    "DNR-5527": [
      { event: "Registered", date: "04 ก.ย. 2569", state: "done", desc: "ลงทะเบียนผู้บริจาคในระบบ" },
      { event: "Screening Completed", date: "04 ก.ย. 2569", state: "done", desc: "ผ่านการตรวจคัดกรองเบื้องต้น" },
      { event: "Lab Completed", date: "05 ก.ย. 2569", state: "done", desc: "ตรวจ Lab ครบทุกรายการ" },
      { event: "HLA Tested", date: "05 ก.ย. 2569", state: "done", desc: "ตรวจ HLA Typing เรียบร้อย" },
      { event: "Evaluation Completed", date: "06 ก.ย. 2569", state: "done", desc: "ประเมินสุขภาพเสร็จสมบูรณ์ ผ่านเกณฑ์" },
      { event: "Approved", date: "อยู่ระหว่างจับคู่", state: "active", desc: "อยู่ระหว่างกระบวนการจับคู่กับผู้ป่วยในบัญชีรอคิว รอผลอนุมัติ" },
      { event: "Surgery", date: "-", state: "pending", desc: "" },
      { event: "Follow-up", date: "-", state: "pending", desc: "" },
    ],
  };

  // Donor Assessment — สรุปผลความเหมาะสมโดยรวมของผู้บริจาค (อิสระจากการจับคู่ผู้ป่วยรายบุคคล)
  const donorAssessments = [
    { donorId: "DNR-5521", date: "05 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน", result: "suitable", reasons: [], note: "ผลประเมินทุกด้านผ่านเกณฑ์ เหมาะสมเป็นผู้บริจาคไต" },
    { donorId: "DNR-5522", date: "06 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน", result: "risk", reasons: ["ความดันโลหิตสูง"], note: "ควบคุมความดันโลหิตได้ดีด้วยยา แต่ต้องเฝ้าระวังเพิ่มเติมระหว่างและหลังผ่าตัด" },
    { donorId: "DNR-5523", date: "02 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน", result: "not-suitable", reasons: ["Positive Crossmatch", "เบาหวานชนิดที่ 2", "eGFR ต่ำกว่าเกณฑ์"], note: "พบข้อบ่งชี้ทางการแพทย์หลายด้านที่ไม่เหมาะสมสำหรับการบริจาค" },
    { donorId: "DNR-5524", date: "18 ส.ค. 2569", doctor: "นพ.ธนกร วัฒนสิน", result: "suitable", reasons: [], note: "เหมาะสมเป็นผู้บริจาคไต ดำเนินการผ่าตัดสำเร็จแล้ว" },
  ];

  // Donor Follow-up — ติดตามอาการผู้บริจาคหลังผ่าตัดตามช่วงเวลามาตรฐาน (2 สัปดาห์ / 1 เดือน / 6 เดือน / 1 ปี)
  const donorFollowups = [
    { donorId: "DNR-5524", visit: "Post Surgery Visit (2 สัปดาห์หลังบริจาค)", date: "01 ก.ย. 2569", creatinine: 1.0, egfr: 88, bp: "120/78 mmHg", medication: "Prednisolone + ยาแก้ปวดตามแพทย์สั่ง", qualityOfLife: "ดี (ทำกิจวัตรประจำวันได้ตามปกติ)", complication: "ไม่มี", note: "แผลผ่าตัดหายดี ไม่มีภาวะแทรกซ้อน กลับไปใช้ชีวิตประจำวันได้ตามปกติ", by: "นพ.ธนกร วัฒนสิน", state: "done" },
    { donorId: "DNR-5524", visit: "1 เดือนหลังบริจาค", date: "18 ก.ย. 2569", creatinine: 1.1, egfr: 85, bp: "118/76 mmHg", medication: "หยุดยาแก้ปวด เหลือเฝ้าระวังทั่วไป", qualityOfLife: "ดีมาก (กลับไปทำงานได้เต็มที่)", complication: "ไม่มี", note: "สุขภาพแข็งแรงดี กลับไปทำงานได้ตามปกติ", by: "นพ.ธนกร วัฒนสิน", state: "done" },
    { donorId: "DNR-5524", visit: "6 เดือนหลังบริจาค", date: "18 ก.พ. 2570", creatinine: null, egfr: null, bp: "", medication: "", qualityOfLife: "", complication: "", note: "นัดตรวจติดตามการทำงานของไตที่เหลือและตรวจสุขภาพทั่วไป", by: "นพ.ธนกร วัฒนสิน", state: "active" },
    { donorId: "DNR-5524", visit: "1 ปีหลังบริจาค", date: "18 ส.ค. 2570", creatinine: null, egfr: null, bp: "", medication: "", qualityOfLife: "", complication: "", note: "นัดตรวจติดตามระยะยาวตามมาตรฐานการดูแลผู้บริจาคไต", by: "นพ.ธนกร วัฒนสิน", state: "pending" },
  ];

  // Matching Results — เชื่อม donor (donorId) กับผู้ป่วยในบัญชีรอคิว (patientHn)
  const matchingResults = [
    { donorId: "DNR-5521", patientHn: "HN-990211", bloodCompat: true, hla: "5/6 Match", crossmatch: "Negative", pra: "4%", coldIschemic: "6 ชม. 20 นาที", score: 92, status: "passed", date: "07 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน" },
    { donorId: "DNR-5521", patientHn: "HN-990212", bloodCompat: false, hla: "2/6 Match", crossmatch: "Positive", pra: "34%", coldIschemic: "9 ชม. 40 นาที", score: 38, status: "rejected", date: "06 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน" },
    { donorId: "DNR-5521", patientHn: "HN-990213", bloodCompat: true, hla: "4/6 Match", crossmatch: "Negative", pra: "8%", coldIschemic: "7 ชม. 05 นาที", score: 81, status: "passed", date: "05 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน" },
    { donorId: "DNR-5521", patientHn: "HN-990214", bloodCompat: true, hla: "6/6 Match", crossmatch: "Negative", pra: "2%", coldIschemic: "5 ชม. 50 นาที", score: 97, status: "accepted", date: "04 ก.ย. 2569", doctor: "นพ.ธนกร วัฒนสิน" },
  ];

  // Suitability Assessment — ประวัติผลการประเมินความเหมาะสม
  const suitabilityAssessments = [
    { donorId: "DNR-5521", patientHn: "HN-990214", result: "suitable", reasons: [], note: "ผลตรวจทุกด้านอยู่ในเกณฑ์ดี เหมาะสมสำหรับการปลูกถ่าย", doctor: "นพ.ธนกร วัฒนสิน", date: "04 ก.ย. 2569" },
    { donorId: "DNR-5521", patientHn: "HN-990212", result: "not-suitable", reasons: ["Positive Crossmatch", "HLA Failure"], note: "พบ Crossmatch Positive และ HLA ไม่เข้ากัน ไม่แนะนำให้ปลูกถ่าย", doctor: "นพ.ธนกร วัฒนสิน", date: "06 ก.ย. 2569" },
  ];

  const auditLogs = [
    { user: "นพ.ธนกร วัฒนสิน", role: "แพทย์", action: "แก้ไขแผนการให้ยา HN-102345", datetime: "09 ก.ย. 2569 09:12", ip: "10.20.14.101" },
    { user: "พว.สุพัตรา เจริญพร", role: "พยาบาล", action: "บันทึกผลการติดตามทางโทรศัพท์ HN-102350", datetime: "09 ก.ย. 2569 08:47", ip: "10.20.14.118" },
    { user: "นพ.ธนกร วัฒนสิน", role: "แพทย์", action: "อนุมัติผล Matching Donor DNR-5521", datetime: "08 ก.ย. 2569 16:03", ip: "10.20.14.101" },
    { user: "admin.system", role: "ผู้ดูแลระบบ", action: "สำรองข้อมูลระบบประจำวัน", datetime: "08 ก.ย. 2569 02:00", ip: "10.20.10.5" },
    { user: "พว.สุพัตรา เจริญพร", role: "พยาบาล", action: "เพิ่มนัดหมายใหม่ HN-102348", datetime: "07 ก.ย. 2569 14:22", ip: "10.20.14.118" },
    { user: "นพ.ธนกร วัฒนสิน", role: "แพทย์", action: "เข้าสู่ระบบ", datetime: "07 ก.ย. 2569 08:01", ip: "10.20.14.101" },
  ];

  const questionnaireStatus = [
    { name: "นายสมชาย ใจดี", hn: "HN-102345", date: "07 ก.ย. 2569", status: "completed", risk: "low", symptoms: [] },
    { name: "นางสมหญิง แสงทอง", hn: "HN-102346", date: "06 ก.ย. 2569", status: "pending", risk: "medium", symptoms: [] },
    { name: "นายประเสริฐ มั่นคง", hn: "HN-102347", date: "09 ก.ย. 2569", status: "highrisk", risk: "high", symptoms: ["มีไข้", "บวม"] },
    { name: "นางสาวกัลยา รุ่งเรือง", hn: "HN-102348", date: "05 ก.ย. 2569", status: "completed", risk: "low", symptoms: [] },
    { name: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", date: "08 ก.ย. 2569", status: "pending", risk: "high", symptoms: [] },
    { name: "นายสุรชัย พิทักษ์กุล", hn: "HN-102353", date: "09 ก.ย. 2569", status: "highrisk", risk: "high", symptoms: ["ปัสสาวะลดลง", "น้ำหนักเพิ่ม", "บวม"] },
  ];

  // Today Task Queue สำหรับ Nurse Dashboard
  const nurseTasks = [
    { time: "08:30", patient: "นายสมชาย ใจดี", hn: "HN-102345", task: "โทรติดตามอาการหลังปลูกถ่าย", priority: "high", status: "pending" },
    { time: "09:00", patient: "นางพรทิพย์ อยู่เย็น", hn: "HN-102350", task: "ติดตามอาการบวม แจ้งนัดด่วน", priority: "urgent", status: "pending" },
    { time: "10:30", patient: "นายประเสริฐ มั่นคง", hn: "HN-102347", task: "ติดตามแบบสอบถามความเสี่ยงสูง", priority: "urgent", status: "pending" },
    { time: "11:00", patient: "นางสมหญิง แสงทอง", hn: "HN-102346", task: "เตือนตอบแบบสอบถามอาการ", priority: "medium", status: "pending" },
    { time: "13:30", patient: "นายสุรชัย พิทักษ์กุล", hn: "HN-102353", task: "แจ้งผลตรวจ Tacrolimus ต่ำกว่าเกณฑ์", priority: "urgent", status: "pending" },
    { time: "14:00", patient: "นางสาวกัลยา รุ่งเรือง", hn: "HN-102348", task: "ยืนยันนัดหมายวันพรุ่งนี้ทาง LINE", priority: "low", status: "done" },
    { time: "15:00", patient: "นายวิชัย ศรีสุข", hn: "HN-102349", task: "ติดตามความร่วมมือการใช้ยา", priority: "medium", status: "pending" },
  ];

  const followupHistory = [
    { date: "07 ก.ย. 2569", type: "โทรศัพท์", result: "ติดต่อสำเร็จ", note: "แจ้งผล Lab และให้คำแนะนำการกินยา", by: "พว.สุพัตรา เจริญพร" },
    { date: "24 ส.ค. 2569", type: "LINE", result: "ให้คำแนะนำ", note: "สอบถามอาการบวม แนะนำจำกัดโซเดียม", by: "พว.สุพัตรา เจริญพร" },
    { date: "10 ส.ค. 2569", type: "นัดหมาย", result: "เลื่อนนัด", note: "ผู้ป่วยติดธุระ เลื่อนเป็น 16 ก.ย. 2569", by: "พว.สุพัตรา เจริญพร" },
    { date: "28 ก.ค. 2569", type: "โทรศัพท์", result: "ไม่รับสาย", note: "โทรติดตาม 3 ครั้ง ไม่สามารถติดต่อได้", by: "พว.สุพัตรา เจริญพร" },
  ];

  const notifications = [
    { title: "Creatinine สูงผิดปกติ", desc: "นายสุรชัย พิทักษ์กุล (HN-102353) ค่า Creatinine 2.8 mg/dL", time: "2 ชม.ที่แล้ว", type: "danger" },
    { title: "ผู้ป่วยผิดนัด", desc: "นางพรทิพย์ อยู่เย็น (HN-102350) ไม่มาตามนัด 10 ก.ย. 2569", time: "5 ชม.ที่แล้ว", type: "warning" },
    { title: "Matching ใหม่", desc: "พบ Donor ที่เข้ากันได้กับผู้ป่วยรอคิว HN-990214", time: "1 วันที่แล้ว", type: "info" },
    { title: "แบบสอบถามความเสี่ยงสูง", desc: "นายประเสริฐ มั่นคง (HN-102347) ตอบแบบสอบถามพบความเสี่ยงสูง", time: "1 วันที่แล้ว", type: "danger" },
  ];

  const chatThreads = [
    { hn: "HN-102345", name: "นายสมชาย ใจดี", lastMsg: "ขอบคุณครับคุณหมอ วันนี้จะไปตรวจตามนัดครับ", time: "09:32", unread: 0, status: "online" },
    { hn: "HN-102350", name: "นางพรทิพย์ อยู่เย็น", lastMsg: "รู้สึกบวมที่ขาทั้งสองข้างค่ะ ควรทำอย่างไรดี", time: "08:15", unread: 2, status: "urgent" },
    { hn: "HN-102347", name: "นายประเสริฐ มั่นคง", lastMsg: "ส่งรูปแผลผ่าตัดให้แล้วนะครับ", time: "เมื่อวาน", unread: 1, status: "waiting" },
    { hn: "HN-102348", name: "นางสาวกัลยา รุ่งเรือง", lastMsg: "พรุ่งนี้เลื่อนนัดได้ไหมคะ", time: "เมื่อวาน", unread: 0, status: "online" },
  ];

  // Patient Treatment Timeline (LIFF) — เรียงจากเก่าไปใหม่
  const timelineEvents = [
    { date: "18 ม.ค. 2566", icon: "heart-pulse", color: "#2563eb", title: "ปลูกถ่ายไต", desc: "ผ่าตัดปลูกถ่ายไตสำเร็จ จากญาติผู้บริจาค (Living Related) เริ่มยากดภูมิคุ้มกัน", state: "done" },
    { date: "25 ม.ค. 2566", icon: "bed", color: "#dc2626", title: "Admission เฝ้าระวังหลังผ่าตัด", desc: "นอนโรงพยาบาลเฝ้าระวังภาวะแทรกซ้อน 7 วันหลังผ่าตัด อาการคงที่ ให้กลับบ้านได้", state: "done" },
    { date: "15 มี.ค. 2566", icon: "pill", color: "#0f766e", title: "ปรับลดยา Tacrolimus", desc: "ปรับลดขนาดยาจาก 3 mg เหลือ 2.5 mg ตามผลตรวจระดับยาในเลือด", state: "done" },
    { date: "20 ก.ค. 2566", icon: "flask-conical", color: "#7c3aed", title: "ตรวจ Lab ติดตามผล", desc: "ผลไตทำงานเป็นปกติ ปรับลดยา Tacrolimus เหลือ 2 mg", state: "done" },
    { date: "10 ส.ค. 2568", icon: "calendar-check", color: "#2563eb", title: "OPD ติดตามอาการ", desc: "พบแพทย์ตามนัด อาการโดยรวมปกติดี แนะนำควบคุมอาหารโซเดียมต่ำ", state: "done" },
    { date: "02 ก.ย. 2569", icon: "flask-conical", color: "#7c3aed", title: "ตรวจ Lab ประจำเดือน", desc: "ค่า Creatinine 1.1 mg/dL, eGFR 78 อยู่ในเกณฑ์ปกติ", state: "done" },
    { date: "16 ก.ย. 2569", icon: "stethoscope", color: "#0f766e", title: "OPD ติดตามล่าสุด", desc: "นัดติดตามหลังปลูกถ่ายไตครั้งถัดไป กับ นพ.ธนกร วัฒนสิน", state: "active" },
  ];

  // Symptom Screening Questionnaire (LIFF)
  const symptomQuestions = [
    { key: "fever", icon: "thermometer", text: "วันนี้มีไข้หรือไม่?" },
    { key: "urine", icon: "droplet", text: "สังเกตว่าปัสสาวะลดลงหรือไม่?" },
    { key: "weight", icon: "scale", text: "น้ำหนักตัวเพิ่มขึ้นผิดปกติหรือไม่?" },
    { key: "swelling", icon: "activity", text: "มีอาการบวมตามร่างกายหรือไม่?" },
    { key: "woundPain", icon: "bandage", text: "มีอาการปวดแผลผ่าตัดหรือไม่?" },
    { key: "cough", icon: "wind", text: "มีอาการไอหรือไม่?" },
    { key: "fatigue", icon: "battery-low", text: "รู้สึกเหนื่อยง่ายผิดปกติหรือไม่?" },
  ];

  const knowledgeArticles = [
    { id: "kb-1", title: "การดูแลตนเองหลังปลูกถ่ายไต", cover: "🩺", summary: "แนวทางปฏิบัติตัวช่วง 3 เดือนแรกหลังผ่าตัด", category: "การดูแลทั่วไป" },
    { id: "kb-2", title: "วิธีกินยากดภูมิคุ้มกันให้ถูกต้อง", cover: "💊", summary: "ความสำคัญของการกินยาตรงเวลาทุกวัน", category: "ยา" },
    { id: "kb-3", title: "อาหารที่เหมาะสมสำหรับผู้ป่วยปลูกถ่ายไต", cover: "🥗", summary: "โซเดียมต่ำ โปรตีนพอดี หลีกเลี่ยงเกรปฟรุต", category: "โภชนาการ" },
    { id: "kb-4", title: "การออกกำลังกายหลังปลูกถ่ายไต", cover: "🚶", summary: "เริ่มต้นอย่างปลอดภัยและค่อยเป็นค่อยไป", category: "การออกกำลังกาย" },
    { id: "kb-5", title: "สัญญาณอันตรายที่ต้องรีบพบแพทย์", cover: "🚨", summary: "ไข้ ปัสสาวะลดลง บวม เหนื่อยง่ายผิดปกติ", category: "อาการอันตราย" },
  ];

  return {
    staff, patients, primaryPatient, labTrend, labParams, medications, doseHistory,
    compliance, appointments, alerts, waitingList, donors, matchingResults, suitabilityAssessments, auditLogs,
    questionnaireStatus, followupHistory, nurseTasks, notifications, chatThreads, knowledgeArticles,
    timelineEvents, symptomQuestions,
    donorEvaluations, donorLabPanels, donorLabTrend, donorAssessments, donorFollowups, donorTimeline,
  };
})();
