import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/client-licenses/global.md');

@Component({
	name: 'RouteLegalClientLicenses',
})
export default class RouteLegalClientLicenses extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Client Licenses');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
