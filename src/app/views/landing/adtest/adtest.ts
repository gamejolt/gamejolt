import { Options } from 'vue-property-decorator';
import { AdPlaywireAdapter } from '../../../../_common/ad/playwire/playwire-adapter';
import { AdProperAdapter } from '../../../../_common/ad/proper/proper-adapter';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppScrollAffix from '../../../../_common/scroll/affix/affix.vue';

@Options({
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
		const adapterMap = {
			proper: AdProperAdapter,
			playwire: AdPlaywireAdapter,
		};

		if (this.q.adapter) {
			const adapter = this.q.adapter as keyof typeof adapterMap;
			const adapterConstructor = adapterMap[adapter];
			this.$ad.overrideAdapter(new adapterConstructor());
		}
	}
}
