import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { number } from '../../../../_common/filters/number';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLandingGameApi',
	components: {
		AppThemeSvg,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/landing/game-api'),
})
export default class RouteLandingGameApi extends BaseRouteComponent {
	totalScores = 0;
	totalAchievedTrophies = 0;
	sessionTime = 0;

	routeResolved($payload: any) {
		this.totalScores = $payload.totalScores || 0;
		this.totalAchievedTrophies = $payload.totalAchievedTrophies || 0;
		this.sessionTime = $payload.sessionTime ? Math.floor($payload.sessionTime / 60 / 60) : 0;
	}
}
