import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/terms/global.md';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalTerms',
})
@OptionsForRoute()
export default class RouteLegalTerms extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Terms of Use');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
