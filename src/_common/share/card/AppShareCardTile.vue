<script lang="ts" setup>
import { computed } from 'vue';

import { trackShareLink } from '~common/analytics/analytics.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Navigate } from '~common/navigate/navigate.service';
import { copyShareLink, ShareProvider, ShareResource } from '~common/share/share.service';

type Props = {
	resource: ShareResource;
	url: string;
	provider: ShareProvider;
	dense?: boolean;
};
const { resource, url, provider } = defineProps<Props>();

const icon = computed(() => {
	switch (provider) {
		case 'facebook':
			return 'facebook';

		case 'fb_messenger':
			return 'facebook-messenger';

		case 'twitter':
			return 'twitter-bird';

		case 'email':
			return 'email';

		case 'sms':
			return 'phone';

		case 'whatsapp':
			return 'whatsapp';

		case 'reddit':
			return 'reddit';

		default:
			return 'share-airplane';
	}
});

const text = computed(() => {
	switch (provider) {
		case 'facebook':
			return 'Facebook';

		case 'twitter':
			return 'Twitter';

		case 'email':
			return 'Email';

		case 'sms':
			return 'SMS';

		case 'fb_messenger':
			return 'Messenger';

		case 'whatsapp':
			return 'WhatsApp';

		case 'reddit':
			return 'Reddit';
	}
});

const phrase = computed(() => {
	return `Check out this awesome ${resource} on Game Jolt!`;
});

const providerLinkData = computed(() => {
	let base = '';
	let inNewWindow = true;
	const params: [string, string][] = [];

	const addUTM = (url: string) =>
		url + (url.includes('?') ? '&' : '?') + 'utm_source=share&utm_medium=web';

	switch (provider) {
		case 'facebook':
			base = `https://www.facebook.com/sharer.php?`;
			params.push(['u', addUTM(url)]);
			params.push(['quote', phrase.value]);
			break;

		case 'fb_messenger':
			base = `http://www.facebook.com/dialog/send?`;
			params.push(['app_id', '410666682312265']);
			params.push(['link', addUTM(url)]);
			params.push(['redirect_uri', addUTM(url)]);
			break;

		case 'twitter':
			base = `https://twitter.com/intent/tweet?`;
			params.push(['source', 'tweetbutton']);
			params.push(['url', addUTM(url)]);
			params.push(['related', 'Game Jolt']);
			params.push(['text', phrase.value]);
			break;

		case 'whatsapp':
			base = `https://wa.me/?`;
			params.push(['text', `${phrase.value} ${addUTM(url)}`]);
			break;

		case 'email':
			inNewWindow = false;

			base = `mailto:?to=&`;
			params.push(['body', `${phrase.value} ${addUTM(url)}`]);
			params.push(['subject', phrase.value]);
			break;

		case 'sms':
			inNewWindow = false;

			// I think that iOS uses '&', Android uses '?'
			base = `sms:?&`;
			params.push(['body', `{phrase.value} ${addUTM(url)}`]);
			break;

		case 'reddit':
			base = `https://www.reddit.com/submit?`;
			params.push(['url', addUTM(url)]);
			params.push(['title', phrase.value]);
			break;

		default:
			// If we don't have support for a link for some reason, just copy it.
			copyShareLink(url, resource);
			return;
	}

	return {
		providerLink: base + params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
		inNewWindow: inNewWindow,
	};
});

function shareProviderLink() {
	const { inNewWindow, providerLink } = providerLinkData.value ?? {};
	if (!providerLink) {
		return;
	}

	trackShareLink(url, { provider: provider, resource: resource });

	if (inNewWindow) {
		Navigate.newWindow(providerLink, { width: 800, height: 600 });
	} else {
		Navigate.gotoExternal(providerLink);
	}
}
</script>

<template>
	<a class="-tile" :class="{ '-dense': dense }" @click="shareProviderLink()">
		<div class="-icon">
			<AppJolticon class="-icon-primary" :icon="icon" />
			<AppJolticon class="-icon-secondary" icon="share-airplane" />
		</div>

		<span>{{ text }}</span>
	</a>
</template>

<style lang="stylus" scoped src="~common/share/card/common.styl"></style>
