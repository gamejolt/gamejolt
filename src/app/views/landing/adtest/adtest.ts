import AppAdPlaywireVideo from '../../../../_common/ad/playwire/video.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppScrollAffix from '../../../../_common/scroll/affix/affix.vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLandingAdtest',
	components: {
		AppAdPlaywireVideo,
		AppScrollAffix,
	},
})
export default class RouteAdtest extends BaseRouteComponent {}
