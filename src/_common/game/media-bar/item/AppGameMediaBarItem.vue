<script lang="ts">
import { ref, toRefs } from 'vue';
import AppImgResponsive from '../../../img/AppImgResponsive.vue';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../media-item/backdrop/AppMediaItemBackdrop.vue';

export const MediaBarItemMaxHeight = 150;
</script>

<script lang="ts" setup>
const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
});

const { item } = toRefs(props);

const width = ref('auto');
const height = ref('auto');

// We set the dimensions on the thumbnails manually.
// This way we can size it correct before it loads.
if (item.value.media_type === 'image') {
	const dimensions = item.value.media_item.getDimensions(400, MediaBarItemMaxHeight);
	width.value = dimensions.width + 'px';
	height.value = dimensions.height + 'px';
} else if (item.value.media_type === 'sketchfab') {
	// Sketchfab thumbnails are hardcoded to this width.
	height.value = `${MediaBarItemMaxHeight}px`;
	width.value = MediaBarItemMaxHeight / 0.5625 + 'px';
} else {
	// Video thumbnails are hardcoded to this width.
	width.value = '200px';
}
</script>

<template>
	<div class="media-bar-item" :style="{ width, height }">
		<a class="-wrapper" :style="{ height }">
			<slot />
			<AppMediaItemBackdrop class="-backdrop" :media-item="item.media_item" radius="lg">
				<AppImgResponsive
					v-if="item.media_type !== 'sketchfab'"
					:src="item.img_thumbnail"
					:title="item.media_type == 'image' ? item.caption : item.title"
					alt=""
				/>

				<img v-else class="img-responsive" :src="item.img_thumbnail" alt="" />
			</AppMediaItemBackdrop>

			<span v-if="item.media_type === 'video'" class="-play">
				<AppJolticon icon="play" />
			</span>

			<span v-if="item.media_type === 'sketchfab'" class="-play">
				<AppJolticon icon="sketchfab" />
			</span>
		</a>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
