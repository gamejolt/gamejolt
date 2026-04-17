<script lang="ts" setup>
import { computed, toRef } from 'vue';

import {
	GameGridRowSizeLg,
	GameGridRowSizeMd,
	GameGridRowSizeSm,
} from '~app/components/game/grid/AppGameGrid.vue';
import AppGameThumbnailPlaceholder from '~common/game/thumbnail/AppGameThumbnailPlaceholder.vue';
import { Screen } from '~common/screen/screen-service';

type Props = {
	num: number;
	truncateToFit?: boolean;
	scrollable?: boolean;
	forceScrollable?: boolean;
};
const { num, truncateToFit, scrollable, forceScrollable } = defineProps<Props>();

const isScrollable = toRef(() => (Screen.isXs && scrollable) || forceScrollable);

const count = computed(() => {
	if (!truncateToFit || isScrollable.value) {
		return num;
	}

	let rowSize: number;
	if (Screen.isXs) {
		rowSize = GameGridRowSizeSm;
	} else if (Screen.isMd) {
		rowSize = GameGridRowSizeMd;
	} else if (Screen.isLg) {
		rowSize = GameGridRowSizeLg;
	} else {
		rowSize = num;
	}

	return Math.max(1, Math.floor(num / rowSize)) * rowSize;
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
@import './'
</style>
