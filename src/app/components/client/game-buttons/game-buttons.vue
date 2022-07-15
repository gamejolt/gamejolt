<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { arrayGroupBy } from '../../../../utils/array';
import { shallowSetup } from '../../../../utils/vue';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../../_common/device/device.service';
import { Game } from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { GamePackagePurchaseModal } from '../../../../_common/game/package/purchase-modal/purchase-modal.service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useClientLibraryStore } from '../../../store/client-library';
import AppClientInstallProgress from '../AppClientInstallProgress.vue';
import { ClientInstallPackageModal } from '../install-package-modal/install-package-modal.service';
import { LocalDbPackage } from '../local-db/package/package.model';

@Options({
	components: {
		AppPopper,
		AppClientInstallProgress,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppClientGameButtons extends Vue {
	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	@Prop(Object)
	game!: Game;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	small?: boolean;

	@Prop(Boolean)
	large?: boolean;

	@Prop(String)
	label?: string;

	@Prop(Boolean)
	hasInstallableBuilds?: boolean;

	@Prop(Boolean)
	canInstall?: boolean;

	@Prop(Boolean)
	noProgress?: boolean;

	isLoadingPackageData = false;
	packageDataPromise: Promise<GamePackagePayloadModel> | null = null;

	readonly LocalDbPackage = LocalDbPackage;
	readonly os = getDeviceOS();
	readonly arch = getDeviceArch();

	@Emit('show-launch-options')
	emitShowLaunchOptions() {}

	@Emit('hide-launch-options')
	emitHideLaunchOptions() {}

	@Emit('show-options')
	emitShowOptions() {}

	@Emit('hide-options')
	emitHideOptions() {}

	@Watch('game')
	onGameChange() {
		this.isLoadingPackageData = false;
		this.packageDataPromise = null;
	}

	// We try to pull a package with some action on it.
	// For example, if a package is installing, we want to pull that one to show.
	get localPackage() {
		return this.clientLibrary.findPackageToRepresentGameStatus(this.game.id);
	}

	get gamePackages() {
		return this.clientLibrary.packagesByGameId.value[this.game.id] || [];
	}

	get settledGamePackages() {
		return this.gamePackages.filter(p => p.isSettled);
	}

	get uninstallableGamePackages() {
		return this.gamePackages.filter(p => !p.install_state && !p.isRemoving);
	}

	get installTooltip() {
		if (!this.canInstall) {
			return this.$gettext(`This game is not available for installing on your OS.`);
		}
	}

	async install() {
		Analytics.trackEvent('client-game-buttons', 'install');

		if (!this.packageDataPromise) {
			this.packageDataPromise = this.fetchPackageData();
		}

		const packageData = await this.packageDataPromise;
		const byPackageId = arrayGroupBy(packageData.installableBuilds!, 'game_package_id');
		// If more than one package for their OS, then we have to show an install package modal.
		if (Object.keys(byPackageId).length > 1) {
			ClientInstallPackageModal.show(this.game);
			return;
		}

		const build = Game.chooseBestBuild(packageData.installableBuilds!, this.os!, this.arch);

		// If the build belongs to a pwyw package, open up the package
		// payment form.
		if (build._package!.shouldShowNamePrice()) {
			GamePackagePurchaseModal.show({
				game: this.game,
				package: build._package!,
				build: build,
				fromExtraSection: false,
			});
			return;
		}

		return this.clientLibrary.packageInstall(
			this.game,
			build._package!,
			build._release!,
			build,
			build._launch_options!
		);
	}

	private async fetchPackageData() {
		const payload = await Api.sendRequest('/web/discover/games/packages/' + this.game.id);

		const packageData = new GamePackagePayloadModel(payload);
		packageData.installableBuilds = Game.pluckInstallableBuilds(
			packageData.packages,
			this.os!,
			this.arch
		);

		return packageData;
	}

	pause() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'pause-install');
		this.clientLibrary.installerPause(this.localPackage);
	}

	resume() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'resume-install');
		this.clientLibrary.installerResume(this.localPackage);
	}

	cancel() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'cancel-install');
		this.clientLibrary.packageUninstall(this.localPackage);
	}

	retryInstall() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'retry-install');
		this.clientLibrary.installerRetry(this.localPackage);
	}

	launch(localPackage: LocalDbPackage) {
		// If already running, do nothing.
		if (localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'launch');
		Popper.hideAll();
		return this.clientLibrary.launcherLaunch(localPackage);
	}

	openFolder(localPackage: LocalDbPackage) {
		const fs = require('fs') as typeof import('fs');
		const path = require('path') as typeof import('path');

		fs.readdir(path.resolve(localPackage.install_dir), function (err, files) {
			if (err) {
				return;
			}

			// Just open the first file in the folder.
			// This way we open within the package folder instead of the parent folder.
			nw.Shell.showItemInFolder(path.resolve(localPackage.install_dir, files[0]));
		});
	}

	async uninstallPackage(localPackage: LocalDbPackage) {
		// If running, do nothing.
		if (localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'uninstall');
		Popper.hideAll();

		await this.clientLibrary.packageUninstall(localPackage);
	}
}
</script>

