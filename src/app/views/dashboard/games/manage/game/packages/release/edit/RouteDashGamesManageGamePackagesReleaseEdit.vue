<script lang="ts">
import { Api } from '../../../../../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';

export default {
	name: 'RouteDashGamesManageGamePackageReleaseEdit',
	...defineAppRouteOptions({
		reloadOn: { params: ['packageId', 'releaseId'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/releases/' +
					route.params.id +
					'/' +
					route.params.packageId +
					'/' +
					route.params.releaseId
			),
	}),
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { GameBuildModel } from '../../../../../../../../../_common/game/build/build.model';
import { GameBuildLaunchOptionModel } from '../../../../../../../../../_common/game/build/launch-option/launch-option.model';
import { GamePackageModel } from '../../../../../../../../../_common/game/package/package.model';
import {
	$removeGameRelease,
	$unpublishGameRelease,
	GameReleaseModel,
} from '../../../../../../../../../_common/game/release/release.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import FormGameRelease from '../../../../../../../../components/forms/game/release/FormGameRelease.vue';
import { useGameDashRouteController } from '../../../../manage.store';

const router = useRouter();
const routeStore = useGameDashRouteController()!;

const game = computed(() => routeStore.game!);

const pkg = ref<GamePackageModel>(null as any);
const release = ref<GameReleaseModel>(null as any);
const releases = ref<GameReleaseModel[]>([]);
const builds = ref<GameBuildModel[]>([]);
const launchOptions = ref<GameBuildLaunchOptionModel[]>([]);
const buildDownloadCounts = ref<{ [buildId: number]: number }>({});
const areWebBuildsLockedBySellable = ref(false);

function onSaved() {
	router.push({
		name: 'dash.games.manage.game.packages.edit',
		params: {
			packageId: pkg.value.id + '',
		},
	});
}

async function unpublishRelease(releaseItem: GameReleaseModel) {
	const result = await showModalConfirm(
		$gettext(
			'Are you sure you want to hide this release? It will no longer be accessible from your game page.'
		)
	);

	if (!result) {
		return;
	}

	await $unpublishGameRelease(releaseItem, game.value);

	showSuccessGrowl(
		$gettext('The release has been unpublished and is now hidden.'),
		$gettext('Release Hidden')
	);
}

async function removeRelease(releaseItem: GameReleaseModel) {
	const result = await showModalConfirm(
		$gettext(
			'Are you sure you want to remove this release? All of its builds will be removed as well.'
		)
	);

	if (!result) {
		return;
	}

	await $removeGameRelease(releaseItem, game.value);

	showSuccessGrowl(
		$gettext('The release and its builds have been removed from the package.'),
		$gettext('Release Removed')
	);

	router.push({
		name: 'dash.games.manage.game.packages.edit',
		params: {
			packageId: pkg.value.id + '',
		},
	});
}

const appRoute = createAppRoute({
	routeTitle: computed(() => {
		if (game.value && pkg.value && release.value) {
			return $gettext('Edit Release %{ release } - %{ package } - %{ game }', {
				game: game.value.title,
				package: pkg.value.title || game.value.title,
				release: release.value.version_number,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		pkg.value = new GamePackageModel(payload.package);
		release.value = new GameReleaseModel(payload.release);
		releases.value = GameReleaseModel.populate(payload.releases);
		builds.value = GameBuildModel.populate(payload.builds);
		launchOptions.value = GameBuildLaunchOptionModel.populate(payload.launchOptions);

		buildDownloadCounts.value = payload.buildDownloadCounts || {};
		if (Array.isArray(buildDownloadCounts.value)) {
			buildDownloadCounts.value = {};
		}

		areWebBuildsLockedBySellable.value = payload.package.is_in_paid_sellable || false;
	},
});
</script>

<template>
	<div v-if="appRoute.isBootstrapped.value">
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
								packageId: pkg.id,
							},
						}"
					>
						<span class="breadcrumb-tag">
							<AppTranslate translate-comment="The noun for package">
								Package
							</AppTranslate>
						</span>
						{{ pkg.title || game.title }}
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
					:package="pkg"
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
