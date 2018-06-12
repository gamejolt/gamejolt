import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/cookies/global.md');

@Component({
	name: 'RouteLegalCookies',
})
export default class RouteLegalCookies extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Cookie Policy');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
