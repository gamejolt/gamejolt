import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./learn.html?style=./learn.styl';

import { Store } from '../../../store/index';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

@View
@Component({
	name: 'RouteLandingLearn',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
		AppThemeSvg,
	},
})
export default class RouteLandingLearn extends BaseRouteComponent {
	@State app: Store['app'];
}
