<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { trackShareLink } from '../../analytics/analytics.service';
import { Navigate } from '../../navigate/navigate.service';
import { copyShareLink, ShareProvider, ShareResource } from '../share.service';
import AppJolticon from '../../jolticon/AppJolticon.vue';

const props = defineProps({
	resource: {
		type: String as PropType<ShareResource>,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	provider: {
		type: String as PropType<ShareProvider>,
		required: true,
	},
	dense: {
		type: Boolean,
	},
});

const { resource, url, provider } = toRefs(props);

const icon = computed(() => {
	switch (provider.value) {
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
	switch (provider.value) {
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
	return `Check out this awesome ${resource.value} on Game Jolt!`;
});

const providerLinkData = computed(() => {
	let base = '';
	let inNewWindow = true;
	const params: [string, string][] = [];

	const addUTM = (url: string) =>
		url + (url.includes('?') ? '&' : '?') + 'utm_source=share&utm_medium=web';

	switch (provider.value) {
		case 'facebook':
			base = `https://www.facebook.com/sharer.php?`;
			params.push(['u', addUTM(url.value)]);
			params.push(['quote', phrase.value]);
			break;

		case 'fb_messenger':
			base = `http://www.facebook.com/dialog/send?`;
			params.push(['app_id', '410666682312265']);
			params.push(['link', addUTM(url.value)]);
			params.push(['redirect_uri', addUTM(url.value)]);
			break;

		case 'twitter':
			base = `https://twitter.com/intent/tweet?`;
			params.push(['source', 'tweetbutton']);
			params.push(['url', addUTM(url.value)]);
			params.push(['related', 'Game Jolt']);
			params.push(['text', phrase.value]);
			break;

		case 'whatsapp':
			base = `https://wa.me/?`;
			params.push(['text', `${phrase.value} ${addUTM(url.value)}`]);
			break;

		case 'email':
			inNewWindow = false;

			base = `mailto:?to=&`;
			params.push(['body', `${phrase.value} ${addUTM(url.value)}`]);
			params.push(['subject', phrase.value]);
			break;

		case 'sms':
			inNewWindow = false;

			// I think that iOS uses '&', Android uses '?'
			base = `sms:?&`;
			params.push(['body', `{phrase.value} ${addUTM(url.value)}`]);
			break;

		case 'reddit':
			base = `https://www.reddit.com/submit?`;
			params.push(['url', addUTM(url.value)]);
			params.push(['title', phrase.value]);
			break;

		default:
			// If we don't have support for a link for some reason, just copy it.
			copyShareLink(url.value, resource.value);
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

	trackShareLink(url.value, { provider: provider.value, resource: resource.value });

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

<style lang="stylus" scoped src="./common.styl"></style>
