import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../store/index';

@Component({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	@State
	app!: Store['app'];
}
