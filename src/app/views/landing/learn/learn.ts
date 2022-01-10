import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { imageJolt } from '../../../img/images';
import { Store } from '../../../store/index';

@Options({
	name: 'RouteLandingLearn',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
		AppThemeSvg,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteLandingLearn extends BaseRouteComponent {
	@State app!: Store['app'];

	readonly imageJolt = imageJolt;
	readonly assetPaths = import.meta.globEager('./*.(svg|png)');
}
