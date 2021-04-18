import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const template: string = require('../../../../lib/terms/deletion/global.md');

@Component({
	name: 'RouteLegalDeletion',
})
export default class RouteLegalDeletion extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Account Deletion');
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: template } });
	}
}
