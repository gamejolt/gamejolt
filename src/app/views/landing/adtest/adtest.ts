import { Component } from 'vue-property-decorator';
import { AdProperAdapter } from '../../../../_common/ad/proper/proper-adapter';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppScrollAffix from '../../../../_common/scroll/affix/affix.vue';

@Component({
	name: 'RouteLandingAdtest',
	components: {
		AppAdWidget,
		AppScrollAffix,
	},
})
export default class RouteAdtest extends BaseRouteComponent {
	get q() {
		return this.$route.query;
	}

	get meta() {
		return {
			staticSize: this.q.staticSize || false,
		};
	}

	routeCreated() {
		if (this.q.adapter === 'proper') {
			this.$ad.adapter = new AdProperAdapter();
		}
	}
}
