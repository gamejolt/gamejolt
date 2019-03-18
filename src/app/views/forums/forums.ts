import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import './forums-content.styl';

@Component({
	name: 'RouteForums',
})
export default class RouteForums extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view', { staticClass: 'route-forums' });
	}
}
