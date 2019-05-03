import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../store/index';

@Component({
	name: 'RouteWelcome',
	components: {
		AppUserAvatar,
	},
})
@RouteResolver({
	resolver: () => Api.sendRequest('/web/touch'),
})
export default class RouteWelcome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	get routeTitle() {
		return this.$gettext('Welcome to Game Jolt!');
	}

	showEditAvatar() {}
}
