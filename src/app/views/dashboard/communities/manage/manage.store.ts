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

const WizardKey = 'manage-community-wizard';

type RouteActions = {
	wizardNext: undefined;
	publish: undefined;
	saveDraft: undefined;
};

type RouteMutations = {
	populate: any;
	finishWizard: undefined;
};

const STATE_PREFIX = 'dash.communities.manage';

const TRANSITION_MAP: any = {
	details: 'design',
	design: 'collaborators',
	collaborators: 'wizard-finish',
};

export function startWizard() {
	window.sessionStorage.setItem(WizardKey, 'active');
}

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	community: Community = null as any;
	collaboration: Collaborator | null = null;
	isWizard = false;

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
		this.isWizard = !!window.sessionStorage.getItem(WizardKey);
	}

	@VuexMutation
	finishWizard() {
		this.isWizard = false;
		window.sessionStorage.removeItem(WizardKey);
	}

	@VuexAction
	async wizardNext() {
		if (!this.community) {
			return;
		}

		const routeName = router.currentRoute.name!;
		for (const current in TRANSITION_MAP) {
			if (routeName.indexOf(`${STATE_PREFIX}.${current}`) !== -1) {
				const next = TRANSITION_MAP[current];
				router.push({
					name: `${STATE_PREFIX}.${next}`,
				});
				return;
			}
		}
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

		// await this.game.$setStatus(Game.STATUS_VISIBLE);

		Growls.success(
			Translate.$gettext(
				`You've published your community to the site! Huzzah! Remember to spread the word...`
			),
			Translate.$gettext(`Game Published`)
		);

		this.finishWizard();

		router.push({
			name: 'dash.communities.manage.design',
			params: router.currentRoute.params,
		});
	}

	@VuexAction
	async saveDraft() {
		this.finishWizard();

		// Simply go to the overview and pull out of the wizard!
		router.push({
			name: 'dash.communities.manage.design',
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
