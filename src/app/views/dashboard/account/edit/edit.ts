import View from '!view!./edit.html';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormProfile } from '../../../../components/forms/profile/profile';
import { Store } from '../../../../store/index';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
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
