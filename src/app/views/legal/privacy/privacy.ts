import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';


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
