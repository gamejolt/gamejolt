import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouterView } from 'vue-router';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import './forums-content.styl';

@Options({
	name: 'RouteForums',
})
@OptionsForRoute()
export default class RouteForums extends BaseRouteComponent {
	render() {
		return h(RouterView, { class: 'route-forums' });
	}
}
