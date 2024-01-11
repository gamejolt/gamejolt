<script lang="ts">
import { ref } from 'vue';
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
import FormCommunityCollaborator from '../../../../../components/forms/community/collaborator/FormCommunityCollaborator.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id'] },
		resolver({ route }) {
			return Api.sendRequest('/web/dash/communities/collaborators/' + route.params.id);
		},
	}),
};
</script>

<script lang="ts" setup>
const { community } = useCommunityRouteStore()!;

const collaborators = ref<CollaboratorModel[]>([]);
const activeCollaborator = ref<CollaboratorModel | undefined>(undefined);
const isShowingCollaboratorAdd = ref(false);

function onAddedCollaborator(collaborator: CollaboratorModel) {
	isShowingCollaboratorAdd.value = false;
	collaborators.value.push(collaborator);
}

function onSavedCollaborator() {
	activeCollaborator.value = undefined;
}

async function removeCollaborator(collaborator: CollaboratorModel) {
	const ret = await showModalConfirm(
		$gettext(
			`Are you sure you want to remove this collaborator? They will no longer be able to make changes to the community.`
		),
		$gettext('Remove Collaborator?')
	);

	if (!ret) {
		return;
	}

	try {
		await $removeCollaboratorInvite(collaborator);

		showSuccessGrowl(
			$gettext('The collaborator has been removed.'),
			$gettext('Collaborator Removed')
		);

		arrayRemove(collaborators.value, i => i.id === collaborator.id);

		if (!collaborators.value.length) {
			isShowingCollaboratorAdd.value = true;
		}
	} catch (e) {
		showErrorGrowl($gettext('Could not remove collaborator for some reason.'));
	}
}

createAppRoute({
	onResolved({ payload }) {
		if (payload.collaborators) {
			collaborators.value = CollaboratorModel.populate(payload.collaborators);
			if (!collaborators.value.length) {
				isShowingCollaboratorAdd.value = true;
			}
		}
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<h2 class="section-header">
			{{ $gettext(`Collaborators`) }}
		</h2>

		<div class="page-help">
			<p>
				{{
					$gettext(`Assign collaborators and choose their access level to help manage your
					community.`)
				}}
			</p>
		</div>

		<AppCardList
			:items="collaborators"
			:active-item="activeCollaborator"
			:is-adding="isShowingCollaboratorAdd"
			@activate="activeCollaborator = $event"
		>
			<AppCardListItem
				v-for="collaborator of collaborators"
				:key="collaborator.id"
				:item="collaborator"
			>
				<a class="card-remove" @click.stop="removeCollaborator(collaborator)">
					<AppJolticon icon="remove" />
				</a>

				<div v-if="collaborator.user" class="card-title">
					<h5>{{ collaborator.user.username }}</h5>
				</div>

				<div class="card-meta">
					<span class="tag">
						<template v-if="collaborator.role === CollaboratorRole.EqualCollaborator">
							{{ $gettext(`Full Collaborator`) }}
						</template>
						<template v-else-if="collaborator.role === CollaboratorRole.JamOrganizer">
							{{ $gettext(`Jam Organizer`) }}
						</template>
						<template v-else-if="collaborator.role === CollaboratorRole.Moderator">
							{{ $gettext(`Moderator`) }}
						</template>
						<template v-else> - </template>
					</span>

					<template v-if="collaborator.status !== CollaboratorStatus.Active">
						<span class="tag">{{ $gettext(`Invited`) }}</span>
						<br />
						{{ $gettext(`This user hasn't accepted their invitation yet.`) }}
					</template>
				</div>

				<template #body>
					<FormCommunityCollaborator
						:model="collaborator"
						:community="community!"
						@submit="onSavedCollaborator"
					/>
				</template>
			</AppCardListItem>

			<AppCardListAdd
				:label="$gettext(`Add Collaborator`)"
				@toggle="isShowingCollaboratorAdd = !isShowingCollaboratorAdd"
			>
				<FormCommunityCollaborator :community="community!" @submit="onAddedCollaborator" />
			</AppCardListAdd>
		</AppCardList>
	</AppCommunitiesViewPageContainer>
</template>
