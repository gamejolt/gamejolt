import { Component } from 'vue-property-decorator';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppScrollAffix from '../../../../_common/scroll/affix/affix.vue';

@Component({
	name: 'RouteLandingAdtest',
	components: {
		AppAdWidget,
		AppScrollAffix,
	},
})
export default class RouteAdtest extends BaseRouteComponent {}
