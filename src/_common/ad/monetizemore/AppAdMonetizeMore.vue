<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { Screen } from '../../screen/screen-service';
import { AdAdapterComponentProps } from '../adapter-base';
import { AdMonetizeMoreAdapter, MonetizeMoreTagPlacement } from './monetizemore-adapter';

type Props = AdAdapterComponentProps<AdMonetizeMoreAdapter>;

const { adSlot, adapter } = defineProps<Props>();

onMounted(() => {
	adapter.ensureLoaded();
});

const tagUnit = computed(() => {
	let tagPlacement: MonetizeMoreTagPlacement | null = null;
	if (adSlot.placement === 'top') {
		if (adSlot.size === 'leaderboard') {
			tagPlacement = 'leaderboard';
		} else {
			tagPlacement = 'content';
		}
	} else if (adSlot.size === 'skyscraper') {
		tagPlacement = 'skyscraper';
	} else {
		tagPlacement = adSlot.placement;
	}

	const unitName = adapter.getDesktopTagUnit(tagPlacement);
	return Screen.isMobile ? `mobile_${unitName}` : `desktop_${unitName}`;
});
</script>

<template>
	<pubguru v-if="tagUnit" :key="tagUnit" :data-pg-ad="tagUnit" />
</template>
