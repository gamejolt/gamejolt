import View from '!view!./install-package-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGamePackageCard } from '../../../../lib/gj-lib-client/components/game/package/card/card';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { arrayIndexBy } from '../../../../lib/gj-lib-client/utils/array';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';
import { ClientLibraryAction, ClientLibraryStore } from '../../../store/client-library';

@View
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
