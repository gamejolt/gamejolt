<script lang="ts" setup>
import { ref, StyleValue, watch } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { AdSlot, AdUnitName } from '../ad-slot-info';
import { useAdStore } from '../ad-store';
import AppAdWidgetInner from './AppAdWidgetInner.vue';

type Props = {
	unitName: AdUnitName;
	takeover?: boolean;
	nativePost?: boolean;
	classOverride?: string;
	styleOverride?: StyleValue;
};

const { unitName, takeover = false, nativePost = false } = defineProps<Props>();

const { shouldShow } = useAdStore();

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
				...styleWhen(unitName === 'billboard', {
					minHeight: `115px`,
				}),
				...styleWhen(unitName === 'mpu' || unitName === 'halfpage', {
					minHeight: `250px`,
				}),
				// For debugging ad placements.
				...styleWhen(GJ_BUILD_TYPE !== 'build', {
					background: `rgba(255, 0, 0, 0.2)`,
					...styleWhen(unitName === 'rail', {
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
