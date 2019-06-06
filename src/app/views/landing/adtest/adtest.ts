import AppAdPlaywireVideo from 'game-jolt-frontend-lib/components/ad/playwire/video.vue';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLandingAdtest',
	components: {
		AppAdPlaywireVideo,
		AppScrollAffix,
	},
})
export default class RouteAdtest extends BaseRouteComponent {}
