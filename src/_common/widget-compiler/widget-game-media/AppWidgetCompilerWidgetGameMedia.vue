<script lang="ts" setup>
import { ref, watch } from 'vue';

import AppGameMediaBar from '../../game/media-bar/AppGameMediaBar.vue';
import { GameScreenshotModel } from '../../game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../game/video/video.model';

type GameMediaModel = GameScreenshotModel | GameVideoModel | GameSketchfabModel;

type Props = {
	items: GameMediaModel[];
	num: number;
};
const { items, num } = defineProps<Props>();

const slicedItems = ref<GameMediaModel[]>([]);

watch(
	() => items,
	() => {
		slicedItems.value = (items || []).slice(0, num || 6);
	},
	{ deep: true }
);
</script>

<template>
	<div v-if="slicedItems.length" class="widget-compiler-widget-game-media">
		<AppGameMediaBar :media-items="slicedItems" />
	</div>
</template>
