import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppJolticon from '../../vue/components/jolticon/jolticon.vue'
import AppCard from '../card/card.vue';
import {
	getLinkedAccountPlatformIcon,
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
	TumblrBlog,
} from './linked-account.model';
import { ModalTumblrBlogSelector } from './tumblr-blog-selector-modal/tumblr-blog-selector-modal-service';

@Component({
	components: { AppJolticon, AppCard },
})
export default class AppLinkedAccount extends Vue {
	@Prop(LinkedAccount)
	account!: LinkedAccount | null;

	@Prop(String)
	provider!: string;

	@Prop(Boolean)
	preview?: boolean;

	@Prop(Boolean)
	spanWidth?: boolean;

	@Prop(Boolean)
	disabled?: boolean;

	@Prop(Boolean)
	showTumblrBlog?: boolean;

	get providerIcon() {
		const provider = this.getProvider();
		return getLinkedAccountPlatformIcon(provider);
	}

	get providerName() {
		const provider = this.getProvider();
		return getLinkedAccountProviderDisplayName(provider);
	}

	get platformLink() {
		if (this.account) {
			return this.account.platformLink;
		}
	}

	get isAccountSet() {
		return !!this.account && this.account.provider_id && this.account.name;
	}

	private getProvider() {
		return this.account ? this.account.provider : this.provider;
	}

	@Emit('sync')
	emitSync(_provider: string) {}

	@Emit('unlink')
	emitUnlink(_provider: string) {}

	@Emit('link')
	emitLink(_provider: string) {}

	@Emit('link-tumblr-blog')
	emitLinkTumblrBlog(_blog: TumblrBlog) {}

	@Emit('unlink-tumblr-blog')
	emitUnlinkTumblrBlog() {}

	onSync() {
		this.emitSync(this.getProvider());
	}

	onUnlink() {
		this.emitUnlink(this.getProvider());
	}

	onLink() {
		this.emitLink(this.getProvider());
	}

	async onSelectTumblrBlog() {
		if (!this.account) {
			return;
		}

		const modalResult = await ModalTumblrBlogSelector.show(
			this.account,
			this.$gettext('Select Tumblr Blog')
		);

		if (modalResult) {
			// do not send if the same blog was already selected
			if (
				this.account.tumblrSelectedBlog &&
				JSON.stringify(modalResult) === JSON.stringify(this.account.tumblrSelectedBlog)
			) {
				return;
			}

			this.emitLinkTumblrBlog(modalResult);
		}
	}

	async onUnlinkTumblrBlog() {
		this.emitUnlinkTumblrBlog();
	}
}
