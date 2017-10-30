import { Component } from 'vue-property-decorator';
import View from '!view!./halloween.html?style=./halloween.styl';

import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { HalloweenMonsterType } from '../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';
import { Halloween2017MonsterBreakdown } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';

@View
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
export default class RouteLandingHalloween extends BaseRouteComponent {
	breakdown: { [key in HalloweenMonsterType]: Halloween2017MonsterBreakdown } = null as any;

	img: { [key in HalloweenMonsterType]: string } = {
		pumpkin: require('../../../img/halloween/pumpkin.png'),
		candy: require('../../../img/halloween/candy.png'),
		zombie: require('../../../img/halloween/zombie.png'),
		witch: require('../../../img/halloween/witch.png'),
		vampire: require('../../../img/halloween/vampire.png'),
	};

	@RouteResolve()
	async routeResolve() {
		return Api.sendRequest('/web/halloween-2017/stats');
	}

	routed() {
		this.breakdown = this.$payload.breakdown;
		if (this.$route.hash === '#monster-stats') {
			Scroll.to('monster-stats');
		}
	}
}
