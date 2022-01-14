<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GamePackage } from '../../../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../../../_common/key-group/key-group.model';
import AppProgressBar from '../../../../../../../_common/progress/bar/bar.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormGameKeyGroup from '../../../../../../components/forms/game/key-group/key-group.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageKeyGroupsList',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppProgressBar,
		FormGameKeyGroup,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/key-groups/' + route.params.id),
})
export default class RouteDashGamesManageKeyGroupsList extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	keyGroups: KeyGroup[] = [];
	packages: GamePackage[] = [];
	isAdding = false;

	readonly KeyGroup = KeyGroup;
	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Key Groups for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.keyGroups = KeyGroup.populate($payload.keyGroups);
		this.packages = GamePackage.populate($payload.packages);
	}

	onKeyGroupAdded(keyGroup: KeyGroup) {
		this.$router.push({
			name: 'dash.games.manage.key-groups.edit',
			params: {
				keyGroupId: keyGroup.id + '',
			},
		});
	}

	divide(left: number | undefined | null, right: number | undefined | null) {
		if (!right) {
			return 0;
		}

		return (left || 0) / right;
	}
}
</script>

<template>
	<div class="route-manage-key-groups">
		<section class="section">
			<div class="container">
				<h2 class="section-header">
					<translate>Access Keys</translate>
				</h2>

				<div class="row">
					<div class="col-md-4 col-md-push-7">
						<div v-translate class="page-help">
							<p>Manage access keys for your game through key groups.</p>
							<p>
								You can create different groups for different types of access, e.g.
								testers, friends, press, let's players, etc.
							</p>
							<p>
								They will be able to access your game's builds through the provided
								keys.
							</p>
						</div>
					</div>

					<div class="col-md-7 col-md-pull-4">
						<app-card-list :items="keyGroups" :is-adding="isAdding">
							<app-card-list-item
								v-for="group of keyGroups"
								:key="group.id"
								:item="group"
							>
								<div class="row">
									<div class="col-sm-8">
										<div class="card-title">
											<h4>
												<router-link
													:to="{
														name: 'dash.games.manage.key-groups.edit',
														params: { keyGroupId: group.id },
													}"
												>
													{{ group.name }}
												</router-link>
											</h4>
										</div>

										<div class="card-meta">
											<span class="tag">
												<template
													v-if="group.type === KeyGroup.TYPE_ANONYMOUS"
												>
													<translate>Unrestricted (Anonymous)</translate>
												</template>
												<template
													v-else-if="
														group.type === KeyGroup.TYPE_ANONYMOUS_CLAIM
													"
												>
													<translate>Claim-Only</translate>
												</template>
												<template
													v-else-if="group.type === KeyGroup.TYPE_EMAIL"
												>
													<translate>Unrestricted (Email)</translate>
												</template>
												<template
													v-else-if="group.type === KeyGroup.TYPE_USER"
												>
													<translate>User</translate>
												</template>
											</span>
										</div>
									</div>
									<div class="col-sm-4">
										<hr class="visible-xs" />

										<div class="key-groups-progress small text-muted">
											<div>
												<strong><translate>Viewed</translate></strong>
												{{ formatNumber(group.viewed_count || 0) }} /
												{{ formatNumber(group.key_count || 0) }}
												({{
													formatNumber(
														divide(group.viewed_count, group.key_count),
														{
															style: 'percent',
															maximumFractionDigits: 2,
														}
													)
												}})
											</div>
											<app-progress-bar
												thin
												:percent="
													((group.viewed_count || 0) /
														(group.key_count || 0)) *
													100
												"
											/>
											<br />

											<div>
												<strong><translate>Claimed</translate></strong>
												{{ formatNumber(group.claimed_count || 0) }} /
												{{ formatNumber(group.key_count || 0) }}
												({{
													formatNumber(
														divide(
															group.claimed_count,
															group.key_count
														),
														{
															style: 'percent',
															maximumFractionDigits: 2,
														}
													)
												}})
											</div>
											<app-progress-bar
												thin
												:percent="
													divide(group.claimed_count, group.key_count) *
													100
												"
											/>
										</div>
									</div>
								</div>

								<div class="card-controls">
									<app-button
										primary
										:to="{
											name: 'dash.games.manage.key-groups.edit',
											params: { keyGroupId: group.id },
										}"
									>
										<translate>Manage</translate>
									</app-button>
								</div>
							</app-card-list-item>

							<app-card-list-add
								:label="$gettext('Add Key Group')"
								@toggle="isAdding = !isAdding"
							>
								<form-game-key-group
									:game="game"
									:packages="packages"
									@submit="onKeyGroupAdded"
								/>
							</app-card-list-add>
						</app-card-list>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.key-groups-progress
	@media $media-sm-up
		text-align: right

	.progress
		margin: 5px 0
</style>
