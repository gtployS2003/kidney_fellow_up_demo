/** มาสคอตไตคู่ (เวอร์ชันโค้ด · อ้างอิงดีไซน์ใน Figma) */
export function Mascot({ size = 120 }: { size?: number }) {
  const kidney = (x: number, flip = false) => (
    <g transform={`translate(${x} 8)${flip ? ' scale(-1 1) translate(-48 0)' : ''}`}>
      <path d="M24 2C10 2 2 16 2 34s10 34 24 34c9 0 14-7 14-14 0-6-5-9-5-16s6-10 6-17C41 10 36 2 24 2Z" fill="#fda4af" />
      <path d="M8 46c3 12 10 20 18 20 6 0 11-4 12-10-8 6-20 2-30-10Z" fill="#e11d48" opacity=".55" />
      <ellipse cx="16" cy="18" rx="5" ry="3" fill="#fff" opacity=".7" transform="rotate(-25 16 18)" />
      <circle cx="16" cy="32" r="4.5" fill="#fff" />
      <circle cx="28" cy="32" r="4.5" fill="#fff" />
      <circle cx="17" cy="33" r="2.3" fill="#334155" />
      <circle cx="29" cy="33" r="2.3" fill="#334155" />
      <path d="M15 42c4 5 11 5 15 0" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="11" cy="39" r="2.5" fill="#fb7185" opacity=".6" />
      <circle cx="33" cy="39" r="2.5" fill="#fb7185" opacity=".6" />
      <path d="M16 70v14M30 70v14" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={size} height={(size * 100) / 120} viewBox="0 0 120 100" aria-hidden>
      <ellipse cx="34" cy="95" rx="16" ry="3" fill="#1e3a8a" opacity=".12" />
      <ellipse cx="86" cy="95" rx="16" ry="3" fill="#1e3a8a" opacity=".12" />
      {kidney(10)}
      {kidney(62, true)}
      <path d="M48 52c6 6 14 6 22 0" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
