<script lang="ts" setup>
import { ref, StyleValue, watch } from 'vue';

import { AdSlot, AdUnitName } from '~common/ad/ad-slot-info';
import { useAdStore } from '~common/ad/ad-store';
import AppAdWidgetInner from '~common/ad/widget/AppAdWidgetInner.vue';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';

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
				minHeight:
					unitName === 'billboard'
						? `115px`
						: unitName === 'mpu' || unitName === 'halfpage'
						? `250px`
						: GJ_BUILD_TYPE !== 'build' && unitName === 'rail'
						? `600px`
						: undefined,
				minWidth: GJ_BUILD_TYPE !== 'build' && unitName === 'rail' ? `160px` : undefined,
				background: GJ_BUILD_TYPE !== 'build' ? `rgba(255, 0, 0, 0.2)` : undefined,
			}"
		>
			<AppAspectRatio v-if="unitName === 'video'" :ratio="16 / 9">
				<AppAdWidgetInner :ad-slot="adSlot" />
			</AppAspectRatio>
			<AppAdWidgetInner v-else :ad-slot="adSlot" />
		</div>
	</div>
</template>
