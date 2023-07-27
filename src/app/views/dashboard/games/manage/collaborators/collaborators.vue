<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import { Collaborator } from '../../../../../../_common/collaborator/collaborator.model';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import AppTimeAgo from '../../../../../../_common/time/AppTimeAgo.vue';
import { arrayRemove } from '../../../../../../utils/array';
import FormGameCollaborator from '../../../../../components/forms/game/collaborator/collaborator.vue';
import { useGameDashRouteController } from '../manage.store';

@Options({
	name: 'RouteDashGamesManageCollaborators',
	components: {
		AppTimeAgo,
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormGameCollaborator,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/collaborators/' + route.params.id),
})
export default class RouteDashGamesManageCollaborators extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	collaborators: Collaborator[] = [];
	activeCollaborator: Collaborator | null = null;
	isAdding = false;

	readonly Collaborator = Collaborator;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Collaborators for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.collaborators = Collaborator.populate($payload.collaborators);
		if (!this.collaborators.length) {
			this.isAdding = true;
		}
	}

	onAdded(collaborator: Collaborator) {
		this.isAdding = false;
		this.collaborators.push(collaborator);
	}

	onSaved() {
		this.activeCollaborator = null;
	}

	async remove(collaborator: Collaborator) {
		const ret = await showModalConfirm(
			this.$gettext(
				`Are you sure you want to remove this collaborator? They will no longer be able to make changes to the game.`
			),
			this.$gettext('Remove Collaborator?')
		);

		if (!ret) {
			return;
		}

		try {
			await collaborator.$remove();

			showSuccessGrowl(
				this.$gettext('The collaborator has been removed.'),
				this.$gettext('Collaborator Removed')
			);

			arrayRemove(this.collaborators, i => i.id === collaborator.id);

			if (!this.collaborators.length) {
				this.isAdding = true;
			}
		} catch (e) {
			showErrorGrowl(this.$gettext('Could not remove collaborator for some reason.'));
		}
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="page-help">
						<p>
							<AppTranslate>
								Allow other users to manage your game by giving them collaborator
								roles.
							</AppTranslate>
						</p>
					</div>
				</div>

				<div class="col-sm-8 col-sm-pull-4">
					<AppCardList
						:items="collaborators"
						:active-item="activeCollaborator"
						:is-adding="isAdding"
						@activate="activeCollaborator = $event"
					>
						<AppCardListItem
							v-for="collaborator of collaborators"
							:key="collaborator.id"
							:item="collaborator"
						>
							<a class="card-remove" @click.stop="remove(collaborator)">
								<AppJolticon icon="remove" />
							</a>

							<div class="card-title">
								<h5>{{ collaborator.user?.username }}</h5>
							</div>

							<div class="card-meta">
								<span class="tag">
									<template
										v-if="
											collaborator.role ===
											Collaborator.ROLE_EQUAL_COLLABORATOR
										"
									>
										<AppTranslate>Collaborator</AppTranslate>
									</template>
									<template
										v-else-if="
											collaborator.role ===
											Collaborator.ROLE_COMMUNITY_MANAGER
										"
									>
										<AppTranslate>Community Manager</AppTranslate>
									</template>
									<template
										v-else-if="
											collaborator.role === Collaborator.ROLE_DEVELOPER
										"
									>
										<AppTranslate>Developer</AppTranslate>
									</template>
									<template v-else> - </template>
								</span>

								<template v-if="collaborator.status !== Collaborator.STATUS_ACTIVE">
									<span class="tag"><AppTranslate>Invited</AppTranslate></span>
									<br />
									<AppTranslate>
										This user hasn't accepted their invitation yet.
									</AppTranslate>
								</template>
							</div>

							<template #body>
								<FormGameCollaborator
									:model="collaborator"
									:game="game"
									@submit="onSaved"
								/>
							</template>
						</AppCardListItem>

						<AppCardListAdd
							:label="$gettext(`Add Collaborator`)"
							@toggle="isAdding = !isAdding"
						>
							<FormGameCollaborator :game="game" @submit="onAdded" />
						</AppCardListAdd>
					</AppCardList>
				</div>
			</div>
		</div>
	</section>
</template>
