import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./collaborators.html';

import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../manage.store';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { GameCollaborator } from '../../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { ModalConfirm } from '../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { arrayRemove } from '../../../../../../lib/gj-lib-client/utils/array';
import { AppTimeAgo } from '../../../../../../lib/gj-lib-client/components/time/ago/ago';
import { FormGameCollaborator } from '../../../../../components/forms/game/collaborator/collaborator';
import { AppCardList } from '../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListItem } from '../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardListAdd } from '../../../../../../lib/gj-lib-client/components/card/list/add/add';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageCollaborators',
	components: {
		AppJolticon,
		AppTimeAgo,
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormGameCollaborator,
	},
})
export default class RouteDashGamesManageCollaborators extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	collaborators: GameCollaborator[] = [];
	activeCollaborator: GameCollaborator | null = null;
	isAdding = false;

	readonly GameCollaborator = GameCollaborator;

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/collaborators/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Collaborators for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed() {
		this.collaborators = GameCollaborator.populate(this.$payload.collaborators);
		if (!this.collaborators.length) {
			this.isAdding = true;
		}
	}

	onAdded(collaborator: GameCollaborator) {
		this.isAdding = false;
		this.collaborators.push(collaborator);
	}

	onSaved() {
		this.activeCollaborator = null;
	}

	async remove(collaborator: GameCollaborator) {
		const ret = await ModalConfirm.show(
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
