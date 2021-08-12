import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { trackShareLink } from '../../../analytics/analytics.service';
import { Community } from '../../../community/community.model';
import { FiresidePost } from '../../../fireside/post/post-model';
import { Game } from '../../../game/game.model';
import { Model } from '../../../model/model.service';
import { Navigate } from '../../../navigate/navigate.service';
import { User } from '../../../user/user.model';
import { copyShareLink, ShareProvider } from '../../share.service';

@Component({})
export default class AppShareCardTile extends Vue {
	@Prop({ type: Model, required: true })
	model!: Model;

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
		const leading = 'Check out this awesome';
		let subject = 'thing';
		const trailing = 'on Game Jolt!';

		if (this.model instanceof FiresidePost) {
			subject = 'post';
		} else if (this.model instanceof Community) {
			subject = 'community';
		} else if (this.model instanceof User) {
			subject = 'user';
		} else if (this.model instanceof Game) {
			subject = 'game';
		}

		// Check out this awesome thing on Game Jolt!
		return [leading, subject, trailing].join(' ');
	}

	private get providerLinkData() {
		let base = '';
		let inNewWindow = true;
		const params: string[] = [];

		switch (this.provider) {
			case 'facebook':
				base = `https://www.facebook.com/sharer.php?`;
				params.push(`u=${this.url}`);
				params.push(`quote=${this.phrase}`);
				break;

			case 'fb_messenger':
				base = `http://www.facebook.com/dialog/send?`;
				params.push(`app_id=410666682312265`);
				params.push(`link=${this.url}`);
				params.push(`redirect_uri=${this.url}`);
				break;

			case 'twitter':
				base = `https://twitter.com/intent/tweet?`;
				params.push(`source=tweetbutton`);
				params.push(`url=${this.url}`);
				params.push(`related=Game Jolt`);
				params.push(`text=${this.phrase}`);
				break;

			case 'whatsapp':
				base = `https://wa.me/?`;
				params.push(`text=${this.phrase} ${this.url}`);
				break;

			case 'email':
				inNewWindow = false;

				base = `mailto:?to=&`;
				params.push(`body=${this.phrase} ${this.url}`);
				params.push(`subject=${this.phrase}`);
				break;

			case 'sms':
				inNewWindow = false;

				// I think that iOS uses '&', Android uses '?'
				base = `sms:?&`;
				params.push(`body=${this.phrase} ${this.url}`);
				break;

			case 'reddit':
				base = `https://www.reddit.com/submit?`;
				params.push(`url=${this.url}`);
				params.push(`title=${this.phrase}`);
				break;

			default:
				// If we don't have support for a link for some reason, just copy it.
				copyShareLink(this.url);
				return;
		}

		return {
			providerLink: encodeURI(base + params.join('&')),
			inNewWindow: inNewWindow,
		};
	}

	shareProviderLink() {
		const { inNewWindow, providerLink } = this.providerLinkData ?? {};
		if (!providerLink) {
			return;
		}

		trackShareLink(this.url, this.provider);

		if (inNewWindow) {
			Navigate.newWindow(providerLink);
		} else {
			Navigate.gotoExternal(providerLink);
		}
	}
}
