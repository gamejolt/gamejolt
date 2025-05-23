<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Screen } from '../../screen/screen-service';
import { AdAdapterComponentProps } from '../adapter-base';
import AppAdMonetizeMoreTakeover, { AdTakeoverProps } from './AppAdMonetizeMoreTakeover.vue';
import { AdMonetizeMoreAdapter, MonetizeMoreTagPlacement } from './monetizemore-adapter';

type Props = AdAdapterComponentProps<AdMonetizeMoreAdapter>;

const { adSlot, adapter } = defineProps<Props>();

const takeoverData = ref<AdTakeoverProps | null>(null);

onMounted(() => {
	// Right now, only "side" content can show takeover ads.
	// TODO: Make this driven by key/values or something.
	if (adSlot.placement === 'side') {
		window.addEventListener('message', showTakeover);
	}

	adapter.ensureLoaded();
});

onBeforeUnmount(() => {
	window.removeEventListener('message', showTakeover);
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

function showTakeover(event: MessageEvent) {
	// We're not showing in a safe-frame, so the origin will be the same.
	if (event.origin !== window.location.origin || event.data?.type !== 'AD_TAKEOVER') {
		return;
	}

	const data = event.data;

	const checkKeys = ['fgImg', 'bgImg', 'destUrl', 'clickUrl', 'impressionUrl'];
	for (const key of checkKeys) {
		if (typeof data[key] !== 'string' || !data[key]) {
			return;
		}
	}

	takeoverData.value = {
		fgImg: data.fgImg,
		bgImg: data.bgImg,
		destUrl: data.destUrl,
		clickUrl: data.clickUrl,
		impressionUrl: data.impressionUrl,
		sizing: data.sizing === 'cover' || data.sizing === 'contain' ? data.sizing : undefined,
	};
}
</script>

<template>
	<pubguru
		v-if="tagUnit"
		:key="tagUnit"
		:data-pg-ad="tagUnit"
		:style="{ display: takeoverData ? 'none' : undefined }"
	/>

	<AppAdMonetizeMoreTakeover
		v-if="takeoverData"
		:fg-img="takeoverData.fgImg"
		:bg-img="takeoverData.bgImg"
		:dest-url="takeoverData.destUrl"
		:click-url="takeoverData.clickUrl"
		:impression-url="takeoverData.impressionUrl"
		:sizing="takeoverData.sizing"
	/>
</template>
