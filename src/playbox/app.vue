<template>
  <div :id="id">
    <div id="shell">
      <div id="content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./app.ts" />

<style lang="stylus" src="./app.styl" />
