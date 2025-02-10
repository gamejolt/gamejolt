<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppActivityFeedPostAdvertisement from '../../../app/components/activity/feed/post/AppActivityFeedPostAdvertisement.vue';
import { useAdStore } from '../ad-store';

const { gptAdapter, properAdapter } = useAdStore();

const slotId = gptAdapter.getNativePostSlot();

// For testing.
// const mediaSrc = ref('https://m.gjcdn.net/gen/600/39511333-ztgqjfyz-v4.jpg');
// const avatarSrc = ref('https://m.gjcdn.net/user-avatar/200/8338814-crop33_0_715_682-vjdm98ha-v4.webp');
// const displayName = ref('ExeGenesis Systems');
// const leadContent =
// 	ref("Experience an emotionally charged adventure where every decision shapes Inayah's destiny. Wishlist now!");
// const href = ref('https://gamejolt.com/');
// const actionText = ref('Wishlist Now');

const mediaSrc = ref('');
const avatarSrc = ref('');
const displayName = ref('');
const leadContent = ref('');
const href = ref('');
const actionText = ref<string>();

let clickUrl = '';
let impressionUrl = '';

if (slotId) {
	onMounted(() => {
		window.addEventListener('message', showNativePost);

		gptAdapter.run(() => {
			const slot = gptAdapter.resolveNativePostSlot(slotId);
			if (slot) {
				googletag.display(slot);
				googletag.pubads().refresh([slot]);
			}
		});

		// We need to make sure that proper loads in since it's the one that loads
		// the script for now.
		properAdapter.ensureLoaded();
	});

	onBeforeUnmount(() => {
		window.removeEventListener('message', showNativePost);
		gptAdapter.releaseNativePostSlot(slotId);

		gptAdapter.run(() => {
			const slot = gptAdapter.resolveNativePostSlot(slotId);
			if (slot) {
				googletag.pubads().clear([slot]);
			}
		});
	});
}

function showNativePost(event: MessageEvent) {
	// We're not showing in a safe-frame, so the origin will be the same.
	if (event.origin !== window.location.origin || event.data?.type !== 'AD_NATIVE_POST') {
		return;
	}

	const data = event.data;

	const checkKeys = [
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

	mediaSrc.value = data.mediaImg;
	avatarSrc.value = data.avatarImg;
	displayName.value = data.displayName;
	leadContent.value = data.leadContent;
	href.value = data.destUrl;
	clickUrl = data.clickUrl;
	impressionUrl = data.impressionUrl;
	actionText.value = typeof data.actionText === 'string' ? data.actionText : undefined;
}

function trackClick() {
	if (!clickUrl) {
		return;
	}

	const clickTracker = new Image();
	clickTracker.src = clickUrl;
}

function trackImpression() {
	if (!impressionUrl) {
		return;
	}

	const impressionTracker = new Image();
	impressionTracker.src = impressionUrl;
}
</script>

<template>
	<template v-if="slotId">
		<div :style="{ display: `none` }">
			<div :id="slotId" />
		</div>

		<template v-if="mediaSrc && avatarSrc && displayName && leadContent && href">
			<AppActivityFeedPostAdvertisement
				:media-src
				:avatar-src
				:display-name
				:lead-content
				:href
				:action-text
				@click="trackClick"
				@inview="trackImpression"
			/>
		</template>
	</template>
</template>
