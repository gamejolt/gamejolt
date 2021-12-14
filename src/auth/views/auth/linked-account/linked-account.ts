import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthLinkedAccount',
})
export default class RouteAuthLinkedAccount extends BaseRouteComponent {
	render() {
		return h(RouterView);
	}
}
