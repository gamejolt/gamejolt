<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import {
	$removeCollaboratorInvite,
	CollaboratorModel,
	CollaboratorRole,
	CollaboratorStatus,
} from '../../../../../../_common/collaborator/collaborator.model';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../../utils/array';
import FormGameCollaborator from '../../../../../components/forms/game/collaborator/collaborator.vue';
import { useGameDashRouteController } from '../manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/collaborators/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const collaborators = ref<CollaboratorModel[]>([]);
const activeCollaborator = ref<CollaboratorModel | undefined>(undefined);
const isAdding = ref(false);

function onAdded(collaborator: CollaboratorModel) {
	isAdding.value = false;
	collaborators.value.push(collaborator);
}

function onSaved() {
	activeCollaborator.value = undefined;
}

async function remove(collaboratorToRemove: CollaboratorModel) {
	const ret = await showModalConfirm(
		$gettext(
			`Are you sure you want to remove this collaborator? They will no longer be able to make changes to the game.`
		),
		$gettext('Remove Collaborator?')
	);

	if (!ret) {
		return;
	}

	try {
		await $removeCollaboratorInvite(collaboratorToRemove);

		showSuccessGrowl(
			$gettext('The collaborator has been removed.'),
			$gettext('Collaborator Removed')
		);

		arrayRemove(collaborators.value, i => i.id === collaboratorToRemove.id);

		if (!collaborators.value.length) {
			isAdding.value = true;
		}
	} catch (e) {
		showErrorGrowl($gettext('Could not remove collaborator for some reason.'));
	}
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Collaborators for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		collaborators.value = CollaboratorModel.populate(payload.collaborators);
		if (!collaborators.value.length) {
			isAdding.value = true;
		}
	},
});
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="page-help">
						<p>
							{{
								$gettext(
									`Allow other users to manage your game by giving them collaborator roles.`
								)
							}}
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
											collaborator.role === CollaboratorRole.EqualCollaborator
										"
									>
										{{ $gettext(`Collaborator`) }}
									</template>
									<template
										v-else-if="
											collaborator.role === CollaboratorRole.CommunityManager
										"
									>
										{{ $gettext(`Community Manager`) }}
									</template>
									<template
										v-else-if="collaborator.role === CollaboratorRole.Developer"
									>
										{{ $gettext(`Developer`) }}
									</template>
									<template v-else> - </template>
								</span>

								<template v-if="collaborator.status !== CollaboratorStatus.Active">
									<span class="tag">{{ $gettext(`Invited`) }}</span>
									<br />
									{{
										$gettext(`This user hasn't accepted their invitation yet.`)
									}}
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
