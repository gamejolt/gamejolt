import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./dashboard.html';

import { Store } from '../../store/index';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	@State app: Store['app'];
}
