import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import FormProfile from '../../../../components/forms/profile/profile.vue';
import { Store } from '../../../../store/index';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Component({
	name: 'RouteDashAccountEdit',
	components: {
		FormProfile,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Promise.resolve(),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext('Edit Your Profile'));
	},
})
export default class RouteDashAccountEdit extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	get routeTitle() {
		return this.heading;
	}

	onProfileSaved() {
		Growls.success(this.$gettext(`Your profile has been updated. Right on!`));
		Scroll.to(0);
	}
}
