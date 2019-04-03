import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Device } from 'game-jolt-frontend-lib/components/device/device.service';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppGamePackageCard from 'game-jolt-frontend-lib/components/game/package/card/card.vue';
import { GamePackagePayloadModel } from 'game-jolt-frontend-lib/components/game/package/package-payload.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { arrayIndexBy } from 'game-jolt-frontend-lib/utils/array';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { filesize } from 'game-jolt-frontend-lib/vue/filters/filesize';
import { Component, Prop } from 'vue-property-decorator';
import { ClientLibraryAction, ClientLibraryStore } from '../../../store/client-library';

@Component({
	components: {
		AppJolticon,
		AppLoading,
		AppGamePackageCard,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		filesize,
	},
})
export default class AppClientInstallPackageModal extends BaseModal {
	@Prop(Game) game!: Game;

	@ClientLibraryAction packageInstall!: ClientLibraryStore['packageInstall'];

	isLoading = true;
	packageData: GamePackagePayloadModel = null as any;

	get buildsByPackage(): { [packageId: number]: GameBuild } {
		const builds = this.packageData.installableBuilds;
		if (!builds) {
			return {};
		}

		return arrayIndexBy(builds, 'game_package_id');
	}

	get installablePackages() {
		const packagesById = arrayIndexBy(this.packageData.packages, 'id');
		return Object.keys(this.buildsByPackage)
			.map(pkgId => packagesById[pkgId])
			.filter(pkg => !!pkg);

		// Can probably also just do this, but the above seems more resillient.
		// I don't want to assume installableBuilds is always necessarily computed from this.packageData.packages
		// return this.packageData.packages.filter(p => !!this.buildsByPackage[p.id]);
	}

	async created() {
		const payload = await Api.sendRequest(`/web/discover/games/packages/${this.game.id}`);
		this.packageData = new GamePackagePayloadModel(payload);

		const os = Device.os();
		const arch = Device.arch();
		this.packageData.installableBuilds = Game.pluckInstallableBuilds(
			this.packageData.packages,
			os!,
			arch
		);

		this.isLoading = false;
	}
}
