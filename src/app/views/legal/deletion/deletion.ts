import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { html } from '../../../../lib/terms/deletion/global.md';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteLegalDeletion',
})
@OptionsForRoute()
export default class RouteLegalDeletion extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Account Deletion');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
