<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../_common/ad/ad-store';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLegal',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLegal extends BaseRouteComponent {
	ads = setup(() => useAdsController());

	routeCreated() {
		const settings = new AdSettingsContainer();
		settings.isPageDisabled = true;
		setPageAdsSettings(this.ads, settings);
	}

	routeDestroyed() {
		releasePageAdsSettings(this.ads);
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-lg-offset-1">
					<router-view />
				</div>
				<div class="col-sm-3 col-md-4 col-lg-3 hidden-xs">
					<br />
					<br />
					<br />
					<nav class="platform-list">
						<ul>
							<li>
								<router-link :to="{ name: 'legal.terms' }" active-class="active">
									<translate>Terms of Use</translate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.privacy' }" active-class="active">
									<translate>Privacy Policy</translate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.cookies' }" active-class="active">
									<translate>Cookie Policy</translate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.ads' }" active-class="active">
									<translate>Advertising Platforms</translate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.deletion' }" active-class="active">
									<translate>Account Deletion</translate>
								</router-link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	</section>
</template>
