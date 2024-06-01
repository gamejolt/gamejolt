<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GamePackageModel } from '../../../../../../../_common/game/package/package.model';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../_common/growls/growls.service';
import {
	$removeKeyGroup,
	KeyGroupModel,
	KeyGroupType,
} from '../../../../../../../_common/key-group/key-group.model';
import { $removeKey, KeyModel } from '../../../../../../../_common/key/key-model';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import AppProgressBar from '../../../../../../../_common/progress/AppProgressBar.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import AppTimeAgo from '../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { arrayRemove } from '../../../../../../../utils/array';
import FormGameKeyGroupAddKeys from '../../../../../../components/forms/game/key-group/add-keys/add-keys.vue';
import FormGameKeyGroup from '../../../../../../components/forms/game/key-group/key-group.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageKeyGroupsEdit',
	components: {
		AppProgressBar,
		AppExpand,
		AppTimeAgo,
		FormGameKeyGroup,
		FormGameKeyGroupAddKeys,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	reloadOn: { params: ['keyGroupId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/developer/games/key-groups/${route.params.id}/${route.params.keyGroupId}`
		),
})
export default class RouteDashGamesManageKeyGroupsEdit extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	keyGroup: KeyGroupModel = null as any;
	packages: GamePackageModel[] = [];
	keys: KeyModel[] = [];

	isShowingAddKeys = false;

	search = {
		filter: '',
		state: 'all',
	};

	readonly formatNumber = formatNumber;
	readonly Environment = Environment;
	readonly KeyGroupTypeUser = KeyGroupType.User;
	readonly KeyGroupTypeEmail = KeyGroupType.Email;

	get routeTitle() {
		if (this.keyGroup) {
			return this.$gettext('Edit Key Group: %{ name }', {
				name: this.keyGroup.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.keyGroup = new KeyGroupModel($payload.keyGroup);
		this.packages = GamePackageModel.populate($payload.packages);
		this.keys = KeyModel.populate($payload.keys);
	}

	async searchKeys() {
		const response = await Api.sendRequest(
			'/web/dash/developer/games/key-groups/search-keys/' +
				`${this.$route.params.id}/${this.$route.params.keyGroupId}`,
			this.search
		);

		this.keys = KeyModel.populate(response.keys);
	}

	copyKeyLink(key: KeyModel) {
		Clipboard.copy(`${Environment.baseUrl}/claim/${key.key}`);
	}

	onNewKeysAdded() {
		// Gotta reload to show the new keys.
		this.reloadRoute();
		this.isShowingAddKeys = false;
	}

	async removeGroup(keyGroup: KeyGroupModel) {
		const resolved = await showModalConfirm(
			this.$gettext(
				'Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed.'
			),
			this.$gettext('Remove key group?')
		);

		if (!resolved) {
			return;
		}

		try {
			await $removeKeyGroup(keyGroup);
		} catch (e) {
			showErrorGrowl(this.$gettext('Could not remove key group for some reason.'));
			return;
		}

		showSuccessGrowl(
			this.$gettext('The key group has been removed.'),
			this.$gettext('Removed Key Group')
		);

		this.$router.push({
			name: 'dash.games.manage.key-groups.list',
		});
	}

	async removeKey(key: KeyModel) {
		const resolved = await showModalConfirm(
			this.$gettext(
				`Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed.`
			),
			this.$gettext('Remove key?')
		);

		if (!resolved) {
			return;
		}

		try {
			await $removeKey(key);
		} catch (e) {
			showErrorGrowl(this.$gettext('Could not remove key for some reason.'));
			return;
		}

		showSuccessGrowl(this.$gettext('The key has been removed.'), this.$gettext('Removed Key'));

		arrayRemove(this.keys, k => k.id === key.id);
	}
}
</script>

<template>
	<section v-if="isRouteBootstrapped" class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-7 col-lg-6">
					<h2 class="section-header">
						<AppTranslate>Edit Key Group</AppTranslate>
					</h2>

					<FormGameKeyGroup :game="game" :packages="packages" :model="keyGroup" />
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
						<p v-translate>
							<b>Not so fast!</b>
							In order for the users in this key group to gain access, you'll need to
							email or message their keys to them. Copy each key page individually
							below, or export the full set to a CSV. Once they've received and
							claimed the key into their library, their claim date will appear in the
							table below.
						</p>
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
									translate-cocmment="Refers to a game's key group's key"
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
