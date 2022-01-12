import { setup } from 'vue-class-component';
import { Options, Provide, Vue, Watch } from 'vue-property-decorator';
import { AppPromotionStore, AppPromotionStoreKey } from '../utils/mobile-app';
import { shallowSetup } from '../utils/vue';
import { createAdsController } from '../_common/ad/ad-store';
import { Analytics } from '../_common/analytics/analytics.service';
import { CommentStoreManager, CommentStoreManagerKey } from '../_common/comment/comment-store';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { createDrawerStore } from '../_common/drawer/drawer-store';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useCommonStore } from '../_common/store/common-store';
import { getTranslationLang, loadCurrentLanguage } from '../_common/translate/translate.service';
import { ChatStore, ChatStoreKey, clearChat, loadChat } from './components/chat/chat-store';
import AppShell from './components/shell/shell.vue';
import { Store } from './store';

@Options({
	components: {
		AppCommonShell,
		AppShell,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {
	commonStore = setup(() => useCommonStore());
	adsController = setup(() => createAdsController());

	@Provide({ to: ChatStoreKey, reactive: true })
	chatStore = new ChatStore();

	@Provide({ to: CommentStoreManagerKey as symbol })
	commentManager = new CommentStoreManager();

	drawerStore = shallowSetup(() => createDrawerStore());

	@Provide({ to: AppPromotionStoreKey })
	appPromotionStore = new AppPromotionStore();

	get user() {
		return this.commonStore.user;
	}

	$store!: Store;

	// On SSR we want to set mount point for the app to this component so that
	// we can hydrate the component. On browser we want to set the "app" in the
	// index template.
	get id() {
		return import.meta.env.SSR ? 'app' : undefined;
	}

	created() {
		if (!import.meta.env.SSR) {
			performance.measure('gj-shell-init', 'gj-start');
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
			performance.measure('gj-shell-mounted', 'gj-start');
		});

		loadCurrentLanguage();
	}

	/**
	 * When the user changes, we need to change our global app state.
	 */
	@Watch('user.id', { immediate: true })
	onUserChange(userId?: number) {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			this.$store.dispatch('bootstrap');
			if (!import.meta.env.SSR) {
				loadChat(this.chatStore);
				this.$store.dispatch('loadGrid');
				this.$store.dispatch('loadNotificationState');
			}

			if (GJ_IS_DESKTOP_APP) {
				this.$store.dispatch('clientLibrary/bootstrap');
			}
		} else {
			this.$store.dispatch('clear');
			this.$store.dispatch('clearGrid');
			this.$store.dispatch('clearNotificationState');
			clearChat(this.chatStore);
		}
	}
}
