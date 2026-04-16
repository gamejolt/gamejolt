<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppDashGameWizardControls from '~app/components/forms/game/wizard-controls/AppDashGameWizardControls.vue';
import { showGamePackageEditModal } from '~app/components/game/package/edit-modal/edit-modal.service';
import AppGamePerms from '~app/components/game/perms/AppGamePerms.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppCardList from '~common/card/list/AppCardList.vue';
import AppCardListDraggable from '~common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '~common/card/list/AppCardListItem.vue';
import { formatCurrency } from '~common/filters/currency';
import {
	$removeGamePackage,
	$saveGamePackageSort,
	GamePackageModel,
	GamePackageVisibility,
} from '~common/game/package/package.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { SellableModel } from '~common/sellable/sellable.model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { arrayIndexBy } from '~utils/array';

export default {
	name: 'RouteDashGamesManageGamePackagesList',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/packages/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();
const routeStore = useGameDashRouteController()!;
const game = computed(() => routeStore.game.value!);

const packages = ref<GamePackageModel[]>([]);
const sellables = ref<{ [x: number]: SellableModel }>({});

const GamePackageVisibilityPrivate = GamePackageVisibility.Private;

const hasAllPerms = computed(() => game.value.hasPerms('all'));
const hasBuildsPerms = computed(() => game.value.hasPerms('builds'));
const packagesSort = computed(() => packages.value.map(i => i.id));

function saveSort(pkgs: GamePackageModel[]) {
	packages.value = pkgs;
	$saveGamePackageSort(game.value.id, packagesSort.value);
}

async function addPackage() {
	const newPackage = await showGamePackageEditModal(routeStore);
	if (newPackage instanceof GamePackageModel) {
		packages.value.push(newPackage);
	}
}

async function removePackage(pkg: GamePackageModel) {
	const result = await showModalConfirm(
		$gettext(
			'Are you sure you want to remove this package? All of the releases and builds it contains will be removed as well.'
		)
	);

	if (!result) {
		return;
	}

	await $removeGamePackage(pkg, game.value);

	showSuccessGrowl($gettext('The game package has been removed.'), $gettext('Package Removed'));

	appRoute.reload();
}

const appRoute = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Manage Packages for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		if (payload.packages && !payload.packages.length) {
			if (game.value.hasPerms('all')) {
				router.replace({
					name: 'dash.games.manage.game.packages.add',
					params: {
						id: game.value.id + '',
					},
				});
			}
			packages.value = [];
			sellables.value = {};
			return;
		}

		packages.value = GamePackageModel.populate(payload.packages);
		sellables.value = arrayIndexBy<SellableModel>(
			SellableModel.populate(payload.sellables),
			'game_package_id' as any
		);
	},
});
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
