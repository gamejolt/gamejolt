<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/AppCardListItem.vue';
import { formatCurrency } from '../../../../../../../../_common/filters/currency';
import {
	$saveGamePackageSort,
	GamePackageModel,
	GamePackageVisibility,
} from '../../../../../../../../_common/game/package/package.model';
import { showSuccessGrowl } from '../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import { SellableModel } from '../../../../../../../../_common/sellable/sellable.model';
import { vAppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import { arrayIndexBy } from '../../../../../../../../utils/array';
import { shallowSetup } from '../../../../../../../../utils/vue';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { useGameDashRouteController } from '../../../manage.store';

@Options({
	name: 'RouteDashGamesManageGamePackagesList',
	components: {
		AppCardList,
		AppCardListItem,
		AppDashGameWizardControls,
		AppGamePerms,
		AppCardListDraggable,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/packages/' + route.params.id),
})
export default class RouteDashGamesManageGamePackagesList extends LegacyRouteComponent {
	routeStore = shallowSetup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game.value!;
	}

	packages: GamePackageModel[] = [];
	sellables: { [x: number]: SellableModel } = {};

	readonly GamePackage = GamePackageModel;
	readonly formatCurrency = formatCurrency;
	readonly GamePackageVisibilityPrivate = GamePackageVisibility.Private;

	get hasAllPerms() {
		return this.game.hasPerms('all');
	}

	get hasBuildsPerms() {
		return this.game.hasPerms('builds');
	}

	get packagesSort() {
		return this.packages.map(i => i.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Packages for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		if ($payload.packages && !$payload.packages.length) {
			if (this.game.hasPerms('all')) {
				this.$router.replace({
					name: 'dash.games.manage.game.packages.add',
					params: {
						id: this.game.id + '',
					},
				});
			}
			this.packages = [];
			this.sellables = {};
			return;
		}

		this.packages = GamePackageModel.populate($payload.packages);
		this.sellables = arrayIndexBy<SellableModel>(
			SellableModel.populate($payload.sellables),
			'game_package_id'
		);
	}

	saveSort(packages: GamePackageModel[]) {
		this.packages = packages;
		$saveGamePackageSort(this.game.id, this.packagesSort);
	}

	async addPackage() {
		const newPackage = await GamePackageEditModal.show(this.routeStore);
		if (newPackage instanceof GamePackageModel) {
			this.packages.push(newPackage);
		}
	}

	async removePackage(pkg: GamePackageModel) {
		const result = await showModalConfirm(
			this.$gettext(
				'Are you sure you want to remove this package? All of the releases and builds it contains will be removed as well.'
			)
		);

		if (!result) {
			return;
		}

		await pkg.$remove(this.game);

		showSuccessGrowl(
			this.$gettext('The game package has been removed.'),
			this.$gettext('Package Removed')
		);

		// We have to do a refresh since a new package may have been chosen as
		// the primary sellable.
		this.reloadRoute();
	}
}
</script>

<template>
	<div class="row">
		<div class="col-sm-4 col-sm-push-8">
			<div class="page-help">
				<p>
					<AppTranslate>
						Packages are how you organize and distribute your game's builds and other
						files.
					</AppTranslate>
				</p>
				<p>
					<AppTranslate>
						Your primary package should contain the builds you want people to play. You
						can create new packages to contain additional files, such as level editors,
						art packs, expansions, and other DLC.
					</AppTranslate>
				</p>
				<p>
					<AppLinkHelp page="dev-packages" class="link-help">
						<AppTranslate>Learn more about packages...</AppTranslate>
					</AppLinkHelp>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="game._is_devlog" class="alert">
				<AppJolticon icon="notice" notice />
				{{ ' ' }}
				<b>
					<AppTranslate>
						Public packages do not show on devlog-only game pages.
					</AppTranslate>
				</b>
				{{ ' ' }}
				<AppTranslate>
					You are only able to create private packages for testers while your game page is
					only a devlog. Once you publish your game page into early access or as a
					complete game, your public packages will show.
				</AppTranslate>
			</div>

			<div v-if="!packages.length" class="alert">
				<p v-if="hasAllPerms">
					<AppTranslate>You haven't added any packages yet.</AppTranslate>
				</p>
				<p v-else>
					<AppTranslate>
						This game hasn't got any packages yet, and you don't have permissions to
						create any.
					</AppTranslate>
				</p>
			</div>

			<AppGamePerms required="all" tag="div">
				<AppButton primary block @click="addPackage()">
					<AppTranslate>Add Package</AppTranslate>
				</AppButton>
			</AppGamePerms>
			<br />

			<AppCardList v-if="packages.length" :items="packages" :is-draggable="hasBuildsPerms">
				<AppCardListDraggable item-key="id" @change="saveSort">
					<template #item="{ element: pkg }">
						<AppCardListItem :item="pkg">
							<AppGamePerms required="all">
								<a
									v-if="!pkg.has_sales"
									class="card-remove"
									@click="removePackage(pkg)"
								>
									<AppJolticon icon="remove" />
								</a>
							</AppGamePerms>

							<div class="card-title">
								<h4>
									<template v-if="hasBuildsPerms">
										<router-link
											:to="{
												name: 'dash.games.manage.game.packages.edit',
												params: { packageId: pkg.id },
											}"
										>
											{{ pkg.title || game.title }}
										</router-link>
									</template>
									<template v-else>
										{{ pkg.title || game.title }}
									</template>
								</h4>
							</div>

							<div class="card-meta">
								<span
									v-if="sellables[pkg.id] && sellables[pkg.id].primary"
									v-app-tooltip="
										$gettext(
											`We use the primary package to determine the price to show on game listings.`
										)
									"
									class="tag tag-highlight"
								>
									<AppTranslate>Primary Package</AppTranslate>
								</span>

								<span
									v-if="pkg.visibility === GamePackageVisibilityPrivate"
									v-app-tooltip="
										$gettext(
											`This package will only be available to you and any keys that have access.`
										)
									"
									class="tag tag-notice"
								>
									<AppTranslate>Private</AppTranslate>
								</span>

								<template
									v-if="sellables[pkg.id] && sellables[pkg.id].type === 'pwyw'"
								>
									<span class="tag">
										<AppTranslate>Pay What You Want</AppTranslate>
									</span>
									<span class="dot-separator" />
									<strong>
										<AppTranslate>Suggested Price</AppTranslate>
									</strong>
									&mdash;
									<template
										v-if="
											sellables[pkg.id] &&
											sellables[pkg.id].pricings[0].amount
										"
									>
										{{ formatCurrency(sellables[pkg.id].pricings[0].amount) }}
									</template>
									<template v-else>
										<AppTranslate>None</AppTranslate>
									</template>
								</template>
								<template
									v-else-if="
										sellables[pkg.id] && sellables[pkg.id].type === 'paid'
									"
								>
									<span class="tag">
										<AppTranslate>Paid</AppTranslate>
									</span>
									<span class="dot-separator" />
									<strong>
										<AppTranslate>Price</AppTranslate>
									</strong>
									&mdash;
									{{ formatCurrency(sellables[pkg.id].pricings[0].amount) }}
								</template>
								<template v-else>
									<span class="tag">
										<AppTranslate>Free</AppTranslate>
									</span>
								</template>
							</div>

							<div v-if="pkg.description" class="card-content">
								{{ pkg.description }}
							</div>

							<div class="card-controls">
								<AppGamePerms required="builds">
									<AppButton
										primary
										:to="{
											name: 'dash.games.manage.game.packages.edit',
											params: { packageId: pkg.id },
										}"
									>
										<AppTranslate>Manage</AppTranslate>
									</AppButton>
								</AppGamePerms>
								{{ ' ' }}
								<AppButton
									trans
									:to="{
										name: 'dash.games.manage.game.packages.edit.widget',
										params: { packageId: pkg.id },
									}"
								>
									<AppTranslate>Widget</AppTranslate>
								</AppButton>
								{{ ' ' }}
								<AppGamePerms required="analytics">
									<AppButton
										trans
										:to="{
											name: 'dash.analytics',
											params: {
												resource: 'Game_Package',
												resourceId: pkg.id,
											},
										}"
									>
										<AppTranslate>Analytics</AppTranslate>
									</AppButton>
								</AppGamePerms>
							</div>
						</AppCardListItem>
					</template>
				</AppCardListDraggable>
			</AppCardList>

			<AppDashGameWizardControls :disabled="!game._is_devlog && !game.has_active_builds" />
		</div>
	</div>
</template>
