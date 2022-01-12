import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { AppTheme } from '../_common/theme/theme';
import { useThemeStore } from '../_common/theme/theme.store';
import AppDownload from './components/download/download.vue';
import AppFooter from './components/footer/footer.vue';
import AppGameHeader from './components/game-header/game-header.vue';
import AppPayment from './components/payment/payment.vue';
import AppProcessingOverlay from './components/processing-overlay/processing-overlay.vue';
import AppToast from './components/toast/toast.vue';
import { Store } from './store/index';

export const WidgetThemeKey = 'widget';

@Options({
	components: {
		AppTheme,
		AppFooter,
		AppProcessingOverlay,
		AppGameHeader,
		AppPayment,
		AppDownload,
		AppToast,
	},
})
export default class App extends Vue {
	themeStore = setup(() => useThemeStore());

	@State isLightTheme!: Store['isLightTheme'];
	@State isLoaded!: Store['isLoaded'];
	@State isProcessing!: Store['isProcessing'];
	@State hasInvalidKey!: Store['hasInvalidKey'];
	@State hasFailure!: Store['hasFailure'];
	@State view!: Store['view'];
	@State sellableKey!: Store['sellableKey'];
	@State game!: Store['game'];

	@Mutation setInvalidKey!: Store['setInvalidKey'];
	@Mutation clearFailure!: Store['clearFailure'];
	@Action bootstrap!: Store['bootstrap'];

	async mounted() {
		if (!this.sellableKey) {
			this.setInvalidKey();
			return;
		}

		await this.bootstrap();
		if (this.game) {
			this.themeStore.setPageTheme({
				key: WidgetThemeKey,
				theme: this.game.theme ?? null,
			});
		}
	}
}
