import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { Store } from '../../../store/index';
import { AppAuthJoinLazy } from '../../lazy';

@Component({
	name: 'RouteLandingLearn',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
		AppThemeSvg,
	},
})
export default class RouteLandingLearn extends BaseRouteComponent {
	@State app!: Store['app'];
}
