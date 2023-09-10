<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCard from '../../../../../../../../_common/card/AppCard.vue';
import AppExpand from '../../../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import AppGamePackageCard from '../../../../../../../../_common/game/package/card/AppGamePackageCard.vue';
import { GamePackagePayloadModel } from '../../../../../../../../_common/game/package/package-payload.model';
import {
	GamePackageModel,
	GamePackageVisibility,
} from '../../../../../../../../_common/game/package/package.model';
import {
	$removeGameRelease,
	GameReleaseModel,
	GameReleaseStatus,
} from '../../../../../../../../_common/game/release/release.model';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../../../../_common/loading/AppLoading.vue';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/tab-list.vue';
import AppProgressPoller from '../../../../../../../../_common/progress/poller/AppProgressPoller.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import { SellableModel } from '../../../../../../../../_common/sellable/sellable.model';
import AppTimeAgo from '../../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import { shallowSetup } from '../../../../../../../../utils/vue';
import FormGamePackage from '../../../../../../../components/forms/game/package/package.vue';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { useGameDashRouteController } from '../../../manage.store';

@Options({
	name: 'RouteDashGamesManageGamePackagesEdit',
	components: {
		AppTimeAgo,
		AppNavTabList,
		AppLoading,
		AppGamePackageCard,
		AppCard,
		AppExpand,
		FormGamePackage,
		AppDashGameWizardControls,
		AppProgressPoller,
		AppGamePerms,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['packageId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/packages/' + route.params.id + '/' + route.params.packageId
		),
})
export default class RouteDashGamesManageGamePackagesEdit extends LegacyRouteComponent {
	routeStore = shallowSetup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game.value!;
	}

	package: GamePackageModel = null as any;
	sellable: SellableModel = null as any;
	releases: GameReleaseModel[] = [];

	previewPackage: GamePackageModel | null = null;
	previewSellable: SellableModel | null = null;
	previewData: GamePackagePayloadModel | null = null;
	buildsProcessingCount = 0;
	isLoadingPreview = false;
	isAddingRelease = false;

	readonly GameRelease = GameReleaseModel;
	readonly formatNumber = formatNumber;
	readonly GamePackageVisibilityPublic = GamePackageVisibility.Public;
	readonly GameReleaseStatusHidden = GameReleaseStatus.Hidden;
	readonly GameReleaseStatusPublished = GameReleaseStatus.Published;

	get hasBuildsPerms() {
		return this.game && this.game.hasPerms('builds');
	}

	get hasAnalyticsPerms() {
		return this.game && this.game.hasPerms('analytics');
	}

	get routeTitle() {
		if (this.game && this.package) {
			return this.$gettext(`Edit Package %{ package } - %{ game }`, {
				game: this.game.title,
				package: this.package.title || this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.package = new GamePackageModel($payload.package);
		this.sellable = new SellableModel($payload.sellable);
		this.releases = GameReleaseModel.populate($payload.releases);

		this.previewData = null;
		this.previewPackage = null;

		this.loadPreview();
	}

	async loadPreview() {
		this.isLoadingPreview = true;

		const response = await Api.sendRequest(
			'/web/dash/developer/games/packages/preview/' +
				this.package.game_id +
				'/' +
				this.package.id,
			null,
			{ detach: true }
		);

		// We pull all new stuff for the preview so that we don't step on the form.
		this.previewData = new GamePackagePayloadModel(response);
		this.previewSellable = response.sellable ? new SellableModel(response.sellable) : null;
		this.previewPackage = this.previewData.packages.find(i => i.id === this.package.id) || null;
		this.buildsProcessingCount = response.buildsProcessingCount || 0;
		this.isLoadingPreview = false;

		// Clear out any "bought" status in the sellable so it always shows as if we haven't bought it yet.
		if (this.previewSellable) {
			this.previewSellable.is_owned = false;
		}
	}

	onBuildsProcessed(response: any) {
		this.loadPreview();

		if (response.game) {
			this.game.assign(response.game);
		}
	}

	async editPackage() {
		// Keep our preview in sync.
		await GamePackageEditModal.show(this.routeStore, this.package, this.sellable);
		this.loadPreview();
	}

	async newRelease() {
		this.isAddingRelease = true;

		try {
			const response = await Api.sendRequest(
				'/web/dash/developer/games/releases/create-stub/' +
					this.package.game_id +
					'/' +
					this.package.id,
				{},
				{ detach: true }
			);

			this.$router.push({
				name: 'dash.games.manage.game.packages.release.edit',
				params: {
					packageId: this.package.id + '',
					releaseId: response.newReleaseId + '',
				},
			});
		} catch (e) {
			showErrorGrowl(this.$gettext(`Could not create new release.`));
			this.isAddingRelease = false;
		}
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

		await $removeGameRelease(release, this.game);

		showSuccessGrowl(
			this.$gettext('The release and its builds have been removed from the package.'),
			this.$gettext('Release Removed')
		);

		const index = this.releases.findIndex(i => i.id === release.id);
		if (index !== -1) {
			this.releases.splice(index, 1);
		}
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
					<AppJolticon icon="chevron-right" class="breadcrumb-separator" />
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">
							<AppTranslate translate-comment="The noun for package">
								Package
							</AppTranslate>
						</span>
						{{ package.title || game.title }}
					</span>
				</li>
			</ul>
		</nav>

		<hr />

		<AppNavTabList>
			<ul>
				<AppGamePerms required="builds,sales" :either="true" tag="li">
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit',
						}"
						exact-active-class="active"
					>
						<AppTranslate>Edit Package</AppTranslate>
					</router-link>
				</AppGamePerms>
				<li>
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit.widget',
						}"
						exact-active-class="active"
					>
						<AppTranslate>Widget</AppTranslate>
					</router-link>
				</li>
			</ul>
		</AppNavTabList>

		<br />

		<template v-if="$route.name === 'dash.games.manage.game.packages.edit'">
			<div class="row">
				<div class="col-sm-8">
					<div
						v-if="game._is_devlog && package.visibility === GamePackageVisibilityPublic"
						class="alert alert-notice"
					>
						<AppJolticon icon="notice" />
						<span v-translate>
							<strong>
								This package won't show up on your devlog-only game page.
							</strong>
							Switch your game page to early access or complete from the
							Overview/Setup page for it to show.
						</span>
						<router-link
							:to="{
								name: 'dash.games.manage.game.overview',
								params: {
									id: game.id,
								},
							}"
						>
							<AppTranslate>Go to Overview/Setup page</AppTranslate>
						</router-link>
					</div>

					<h3
						:class="{
							'section-header': !(
								game._is_devlog &&
								package.visibility === GamePackageVisibilityPublic
							),
						}"
					>
						<AppTranslate>Package Preview</AppTranslate>
					</h3>

					<AppGamePerms tag="div" required="sales">
						<AppButton primary block @click="editPackage()">
							Edit Package Details
						</AppButton>
						<br />
					</AppGamePerms>

					<AppLoading v-if="isLoadingPreview" />
					<template v-else>
						<AppGamePackageCard
							v-if="previewPackage"
							:game="game"
							:sellable="previewSellable"
							:package="previewPackage"
							:releases="previewPackage ? previewPackage._releases : null"
							:builds="previewPackage ? previewPackage._builds : null"
						/>

						<template v-if="buildsProcessingCount > 0">
							<AppProgressPoller
								:url="`/web/dash/developer/games/packages/poll-processing-builds/${game.id}/${package.id}/${buildsProcessingCount}`"
								@complete="onBuildsProcessed($event)"
							/>

							<div class="alert">
								<AppJolticon icon="notice" />
								<AppTranslate>
									This package has builds that are still processing. They will be
									available in the package as soon as they're finished processing.
								</AppTranslate>
							</div>
						</template>
					</template>
				</div>
			</div>

			<h3>
				<AppTranslate>Releases</AppTranslate>
			</h3>

			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="page-help">
						<p>
							<AppTranslate>
								Releases represent new versions of your package. If you update a
								package, you should add a release. You can group all of the new
								builds for different platforms into a single new release.
							</AppTranslate>
						</p>
						<p>
							<AppLinkHelp page="dev-packages" class="link-help">
								<AppTranslate> Learn more about releases... </AppTranslate>
							</AppLinkHelp>
						</p>
					</div>
				</div>

				<div class="col-sm-8 col-sm-pull-4">
					<div v-if="!releases.length" class="alert alert-notice">
						<p>
							<AppTranslate>There are no releases in this package yet.</AppTranslate>
						</p>
						<p>
							<AppTranslate>
								Add a release to this package in order to upload builds/files to it.
							</AppTranslate>
						</p>
					</div>

					<AppGamePerms tag="div" required="builds">
						<AppButton primary block :disabled="isAddingRelease" @click="newRelease">
							<AppTranslate>New Release</AppTranslate>
						</AppButton>
						<br />
					</AppGamePerms>

					<div v-if="releases.length">
						<AppCard v-for="release of releases" :key="release.id">
							<AppGamePerms required="builds">
								<a class="card-remove" @click="removeRelease(release)">
									<AppJolticon icon="remove" />
								</a>
							</AppGamePerms>

							<div class="card-title">
								<h4>
									<template v-if="hasBuildsPerms">
										<router-link
											:to="{
												name: 'dash.games.manage.game.packages.release.edit',
												params: {
													packageId: package.id,
													releaseId: release.id,
												},
											}"
										>
											{{ release.version_number }}
										</router-link>
									</template>
									<template v-else>
										{{ release.version_number }}
									</template>
								</h4>
							</div>

							<div class="card-meta">
								<template v-if="release.status === GameReleaseStatusHidden">
									<span
										v-if="!release.isScheduled"
										v-app-tooltip="
											$gettext(
												`This release is hidden and won't show up on your game page until published.`
											)
										"
										class="tag"
									>
										<AppJolticon icon="inactive" />
										{{ ' ' }}
										<AppTranslate>Draft</AppTranslate>
									</span>
									<template v-else>
										<span
											v-app-tooltip="
												$gettext(
													`This release is scheduled and will be published to your game page in the future.`
												)
											"
											class="tag tag-notice"
										>
											<AppJolticon icon="calendar-grid" />
											{{ ' ' }}
											<AppTranslate>Scheduled</AppTranslate>
										</span>
										{{ ' ' }}
										<AppTimeAgo :date="release.scheduled_for" without-suffix />
									</template>
								</template>

								<span
									v-if="release.status === GameReleaseStatusPublished"
									v-app-tooltip="
										$gettext(
											`This release is published and can be accessed from your game page.`
										)
									"
									class="tag tag-highlight"
								>
									<AppJolticon icon="active" />
									{{ ' ' }}
									<AppTranslate> Published </AppTranslate>
								</span>

								<span class="dot-separator" />

								<template v-if="!release.build_count">
									<AppTranslate> No builds yet. </AppTranslate>
								</template>
								<template v-else>
									<AppTranslate
										:translate-params="{
											count: formatNumber(release.build_count),
										}"
										:translate-n="release.build_count"
										translate-plural="%{ count } builds"
									>
										%{ count } build
									</AppTranslate>
								</template>
							</div>

							<div v-if="hasBuildsPerms || hasAnalyticsPerms" class="card-controls">
								<AppGamePerms required="builds">
									<AppButton
										primary
										:to="{
											name: 'dash.games.manage.game.packages.release.edit',
											params: {
												packageId: package.id,
												releaseId: release.id,
											},
										}"
									>
										<AppTranslate>Edit Release</AppTranslate>
									</AppButton>
								</AppGamePerms>
								{{ ' ' }}
								<AppGamePerms required="analytics">
									<AppButton
										trans
										:to="{
											name: 'dash.analytics',
											params: {
												resource: 'Game_Release',
												resourceId: release.id,
											},
										}"
									>
										<AppTranslate>Analytics</AppTranslate>
									</AppButton>
								</AppGamePerms>
							</div>
						</AppCard>
					</div>

					<AppDashGameWizardControls
						:disabled="!game._is_devlog && !game.has_active_builds"
					/>
				</div>
			</div>
		</template>

		<router-view />
	</div>
</template>
