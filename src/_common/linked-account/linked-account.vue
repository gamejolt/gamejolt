<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../card/AppCard.vue';
import {
	getLinkedAccountPlatformIcon,
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
	TumblrBlog,
} from './linked-account.model';
import { ModalTumblrBlogSelector } from './tumblr-blog-selector-modal/tumblr-blog-selector-modal-service';

@Options({
	components: { AppCard },
})
export default class AppLinkedAccount extends Vue {
	@Prop(Object)
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
		return undefined;
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
</script>

<template>
	<AppCard>
		<div class="-icon">
			<AppJolticon big :icon="providerIcon" />
		</div>

		<div class="-body">
			<h5>
				<AppTranslate>{{ providerName }}</AppTranslate>
			</h5>

			<template v-if="!isAccountSet">
				<p>
					<small class="text-muted">
						<AppTranslate>Not linked.</AppTranslate>
					</small>
				</p>

				<AppButton
					v-if="!preview"
					primary
					:disabled="disabled"
					icon="link"
					@click="onLink()"
				>
					<AppTranslate>Link Now</AppTranslate>
				</AppButton>
			</template>
			<template v-else>
				<p>
					<strong v-if="platformLink">
						<a :href="platformLink" target="_blank">
							{{ account.name }}
						</a>
					</strong>
					<span v-else>
						{{ account.name }}
					</span>
				</p>

				<div v-if="!preview">
					<AppButton :disabled="disabled" @click="onSync()">
						<AppTranslate>Sync</AppTranslate>
					</AppButton>
					<AppButton trans :disabled="disabled" @click="onUnlink()">
						<AppTranslate>Unlink</AppTranslate>
					</AppButton>
				</div>

				<div v-if="showTumblrBlog" class="-tumblr-blog">
					<br />
					<template v-if="account.tumblrSelectedBlog">
						<p>
							<strong>
								<a :href="account.tumblrSelectedBlog.url" target="_blank">
									{{ account.tumblrSelectedBlog.title }}
								</a>
							</strong>
						</p>
						<AppButton :disabled="disabled" @click="onSelectTumblrBlog">
							<AppTranslate>Change Blog</AppTranslate>
						</AppButton>
						<AppButton
							v-if="account.tumblrSelectedBlog"
							:disabled="disabled"
							trans
							@click="onUnlinkTumblrBlog"
						>
							<AppTranslate>Unlink Blog</AppTranslate>
						</AppButton>
					</template>
					<template v-else>
						<div class="alert alert-notice">
							<AppTranslate>
								Before you can publish to Tumblr, you have to select a blog within
								your Tumblr account that you'd like to use.
							</AppTranslate>
						</div>
						<AppButton :disabled="disabled" @click="onSelectTumblrBlog">
							<AppTranslate>Select Blog</AppTranslate>
						</AppButton>
					</template>
				</div>
			</template>

			<slot />
		</div>
	</AppCard>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px

	> h5
		margin: 0
		font-weight: bold

.-facebook-page, .-tumblr-blog
	> h5
		margin-top: 20px
		margin-bottom: 0
		font-weight: bold
</style>