<template>
	<span class="client-game-buttons">
		<span v-if="!localPackage" v-app-tooltip="installTooltip" style="display: inline-block">
			<AppButton
				primary
				solid
				icon="download-box"
				:disabled="!canInstall"
				:overlay="overlay"
				:sm="small"
				:lg="large"
				@click.stop="install()"
			>
				<AppTranslate>Install</AppTranslate>
			</AppButton>
		</span>

		<template v-else>
			<!-- If we're installing -->
			<span v-if="localPackage.install_state || localPackage.update_state">
				<template v-if="localPackage.didInstallFail || localPackage.didUpdateFail">
					<span class="tag tag-notice">
						{{
							localPackage.didInstallFail
								? $gettext('Installation Failed')
								: $gettext('Update Failed')
						}}
					</span>
					<AppButton
						primary
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="retryInstall()"
					>
						<AppTranslate>Retry</AppTranslate>
					</AppButton>
				</template>

				<AppClientInstallProgress v-if="!noProgress" :local-package="localPackage" />

				<template v-if="localPackage.isPatching">
					<template v-if="localPackage.isPatchQueued">
						<AppTranslate class="tag">QUEUED</AppTranslate>
					</template>

					<template v-else-if="localPackage.isUpdating">
						<AppTranslate class="tag tag-highlight">UPDATING</AppTranslate>
					</template>

					<template v-else-if="!localPackage.isPatchQueued">
						<template v-if="!localPackage.isPatchPaused">
							<AppButton
								:overlay="overlay"
								:sm="small"
								:lg="large"
								@click.stop="pause()"
							>
								<AppTranslate v-if="!small">Pause</AppTranslate>
							</AppButton>
						</template>

						<template v-else>
							<AppButton
								primary
								:overlay="overlay"
								:sm="small"
								:lg="large"
								@click.stop="resume()"
							>
								<AppTranslate v-if="!small">Resume</AppTranslate>
							</AppButton>
						</template>
					</template>
				</template>

				<AppButton
					v-if="localPackage.install_state"
					v-app-tooltip="$gettext('Cancel Installation')"
					circle
					icon="remove"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
					@click.stop="cancel()"
				/>
			</span>

			<span v-if="localPackage.isSettled">
				<!-- Single game launching. -->
				<template v-if="gamePackages.length === 1">
					<AppButton
						v-if="!localPackage.isRunning"
						v-app-tooltip="
							localPackage.isRunning
								? $gettext(`This game is currently running.`)
								: undefined
						"
						primary
						solid
						icon="play"
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="launch(localPackage!)"
					>
						<AppTranslate>Launch</AppTranslate>
					</AppButton>
				</template>

				<!-- Multi game launching. -->
				<AppPopper
					v-if="gamePackages.length > 1"
					popover-class="fill-darkest"
					@show="emitShowLaunchOptions()"
					@hide="emitHideLaunchOptions()"
				>
					<AppButton primary solid icon="play" :overlay="overlay" :sm="small" :lg="large">
						<AppTranslate>Launch</AppTranslate>
					</AppButton>

					<template #popover>
						<div class="list-group list-group-dark thin">
							<a
								v-for="pkg of settledGamePackages"
								:key="`launch-${pkg.id}`"
								class="list-group-item has-icon"
								:class="{
									disabled: pkg.isRunning,
								}"
								@click="launch(pkg)"
							>
								<AppJolticon icon="play" />
								{{ pkg.title || game.title }}
							</a>
						</div>
					</template>
				</AppPopper>
			</span>

			<AppPopper
				v-if="!localPackage.install_state"
				class="fill-darkest"
				@show="emitShowOptions()"
				@hide="emitHideOptions()"
			>
				<AppButton
					circle
					icon="ellipsis-v"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
				/>

				<template #popover>
					<div class="list-group list-group-dark thin">
						<router-link
							class="list-group-item has-icon"
							:to="{
								name: 'discover.games.view.overview',
								params: {
									slug: game.slug,
									id: game.id,
								},
							}"
						>
							<AppJolticon icon="gamepad" />
							<AppTranslate>View Game</AppTranslate>
						</router-link>
						<a
							v-for="pkg of settledGamePackages"
							:key="`open-folder-${pkg.id}`"
							class="list-group-item has-icon"
							@click="openFolder(pkg)"
						>
							<AppJolticon icon="folder-open" />
							<span v-translate="{ title: pkg.title || game.title }">
								Open Folder for %{ title }
							</span>
						</a>
						<a
							v-for="pkg of uninstallableGamePackages"
							:key="`uninstall-${pkg.id}`"
							class="list-group-item has-icon"
							:class="{
								disabled: pkg.isRunning,
							}"
							@click="uninstallPackage(pkg)"
						>
							<AppJolticon icon="remove" notice />
							<span v-translate="{ title: pkg.title || game.title }">
								Uninstall %{ title }
							</span>
						</a>
					</div>
				</template>
			</AppPopper>
		</template>
	</span>
</template>
