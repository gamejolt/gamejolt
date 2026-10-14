<script lang="ts" setup>
import { ref, StyleValue, watch } from 'vue';

import { AdSlot, AdUnitName } from '~common/ad/ad-slot-info';
import { useAdStore } from '~common/ad/ad-store';
import AppAdAdBridg from '~common/ad/adbridg/AppAdAdBridg.vue';
import AppAdMonetizeMoreSlot from '~common/ad/monetizemore/AppAdMonetizeMoreSlot.vue';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { styleWhen } from '~styles/mixins';

type Props = {
	unitName: AdUnitName;
	takeover?: boolean;
	nativePost?: boolean;
	classOverride?: string;
	styleOverride?: StyleValue;
};

const { unitName, takeover = false, nativePost = false } = defineProps<Props>();

const { shouldShow, adapter } = useAdStore();

const adSlot = ref(_makeAdSlot());

// If anything within our props changes, regenerate.
watch([() => unitName, () => takeover, () => nativePost], () => {
	adSlot.value = _makeAdSlot();
});

function _makeAdSlot() {
	return new AdSlot(unitName, takeover, nativePost);
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
				...styleWhen(unitName === 'leaderboard', {
					minHeight: `115px`,
				}),
				...styleWhen(unitName === 'incontent' || unitName === 'sidebar', {
					minHeight: `250px`,
				}),
				// For debugging ad placements.
				...styleWhen(GJ_BUILD_TYPE !== 'build', {
					background: `rgba(255, 0, 0, 0.2)`,
					...styleWhen(unitName === 'gutter', {
						minWidth: `160px`,
						minHeight: `600px`,
					}),
				}),
			}"
		>
			<AppAspectRatio v-if="unitName === 'instream'" :ratio="16 / 9">
				<AppAdAdBridg v-if="adapter.provider === 'adbridg'" :ad-slot :adapter />
				<AppAdMonetizeMoreSlot v-else :ad-slot :adapter />
			</AppAspectRatio>
			<template v-else>
				<AppAdAdBridg v-if="adapter.provider === 'adbridg'" :ad-slot :adapter />
				<AppAdMonetizeMoreSlot v-else :ad-slot :adapter />
			</template>
		</div>
	</div>
</template>
