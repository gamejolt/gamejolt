import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';


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
