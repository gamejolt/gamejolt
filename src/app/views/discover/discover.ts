import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteDiscover',
})
export default class RouteDiscover extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
