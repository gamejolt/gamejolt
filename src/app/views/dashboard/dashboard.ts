import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { Store } from '../../store/index';

@Options({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	@State
	app!: Store['app'];
}
