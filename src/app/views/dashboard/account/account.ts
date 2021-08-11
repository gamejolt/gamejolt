import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { WithRouteStore } from '../../../../_common/route/route-store';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';
import { Store, store } from '../../../store/index';
import { RouteStore, RouteStoreModule, RouteStoreName } from './account.store';

@Options({
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
	resolver: () => Api.sendRequest('/web/dash/account'),
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
