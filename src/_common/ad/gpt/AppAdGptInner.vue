<script lang="ts" setup>
import { PropType, onBeforeUnmount, onMounted, toRef } from 'vue';
import { useAdStore } from '../ad-store';
import { AdProperAdapter } from '../proper/proper-adapter';
import { AdGptMobileLeaderSlotId, AdGptMobileMidpageSlotId } from './gpt-adapter';

const props = defineProps({
	placement: {
		type: String as PropType<'top' | 'midpage'>,
		required: true,
	},
});

const { adapter: properAdapter, takeoverAdapter: adapter } = useAdStore();

function getGptSlot() {
	return props.placement === 'top'
		? adapter.getMobileLeaderGptSlot()
		: adapter.getMobileMidpageGptSlot();
}

const slotId = toRef(() =>
	props.placement === 'top' ? AdGptMobileLeaderSlotId : AdGptMobileMidpageSlotId
);

onMounted(() => {
	adapter.run(() => {
		const gptSlot = getGptSlot();
		if (!gptSlot) {
			return;
		}

		googletag.display(gptSlot);
		googletag.pubads().refresh([gptSlot]);
	});

	// We need to make sure that proper loads in since it's the one that loads
	// the script for now.
	(properAdapter as AdProperAdapter).ensureLoaded();
});

onBeforeUnmount(() => {
	const gptSlot = getGptSlot();
	if (!gptSlot) {
		return;
	}

	adapter.run(() => {
		googletag.pubads().clear([gptSlot]);
	});
});
</script>

<template>
	<div class="gpt-ad-unit" :style="{ display: `flex`, justifyContent: `center` }">
		<div :id="slotId" />
	</div>
</template>
