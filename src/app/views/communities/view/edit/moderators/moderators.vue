<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../utils/array';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListItem from '../../../../../../_common/card/list/AppCardListItem.vue';
import { Collaborator } from '../../../../../../_common/collaborator/collaborator.model';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import FormCommunityCollaborator from '../../../../../components/forms/community/collaborator/collaborator.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

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
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/collaborators/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditModerators extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	collaborators: Collaborator[] = [];
	activeCollaborator: Collaborator | null = null;
	isShowingCollaboratorAdd = false;

	readonly Collaborator = Collaborator;

	get community() {
		return this.routeStore.community;
	}

	routeResolved($payload: any) {
		if ($payload.collaborators) {
			this.collaborators = Collaborator.populate($payload.collaborators);
			if (!this.collaborators.length) {
				this.isShowingCollaboratorAdd = true;
			}
		}
	}

	onAddedCollaborator(collaborator: Collaborator) {
		this.isShowingCollaboratorAdd = false;
		this.collaborators.push(collaborator);
	}

	onSavedCollaborator() {
		this.activeCollaborator = null;
	}

	async removeCollaborator(collaborator: Collaborator) {
		const ret = await ModalConfirm.show(
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
	<app-communities-view-page-container>
		<h2 class="section-header">
			<translate>Collaborators</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					Assign collaborators and choose their access level to help manage your
					community.
				</translate>
			</p>
		</div>

		<app-card-list
			:items="collaborators"
			:active-item="activeCollaborator"
			:is-adding="isShowingCollaboratorAdd"
			@activate="activeCollaborator = $event"
		>
			<app-card-list-item
				v-for="collaborator of collaborators"
				:key="collaborator.id"
				:item="collaborator"
			>
				<a class="card-remove" @click.stop="removeCollaborator(collaborator)">
					<app-jolticon icon="remove" />
				</a>

				<div v-if="collaborator.user" class="card-title">
					<h5>{{ collaborator.user.username }}</h5>
				</div>

				<div class="card-meta">
					<span class="tag">
						<template v-if="collaborator.role === Collaborator.ROLE_EQUAL_COLLABORATOR">
							<translate>Full Collaborator</translate>
						</template>
						<template v-else-if="collaborator.role === Collaborator.ROLE_JAM_ORGANIZER">
							<translate>Jam Organizer</translate>
						</template>
						<template v-else-if="collaborator.role === Collaborator.ROLE_MODERATOR">
							<translate>Moderator</translate>
						</template>
						<template v-else> - </template>
					</span>

					<template v-if="collaborator.status !== Collaborator.STATUS_ACTIVE">
						<span class="tag"><translate>Invited</translate></span>
						<br />
						<translate>This user hasn't accepted their invitation yet.</translate>
					</template>
				</div>

				<template #body>
					<form-community-collaborator
						:model="collaborator"
						:community="community"
						@submit="onSavedCollaborator"
					/>
				</template>
			</app-card-list-item>

			<app-card-list-add
				:label="$gettext(`Add Collaborator`)"
				@toggle="isShowingCollaboratorAdd = !isShowingCollaboratorAdd"
			>
				<form-community-collaborator :community="community" @submit="onAddedCollaborator" />
			</app-card-list-add>
		</app-card-list>
	</app-communities-view-page-container>
</template>
