<script lang="ts">
import { Options } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../../../../../utils/array';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/item/item.vue';
import { formatCurrency } from '../../../../../../../../_common/filters/currency';
import { GamePackage } from '../../../../../../../../_common/game/package/package.model';
import { showSuccessGrowl } from '../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../_common/route/route-component';
import { Sellable } from '../../../../../../../../_common/sellable/sellable.model';
import { AppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

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
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/packages/' + route.params.id),
})
export default class RouteDashGamesManageGamePackagesList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	packages: GamePackage[] = [];
	sellables: { [x: number]: Sellable } = {};

	readonly GamePackage = GamePackage;
	readonly formatCurrency = formatCurrency;

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

		this.packages = GamePackage.populate($payload.packages);
		this.sellables = arrayIndexBy<Sellable>(
			Sellable.populate($payload.sellables),
			'game_package_id'
		);
	}

	saveSort(packages: GamePackage[]) {
		this.packages = packages;
		GamePackage.$saveSort(this.game.id, this.packagesSort);
	}

	async addPackage() {
		const newPackage = await GamePackageEditModal.show(this.game);
		if (newPackage instanceof GamePackage) {
			this.packages.push(newPackage);
		}
	}

	async removePackage(pkg: GamePackage) {
		const result = await ModalConfirm.show(
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
					<translate>
						Packages are how you organize and distribute your game's builds and other
						files.
					</translate>
				</p>
				<p>
					<translate>
						Your primary package should contain the builds you want people to play. You
						can create new packages to contain additional files, such as level editors,
						art packs, expansions, and other DLC.
					</translate>
				</p>
				<p>
					<app-link-help page="dev-packages" class="link-help">
						<translate>dash.games.packages.page_help_link</translate>
					</app-link-help>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="game._is_devlog" class="alert">
				<app-jolticon icon="notice" notice />
				<b><translate>Public packages do not show on devlog-only game pages.</translate></b>
				<translate>
					You are only able to create private packages for testers while your game page is
					only a devlog. Once you publish your game page into early access or as a
					complete game, your public packages will show.
				</translate>
			</div>

			<div v-if="!packages.length" class="alert">
				<p v-if="hasAllPerms"><translate>You haven't added any packages yet.</translate></p>
				<p v-else>
					<translate>
						This game hasn't got any packages yet, and you don't have permissions to
						create any.
					</translate>
				</p>
			</div>

			<app-game-perms required="all" tag="div">
				<app-button primary block @click="addPackage()">
					<translate>dash.games.packages.add_package_button</translate>
				</app-button>
			</app-game-perms>
			<br />

			<app-card-list v-if="packages.length" :items="packages" :is-draggable="hasBuildsPerms">
				<app-card-list-draggable item-key="id" @change="saveSort">
					<template #item="{ element: pkg }">
						<app-card-list-item :item="pkg">
							<app-game-perms required="all">
								<a
									v-if="!pkg.has_sales"
									class="card-remove"
									@click="removePackage(pkg)"
								>
									<app-jolticon icon="remove" />
								</a>
							</app-game-perms>

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
									<translate>Primary Package</translate>
								</span>

								<span
									v-if="pkg.visibility === GamePackage.VISIBILITY_PRIVATE"
									v-app-tooltip="
										$gettext(
											`This package will only be available to you and any keys that have access.`
										)
									"
									class="tag tag-notice"
								>
									<translate>Private</translate>
								</span>

								<template
									v-if="sellables[pkg.id] && sellables[pkg.id].type === 'pwyw'"
								>
									<span class="tag">
										<translate>Pay What You Want</translate>
									</span>
									<span class="dot-separator" />
									<strong>
										<translate>Suggested Price</translate>
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
										<translate>None</translate>
									</template>
								</template>
								<template
									v-else-if="
										sellables[pkg.id] && sellables[pkg.id].type === 'paid'
									"
								>
									<span class="tag">
										<translate>Paid</translate>
									</span>
									<span class="dot-separator" />
									<strong>
										<translate>Price</translate>
									</strong>
									&mdash;
									{{ formatCurrency(sellables[pkg.id].pricings[0].amount) }}
								</template>
								<template v-else>
									<span class="tag">
										<translate>Free</translate>
									</span>
								</template>
							</div>

							<div v-if="pkg.description" class="card-content">
								{{ pkg.description }}
							</div>

							<div class="card-controls">
								<app-game-perms required="builds">
									<app-button
										primary
										:to="{
											name: 'dash.games.manage.game.packages.edit',
											params: { packageId: pkg.id },
										}"
									>
										<translate>Manage</translate>
									</app-button>
								</app-game-perms>
								<app-button
									trans
									:to="{
										name: 'dash.games.manage.game.packages.edit.widget',
										params: { packageId: pkg.id },
									}"
								>
									<translate>Widget</translate>
								</app-button>
								<app-game-perms required="analytics">
									<app-button
										trans
										:to="{
											name: 'dash.analytics',
											params: {
												resource: 'Game_Package',
												resourceId: pkg.id,
											},
										}"
									>
										<translate>Analytics</translate>
									</app-button>
								</app-game-perms>
							</div>
						</app-card-list-item>
					</template>
				</app-card-list-draggable>
			</app-card-list>

			<app-dash-game-wizard-controls
				:disabled="!game._is_devlog && !game.has_active_builds"
			/>
		</div>
	</div>
</template>
