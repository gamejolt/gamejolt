<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Screen } from '../../screen/screen-service';
import { AdAdapterComponentProps } from '../adapter-base';
import AppAdMonetizeMoreNativePost, { AdNativePostProps } from './AppAdMonetizeMoreNativePost.vue';
import AppAdMonetizeMoreTakeover, { AdTakeoverProps } from './AppAdMonetizeMoreTakeover.vue';
import { AdMonetizeMoreAdapter } from './monetizemore-adapter';

type Props = AdAdapterComponentProps<AdMonetizeMoreAdapter>;

const { adSlot, adapter } = defineProps<Props>();

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
	let suffix = '';
	if (adSlot.takeover) {
		suffix = '_takeover';
	} else if (adSlot.nativePost) {
		suffix = '_native';
	}
	return Screen.isMobile
		? `mobile_${adSlot.unitName}${suffix}`
		: `desktop_${adSlot.unitName}${suffix}`;
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

	// eslint-disable-next-line vue/no-mutating-props
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

	// eslint-disable-next-line vue/no-mutating-props
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
