import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppPageHeader from '../../page-header/page-header.vue';

@Component({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends BaseRouteComponent {
	readonly Screen = Screen;
}
