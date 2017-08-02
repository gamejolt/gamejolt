import { Component } from 'vue-property-decorator';
import * as View from '!view!./game-api.html';

import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteLandingGameApi',
	directives: {
		AppTooltip,
	},
})
export default class RouteLandingGameApi extends BaseRouteComponent {}
