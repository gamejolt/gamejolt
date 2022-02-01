import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/ads/global.md';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalAds',
})
@OptionsForRoute()
export default class RouteLegalAds extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Advertising Platforms');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
