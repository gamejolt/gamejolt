import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import './forums-content.styl';

@Component({
	name: 'RouteForums',
})
export default class RouteForums extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view', { staticClass: 'route-forums' });
	}
}
