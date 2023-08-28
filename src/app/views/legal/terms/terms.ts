import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { html } from '../../../../lib/terms/terms/global.md';

@Options({
	name: 'RouteLegalTerms',
})
@OptionsForLegacyRoute()
export default class RouteLegalTerms extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Terms of Use');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
