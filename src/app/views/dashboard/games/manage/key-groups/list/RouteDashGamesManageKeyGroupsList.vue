<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import FormGameKeyGroup from '~app/components/forms/game/key-group/FormGameKeyGroup.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppCardList from '~common/card/list/AppCardList.vue';
import AppCardListAdd from '~common/card/list/AppCardListAdd.vue';
import AppCardListItem from '~common/card/list/AppCardListItem.vue';
import { formatNumber } from '~common/filters/number';
import { GamePackageModel } from '~common/game/package/package.model';
import {
	KeyGroupModel,
	KeyGroupType,
} from '~common/key-group/key-group.model';
import AppProgressBar from '~common/progress/AppProgressBar.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

export default {
	name: 'RouteDashGamesManageKeyGroupsList',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/key-groups/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();
const routeStore = useGameDashRouteController()!;

const game = computed(() => routeStore.game.value!);

const keyGroups = ref<KeyGroupModel[]>([]);
const packages = ref<GamePackageModel[]>([]);
const isAdding = ref(false);

const KeyGroupTypeAnonymous = KeyGroupType.Anonymous;
const KeyGroupTypeAnonymousClaim = KeyGroupType.AnonymousClaim;
const KeyGroupTypeEmail = KeyGroupType.Email;
const KeyGroupTypeUser = KeyGroupType.User;

function onKeyGroupAdded(keyGroup: KeyGroupModel) {
	router.push({
		name: 'dash.games.manage.key-groups.edit',
		params: {
			keyGroupId: keyGroup.id + '',
		},
	});
}

function divide(left: number | undefined | null, right: number | undefined | null) {
	if (!right) {
		return 0;
	}

	return (left || 0) / right;
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Manage Key Groups for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		keyGroups.value = KeyGroupModel.populate(payload.keyGroups);
		packages.value = GamePackageModel.populate(payload.packages);
	},
});
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
									:game="game!"
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
