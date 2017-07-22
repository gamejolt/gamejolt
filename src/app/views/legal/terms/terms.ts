import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

const template: string = require('../../../../lib/terms/terms/global.md');

@Component({})
export default class RouteLegalTerms extends BaseRouteComponent {
	routeInit() {
		Meta.title = this.$gettext('Terms of Use');
	}

	render(h: Vue.CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
