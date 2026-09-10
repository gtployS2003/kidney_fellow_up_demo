/**
 * Charts — Factory functions สร้าง Chart.js ตาม theme สีของระบบ (ต้องโหลด Chart.js ก่อนใช้)
 */
window.Charts = (function () {
  const COLORS = {
    primary: "#2563eb",
    primarySoft: "rgba(37,99,235,.12)",
    teal: "#0f766e",
    tealSoft: "rgba(15,118,110,.12)",
    amber: "#d97706",
    amberSoft: "rgba(217,119,6,.12)",
    red: "#dc2626",
    redSoft: "rgba(220,38,38,.12)",
    slate: "#94a3b8",
  };

  const baseFont = { family: "'Segoe UI', Arial, sans-serif", size: 11 };
  const tooltipBase = { backgroundColor: "#0f172a", padding: 12, cornerRadius: 10, titleFont: { ...baseFont, weight: "700" }, bodyFont: baseFont, boxPadding: 4, displayColors: true };

  // สร้าง canvas gradient สำหรับพื้นที่ใต้เส้นกราฟ (โทนสีเดียวกับเส้น ไล่จางลง)
  function areaGradient(ctx, chartArea, hexColor) {
    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    const rgb = hexColor.match(/\w\w/g).map((h) => parseInt(h, 16));
    g.addColorStop(0, `rgba(${rgb.join(",")},.28)`);
    g.addColorStop(1, `rgba(${rgb.join(",")},0)`);
    return g;
  }

  function lineChart(ctx, { labels, datasets }) {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.fill
            ? (context) => {
                const { chart } = context;
                const { ctx: c, chartArea } = chart;
                if (!chartArea) return d.fillColor || "transparent";
                return areaGradient(c, chartArea, d.color.replace("#", ""));
              }
            : "transparent",
          fill: !!d.fill,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderColor: d.color,
          pointBorderWidth: 2,
          borderWidth: 3,
          cubicInterpolationMode: "monotone",
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: datasets.length > 1, position: "bottom", labels: { font: baseFont, boxWidth: 10, usePointStyle: true, padding: 16 } },
          tooltip: tooltipBase,
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: baseFont, color: "#94a3b8" }, border: { display: false } },
          y: { grid: { color: "#f1f5f9" }, ticks: { font: baseFont, color: "#94a3b8" }, border: { display: false } },
        },
      },
    });
  }

  function barChart(ctx, { labels, data, color }) {
    return new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ data, backgroundColor: color || COLORS.primary, borderRadius: 10, borderSkipped: false, maxBarThickness: 32, hoverBackgroundColor: color || COLORS.primary }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tooltipBase },
        scales: {
          x: { grid: { display: false }, ticks: { font: baseFont, color: "#94a3b8" }, border: { display: false } },
          y: { grid: { color: "#f1f5f9" }, ticks: { font: baseFont, color: "#94a3b8" }, border: { display: false } },
        },
      },
    });
  }

  function doughnutChart(ctx, { labels, data, colors }) {
    return new Chart(ctx, {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 3, borderColor: "#fff", hoverOffset: 8, spacing: 2 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: { position: "bottom", labels: { font: baseFont, boxWidth: 10, usePointStyle: true, padding: 14 } },
          tooltip: tooltipBase,
        },
      },
    });
  }

  return { COLORS, lineChart, barChart, doughnutChart };
})();
