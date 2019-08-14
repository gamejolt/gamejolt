import { Component, Prop } from 'vue-property-decorator';

import { BaseModal } from '../../../modal/base';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue'
import FormGamePackagePayment from '../payment-form/payment-form.vue';
import { Game } from '../../game.model';
import { Sellable } from '../../../sellable/sellable.model';
import { Analytics } from '../../../analytics/analytics.service';
import { GameDownloader } from '../../downloader/downloader.service';
import { User } from '../../../user/user.model';
import AppLoading from '../../../../vue/components/loading/loading.vue'
import { Growls } from '../../../growls/growls.service';
import { VuexStore } from '../../../../utils/vuex';
import { GamePlayModal } from '../../play-modal/play-modal.service';

@Component({
	components: {
		AppLoading,
		AppJolticon,
		FormGamePackagePayment,
	},
})
export default class AppGamePackagePurchaseModal extends BaseModal {
	@Prop(Game) game!: Game;
	@Prop(GamePackage) package!: GamePackage;
	@Prop(GameBuild) build!: GameBuild | null;
	@Prop(Boolean) fromExtraSection!: boolean;
	@Prop(String) partnerKey?: string;
	@Prop(User) partner?: User;

	static hook = {
		downloadPackage: undefined as
			| ((store: VuexStore, game: Game, build: GameBuild) => void)
			| undefined,
	};

	sellable: Sellable = null as any;

	created() {
		this.sellable = this.package._sellable!;
	}

	bought() {
		// Hack to show the sellable as bought without pulling from API.
		this.sellable.is_owned = true;
		if (this.game.sellable && this.game.sellable.id === this.sellable.id) {
			this.game.sellable.is_owned = true;
		}

		Growls.success({
			title: this.$gettext('Order Complete'),
			message: this.$gettextInterpolate(
				'Warm thanks from both %{ developer } and the Game Jolt team.',
				{ developer: this.game.developer.display_name }
			),
			sticky: true,
		});

		this.modal.dismiss();
	}

	get operation() {
		if (!this.build) {
			return 'download';
		}

		let operation = this.build.type === GameBuild.TYPE_DOWNLOADABLE ? 'download' : 'play';
		if (this.build.type === GameBuild.TYPE_ROM && this.fromExtraSection) {
			operation = 'download';
		}
		return operation;
	}

	skipPayment() {
		if (!this.build) {
			throw new Error(`Build isn't set`);
		}

		const operation = this.operation;
		console.log(`${operation}ing build`);

		if (operation === 'play') {
			this.showBrowserModal(this.build);
		} else if (operation === 'download') {
			if (AppGamePackagePurchaseModal.hook.downloadPackage) {
				AppGamePackagePurchaseModal.hook.downloadPackage(this.$store, this.game, this.build);
			} else {
				this.download(this.build);
			}
		}
		this.modal.dismiss();
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-purchase-modal', 'download', 'download');
		GameDownloader.download(this.$router, this.game, build);
	}

	private showBrowserModal(build: GameBuild) {
		Analytics.trackEvent('game-purchase-modal', 'download', 'play');
		GamePlayModal.show(this.game, build);
	}
}
