import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

const template: string = require('../../../../lib/terms/terms/global.md');

@Options({
	name: 'RouteLegalTerms',
})
export default class RouteLegalTerms extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Terms of Use');
	}

	render() {
		return h('div', { innerHTML: template });
	}
}
