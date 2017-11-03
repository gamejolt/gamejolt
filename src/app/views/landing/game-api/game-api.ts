import { Component } from 'vue-property-decorator';
import View from '!view!./game-api.html';

import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	name: 'RouteLandingGameApi',
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class RouteLandingGameApi extends BaseRouteComponent {
	totalScores = 0;
	totalAchievedTrophies = 0;
	sessionTime = 0;

	@RouteResolve({ cache: true, lazy: true })
	async routeResolve() {
		return Api.sendRequest('/web/landing/game-api');
	}

	routed($payload: any) {
		this.totalScores = $payload.totalScores || 0;
		this.totalAchievedTrophies = $payload.totalAchievedTrophies || 0;
		this.sessionTime = $payload.sessionTime
			? Math.floor($payload.sessionTime / 60 / 60)
			: 0;
	}
}
