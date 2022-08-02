<script lang="ts" setup>
defineProps({
	imgUrl: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<div class="sticker-stack-item">
		<span>
			<img class="-sticker-img" :src="imgUrl" alt="" draggable="false" />
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-stack-item
	user-select: none

.-sticker-img
	display: block
	width: 100%
	height: 100%
</style>
