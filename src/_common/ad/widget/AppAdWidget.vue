<script lang="ts" setup>
import { ref, StyleValue, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { AdSlot, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
import { useAdStore } from '../ad-store';
import AppAdWidgetInner from './AppAdWidgetInner.vue';

type Props = {
	size?: AdSlotSize;
	placement?: AdSlotPlacement;
	takeover?: boolean;
	nativePost?: boolean;
	classOverride?: string;
	styleOverride?: StyleValue;
};

const {
	size = 'rectangle',
	placement = 'content',
	takeover = false,
	nativePost = false,
} = defineProps<Props>();

const { shouldShow } = useAdStore();

const adSlot = ref(_makeAdSlot());

// If anything within our props changes, regenerate.
watch(
	[() => size, () => placement],
	() => {
		adSlot.value = _makeAdSlot();
	},
	{ deep: true }
);

function _makeAdSlot() {
	return new AdSlot(size, placement, takeover, nativePost);
}
</script>

<template>
	<div
		v-if="shouldShow"
		:class="adSlot.showingCustom ? undefined : classOverride"
		:style="[{ textAlign: `center` }, adSlot.showingCustom ? undefined : styleOverride]"
	>
		<div
			:style="{
				display: `flex`,
				alignItems: `center`,
				justifyContent: `center`,
				margin: `0 auto`,
				...styleWhen(adSlot.size === 'leaderboard', {
					minHeight: `115px`,
				}),
				...styleWhen(adSlot.size === 'rectangle', {
					minHeight: `250px`,
				}),
				// For debugging ad placements.
				...styleWhen(GJ_BUILD_TYPE !== 'build', {
					background: `rgba(255, 0, 0, 0.2)`,
					...styleWhen(adSlot.size === 'skyscraper', {
						minWidth: `160px`,
						minHeight: `600px`,
					}),
				}),
			}"
		>
			<AppAdWidgetInner :ad-slot="adSlot" />
		</div>
	</div>
</template>
