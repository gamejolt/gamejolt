<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { AdSlot, AdUnitName } from '~common/ad/ad-slot-info';
import AppAdMonetizeMoreNativePost, {
	AdNativePostProps,
} from '~common/ad/monetizemore/AppAdMonetizeMoreNativePost.vue';
import AppAdMonetizeMoreTakeover, {
	AdTakeoverProps,
} from '~common/ad/monetizemore/AppAdMonetizeMoreTakeover.vue';
import { MonetizeMoreAdapter } from '~common/ad/monetizemore/monetizemore-adapter';
import { getScreen } from '~common/screen/screen-service';

type Props = {
	adSlot: AdSlot;
	adapter: MonetizeMoreAdapter;
};

const { adSlot, adapter } = defineProps<Props>();

const MonetizeMoreUnits: Record<Exclude<AdUnitName, 'instream'>, string> = {
	leaderboard: 'billboard',
	rail: 'halfpage',
	'rail-mpu': 'mpu',
	gutter: 'rail',
	incontent: 'mpu',
};

const takeoverData = ref<AdTakeoverProps | null>(null);
const nativePostData = ref<AdNativePostProps | null>(null);

onMounted(() => {
	if (adSlot.takeover) {
		window.addEventListener('message', showTakeover);
	}

	if (adSlot.nativePost) {
		window.addEventListener('message', showNativePost);
	}

	adapter.ensureLoaded();
});

onBeforeUnmount(() => {
	window.removeEventListener('message', showTakeover);
	window.removeEventListener('message', showNativePost);
});

const tagUnit = computed(() => {
	// Handle special video unit case.
	if (adSlot.unitName === 'instream') {
		return 'gamejolt.com_OS_OOP';
	}

	const unit = MonetizeMoreUnits[adSlot.unitName];

	let suffix = '';
	if (adSlot.takeover) {
		suffix = '_takeover';
	} else if (adSlot.nativePost) {
		suffix = '_native';
	}
	return getScreen().isMobile.value ? `mobile_${unit}${suffix}` : `desktop_${unit}${suffix}`;
});

function showTakeover(event: MessageEvent) {
	// We're not showing in a safe-frame, so the origin will be the same.
	if (
		!adSlot.takeover ||
		event.origin !== window.location.origin ||
		event.data?.type !== 'AD_TAKEOVER'
	) {
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

	adSlot.showingCustom = true;
}

function showNativePost(event: MessageEvent) {
	// We're not showing in a safe-frame, so the origin will be the same.
	if (
		!adSlot.nativePost ||
		event.origin !== window.location.origin ||
		event.data?.type !== 'AD_NATIVE_POST'
	) {
		return;
	}

	const data = event.data;

	const checkKeys = [
		'adUnit',
		'mediaImg',
		'avatarImg',
		'displayName',
		'leadContent',
		'destUrl',
		'clickUrl',
		'impressionUrl',
	];
	for (const key of checkKeys) {
		if (typeof data[key] !== 'string' || !data[key]) {
			return;
		}
	}

	nativePostData.value = {
		mediaImg: data.mediaImg,
		avatarImg: data.avatarImg,
		displayName: data.displayName,
		leadContent: data.leadContent,
		destUrl: data.destUrl,
		clickUrl: data.clickUrl,
		impressionUrl: data.impressionUrl,
		actionText: typeof data.actionText === 'string' ? data.actionText : undefined,
	};

	adSlot.showingCustom = true;
}
</script>

<template>
	<pubguru
		v-if="tagUnit"
		:key="tagUnit"
		:data-pg-ad="tagUnit"
		:style="{ display: takeoverData || nativePostData ? 'none' : undefined }"
	/>

	<AppAdMonetizeMoreTakeover v-if="takeoverData" v-bind="takeoverData" />
	<AppAdMonetizeMoreNativePost v-else-if="nativePostData" v-bind="nativePostData" />
</template>
