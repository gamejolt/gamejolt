import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../_common/route/legacy-route-component';
import './forums-content.styl';

@Options({
	name: 'RouteForums',
})
@OptionsForLegacyRoute()
export default class RouteForums extends LegacyRouteComponent {
	render() {
		return h(RouterView, { class: 'route-forums' });
	}
}
