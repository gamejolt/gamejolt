import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { imageJolt } from '../../../img/images';

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
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly imageJolt = imageJolt;
	readonly assetPaths = import.meta.globEager('./*.(svg|png)');
}
