<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCard from '../../../../../../../../_common/card/card.vue';
import AppExpand from '../../../../../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import AppGamePackageCard from '../../../../../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../../../../../_common/game/package/package-payload.model';
import { GamePackage } from '../../../../../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../../../../../_common/game/release/release.model';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../../../../_common/loading/loading.vue';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/tab-list.vue';
import { AppProgressPoller } from '../../../../../../../../_common/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../_common/route/route-component';
import { Sellable } from '../../../../../../../../_common/sellable/sellable.model';
import { AppTimeAgo } from '../../../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
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
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['packageId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/packages/' + route.params.id + '/' + route.params.packageId
		),
})
export default class RouteDashGamesManageGamePackagesEdit extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	package: GamePackage = null as any;
	sellable: Sellable = null as any;
	releases: GameRelease[] = [];

	previewPackage: GamePackage | null = null;
	previewSellable: Sellable | null = null;
	previewData: GamePackagePayloadModel | null = null;
	buildsProcessingCount = 0;
	isLoadingPreview = false;
	isAddingRelease = false;

	GamePackage = GamePackage;
	GameRelease = GameRelease;
	formatNumber = formatNumber;

	get hasBuildsPerms() {
		return this.game && this.game.hasPerms('builds');
	}

	get hasAnalyticsPerms() {
		return this.game && this.game.hasPerms('analytics');
	}

	get routeTitle() {
		if (this.game && this.package) {
			return this.$gettextInterpolate(`Edit Package %{ package } - %{ game }`, {
				game: this.game.title,
				package: this.package.title || this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.package = new GamePackage($payload.package);
		this.sellable = new Sellable($payload.sellable);
		this.releases = GameRelease.populate($payload.releases);

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
		this.previewSellable = response.sellable ? new Sellable(response.sellable) : null;
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
		await GamePackageEditModal.show(this.game, this.package, this.sellable);
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

	async removeRelease(release: GameRelease) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.releases.manage.remove_release_confirmation')
		);

		if (!result) {
			return;
		}

		await release.$remove(this.game);

		showSuccessGrowl(
			this.$gettext('dash.games.releases.manage.remove_release_growl'),
			this.$gettext('dash.games.releases.manage.remove_release_growl_title')
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
						<translate>Packages</translate>
					</router-link>
					<app-jolticon icon="chevron-right" class="breadcrumb-separator" />
				</li>
				<li>
					<span class="active">
						<span class="breadcrumb-tag">
							<translate>dash.games.releases.manage.breadcrumb_package</translate>
						</span>
						{{ package.title || game.title }}
					</span>
				</li>
			</ul>
		</nav>

		<hr />

		<app-nav-tab-list>
			<ul>
				<app-game-perms required="builds,sales" :either="true" tag="li">
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit',
						}"
						exact-active-class="active"
					>
						<translate>Edit Package</translate>
					</router-link>
				</app-game-perms>
				<li>
					<router-link
						:to="{
							name: 'dash.games.manage.game.packages.edit.widget',
						}"
						exact-active-class="active"
					>
						<translate>Widget</translate>
					</router-link>
				</li>
			</ul>
		</app-nav-tab-list>

		<br />

		<template v-if="$route.name === 'dash.games.manage.game.packages.edit'">
			<div class="row">
				<div class="col-sm-8">
					<div
						v-if="
							game._is_devlog && package.visibility === GamePackage.VISIBILITY_PUBLIC
						"
						class="alert alert-notice"
					>
						<app-jolticon icon="notice" />
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
							<translate>Go to Overview/Setup page</translate>
						</router-link>
					</div>

					<h3
						:class="{
							'section-header': !(
								game._is_devlog &&
								package.visibility === GamePackage.VISIBILITY_PUBLIC
							),
						}"
					>
						<translate>Package Preview</translate>
					</h3>

					<app-game-perms tag="div" required="sales">
						<app-button primary block @click="editPackage()">
							Edit Package Details
						</app-button>
						<br />
					</app-game-perms>

					<app-loading v-if="isLoadingPreview" />
					<template v-else>
						<app-game-package-card
							v-if="previewPackage"
							:game="game"
							:sellable="previewSellable"
							:package="previewPackage"
							:releases="previewPackage ? previewPackage._releases : null"
							:builds="previewPackage ? previewPackage._builds : null"
						/>

						<template v-if="buildsProcessingCount > 0">
							<app-progress-poller
								:url="`/web/dash/developer/games/packages/poll-processing-builds/${game.id}/${package.id}/${buildsProcessingCount}`"
								@complete="onBuildsProcessed($event)"
							/>

							<div class="alert">
								<app-jolticon icon="notice" />
								<translate>
									This package has builds that are still processing. They will be
									available in the package as soon as they're finished processing.
								</translate>
							</div>
						</template>
					</template>
				</div>
			</div>

			<h3>
				<translate>dash.games.packages.manage.releases.heading</translate>
			</h3>

			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="page-help">
						<p>
							<translate>
								Releases represent new versions of your package. If you update a
								package, you should add a release. You can group all of the new
								builds for different platforms into a single new release.
							</translate>
						</p>
						<p>
							<app-link-help page="dev-packages" class="link-help">
								<translate>
									dash.games.packages.manage.releases.page_help_link
								</translate>
							</app-link-help>
						</p>
					</div>
				</div>

				<div class="col-sm-8 col-sm-pull-4">
					<div v-if="!releases.length" class="alert alert-notice">
						<p><translate>There are no releases in this package yet.</translate></p>
						<p>
							<translate>
								Add a release to this package in order to upload builds/files to it.
							</translate>
						</p>
					</div>

					<app-game-perms tag="div" required="builds">
						<app-button primary block :disabled="isAddingRelease" @click="newRelease">
							<translate>New Release</translate>
						</app-button>
						<br />
					</app-game-perms>

					<div v-if="releases.length">
						<app-card v-for="release of releases" :key="release.id">
							<app-game-perms required="builds">
								<a class="card-remove" @click="removeRelease(release)">
									<app-jolticon icon="remove" />
								</a>
							</app-game-perms>

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
								<template v-if="release.status === GameRelease.STATUS_HIDDEN">
									<span
										v-if="!release.isScheduled"
										v-app-tooltip="
											$gettext(
												`dash.games.packages.manage.releases.hidden_tooltip`
											)
										"
										class="tag"
									>
										<app-jolticon icon="inactive" />
										<translate>Draft</translate>
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
											<app-jolticon icon="calendar-grid" />
											<translate>Scheduled</translate>
										</span>

										<app-time-ago
											:date="release.scheduled_for"
											without-suffix
										/>
									</template>
								</template>

								<span
									v-if="release.status === GameRelease.STATUS_PUBLISHED"
									v-app-tooltip="
										$gettext(
											`dash.games.packages.manage.releases.published_tooltip`
										)
									"
									class="tag tag-highlight"
								>
									<app-jolticon icon="active" />
									<translate>
										dash.games.packages.manage.releases.published_tag
									</translate>
								</span>

								<span class="dot-separator" />

								<template v-if="!release.build_count">
									<translate>
										dash.games.packages.manage.releases.builds_count_none
									</translate>
								</template>
								<template v-else>
									<translate
										:translate-params="{
											count: formatNumber(release.build_count),
										}"
										:translate-n="release.build_count"
										translate-plural="%{ count } builds"
									>
										%{ count } build
									</translate>
								</template>
							</div>

							<div v-if="hasBuildsPerms || hasAnalyticsPerms" class="card-controls">
								<app-game-perms required="builds">
									<app-button
										primary
										:to="{
											name: 'dash.games.manage.game.packages.release.edit',
											params: {
												packageId: package.id,
												releaseId: release.id,
											},
										}"
									>
										<translate>Edit Release</translate>
									</app-button>
								</app-game-perms>

								<app-game-perms required="analytics">
									<app-button
										trans
										:to="{
											name: 'dash.analytics',
											params: {
												resource: 'Game_Release',
												resourceId: release.id,
											},
										}"
									>
										<translate>Analytics</translate>
									</app-button>
								</app-game-perms>
							</div>
						</app-card>
					</div>

					<app-dash-game-wizard-controls
						:disabled="!game._is_devlog && !game.has_active_builds"
					/>
				</div>
			</div>
		</template>

		<router-view />
	</div>
</template>
