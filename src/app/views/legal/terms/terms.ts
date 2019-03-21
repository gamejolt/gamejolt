import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';


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
