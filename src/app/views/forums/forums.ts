import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import './forums-content.styl';

@Options({
	name: 'RouteForums',
})
export default class RouteForums extends BaseRouteComponent {
	render() {
		return h('router-view', { class: 'route-forums' });
	}
}
