<script lang="ts" setup>
defineProps({
	count: {
		type: Number,
		required: true,
	},
	current: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div class="event-item-media-indicator">
		<div
			v-for="i of count"
			:key="i"
			class="-dot"
			:class="{
				'-active': current === i,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.event-item-media-indicator
	display: flex
	justify-content: center
	align-items: center

.-dot
	change-bg('bg-subtle')
	margin-right: 2px
	margin-left: 2px
	width: 6px
	height: 6px
	border-radius: 50%

.-active
	change-bg('link')
</style>
