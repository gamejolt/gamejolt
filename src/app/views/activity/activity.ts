import View from '!view!./activity.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { AppPageHeader } from '../../components/page-header/page-header';
import { Store } from '../../store';

@View
@Component({
	name: 'RouteActivity',
	components: {
		AppPageHeader,
	},
})
export default class RouteActivity extends BaseRouteComponent {
	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];
}
