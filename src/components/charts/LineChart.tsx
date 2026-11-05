import { motion } from 'framer-motion';

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
  /** จุดที่เกินค่านี้แสดงเป็นสีส้ม */
  limit?: number;
}

/** กราฟเส้นแบบเบา (SVG) · ปรับขนาดตามกล่อง */
export function LineChart({ series, labels, min, max, height = 180, limit, limitLabel }: { series: LineSeries[]; labels: string[]; min: number; max: number; height?: number; limit?: number; limitLabel?: string }) {
  const W = 700;
  const H = height;
  const pl = 34;
  const n = Math.max(1, (series[0]?.values.length ?? 1) - 1);
  const x = (i: number) => pl + (i * (W - pl - 8)) / n;
  const y = (v: number) => 8 + (1 - (v - min) / (max - min)) * (H - 28);
  const grid = [0, 1, 2, 3, 4].map((g) => min + ((max - min) * g) / 4);
  const every = Math.ceil(labels.length / 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img">
      {grid.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - 8} y1={y(v)} y2={y(v)} stroke="#f1f5f9" />
          <text x={0} y={y(v) + 4} fontSize={10} fill="#94a3b8">
            {Math.round(v * 10) / 10}
          </text>
        </g>
      ))}
      {limit != null && (
        <g>
          <line x1={pl} x2={W - 8} y1={y(limit)} y2={y(limit)} stroke="#f97316" strokeDasharray="5 4" strokeWidth={1.5} />
          {limitLabel && (
            <text x={W - 8} y={y(limit) - 5} fontSize={10} fill="#ea580c" textAnchor="end" fontWeight={600}>
              {limitLabel}
            </text>
          )}
        </g>
      )}
      {series.map((s) => (
        <g key={s.name}>
          <motion.polyline
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7 }}
          />
          {s.values.map((v, i) => {
            const bad = s.limit != null && v > s.limit;
            return <circle key={i} cx={x(i)} cy={y(v)} r={bad ? 4.5 : s.values.length > 40 ? 0 : 3} fill={bad ? '#f97316' : '#ffffff'} stroke={bad ? '#ffffff' : s.color} strokeWidth={2} />;
          })}
        </g>
      ))}
      {labels.map((l, i) =>
        i % every === 0 || i === labels.length - 1 ? (
          <text key={i} x={x(i)} y={H - 4} fontSize={10} fill="#94a3b8" textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}
