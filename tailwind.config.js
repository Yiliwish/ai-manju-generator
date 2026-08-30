/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 主题色沿用玫瑰红（与「旅兔」品牌一致），暗色电影感界面
      fontFamily: {
        sans: ['"Microsoft YaHei"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
