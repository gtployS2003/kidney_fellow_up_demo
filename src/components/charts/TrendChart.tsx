import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * กราฟแนวโน้มแบบ SVG (ไม่ใช้ไลบรารีเพิ่ม) — ใช้ทั้งหน้างานและ LINE OA
 * แกน x เป็นตัวเลข (เช่น timestamp หรือ index) · รองรับช่วงปกติ/ช่วงเป้า · เส้นเหตุการณ์ · แกนที่สอง · ผลแบบระดับ (ordinal)
 */
export interface TrendPoint {
  x: number;
  y: number | null;
  /** ค่านอกช่วง → จุดสีส้ม */
  flag?: boolean;
  /** จุดกลวงเส้นประ (เช่น ไม่ใช่ trough) */
  hollow?: boolean;
  label?: string;
}
export interface TrendBand {
  x0?: number;
  x1?: number;
  lo: number;
  hi: number | null;
  color: string;
  opacity?: number;
}
export interface TrendMarker {
  x: number;
  color: string;
  label?: string;
  dashed?: boolean;
}
export interface TrendShade {
  x0: number;
  x1: number;
  color: string;
  label?: string;
}
export interface TrendSeries {
  points: TrendPoint[];
  color: string;
  dashed?: boolean;
  shape?: 'circle' | 'diamond';
  step?: boolean;
  width?: number;
  fill?: string;
  /** แสดงจุดทุกจุด (ค่าเริ่มต้น true) */
  dots?: boolean;
}

