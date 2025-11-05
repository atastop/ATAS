/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-black': 'rgba(0,0,0,0.3)', // 自定義背景色
        'text-white-light': 'rgba(255,255,255,0.7)', // 自定義文字顏色
      },
    },
  },
  plugins: [],
}
