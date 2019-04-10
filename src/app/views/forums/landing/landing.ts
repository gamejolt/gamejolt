import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component } from 'vue-property-decorator';
import AppPageHeader from '../../../components/page-header/page-header.vue';


@Component({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends BaseRouteComponent {
	readonly Screen = Screen;
}
