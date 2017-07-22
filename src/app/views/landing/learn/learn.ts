import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./learn.html?style=./learn.styl';

import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Store } from '../../../store/index';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppAuthJoin,
	},
})
export default class RouteLandingLearn extends BaseRouteComponent {
	@State app: Store['app'];
}
