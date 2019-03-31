import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import AppWeplayBanner from '../../../components/weplay/banner/banner.vue';
import AppWeplayLogo from '../../../components/weplay/logo/logo.vue';
import { LOCALSTORAGE_VISITED_KEY } from '../../weplay/weplay';

@Component({
	name: 'RouteLandingWeplay',
	components: {
		AppWeplayBanner,
		AppWeplayLogo,
	},
})
export default class RouteLandingWeplay extends BaseRouteComponent {
	mounted() {
		localStorage.setItem(LOCALSTORAGE_VISITED_KEY, '1');
	}
}
