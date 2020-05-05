import { namespace } from 'vuex-class';
import {
	NamespaceVuexStore,
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../../../../utils/vuex';
import { Collaborator } from '../../../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../../../_common/community/community.model';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { Translate } from '../../../../../../_common/translate/translate.service';
import { store } from '../../../../../store';
import { router } from '../../../../index';

export const RouteStoreName = 'editRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

type RouteActions = {};
type RouteMutations = {
	populate: any;
	setCanLinkNewGames: boolean;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	community: Community = null as any;
	collaboration: Collaborator | null = null;

	@VuexMutation
	populate(payload: RouteMutations['populate']) {
		this.community = new Community(payload.community);
		this.collaboration = payload.collaboration ? new Collaborator(payload.collaboration) : null;
	}

	@VuexAction
	async removeCommunity() {
		const result = await ModalConfirm.show(
			Translate.$gettext(
				`Are you sure you want to permanently remove your community? Once it's gone, it's gone forever.`
			)
		);
		if (!result) {
			return;
		}

		await this.community.$remove();
		await store.dispatch('leaveCommunity', this.community);

		Growls.info(
			Translate.$gettext('Your community has been removed from the site.'),
			Translate.$gettext('Community Removed')
		);

		router.push({ name: 'home' });
	}

	@VuexAction
	async leaveCommunity() {
		if (!this.collaboration) {
			return;
		}

		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to leave this community?`),
			Translate.$gettext('Leave community?'),
			'yes'
		);

		if (!result) {
			return;
		}

		await this.collaboration.$remove();
		await store.dispatch('leaveCommunity', this.community);

		Growls.success(
			Translate.$gettext('You left the community. You will be missed! ;A;'),
			Translate.$gettext('Left Community')
		);

		router.push({ name: 'home' });
	}
}
