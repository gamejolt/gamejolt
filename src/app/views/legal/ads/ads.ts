import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const template: string = require('../../../../lib/terms/ads/global.md');

@Options({
	name: 'RouteLegalAds',
})
export default class RouteLegalAds extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Advertising Platforms');
	}

	render() {
		return h('div', { domProps: { innerHTML: template } });
	}
}
