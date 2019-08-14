import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Growls } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { Translate } from '../../../../../_common/translate/translate.service';
import { Store } from '../../../../store/index';
import FormProfile from '../../../forms/profile/profile.vue';
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
