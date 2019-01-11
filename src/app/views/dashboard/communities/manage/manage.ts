import View from '!view!./manage.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppEditableOverlay } from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay';
import { AppExpand } from 'game-jolt-frontend-lib/components/expand/expand';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { AppMediaItemCover } from '../../../../../_common/media-item/cover/cover';
import { CommunityHeaderModal } from '../../../../components/forms/community/header-modal/header-modal.service';
import { IntentService } from '../../../../components/intent/intent.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { store } from '../../../../store';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './manage.store';

@View
@Component({
	name: 'RouteDashCommunitiesManage',
	components: {
		AppPageHeader,
		AppExpand,
		AppTimeAgo,
		AppManageCommunityNav,
		AppNavTabList,
		AppEditableOverlay,
		AppMediaItemCover,
	},
	directives: {
		AppTooltip,
	},
})
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	deps: { params: ['id'], query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'accept-community-collaboration',
			message: Translate.$gettext(`You're now a collaborator for this project!`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/developer/communitys/' + route.params.id);
	},
	resolveStore({ payload }) {
		routeStore.commit('populate', payload);
		store.commit('theme/setPageTheme', routeStore.state.community.theme || null);
	},
})
export default class RouteDashCommunitiesManage extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.Mutation
	populate!: RouteStore['populate'];

	@RouteStoreModule.State
	media!: RouteStore['media'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	readonly Community = Community;
	readonly Screen = Screen;

	routeDestroyed() {
		store.commit('theme/setPageTheme', null);
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
	}
}
