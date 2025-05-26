<script lang="ts" setup>
import AppActivityFeedPostAdvertisement from '../../../app/components/activity/feed/post/AppActivityFeedPostAdvertisement.vue';

export type AdNativePostProps = {
	mediaImg: string;
	avatarImg: string;
	displayName: string;
	leadContent: string;
	destUrl: string;
	clickUrl: string;
	impressionUrl: string;
	actionText?: string;
};

const {
	mediaImg,
	avatarImg,
	displayName,
	leadContent,
	destUrl,
	clickUrl,
	impressionUrl,
	actionText,
} = defineProps<AdNativePostProps>();

function trackClick() {
	const clickTracker = new Image();
	clickTracker.src = clickUrl;
}

function trackImpression() {
	const impressionTracker = new Image();
	impressionTracker.src = impressionUrl;
}
</script>

<template>
	<AppActivityFeedPostAdvertisement
		:media-src="mediaImg"
		:avatar-src="avatarImg"
		:display-name
		:lead-content
		:href="destUrl"
		:action-text
		@click="trackClick"
		@inview="trackImpression"
	/>
</template>
