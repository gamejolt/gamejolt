import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';
import { Store, store } from '../../../store/index';
import { RouteStore, RouteStoreModule, RouteStoreName } from './account.store';

@Component({
	name: 'RouteDashAccount',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppExpand,
		AppMediaItemCover,
		AppEditableOverlay,
	},
})
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
})
@RouteResolver({
	deps: {},
	// We want to reload this data every time we come into this section.
	resolver: () => Api.sendRequest('/web/dash/account', {}),
	// This will set our user with more fields required for managing it.
	resolveStore({ payload }) {
		store.commit('app/setUser', payload.user);
	},
})
export default class RouteDashAccount extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	readonly Screen = Screen;

	showEditHeader() {
		UserHeaderModal.show();
	}

	showEditAvatar() {
		UserAvatarModal.show();
	}
}
