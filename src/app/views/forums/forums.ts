import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import './forums-content.styl';

import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@Component({})
export default class RouteForums extends BaseRouteComponent {
	render(h: Vue.CreateElement) {
		return h('router-view', { staticClass: 'route-forums' });
	}
}
