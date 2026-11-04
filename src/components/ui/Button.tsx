import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'indigo';

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
  indigo: 'bg-brand-indigo text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
  ghost: 'text-primary hover:bg-primary-soft',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
};

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'style'> {
  variant?: Variant;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  size?: 'sm' | 'md';
  to?: string;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', icon: Icon, iconRight: IconRight, size = 'md', to, className, children, ...rest },
  ref,
) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
    size === 'md' ? 'h-10 px-4 text-sm' : 'h-8 px-3 text-[13px]',
    styles[variant],
    className,
  );
  const inner = (
    <>
      {Icon && <Icon className={size === 'md' ? 'h-[18px] w-[18px]' : 'h-4 w-4'} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <motion.button ref={ref} whileTap={{ scale: 0.97 }} className={cls} {...rest}>
      {inner}
    </motion.button>
  );
});
