import View from '!view!./account.html?style=./account.styl';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppEditableOverlay } from '../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppMediaItemCover } from '../../../../_common/media-item/cover/cover';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';
import { Store, store } from '../../../store/index';
import { RouteStore, RouteStoreModule, RouteStoreName } from './account.store';

@View
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
