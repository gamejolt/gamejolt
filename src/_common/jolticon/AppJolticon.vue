<script lang="ts" setup>
defineProps({
	icon: {
		type: String,
		required: true,
	},
	big: {
		type: Boolean,
	},
	highlight: {
		type: Boolean,
	},
	notice: {
		type: Boolean,
	},
});
</script>

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
