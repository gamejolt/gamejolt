import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../../manage.store';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { GameCollaborator } from '../../../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { arrayRemove } from '../../../../../../../lib/gj-lib-client/utils/array';
import { AppTimeAgo } from '../../../../../../../lib/gj-lib-client/components/time/ago/ago';
import { FormGameCollaborator } from '../../../../../../components/forms/game/collaborator/collaborator';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageCollaboratorsList',
	components: {
		AppJolticon,
		AppTimeAgo,
		FormGameCollaborator,
	},
})
export default class RouteDashGamesManageCollaboratorsList extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	invites: GameCollaborator[] = [];
	roles: GameCollaborator[] = [];

	readonly GameCollaborator = GameCollaborator;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/collaborators/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Collaborators for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed() {
		this.invites = GameCollaborator.populate(this.$payload.invites);
		this.roles = GameCollaborator.populate(this.$payload.roles);
	}

	onInvited() {
		this.reloadRoute();
	}

	async removeInvite(invite: GameCollaborator) {
		const resolved = await ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				`Are you sure you want to cancel this collaboration invite?`
			),
			this.$gettext('Uninvite Collaborator?')
		);

		if (!resolved) {
			return;
		}

		try {
			await invite.$remove();
		} catch (e) {
			Growls.error(this.$gettext('Could not cancel the invite for some reason.'));
			return;
		}

		Growls.success(
			this.$gettext('The invite has been canceled.'),
			this.$gettext('Collaboration Invite Canceled')
		);

		arrayRemove(this.invites, i => i.id === invite.id);
	}

	async removeRole(role: GameCollaborator) {
		const resolved = await ModalConfirm.show(
			this.$gettext(
				// tslint:disable-next-line:max-line-length
				`Are you sure you want to remove this collaborator? This will revoke his management access to this game.`
			),
			this.$gettext('Remove Collaborator?')
		);

		if (!resolved) {
			return;
		}

		try {
			await role.$remove();
		} catch (e) {
			Growls.error(this.$gettext('Could not remove collaborator for some reason.'));
			return;
		}

		Growls.success(
			this.$gettext('The collaborator has been removed.'),
			this.$gettext('Collaborator Removed')
		);

		arrayRemove(this.roles, r => r.id === role.id);
	}
}
