import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import {
	NamespaceVuexStore,
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from 'game-jolt-frontend-lib/utils/vuex';
import { namespace } from 'vuex-class';
import { store } from '../../../../store';
import { router } from '../../../index';

export const RouteStoreName = 'manageCommunityRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

type RouteActions = {
	publish: undefined;
};

type RouteMutations = {
	populate: any;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	community: Community = null as any;
	collaboration: Collaborator | null = null;

	get canPublish() {
		if (!this.community) {
			return false;
		}

		if (!this.community.thumbnail || !this.community.header) {
			return false;
		}

		return true;
	}

	@VuexMutation
	populate(payload: RouteMutations['populate']) {
		this.community = new Community(payload.community);
		this.collaboration = payload.collaboration ? new Collaborator(payload.collaboration) : null;
	}

	@VuexAction
	async publish() {
		const result = await ModalConfirm.show(
			Translate.$gettext(
				`Publishing your community makes it visible on the site, so make sure your community page is lookin' good!`
			)
		);
		if (!result) {
			return;
		}

		await this.community.$publish();

		Growls.success(
			Translate.$gettext(
				`You've published your community to the site! Huzzah! Remember to spread the word...`
			),
			Translate.$gettext(`Community Published`)
		);

		router.push({
			name: 'dash.communities.manage.overview',
			params: router.currentRoute.params,
		});
	}

	@VuexAction
	async resign() {
		if (!this.collaboration || this.collaboration.role === Collaborator.ROLE_OWNER) {
			return;
		}

		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to resign from this community?`),
			Translate.$gettext('Resign from community?'),
			'yes'
		);

		if (!result) {
			return;
		}

		await this.collaboration.$remove();

		Growls.success(
			Translate.$gettext('You resigned from the community. You will be missed! ;A;'),
			Translate.$gettext('Resigned from community')
		);

		router.push({ name: 'home' });
	}
}
