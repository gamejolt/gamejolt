import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./learn.html?style=./learn.styl';

import { Store } from '../../../store/index';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppAuthJoinLazy } from '../../../components/lazy';

@View
@Component({
	name: 'RouteLandingLearn',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
	},
})
export default class RouteLandingLearn extends BaseRouteComponent {
	@State app: Store['app'];
}
