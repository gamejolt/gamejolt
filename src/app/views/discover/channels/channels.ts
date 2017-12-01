import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteDiscoverChannels',
})
export default class RouteDiscoverChannels extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view');
	}
}
