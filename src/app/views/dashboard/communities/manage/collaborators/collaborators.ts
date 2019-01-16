import View from '!view!./collaborators.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppCardListAdd } from 'game-jolt-frontend-lib/components/card/list/add/add';
import { AppCardListItem } from 'game-jolt-frontend-lib/components/card/list/item/item';
import { AppCardList } from 'game-jolt-frontend-lib/components/card/list/list';
import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import { FormCommunityCollaborator } from '../../../../../components/forms/community/collaborator/collaborator';
import { RouteStore, RouteStoreModule } from '../manage.store';

@View
@Component({
	name: 'RouteDashCommunitiesManageCollaborators',
	components: {
		AppTimeAgo,
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityCollaborator,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/communities/collaborators/' + route.params.id),
})
export default class RouteDashCommunitiesManageCollaborators extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	collaborators: Collaborator[] = [];
	activeCollaborator: Collaborator | null = null;
	isAdding = false;

	readonly Collaborator = Collaborator;

	get routeTitle() {
		if (this.community) {
			return this.$gettextInterpolate('Collaborators for %{ community }', {
				community: this.community.name,
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
				this.isAdding = true;
			}
		} catch (e) {
			Growls.error(this.$gettext('Could not remove collaborator for some reason.'));
		}
	}
}
