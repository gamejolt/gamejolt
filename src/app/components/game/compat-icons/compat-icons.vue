<script lang="ts" src="./compat-icons"></script>

<template>
	<span v-if="platforms.length" class="game-compat-icons">
		<app-jolticon
			v-for="platform of platforms"
			:key="platform"
			class="-icon"
			:icon="platform"
		/>
	</span>
</template>

<style lang="stylus" scoped>
.-icon
	theme-prop('color', 'bg-subtle')
	position: relative
	top: 1px // Bump it down to match up with the bottom of the text more.
</style>
