<script lang="ts" setup>
defineProps({
	imgUrl: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<div class="live-reaction-item">
		<span class="-sticker">
			<img class="-sticker-img" :src="imgUrl" alt="" draggable="false" />
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.live-reaction-item
	user-select: none

.-sticker
	width: 20px
	height: 20px

.-sticker-img
	display: block
	width: 100%
	height: 100%
</style>
