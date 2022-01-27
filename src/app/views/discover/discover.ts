import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';

@Options({
	name: 'RouteDiscover',
})
@RouteResolver()
export default class RouteDiscover extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
