<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import {
	CollaboratorModel,
	CollaboratorRole,
	CollaboratorStatus,
} from '../../../../../../_common/collaborator/collaborator.model';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { arrayRemove } from '../../../../../../utils/array';
import FormCommunityCollaborator from '../../../../../components/forms/community/collaborator/collaborator.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditModerators',
	components: {
		AppCommunitiesViewPageContainer,
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityCollaborator,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/collaborators/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditModerators extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	collaborators: CollaboratorModel[] = [];
	activeCollaborator: CollaboratorModel | null = null;
	isShowingCollaboratorAdd = false;

	readonly Collaborator = CollaboratorModel;
	readonly CollaboratorStatusActive = CollaboratorStatus.Active;
	readonly CollaboratorRoleEqualCollaborator = CollaboratorRole.EqualCollaborator;
	readonly CollaboratorRoleModerator = CollaboratorRole.Moderator;
	readonly CollaboratorRoleJamOrganizer = CollaboratorRole.JamOrganizer;

	get community() {
		return this.routeStore.community;
	}

	routeResolved($payload: any) {
		if ($payload.collaborators) {
			this.collaborators = CollaboratorModel.populate($payload.collaborators);
			if (!this.collaborators.length) {
				this.isShowingCollaboratorAdd = true;
			}
		}
	}

	onAddedCollaborator(collaborator: CollaboratorModel) {
		this.isShowingCollaboratorAdd = false;
		this.collaborators.push(collaborator);
	}

	onSavedCollaborator() {
		this.activeCollaborator = null;
	}

	async removeCollaborator(collaborator: CollaboratorModel) {
		const ret = await showModalConfirm(
			this.$gettext(
				`Are you sure you want to remove this collaborator? They will no longer be able to make changes to the community.`
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
				this.isShowingCollaboratorAdd = true;
			}
		} catch (e) {
			showErrorGrowl(this.$gettext('Could not remove collaborator for some reason.'));
		}
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<h2 class="section-header">
			<AppTranslate>Collaborators</AppTranslate>
		</h2>

		<div class="page-help">
			<p>
				<AppTranslate>
					Assign collaborators and choose their access level to help manage your
					community.
				</AppTranslate>
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
						<template v-if="collaborator.role === CollaboratorRoleEqualCollaborator">
							<AppTranslate>Full Collaborator</AppTranslate>
						</template>
						<template v-else-if="collaborator.role === CollaboratorRoleJamOrganizer">
							<AppTranslate>Jam Organizer</AppTranslate>
						</template>
						<template v-else-if="collaborator.role === CollaboratorRoleModerator">
							<AppTranslate>Moderator</AppTranslate>
						</template>
						<template v-else> - </template>
					</span>

					<template v-if="collaborator.status !== CollaboratorStatusActive">
						<span class="tag"><AppTranslate>Invited</AppTranslate></span>
						<br />
						<AppTranslate>This user hasn't accepted their invitation yet.</AppTranslate>
					</template>
				</div>

				<template #body>
					<FormCommunityCollaborator
						:model="collaborator"
						:community="community"
						@submit="onSavedCollaborator"
					/>
				</template>
			</AppCardListItem>

			<AppCardListAdd
				:label="$gettext(`Add Collaborator`)"
				@toggle="isShowingCollaboratorAdd = !isShowingCollaboratorAdd"
			>
				<FormCommunityCollaborator :community="community" @submit="onAddedCollaborator" />
			</AppCardListAdd>
		</AppCardList>
	</AppCommunitiesViewPageContainer>
</template>
