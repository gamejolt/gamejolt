import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { trackShareLink } from '../../../analytics/analytics.service';
import { Navigate } from '../../../navigate/navigate.service';
import { copyShareLink, ShareProvider, ShareResource } from '../../share.service';

@Component({})
export default class AppShareCardTile extends Vue {
	@Prop({ type: String, required: true })
	resource!: ShareResource;

	@Prop({ type: String, required: true })
	url!: string;

	@Prop({ type: String, required: true })
	provider!: ShareProvider;

	@Prop({ type: Boolean, required: false, default: false })
	dense!: boolean;

	get icon() {
		switch (this.provider) {
			case 'facebook':
			case 'fb_messenger':
				return 'facebook';

			case 'twitter':
				return 'twitter-bird';

			case 'email':
				return 'email';

			case 'sms':
				return 'phone';

			case 'whatsapp':
				return 'comment-filled';

			case 'reddit':
				return 'reddit';

			default:
				return 'share-airplane';
		}
	}

	get text() {
		switch (this.provider) {
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
	}

	private get phrase() {
		return `Check out this awesome ${this.resource} on Game Jolt!`;
	}

	private get providerLinkData() {
		let base = '';
		let inNewWindow = true;
		const params: [string, string][] = [];

		const addUTM = (url: string) =>
			url + (url.includes('?') ? '&' : '?') + 'utm_source=share&utm_medium=web';

		switch (this.provider) {
			case 'facebook':
				base = `https://www.facebook.com/sharer.php?`;
				params.push(['u', addUTM(this.url)]);
				params.push(['quote', this.phrase]);
				break;

			case 'fb_messenger':
				base = `http://www.facebook.com/dialog/send?`;
				params.push(['app_id', '410666682312265']);
				params.push(['link', addUTM(this.url)]);
				params.push(['redirect_uri', addUTM(this.url)]);
				break;

			case 'twitter':
				base = `https://twitter.com/intent/tweet?`;
				params.push(['source', 'tweetbutton']);
				params.push(['url', addUTM(this.url)]);
				params.push(['related', 'Game Jolt']);
				params.push(['text', this.phrase]);
				break;

			case 'whatsapp':
				base = `https://wa.me/?`;
				params.push(['text', `${this.phrase} ${addUTM(this.url)}`]);
				break;

			case 'email':
				inNewWindow = false;

				base = `mailto:?to=&`;
				params.push(['body', `${this.phrase} ${addUTM(this.url)}`]);
				params.push(['subject', this.phrase]);
				break;

			case 'sms':
				inNewWindow = false;

				// I think that iOS uses '&', Android uses '?'
				base = `sms:?&`;
				params.push(['body', `{this.phrase} ${addUTM(this.url)}`]);
				break;

			case 'reddit':
				base = `https://www.reddit.com/submit?`;
				params.push(['url', addUTM(this.url)]);
				params.push(['title', this.phrase]);
				break;

			default:
				// If we don't have support for a link for some reason, just copy it.
				copyShareLink(this.url, this.resource);
				return;
		}

		return {
			providerLink: base + params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
			inNewWindow: inNewWindow,
		};
	}

	shareProviderLink() {
		const { inNewWindow, providerLink } = this.providerLinkData ?? {};
		if (!providerLink) {
			return;
		}

		trackShareLink(this.url, { provider: this.provider, resource: this.resource });

		if (inNewWindow) {
			Navigate.newWindow(providerLink, { width: 800, height: 600 });
		} else {
			Navigate.gotoExternal(providerLink);
		}
	}
}
