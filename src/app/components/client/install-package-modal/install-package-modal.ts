import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./install-package-modal.html';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { arrayIndexBy } from '../../../../lib/gj-lib-client/utils/array';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { ClientLibraryAction, ClientLibraryStore } from '../../../store/client-library';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';
import { RouteState, RouteStore } from '../../../views/discover/games/view/view.store';
import { AppGamePackageCard } from '../../../../lib/gj-lib-client/components/game/package/card/card';

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
	@ClientLibraryAction packageInstall: ClientLibraryStore['packageInstall'];
	@RouteState partner: RouteStore['partner'];
	@RouteState partnerKey: RouteStore['partnerKey'];

	@Prop(Game) game: Game;

	private isLoading = true;
	private showFullDescription = false;
	private packageData: GamePackagePayloadModel = null as any;

	get buildsByPackage(): { [packageId: number]: GameBuild } {
		const builds = this.packageData.installableBuilds;
		if (!builds) {
			return {};
		}

		return arrayIndexBy(builds, 'game_package_id');
	}

	async created() {
		this.isLoading = true;
		this.showFullDescription = false;

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
