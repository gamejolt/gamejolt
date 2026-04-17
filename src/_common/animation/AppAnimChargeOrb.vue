<script lang="ts" setup>
import AppAnimSlideshow from '~common/animation/AppAnimSlideshow.vue';
import { sheetChargeOrbBottom, sheetChargeOrbTop } from '~common/animation/slideshow/sheets';

type Props = {
	pause?: boolean;
	useRandomOffset?: boolean;
};
const { useRandomOffset } = defineProps<Props>();

const bottomOffset = useRandomOffset ? Math.random() : undefined;
const topOffset = useRandomOffset ? Math.random() : undefined;
</script>

<template>
	<div class="relative">
		<AppAnimSlideshow
			:pause="pause"
			:sheet="sheetChargeOrbBottom"
			:start-offset="bottomOffset"
		/>
		<AppAnimSlideshow
			:style="{
				position: `absolute`,
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				zIndex: 2,
			}"
			:pause="pause"
			:sheet="sheetChargeOrbTop"
			:start-offset="topOffset"
		/>
	</div>
</template>
