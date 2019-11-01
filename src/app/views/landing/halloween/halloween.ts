import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { number } from '../../../../_common/filters/number';
import { HalloweenMonsterType } from '../../../../_common/halloween-monster/halloween-monster.model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { Halloween2019MonsterBreakdown } from '../../../../_common/user/user.model';

@Component({
	name: 'RouteLandingHalloween',
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	resolver() {
		return Api.sendRequest('/web/halloween-2019/stats');
	},
})
export default class RouteLandingHalloween extends BaseRouteComponent {
	breakdown: { [key in HalloweenMonsterType]: Halloween2019MonsterBreakdown } = null as any;

	img: { [key in HalloweenMonsterType]: string } = {
		pumpkin: require('../../../img/halloween/pumpkin.png'),
		candy: require('../../../img/halloween/candy.png'),
		zombie: require('../../../img/halloween/zombie.png'),
		witch: require('../../../img/halloween/witch.png'),
		vampire: require('../../../img/halloween/vampire.png'),
	};

	routeResolved($payload: any) {
		this.breakdown = $payload.breakdown;
		if (this.$route.hash === '#monster-stats') {
			Scroll.to('monster-stats');
		}
	}
}
