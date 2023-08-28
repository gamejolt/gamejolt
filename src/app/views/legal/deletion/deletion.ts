import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { html } from '../../../../lib/terms/deletion/global.md';

@Options({
	name: 'RouteLegalDeletion',
})
@OptionsForLegacyRoute()
export default class RouteLegalDeletion extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Account Deletion');
	}

	render() {
		return h('div', { innerHTML: html });
	}
}
