<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { overrideAdsAdapter, useAdsController } from '../../../../_common/ad/ad-store';
import { AdPlaywireAdapter } from '../../../../_common/ad/playwire/playwire-adapter';
import { AdProperAdapter } from '../../../../_common/ad/proper/proper-adapter';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';

@Options({
	name: 'RouteLandingAdtest',
	components: {
		AppAdWidget,
		AppScrollAffix,
	},
})
@OptionsForLegacyRoute()
export default class RouteAdtest extends LegacyRouteComponent {
	ads = setup(() => useAdsController());

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
			overrideAdsAdapter(this.ads, new adapterConstructor());
		}
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-lg-9">
					<AppAdWidget size="leaderboard" placement="top" />
					<AppAdWidget size="rectangle" placement="content" />

					<div class="alert" style="height: 2500px" />

					<AppAdWidget size="rectangle" placement="content" />
					<AppAdWidget size="rectangle" placement="content" />
				</div>

				<div class="col-lg-3">
					<AppAdWidget size="rectangle" placement="side" />
					<AppScrollAffix>
						<AppAdWidget size="video" placement="side" />
					</AppScrollAffix>
				</div>
			</div>
		</div>
	</section>
</template>
