/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/**/*.{js,ts,jsx,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}', // Storybook 파일 포함
    './.storybook/**/*.{js,jsx,ts,tsx}', // Storybook 설정 파일 포함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
