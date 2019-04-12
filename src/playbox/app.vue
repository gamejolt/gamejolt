<template>
  <div :id="id">
    <div id="shell">
      <div id="content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./app.ts"></script>

<style lang="stylus" src="./app.styl"></style>
