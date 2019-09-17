import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteDashCommunities',
})
export default class RouteDashCommunities extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
