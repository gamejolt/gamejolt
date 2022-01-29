import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';

@Options({
	name: 'RouteDiscover',
})
@OptionsForRoute()
export default class RouteDiscover extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
