import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../_common/route/route-component';

@Component({
	name: 'RouteDiscover',
})
export default class RouteDiscover extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
