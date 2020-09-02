import Vue from 'vue';
import { Component, Provide, ProvideReactive, Watch } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import { Analytics } from '../_common/analytics/analytics.service';
import { CommentStoreManager, CommentStoreManagerKey } from '../_common/comment/comment-store';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { AppState, AppStore } from '../_common/store/app-store';
import { getTranslationLang } from '../_common/translate/translate.service';
import { ChatClient, ChatKey } from './components/chat/client';
import { ChatClientLazy } from './components/lazy';
import AppShell from './components/shell/shell.vue';
import { Store } from './store';

@Component({
	components: {
		AppCommonShell,
		AppShell,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {
	@ProvideReactive(ChatKey) chat: null | ChatClient = null;
	@Provide(CommentStoreManagerKey) commentManager = new CommentStoreManager();

	@AppState user!: AppStore['user'];

	$store!: Store;

	// On SSR we want to set mount point for the app to this component so that
	// we can hydrate the component. On browser we want to set the "app" in the
	// index template.
	get id() {
		return GJ_IS_SSR ? 'app' : undefined;
	}

	created() {
		if (!GJ_IS_SSR) {
			Analytics.trackTiming('shell', 'vue-init', Date.now() - window._gjStartTime);
			const lang = getTranslationLang();
			if (lang !== 'en_US') {
				Analytics.trackEvent('translations', 'loaded', lang);
			}
		}
	}

	mounted() {
		// Let it finish doing all the initial rendering junk and track after
		// that.
		setTimeout(() => {
			Analytics.trackTiming('shell', 'vue-mounted', Date.now() - window._gjStartTime);
		});

		loadCurrentLanguage(this);
	}

	/**
	 * When the user changes, we need to change our global app state.
	 */
	@Watch('user.id', { immediate: true })
	onUserChange(userId?: number) {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			this.$store.dispatch('bootstrap');
			if (!GJ_IS_SSR) {
				this.initChat();
				this.$store.dispatch('loadGrid');
				this.$store.dispatch('loadNotificationState');
			}

			if (GJ_IS_CLIENT) {
				this.$store.dispatch('clientLibrary/bootstrap');
			}
		} else {
			this.$store.dispatch('clear');
			this.$store.dispatch('clearGrid');
			this.$store.dispatch('clearNotificationState');
			this.clearChat();
		}
	}

	private async initChat() {
		const { ChatClient: ChatClient_ } = await ChatClientLazy();
		this.chat = new ChatClient_();
	}

	private async clearChat() {
		if (!this.chat) {
			return;
		}

		const { destroy } = await ChatClientLazy();
		destroy(this.chat);
		this.chat = null;
	}
}
