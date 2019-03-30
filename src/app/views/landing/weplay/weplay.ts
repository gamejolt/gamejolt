import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import AppWeplayBanner from '../../../components/weplay/banner/banner.vue';
import AppWeplayLogo from '../../../components/weplay/logo/logo.vue';

@Component({
	name: 'RouteLandingWeplay',
	components: {
		AppWeplayBanner,
		AppWeplayLogo,
	},
})
export default class RouteLandingWeplay extends BaseRouteComponent {}
