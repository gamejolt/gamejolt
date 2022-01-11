import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Environment } from '../../../_common/environment/environment.service';
import { formatCurrency } from '../../../_common/filters/currency';
import { formatFilesize } from '../../../_common/filters/filesize';
import { GameBuild } from '../../../_common/game/build/build.model';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import { Sellable } from '../../../_common/sellable/sellable.model';
import { useCommonStore } from '../../../_common/store/common-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppFadeCollapse from '../../components/fade-collapse/fade-collapse.vue';
import AppModal from '../../components/modal/modal.vue';
import { Store } from '../../store/index';
import AppPayment from '../payment/payment.vue';

@Options({
	components: {
		AppModal,
		AppFadeCollapse,
		AppPayment,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppDownload extends Vue {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
	@State packageCard!: Store['packageCard'];
	@State game!: Store['game'];
	@State developer!: Store['developer'];
	@State package!: Store['package'];
	@State sellable!: Store['sellable'];
	@State pricing!: NonNullable<Store['pricing']>;
	@State price!: NonNullable<Store['price']>;

	isShowingMoreOptions = false;
	isDescriptionCollapsed = false;
	isShowingDescription = false;
	isShowingPayment = false;
	clickedBuild?: GameBuild;

	readonly GameBuild = GameBuild;
	readonly formatFilesize = formatFilesize;
	readonly formatCurrency = formatCurrency;

	// "Convenience" I guess
	get hasBrowserBuild() {
		return !!this.packageCard.browserBuild;
	}
	get browserBuild() {
		return this.packageCard.browserBuild!;
	}
	get hasDownloadableBuild() {
		return !!this.packageCard.downloadableBuild;
	}
	get downloadableBuild() {
		return this.packageCard.downloadableBuild!;
	}
	get showcasedBrowserIcon() {
		return this.packageCard.showcasedBrowserIcon;
	}
	get platformSupportInfo() {
		return this.packageCard.platformSupportInfo;
	}
	get showcasedOs() {
		return this.packageCard.showcasedOs;
	}
	get showcasedOsIcon() {
		return this.packageCard.showcasedOsIcon;
	}
	get extraBuilds() {
		return this.packageCard.extraBuilds;
	}
	get otherOnly() {
		return this.packageCard.otherOnly;
	}

	get shouldShowDevDescription() {
		return (
			this.app.user &&
			this.game.developer.id === this.app.user.id &&
			!this.package.description
		);
	}

	async buildClick(build?: GameBuild) {
		// We only allow undefined builds for TS typing reasons within the view.
		// It shouldn't ever actually happen.
		if (!build) {
			throw new Error('Build must always be set.');
		}

		if (this.sellable.type === Sellable.TYPE_PWYW && !this.isShowingPayment) {
			this.clickedBuild = build;
			this.isShowingPayment = true;
			return;
		}

		this.isShowingPayment = false;

		Analytics.trackEvent('game-widget', 'dowload');

		HistoryTick.sendBeacon('game-build', build.id, {
			sourceResource: 'Game',
			sourceResourceId: this.game.id,
		});

		if (build.isBrowserBased || build.type === GameBuild.TYPE_ROM) {
			Analytics.trackEvent('game-play', 'play');

			// We have to open the window first before getting the URL. The browser
			// will block the popup unless it's done directly in the onclick
			// handler. Once we have the download URL we can direct the window that
			// we now have the reference to.
			const win = window.open('');
			if (win) {
				// For some reason "win" in null in dev.
				const payload = await build.getDownloadUrl();
				win.location.href = payload.url;
			}
		} else {
			Analytics.trackEvent('game-play', 'download');
			window.open(Environment.baseUrl + build.getUrl(this.game, 'download'));
		}
	}
}
