import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { html } from '../../../../lib/terms/ads/global.md';

@Options({
	name: 'RouteLegalAds',
})
@OptionsForLegacyRoute()
export default class RouteLegalAds extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Advertising Platforms');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
