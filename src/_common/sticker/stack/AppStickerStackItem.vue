<script lang="ts" setup>
import AppStickerImg from '../AppStickerImg.vue';

defineProps({
	imgUrl: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<div
		class="AppStickerStackItem"
		:style="{
			userSelect: `none`,
		}"
	>
		<span>
			<AppStickerImg
				:style="{
					display: `block`,
					width: `100%`,
					height: `100%`,
				}"
				:src="imgUrl"
			/>
		</span>
	</div>
</template>
