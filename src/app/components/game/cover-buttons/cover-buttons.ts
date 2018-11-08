import View from '!view!./cover-buttons.html?style=./cover-buttons.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { GameDownloader } from '../../../../lib/gj-lib-client/components/game/downloader/downloader.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { GamePackagePurchaseModal } from '../../../../lib/gj-lib-client/components/game/package/purchase-modal/purchase-modal.service';
import { GamePlayModal } from '../../../../lib/gj-lib-client/components/game/play-modal/play-modal.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { arrayUnique } from '../../../../lib/gj-lib-client/utils/array';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameCoverButtonsBuildButtons } from './build-buttons';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameCoverButtons extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(Array)
	packages!: GamePackage[];

	@Prop(Array)
	downloadableBuilds!: GameBuild[];

	@Prop(Array)
	browserBuilds!: GameBuild[];

	@Prop(Array)
	installableBuilds!: GameBuild[];

	@Prop(String)
	partnerKey?: string;

	@Prop(User)
	partner?: User;

	static hook = {
		buildButtons: undefined as typeof Vue | undefined,
	};

	get buildButtonsComponent() {
		return AppGameCoverButtons.hook.buildButtons || AppGameCoverButtonsBuildButtons;
	}

	private chooseBuild(builds: GameBuild[], defaultBuild?: GameBuild) {
		let chosen: GameBuild | undefined;

		// Do we have to choose between multiple?
		if (builds.length > 1) {
			const packageIds = arrayUnique(builds.map(item => item.game_package_id));

			// All builds in same package, so choose the default one.
			if (packageIds.length <= 1) {
				if (defaultBuild) {
					chosen = defaultBuild;
				}
			} else {
				// When there's more than one package, we have to give them the
				// option of what to play/download.
				this.$emit('show-multiple-packages');
				return false;
			}
		}

		if (!chosen) {
			chosen = defaultBuild;
		}

		return chosen;
	}

	play() {
		Analytics.trackEvent('game-cover-buttons', 'download', 'play');

		// Prioritize HTML build.
		let defaultBuild = this.browserBuilds.find(item => item.type === GameBuild.TYPE_HTML);

		// If no HTML build, use something else.
		if (!defaultBuild && this.browserBuilds.length) {
			defaultBuild = this.browserBuilds[0];
		}

		const build = this.chooseBuild(this.browserBuilds, defaultBuild);

		if (build) {
			// If the build belongs to a pwyw package, open up the package
			// payment form.
			if (build._package!.shouldShowNamePrice()) {
				this.buy(build._package, build);
			} else {
				GamePlayModal.show(this.game, build);
			}
		}
	}

	download() {
		Analytics.trackEvent('game-cover-buttons', 'download', 'download');

		const os = Device.os();
		const arch = Device.arch();

		// This will return builds that may not work for this OS, but it's still the "best" to get.
		const defaultBuild = Game.chooseBestBuild(this.downloadableBuilds, os, arch);

		// We then try to see within the actual installable builds for this OS, if there are
		// multiple packages we may have to choose from.
		const build = this.chooseBuild(this.installableBuilds, defaultBuild);
		if (build) {
			// If the build belongs to a pwyw package, open up the package
			// payment form.
			if (build._package!.shouldShowNamePrice()) {
				this.buy(build._package, build);
			} else {
				GameDownloader.download(this.$router, this.game, build);
			}
		}
	}

	buy(pkg?: GamePackage, build?: GameBuild) {
		if (!pkg) {
			if (!this.game.sellable) {
				return;
			}
			const sellableId = this.game.sellable.id;

			pkg = this.packages.find(item => {
				if (!item._sellable) {
					return false;
				}

				return item._sellable.id === sellableId;
			});
			if (!pkg) {
				return;
			}
		}

		GamePackagePurchaseModal.show({
			game: this.game,
			package: pkg,
			build: build || null,
			partner: this.partner,
			partnerKey: this.partnerKey,
			fromExtraSection: false,
		});
	}
}
