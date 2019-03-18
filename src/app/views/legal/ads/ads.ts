import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';


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
