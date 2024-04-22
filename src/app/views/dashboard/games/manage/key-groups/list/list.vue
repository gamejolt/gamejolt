<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListItem from '../../../../../../../_common/card/list/AppCardListItem.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GamePackageModel } from '../../../../../../../_common/game/package/package.model';
import {
	KeyGroupModel,
	KeyGroupType,
} from '../../../../../../../_common/key-group/key-group.model';
import AppProgressBar from '../../../../../../../_common/progress/AppProgressBar.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
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
@OptionsForLegacyRoute({
	reloadOn: 'never',
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/key-groups/' + route.params.id),
})
export default class RouteDashGamesManageKeyGroupsList extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	keyGroups: KeyGroupModel[] = [];
	packages: GamePackageModel[] = [];
	isAdding = false;

	readonly formatNumber = formatNumber;
	readonly KeyGroupTypeAnonymous = KeyGroupType.Anonymous;
	readonly KeyGroupTypeAnonymousClaim = KeyGroupType.AnonymousClaim;
	readonly KeyGroupTypeEmail = KeyGroupType.Email;
	readonly KeyGroupTypeUser = KeyGroupType.User;

	get routeTitle() {
		if (this.game) {
			return this.$gettext('Manage Key Groups for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.keyGroups = KeyGroupModel.populate($payload.keyGroups);
		this.packages = GamePackageModel.populate($payload.packages);
	}

	onKeyGroupAdded(keyGroup: KeyGroupModel) {
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
					<AppTranslate>Access Keys</AppTranslate>
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
						<AppCardList :items="keyGroups" :is-adding="isAdding">
							<AppCardListItem
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
													v-if="group.type === KeyGroupTypeAnonymous"
												>
													<AppTranslate>
														Unrestricted (Anonymous)
													</AppTranslate>
												</template>
												<template
													v-else-if="
														group.type === KeyGroupTypeAnonymousClaim
													"
												>
													<AppTranslate>Claim-Only</AppTranslate>
												</template>
												<template
													v-else-if="group.type === KeyGroupTypeEmail"
												>
													<AppTranslate>
														Unrestricted (Email)
													</AppTranslate>
												</template>
												<template
													v-else-if="group.type === KeyGroupTypeUser"
												>
													<AppTranslate>User</AppTranslate>
												</template>
											</span>
										</div>
									</div>
									<div class="col-sm-4">
										<hr class="visible-xs" />

										<div class="key-groups-progress small text-muted">
											<div>
												<strong><AppTranslate>Viewed</AppTranslate></strong>
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
											<AppProgressBar
												thin
												:percent="
													((group.viewed_count || 0) /
														(group.key_count || 0)) *
													100
												"
											/>
											<br />

											<div>
												<strong>
													<AppTranslate>Claimed</AppTranslate>
												</strong>
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
											<AppProgressBar
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
									<AppButton
										primary
										:to="{
											name: 'dash.games.manage.key-groups.edit',
											params: { keyGroupId: group.id },
										}"
									>
										<AppTranslate>Manage</AppTranslate>
									</AppButton>
								</div>
							</AppCardListItem>

							<AppCardListAdd
								:label="$gettext('Add Key Group')"
								@toggle="isAdding = !isAdding"
							>
								<FormGameKeyGroup
									:game="game"
									:packages="packages"
									@submit="onKeyGroupAdded"
								/>
							</AppCardListAdd>
						</AppCardList>
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
