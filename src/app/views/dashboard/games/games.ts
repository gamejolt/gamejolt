import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@Component({})
export default class RouteDashGames extends BaseRouteComponent {
	render(h: Vue.CreateElement) {
		return h('router-view');
	}
}
