<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameBuildModel } from '../../../../../../../../../_common/game/build/build.model';
import { GameBuildLaunchOptionModel } from '../../../../../../../../../_common/game/build/launch-option/launch-option.model';
import { GamePackageModel } from '../../../../../../../../../_common/game/package/package.model';
import { GameReleaseModel } from '../../../../../../../../../_common/game/release/release.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import FormGameRelease from '../../../../../../../../components/forms/game/release/release.vue';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageGamePackageReleaseEdit',
	components: {
		FormGameRelease,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['packageId', 'releaseId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/releases/' +
				route.params.id +
				'/' +
				route.params.packageId +
				'/' +
				route.params.releaseId
		),
})
export default class RouteDashGamesManageGamePackageReleaseEdit extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	package: GamePackageModel = null as any;
	release: GameReleaseModel = null as any;
	releases: GameReleaseModel[] = [];
	builds: GameBuildModel[] = [];
	launchOptions: GameBuildLaunchOptionModel[] = [];
	buildDownloadCounts: { [buildId: number]: number } = {};
	areWebBuildsLockedBySellable = false;

	get routeTitle() {
		if (this.game && this.package && this.release) {
			return this.$gettextInterpolate(
				'Edit Release %{ release } - %{ package } - %{ game }',
				{
					game: this.game.title,
					package: this.package.title || this.game.title,
					release: this.release.version_number,
				}
			);
		}
		return null;
	}

	routeResolved($payload: any) {
		this.package = new GamePackageModel($payload.package);
		this.release = new GameReleaseModel($payload.release);
		this.releases = GameReleaseModel.populate($payload.releases);
		this.builds = GameBuildModel.populate($payload.builds);
		this.launchOptions = GameBuildLaunchOptionModel.populate($payload.launchOptions);

		this.buildDownloadCounts = $payload.buildDownloadCounts || {};
		// If the server has no build counts it returns an empty array instead of an empty object.
		// This is an issue with the backend not explicitly casting empty arrays to objects.
		if (Array.isArray(this.buildDownloadCounts)) {
			this.buildDownloadCounts = {};
		}

		this.areWebBuildsLockedBySellable = $payload.package.is_in_paid_sellable || false;
	}

	onSaved() {
		this.$router.push({
			name: 'dash.games.manage.game.packages.edit',
			params: {
				packageId: this.package.id + '',
			},
		});
	}

	async unpublishRelease(release: GameReleaseModel) {
		const result = await showModalConfirm(
			this.$gettext(
				'Are you sure you want to hide this release? It will no longer be accessible from your game page.'
			)
		);

		if (!result) {
			return;
		}

		await release.$unpublish(this.game);

		showSuccessGrowl(
			this.$gettext('The release has been unpublished and is now hidden.'),
			this.$gettext('Release Hidden')
		);
	}

	async removeRelease(release: GameReleaseModel) {
		const result = await showModalConfirm(
			this.$gettext(
				'Are you sure you want to remove this release? All of its builds will be removed as well.'
			)
		);

		if (!result) {
			return;
		}

		await release.$remove(this.game);

		showSuccessGrowl(
			this.$gettext('The release and its builds have been removed from the package.'),
			this.$gettext('Release Removed')
		);

		this.$router.push({
			name: 'dash.games.manage.game.packages.edit',
			params: {
				packageId: this.package.id + '',
			},
		});
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<nav class="breadcrumb">
			<ul>
				<li>
					<router-link :to="{ name: 'dash.games.manage.game.packages.list' }">
						<span class="breadcrumb-tag">&nbsp;</span>
						<AppTranslate>Packages</AppTranslate>
					</router-link>
					<span class="breadcrumb-separator"><AppJolticon icon="chevron-right" /></span>
				</li>
				<li>
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit',
							params: {
								packageId: package.id,
							},
						}"
					>
						<span class="breadcrumb-tag">
							<AppTranslate translate-comment="The noun for package">
								Package
							</AppTranslate>
						</span>
						{{ package.title || game.title }}
					</router-link>
					<span class="breadcrumb-separator"><AppJolticon icon="chevron-right" /></span>
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">
							<AppTranslate translate-comment="The noun for release">
								Release
							</AppTranslate>
						</span>
						{{ release.version_number }}
					</span>
				</li>
			</ul>
		</nav>

		<hr />

		<div class="row">
			<div class="col-lg-9">
				<FormGameRelease
					:model="release"
					:game="game"
					:package="package"
					:builds="builds"
					:launch-options="launchOptions"
					:build-download-counts="buildDownloadCounts"
					:are-web-builds-locked-by-sellable="areWebBuildsLockedBySellable"
					@submit="onSaved"
					@remove-release="removeRelease"
					@unpublish-release="unpublishRelease"
				/>
			</div>
		</div>
	</div>
</template>
