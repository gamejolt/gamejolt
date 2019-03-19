<template>
	<span class="game-compat-icons" v-if="platforms.length">
		<app-jolticon class="-icon" v-for="platform of platforms" :key="platform" :icon="platform" />
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables';
@require '~styles-lib/mixins';

.-icon {
  theme-prop('color', 'bg-subtle');
  position: relative;
  top: 1px; // Bump it down to match up with the bottom of the text more.
}
</style>

<script lang="ts" src="./compat-icons" />
