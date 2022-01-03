import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/terms/global.md';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalTerms',
})
export default class RouteLegalTerms extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Terms of Use');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
