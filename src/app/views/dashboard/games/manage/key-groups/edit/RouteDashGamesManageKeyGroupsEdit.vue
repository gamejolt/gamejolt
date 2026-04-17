<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import FormGameKeyGroupAddKeys from '~app/components/forms/game/key-group/add-keys/FormGameKeyGroupAddKeys.vue';
import FormGameKeyGroup from '~app/components/forms/game/key-group/FormGameKeyGroup.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { Clipboard } from '~common/clipboard/clipboard-service';
import { Environment } from '~common/environment/environment.service';
import AppExpand from '~common/expand/AppExpand.vue';
import { formatNumber } from '~common/filters/number';
import { GamePackageModel } from '~common/game/package/package.model';
import { showErrorGrowl, showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { $removeKey, KeyModel } from '~common/key/key-model';
import { $removeKeyGroup, KeyGroupModel, KeyGroupType } from '~common/key-group/key-group.model';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppProgressBar from '~common/progress/AppProgressBar.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { arrayRemove } from '~utils/array';

export default {
	name: 'RouteDashGamesManageKeyGroupsEdit',
	...defineAppRouteOptions({
		reloadOn: { params: ['keyGroupId'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				`/web/dash/developer/games/key-groups/${route.params.id}/${route.params.keyGroupId}`
			),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const routeStore = useGameDashRouteController()!;

const game = computed(() => routeStore.game.value!);

const keyGroup = ref<KeyGroupModel>(null as any);
const packages = ref<GamePackageModel[]>([]);
const keys = ref<KeyModel[]>([]);

const isShowingAddKeys = ref(false);

const search = ref({
	filter: '',
	state: 'all',
});

const KeyGroupTypeUser = KeyGroupType.User;
const KeyGroupTypeEmail = KeyGroupType.Email;

async function searchKeys() {
	const response = await Api.sendRequest(
		'/web/dash/developer/games/key-groups/search-keys/' +
			`${route.params.id}/${route.params.keyGroupId}`,
		search.value
	);

	keys.value = KeyModel.populate(response.keys);
}

function copyKeyLink(key: KeyModel) {
	Clipboard.copy(`${Environment.baseUrl}/claim/${key.key}`);
}

function onNewKeysAdded() {
	appRoute.reload();
	isShowingAddKeys.value = false;
}

async function removeGroup(kg: KeyGroupModel) {
	const resolved = await showModalConfirm(
		$gettext(
			'Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed.'
		),
		$gettext('Remove key group?')
	);

	if (!resolved) {
		return;
	}

	try {
		await $removeKeyGroup(kg);
	} catch (e) {
		showErrorGrowl($gettext('Could not remove key group for some reason.'));
		return;
	}

	showSuccessGrowl($gettext('The key group has been removed.'), $gettext('Removed Key Group'));

	router.push({
		name: 'dash.games.manage.key-groups.list',
	});
}

async function removeKey(key: KeyModel) {
	const resolved = await showModalConfirm(
		$gettext(
			`Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed.`
		),
		$gettext('Remove key?')
	);

	if (!resolved) {
		return;
	}

	try {
		await $removeKey(key);
	} catch (e) {
		showErrorGrowl($gettext('Could not remove key for some reason.'));
		return;
	}

	showSuccessGrowl($gettext('The key has been removed.'), $gettext('Removed Key'));

	arrayRemove(keys.value, k => k.id === key.id);
}

const appRoute = createAppRoute({
	routeTitle: computed(() => {
		if (keyGroup.value) {
			return $gettext('Edit Key Group: %{ name }', {
				name: keyGroup.value.name,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		keyGroup.value = new KeyGroupModel(payload.keyGroup);
		packages.value = GamePackageModel.populate(payload.packages);
		keys.value = KeyModel.populate(payload.keys);
	},
});
</script>

<template>
	<section v-if="appRoute.isBootstrapped.value" class="section">
		<div class="gj-container">
			<div class="row">
				<div class="col-sm-10 col-md-7 col-lg-6">
					<h2 class="section-header">
						<AppTranslate>Edit Key Group</AppTranslate>
					</h2>

					<FormGameKeyGroup :game="game!" :packages="packages" :model="keyGroup" />
				</div>
				<div class="col-sm-10 col-md-4 col-md-offset-1 col-lg-5">
					<div v-if="keyGroup.type === KeyGroupTypeEmail" class="alert">
						<p>
							<AppTranslate>
								You can hand out this URL for people to retrieve the keys attached
								to their email addresses.
							</AppTranslate>
						</p>
						<a :href="`${Environment.baseUrl}/claim/g-${game.id}`" target="_blank">
							{{ Environment.baseUrl }}/claim/g-{{ game.id }}
						</a>
					</div>
					<div v-else-if="keyGroup.type === KeyGroupTypeUser" class="alert">
						<AppTranslate tag="p">
							Not so fast! In order for the users in this key group to gain access,
							you'll need to email or message their keys to them. Copy each key page
							individually below, or export the full set to a CSV. Once they've
							received and claimed the key into their library, their claim date will
							appear in the table below.
						</AppTranslate>
					</div>

					<h5>
						<strong><AppTranslate>Viewed</AppTranslate></strong>
					</h5>
					<p>
						{{ formatNumber(keyGroup.viewed_count || 0) }} /
						{{ formatNumber(keyGroup.key_count || 0) }}
						<small>
							({{
								formatNumber(
									(keyGroup.viewed_count || 0) / (keyGroup.key_count || 0),
									{
										style: 'percent',
										maximumFractionDigits: 2,
									}
								)
							}})
						</small>
					</p>

					<AppProgressBar
						thin
						:percent="((keyGroup.viewed_count || 0) / (keyGroup.key_count || 0)) * 100"
					/>

					<h5>
						<strong><AppTranslate>Claimed</AppTranslate></strong>
					</h5>
					<p>
						{{ formatNumber(keyGroup.claimed_count || 0) }} /
						{{ formatNumber(keyGroup.key_count || 0) }}
						<small>
							({{
								formatNumber(
									(keyGroup.claimed_count || 0) / (keyGroup.key_count || 0),
									{
										style: 'percent',
										maximumFractionDigits: 2,
									}
								)
							}})
						</small>
					</p>

					<AppProgressBar
						thin
						:percent="((keyGroup.claimed_count || 0) / (keyGroup.key_count || 0)) * 100"
					/>

					<hr />

					<div>
						<AppButton block @click="removeGroup(keyGroup)">
							<AppTranslate>Remove Key Group</AppTranslate>
						</AppButton>
					</div>
				</div>
			</div>

			<h2>
				<div class="section-header-controls">
					<AppButton primary @click="isShowingAddKeys = !isShowingAddKeys">
						<AppTranslate>Add Keys</AppTranslate>
					</AppButton>
					<AppButton
						:href="`${Environment.baseUrl}/x/keys/export-csv/${game.id}/${keyGroup.id}`"
						target="_blank"
					>
						<AppTranslate>Export CSV</AppTranslate>
					</AppButton>
				</div>

				<AppTranslate>Keys</AppTranslate>
			</h2>

			<AppExpand :when="isShowingAddKeys" class="full-bleed-xs">
				<div class="well fill-offset">
					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
							<FormGameKeyGroupAddKeys
								:key-group="keyGroup"
								@submit="onNewKeysAdded"
							/>
						</div>
					</div>
				</div>
			</AppExpand>

			<div class="well fill-offset full-bleed-xs">
				<form class="form-inline" @submit.prevent="searchKeys()">
					<div class="form-group">
						<input
							v-model="search.filter"
							type="text"
							class="form-control"
							style="min-width: 250px"
							:placeholder="$gettext('Filter')"
						/>
					</div>
					{{ ' ' }}
					<AppButton trans @click="searchKeys">
						<AppTranslate>Search</AppTranslate>
					</AppButton>
				</form>
			</div>

			<div class="table-responsive">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>
								<AppTranslate
									translate-comment="Refers to a game's key group's key"
								>
									Key
								</AppTranslate>
							</th>
							<th v-if="keyGroup.type === KeyGroupTypeEmail">
								<AppTranslate>Email</AppTranslate>
							</th>
							<th><AppTranslate>User</AppTranslate></th>
							<th>
								<AppTranslate translate-comment="Refers to claiming a game's key">
									Claimed On
								</AppTranslate>
							</th>
							<th><AppTranslate>Last Viewed On</AppTranslate></th>
							<th />
						</tr>
					</thead>
					<tbody>
						<tr v-for="key of keys" :key="key.id">
							<td>
								<code>{{ key.key }}</code>
								<a
									v-app-tooltip="$gettext(`Copy Key Page URL`)"
									@click="copyKeyLink(key)"
								>
									<AppJolticon icon="link" />
								</a>
							</td>

							<td v-if="keyGroup.type === KeyGroupTypeEmail">
								{{ key.email }}
							</td>

							<td>
								<template v-if="!!key.user_id">
									{{ key.username }}
								</template>
								<template v-else>-</template>
							</td>

							<td>
								<AppTimeAgo v-if="!!key.claimed_on" :date="key.claimed_on" />
								<template v-else>-</template>
							</td>

							<td>
								<AppTimeAgo v-if="!!key.viewed_on" :date="key.viewed_on" />
								<template v-else>-</template>
							</td>

							<td style="text-align: right">
								<AppButton sm sparse trans icon="remove" @click="removeKey(key)" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>
