import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/privacy/global.md');

@Component({
	name: 'RouteLegalPrivacy',
})
export default class RouteLegalPrivacy extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Privacy Policy');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
