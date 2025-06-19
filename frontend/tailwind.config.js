/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{html,js,jsx,ts,tsx}",
  "./public/index.html"
];

export const theme = {
  fontFamily: {
    
     roboto: ["Roboto", "sans-serif"],
  poppins: ["Poppins", "sans-serif"], // lowercase is conventional
  },
  extend: {
    screens: {
     'xs': '400px', // more semantic name
      'md-lg': '800px', // between md and lg
      'xl-plus': '1050px', // custom xl variant
      '2xl-plus': '1110px', // custom 2xl variant
      '3xl': '1300px', // standard 3xl breakpoint
    },
  },
};
export const plugins = [];