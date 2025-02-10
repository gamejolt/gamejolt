<script lang="ts" setup>
import { onBeforeUnmount, onMounted, toRef } from 'vue';
import { useAdStore } from '../ad-store';
import { AdGptMobileLeaderSlotId, AdGptMobileMidpageSlotId } from './gpt-adapter';

type Props = {
	placement: 'top' | 'midpage';
};

const { placement } = defineProps<Props>();

const { properAdapter, gptAdapter } = useAdStore();

function getGptSlot() {
	return placement === 'top'
		? gptAdapter.getMobileLeaderSlot()
		: gptAdapter.getMobileMidpageSlot();
}

const slotId = toRef(() =>
	placement === 'top' ? AdGptMobileLeaderSlotId : AdGptMobileMidpageSlotId
);

onMounted(() => {
	gptAdapter.run(() => {
		const gptSlot = getGptSlot();
		if (!gptSlot) {
			return;
		}

		googletag.display(gptSlot);
		googletag.pubads().refresh([gptSlot]);
	});

	// We need to make sure that proper loads in since it's the one that loads
	// the script for now.
	properAdapter.ensureLoaded();
});

onBeforeUnmount(() => {
	const gptSlot = getGptSlot();
	if (!gptSlot) {
		return;
	}

	gptAdapter.run(() => {
		googletag.pubads().clear([gptSlot]);
	});
});
</script>

<template>
	<div class="gpt-ad-unit" :style="{ display: `flex`, justifyContent: `center` }">
		<div :id="slotId" />
	</div>
</template>
