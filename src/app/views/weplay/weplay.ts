import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
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
