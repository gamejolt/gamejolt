import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./main.html';

import { Store } from '../../../store/index';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashMain',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export default class RouteDashMain extends BaseRouteComponent {
	@State app!: Store['app'];
}
