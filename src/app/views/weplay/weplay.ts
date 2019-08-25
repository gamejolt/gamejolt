import { Component } from 'vue-property-decorator';
import AppCard from '../../../_common/card/card.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { AppTooltip } from '../../../_common/tooltip/tooltip';
import { User } from '../../../_common/user/user.model';
import AppWeplayLogo from '../../components/weplay/logo/logo.vue';

@Component({
	name: 'RouteWeplay',
	components: {
		AppCard,
		AppWeplayLogo,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteWeplay extends BaseRouteComponent {
	readonly Screen = Screen;

	get routeTitle() {
		return 'Stajoltia';
	}
}
