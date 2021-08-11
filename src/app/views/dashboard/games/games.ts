import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteDashGames',
})
export default class RouteDashGames extends BaseRouteComponent {
	render() {
		return h('router-view');
	}
}
