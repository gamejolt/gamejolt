import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/ads/global.md';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalAds',
})
export default class RouteLegalAds extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Advertising Platforms');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
