import Component from 'vue-class-component';
import { arrayRemove } from '../../../../../../../utils/array';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { Collaborator } from '../../../../../../../_common/collaborator/collaborator.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormCommunityCollaborator from '../../../../../../components/forms/community/collaborator/collaborator.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

@Component({
	name: 'RouteCommunitiesViewEditModerators',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityCollaborator,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/collaborators/' + route.params.id, {});
	},
})
export default class RouteCommunitiesViewEditModerators extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	collaborators: Collaborator[] = [];
	activeCollaborator: Collaborator | null = null;
	isShowingCollaboratorAdd = false;

	readonly Collaborator = Collaborator;

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

			Growls.success(
				this.$gettext('The collaborator has been removed.'),
				this.$gettext('Collaborator Removed')
			);

			arrayRemove(this.collaborators, i => i.id === collaborator.id);

			if (!this.collaborators.length) {
				this.isShowingCollaboratorAdd = true;
			}
		} catch (e) {
			Growls.error(this.$gettext('Could not remove collaborator for some reason.'));
		}
	}
}
