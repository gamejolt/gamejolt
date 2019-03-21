import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteAuthLinkedAccount',
})
export default class RouteAuthLinkedAccount extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
