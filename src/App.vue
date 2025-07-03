<template>
  <router-view></router-view>  
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

* {
  box-sizing: border-box;
}

html {
  font-family: "Roboto", sans-serif;
}

body {
  margin: 0;
  font-family: 'dinpro-regular', sans-serif;
}

@font-face {
  font-family: 'dinpro-regular';
  src: url('../src/fonts/d_din_pro/otf/D-DIN-PRO-400-Regular.otf') format('opentype');
}
.dinpro-regular-font {
  font-family: 'dinpro-regular', sans-serif;
}
</style>