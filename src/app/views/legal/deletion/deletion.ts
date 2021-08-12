import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const template: string = require('../../../../lib/terms/deletion/global.md');

@Options({
	name: 'RouteLegalDeletion',
})
export default class RouteLegalDeletion extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Account Deletion');
	}

	render() {
		return h('div', { innerHTML: template });
	}
}
