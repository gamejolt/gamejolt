<script lang="ts" setup>
import { computed, toRef, toRefs } from 'vue';
import AppGameThumbnailPlaceholder from '../../../../_common/game/thumbnail/AppGameThumbnailPlaceholder.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { GameGridRowSizeLg, GameGridRowSizeMd, GameGridRowSizeSm } from './AppGameGrid.vue';

const props = defineProps({
	num: {
		type: Number,
		required: true,
	},
	truncateToFit: {
		type: Boolean,
	},
	scrollable: {
		type: Boolean,
	},
	forceScrollable: {
		type: Boolean,
	},
});

const { num, truncateToFit, scrollable, forceScrollable } = toRefs(props);

const isScrollable = toRef(() => (Screen.isXs && scrollable.value) || forceScrollable.value);

const count = computed(() => {
	if (!truncateToFit.value || isScrollable.value) {
		return num.value;
	}

	let rowSize: number;
	if (Screen.isXs) {
		rowSize = GameGridRowSizeSm;
	} else if (Screen.isMd) {
		rowSize = GameGridRowSizeMd;
	} else if (Screen.isLg) {
		rowSize = GameGridRowSizeLg;
	} else {
		rowSize = num.value;
	}

	return Math.max(1, Math.floor(num.value / rowSize)) * rowSize;
});
</script>

<template>
	<div :class="{ 'scrollable-grid-xs': scrollable }">
		<div class="_game-grid-items">
			<div v-for="i of count" :key="i" class="_game-grid-item">
				<AppGameThumbnailPlaceholder />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../grid'
</style>