interface Props {
  series: TrendSeries;
  /** แกนที่สอง (ขวา) */
  secondary?: TrendSeries & { domain: [number, number]; ticks?: number[]; unit?: string };
  xDomain: [number, number];
  yDomain?: [number, number];
  height: number;
  bands?: TrendBand[];
  markers?: TrendMarker[];
  shades?: TrendShade[];
  xTicks?: { x: number; label: string }[];
  yTicks?: number[];
  yUnit?: string;
  ordinal?: string[];
  /** แสดงค่าบนจุดล่าสุด */
  lastLabel?: string;
  tooltip?: (i: number) => ReactNode;
  pad?: { l?: number; r?: number; t?: number; b?: number };
  className?: string;
}

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver((e) => setW(Math.round(e[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** ขอบเขตแกน y อัตโนมัติ (รวมช่วงปกติ + เผื่อขอบ 12%) */
export function autoDomain(values: (number | null)[], lo?: number, hi?: number | null): [number, number] {
  const vs = values.filter((v): v is number => v !== null);
  let mn = Math.min(...vs, lo ?? Infinity);
  let mx = Math.max(...vs, hi ?? lo ?? -Infinity);
  if (!Number.isFinite(mn) || !Number.isFinite(mx)) return [0, 1];
  if (hi === null && lo !== undefined) mx = Math.max(mx, lo * 1.35);
  const pad = (mx - mn) * 0.12 || Math.abs(mx) * 0.1 || 1;
  mn -= pad;
  mx += pad;
  if (Math.min(...vs) >= 0 && mn < 0) mn = 0;
  return [mn, mx];
}

export function TrendChart({ series, secondary, xDomain, yDomain, height, bands = [], markers = [], shades = [], xTicks = [], yTicks, yUnit, ordinal, lastLabel, tooltip, pad, className }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pl = pad?.l ?? (yTicks || ordinal ? 34 : 6);
  const pr = pad?.r ?? (secondary ? 36 : 8);
  const pt = pad?.t ?? (markers.some((m) => m.label) ? 22 : 8);
  const pb = pad?.b ?? (xTicks.length ? 20 : 6);
  const W = Math.max(width, 120);
  const H = height;
  const yd = useMemo<[number, number]>(() => yDomain ?? (ordinal ? [-0.5, ordinal.length - 0.5] : autoDomain(series.points.map((p) => p.y))), [yDomain, ordinal, series.points]);
  const X = (x: number) => pl + ((x - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) * (W - pl - pr);
  const Ymk = (d: [number, number]) => (y: number) => pt + (1 - (y - d[0]) / (d[1] - d[0] || 1)) * (H - pt - pb);
  const Y = Ymk(yd);
  const Y2 = secondary ? Ymk(secondary.domain) : Y;
  const clampY = (y: number) => Math.min(H - pb, Math.max(pt, y));

  const pathOf = (s: TrendSeries, y: (v: number) => number) => {
    const pts = s.points.filter((p) => p.y !== null);
    if (!pts.length) return '';
    return pts
      .map((p, i) => {
        const px = X(p.x).toFixed(1);
        const py = y(p.y as number).toFixed(1);
        if (i === 0) return `M${px} ${py}`;
        return s.step ? `H${px} V${py}` : `L${px} ${py}`;
      })
      .join(' ');
  };
  const dots = (s: TrendSeries, y: (v: number) => number, key: string) =>
    s.dots === false
      ? null
      : s.points.map((p, i) => {
          if (p.y === null) return null;
          const last = i === s.points.length - 1 || s.points.slice(i + 1).every((q) => q.y === null);
          const c = p.flag ? '#ea580c' : s.color;
          const cx = X(p.x);
          const cy = y(p.y);
          const r = last ? 5 : 3.2;
          if (s.shape === 'diamond') return <rect key={key + i} x={cx - 3.6} y={cy - 3.6} width={7.2} height={7.2} transform={`rotate(45 ${cx} ${cy})`} fill={c} />;
          return <circle key={key + i} cx={cx} cy={cy} r={r} fill={last && !p.hollow ? c : '#fff'} stroke={c} strokeWidth={last ? 2.2 : 1.8} strokeDasharray={p.hollow ? '2 2' : undefined} />;
        });

  const ticksY = ordinal ? ordinal.map((_, i) => i) : yTicks;
  const xs = series.points.map((p) => p.x);
  const onMove = (e: { clientX: number; currentTarget: { getBoundingClientRect: () => DOMRect } }) => {
    if (!tooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let best = -1;
    let bd = Infinity;
    series.points.forEach((p, i) => {
      if (p.y === null && !secondary?.points[i]) return;
      const d = Math.abs(X(p.x) - mx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    setHover(best >= 0 && bd < 40 ? best : null);
  };
  const lastPt = [...series.points].reverse().find((p) => p.y !== null);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', height: H }} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} style={{ display: 'block', overflow: 'visible' }}>
          {(ticksY ?? [yd[0] + (yd[1] - yd[0]) * 0.1, yd[0] + (yd[1] - yd[0]) * 0.5, yd[0] + (yd[1] - yd[0]) * 0.9]).map((v, i) => (
            <line key={'g' + i} x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} stroke="#eef2f7" />
          ))}
          {shades.map((s, i) => (
            <rect key={'s' + i} x={X(s.x0)} y={pt} width={Math.max(0, X(s.x1) - X(s.x0))} height={H - pt - pb} fill={s.color} />
          ))}
          {bands.map((b, i) => {
            const top = b.hi === null ? pt : clampY(Y(b.hi));
            const bot = clampY(Y(b.lo));
            const x0 = X(b.x0 ?? xDomain[0]);
            const x1 = X(b.x1 ?? xDomain[1]);
            return <rect key={'b' + i} x={x0} y={top} width={Math.max(0, x1 - x0)} height={Math.max(0, bot - top)} fill={b.color} opacity={b.opacity ?? 1} />;
          })}
          {markers.map((m, i) => (
            <line key={'m' + i} x1={X(m.x)} x2={X(m.x)} y1={pt - (m.label ? 6 : 0)} y2={H - pb} stroke={m.color} strokeWidth={1.2} strokeDasharray={m.dashed === false ? undefined : '4 3'} />
          ))}
          {series.fill && <path d={`${pathOf(series, Y)} V${H - pb} H${X(series.points.find((p) => p.y !== null)?.x ?? 0)} Z`} fill={series.fill} />}
          {secondary && <path d={pathOf(secondary, Y2)} fill="none" stroke={secondary.color} strokeWidth={secondary.width ?? 2} strokeDasharray={secondary.dashed ? '6 4' : undefined} strokeLinejoin="round" />}
          <path d={pathOf(series, Y)} fill="none" stroke={series.color} strokeWidth={series.width ?? 2.2} strokeDasharray={series.dashed ? '6 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
          {secondary && dots(secondary, Y2, 'd2')}
          {dots(series, Y, 'd1')}
          {hover !== null && <line x1={X(xs[hover])} x2={X(xs[hover])} y1={pt} y2={H - pb} stroke="#94a3b8" />}
          {ticksY?.map((v, i) => (
            <text key={'ty' + i} x={pl - 6} y={Y(v) + 3.5} textAnchor="end" fontSize={10.5} fill="#94a3b8">
              {ordinal ? ordinal[v] : Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          ))}
          {yUnit && (
            <text x={0} y={10} fontSize={10.5} fontWeight={600} fill={series.color}>
              {yUnit}
            </text>
          )}
          {secondary?.ticks?.map((v, i) => (
            <text key={'t2' + i} x={W - pr + 6} y={Y2(v) + 3.5} fontSize={10.5} fill={secondary.color}>
              {v}
            </text>
          ))}
          {secondary?.unit && (
            <text x={W} y={10} textAnchor="end" fontSize={10.5} fontWeight={600} fill={secondary.color}>
              {secondary.unit}
            </text>
          )}
          {xTicks.map((t, i) => (
            <text key={'tx' + i} x={Math.min(W - pr - 8, Math.max(pl + 8, X(t.x)))} y={H - 4} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
              {t.label}
            </text>
          ))}
          {lastLabel && lastPt && (
            <g>
              <rect x={X(lastPt.x) - 18} y={Y(lastPt.y as number) - 30} width={36} height={19} rx={6} fill="#1e3a8a" />
              <text x={X(lastPt.x)} y={Y(lastPt.y as number) - 17} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                {lastLabel}
              </text>
            </g>
          )}
        </svg>
      )}
      {width > 0 &&
        markers
          .filter((m) => m.label)
          .map((m, i) => (
            <span key={'ml' + i} className="pointer-events-none absolute top-0 whitespace-nowrap rounded-md px-1.5 py-px text-[10.5px] font-semibold" style={{ left: Math.min(W - 90, Math.max(0, X(m.x) - 30)), background: m.color + '22', color: m.color }}>
              {m.label}
            </span>
          ))}
      {width > 0 &&
        shades
          .filter((s) => s.label)
          .map((s, i) => (
            <span key={'sl' + i} className="pointer-events-none absolute whitespace-nowrap rounded-md bg-amber-200/80 px-1.5 py-px text-[10.5px] font-semibold text-amber-900" style={{ left: X(s.x0) + 2, top: pt + 4 }}>
              {s.label}
            </span>
          ))}
      {hover !== null && tooltip && (
        <div className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 px-2.5 py-2 text-[11.5px] text-slate-100 shadow-lg" style={{ left: Math.min(W - 190, Math.max(0, X(xs[hover]) + 10)), top: pt + 8 }}>
          {tooltip(hover)}
        </div>
      )}
    </div>
  );
}

/** กราฟจิ๋ว (sparkline) */
export function Sparkline({ values, color, width = 64, height = 22 }: { values: number[]; color: string; width?: number; height?: number }) {
  if (values.length < 2) return <span className="inline-block text-slate-300" style={{ width }}>—</span>;
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const pts = values.map((v, i) => [2 + (i * (width - 6)) / (values.length - 1), height - 3 - ((v - mn) / (mx - mn || 1)) * (height - 6)]);
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}
