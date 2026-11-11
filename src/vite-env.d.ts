/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_BASE?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }

// lottie-web รุ่น light ใช้ type เดียวกับตัวเต็ม
declare module 'lottie-web/build/player/lottie_light' {
  import lottie from 'lottie-web';
  export default lottie;
}
