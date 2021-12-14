import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent } from '../../../_common/route/route-component';

@Options({
	name: 'RouteDiscover',
})
export default class RouteDiscover extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
