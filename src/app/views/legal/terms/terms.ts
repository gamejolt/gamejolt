import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/terms/global.md');

@Component({
	name: 'RouteLegalTerms',
})
export default class RouteLegalTerms extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Terms of Use');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
