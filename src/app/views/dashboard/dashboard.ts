import View from '!view!./dashboard.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../store/index';

@View
@Component({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	@State
	app!: Store['app'];
}
