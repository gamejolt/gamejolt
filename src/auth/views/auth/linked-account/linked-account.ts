import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthLinkedAccount',
})
export default class RouteAuthLinkedAccount extends BaseRouteComponent {
	render() {
		return h('router-view');
	}
}
