import { Component, Prop } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../utils/array';
import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../_common/api/api.service';
import { Device } from '../../../../_common/device/device.service';
import { filesize } from '../../../../_common/filters/filesize';
import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { ClientLibraryAction, ClientLibraryStore } from '../../../store/client-library';

@Component({
	components: {
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
