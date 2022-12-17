<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { StickerPack } from './pack.model';

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPack>,
		required: true,
	},
});

const { pack } = toRefs(props);
</script>

<template>
	<div class="-sticker-pack">
		<img draggable="false" style="user-drag: none" :src="pack.media_item.img_url" />
	</div>
</template>

<style lang="stylus" scoped>
.-sticker-pack
	rounded-corners-lg()
	overflow: hidden
	width: 80px
	height: 120px

	> img
		display: block
		width: 100%
		height: 100%
</style>
