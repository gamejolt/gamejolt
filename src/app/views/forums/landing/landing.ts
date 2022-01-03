import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import butterfliesImage from './butterflies.png';

@Options({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends BaseRouteComponent {
	readonly Screen = Screen;
	readonly butterfliesImage = butterfliesImage;
}
