import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';

@Options({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
}
