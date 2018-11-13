import View from '!view!./main.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteDashMain',
	components: {
		AppPageHeader,
		AppUserAvatar,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export default class RouteDashMain extends BaseRouteComponent {
	@State
	app!: Store['app'];
}
