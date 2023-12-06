<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import AppGameMediaBar from '../../game/media-bar/AppGameMediaBar.vue';
import { GameScreenshotModel } from '../../game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../game/video/video.model';

type GameMediaModel = GameScreenshotModel | GameVideoModel | GameSketchfabModel;

const props = defineProps({
	items: {
		type: Array as PropType<GameMediaModel[]>,
		required: true,
	},
	num: {
		type: Number,
		required: true,
	},
});

const { items, num } = toRefs(props);

const slicedItems = ref<GameMediaModel[]>([]);

watch(
	items,
	() => {
		slicedItems.value = (items.value || []).slice(0, num.value || 6);
	},
	{ deep: true }
);
</script>

<template>
	<div v-if="slicedItems.length" class="widget-compiler-widget-game-media">
		<AppGameMediaBar :media-items="slicedItems" />
	</div>
</template>
