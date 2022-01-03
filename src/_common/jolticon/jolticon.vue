<script lang="ts" src="./jolticon"></script>

<template>
	<span
		class="jolticon"
		:class="[
			'jolticon-' + icon,
			big ? 'big' : undefined,
			highlight ? 'highlight' : undefined,
			notice ? 'notice' : undefined,
		]"
	/>
</template>

<style lang="stylus" src="../jolticons/jolticons.styl"></style>
