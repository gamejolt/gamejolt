import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteDashFireside',
})
export default class RouteDashFireside extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
