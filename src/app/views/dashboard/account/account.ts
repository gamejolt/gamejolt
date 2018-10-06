import View from '!view!./account.html?style=./account.styl';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppEditableOverlay } from '../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppMutation, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppMediaItemCover } from '../../../../_common/media-item/cover/cover';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';
import { Store } from '../../../store/index';
import { RouteState, RouteStore, RouteStoreName } from './account.store';

@View
@Component({
	name: 'RouteDashAccount',
	components: {
		AppJolticon,
		AppPageHeader,
		AppUserAvatar,
		AppExpand,
		AppMediaItemCover,
		AppEditableOverlay,
	},
})
export default class RouteDashAccount extends BaseRouteComponent {
	@State
	app!: Store['app'];
	@RouteState
	heading!: RouteStore['heading'];

	@AppMutation
	setUser!: AppStore['setUser'];

	readonly Screen = Screen;

	storeName = RouteStoreName;
	storeModule = RouteStore;

	// We want to reload this data every time we come into this section.
	@RouteResolve({
		lazy: false,
		cache: false,
		deps: {},
	})
	routeResolve() {
		return Api.sendRequest('/web/dash/account', {});
	}

	routed(payload: any) {
		// This will set our user with more fields required for managing it.
		this.setUser(payload.user);
	}

	showEditHeader() {
		UserHeaderModal.show();
	}

	showEditAvatar() {
		UserAvatarModal.show();
	}
}
