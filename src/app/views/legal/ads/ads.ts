import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/ads/global.md');

@Component({
	name: 'RouteLegalAds',
})
export default class RouteLegalAds extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Advertising Platforms');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
