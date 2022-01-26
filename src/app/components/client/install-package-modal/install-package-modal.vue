<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../../_common/device/device.service';
import { formatFilesize } from '../../../../_common/filters/filesize';
import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
// import { ClientLibraryAction, ClientLibraryStore } from '../../../store/client-library';

@Options({
	components: {
		AppLoading,
		AppGamePackageCard,
	},
})
export default class AppClientInstallPackageModal extends mixins(BaseModal) {
	@Prop(Object) game!: Game;

	// @ClientLibraryAction packageInstall!: ClientLibraryStore['packageInstall'];
	packageInstall!: any;

	isLoading = true;
	packageData: GamePackagePayloadModel = null as any;

	readonly formatFilesize = formatFilesize;

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

		const os = getDeviceOS();
		const arch = getDeviceArch();
		this.packageData.installableBuilds = Game.pluckInstallableBuilds(
			this.packageData.packages,
			os!,
			arch
		);

		this.isLoading = false;
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppJolticon icon="download-box" big />
				<AppTranslate>Choose a Package</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate>
					This game has multiple installable packages. Please choose the one you'd like to
					install.
				</AppTranslate>
			</p>

			<AppLoading v-if="isLoading" big />
			<template v-else-if="installablePackages.length">
				<AppGamePackageCard
					v-for="pkg of installablePackages"
					:key="pkg.id"
					:game="game"
					:sellable="pkg._sellable"
					:package="pkg"
					:releases="pkg._releases"
					:builds="pkg._builds"
				/>
			</template>
			<template v-else class="alert alert-notice">
				<AppTranslate>This game doesn't have any packages to install.</AppTranslate>
			</template>
		</div>
	</AppModal>
</template>
