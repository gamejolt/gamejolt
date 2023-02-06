<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppContactLink from '../../../../_common/contact-link/AppContactLink.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { imageJolt } from '../../../img/images';
import socialImage from './social.png';

@Options({
	name: 'RouteLandingMarketplace',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
		AppThemeSvg,
		AppContactLink,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/marketplace'),
})
export default class RouteLandingMarketplace extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	firesidePosts: FiresidePost[] = [];
	games: Game[] = [];

	readonly Screen = Screen;
	readonly imageJolt = imageJolt;
	readonly assetPaths = import.meta.glob('./*.svg', { eager: true, as: 'url' });

	get routeTitle() {
		return 'Sell Your Games';
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
		Meta.fb.image = Meta.twitter.image = socialImage;

		this.firesidePosts = FiresidePost.populate($payload.firesidePosts);
		this.games = Game.populate($payload.games);
	}
}
</script>

<template>
	<div>
		<section class="section landing-header text-center">
			<div class="container">
				<h1>
					<AppThemeSvg class="bolt" :src="imageJolt" alt="" strict-colors />
					Marketplace
				</h1>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">This is how it works...</h1>
					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./revenue-share.svg']" alt="" />
							</div>

							<h4 class="text-center">Revenue Split</h4>

							<p>
								As a developer, you set the percentage you'd like to give to Game
								Jolt, as long as it's
								<strong>less than 10%</strong>
								. It's up to you. We will never guilt you into giving us
								more&mdash;in fact, you can't!
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./taxes.svg']" alt="" />
							</div>

							<h4 class="text-center">Taxes</h4>

							<p>We will take care of taxes (including VAT) so you don't have to!</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./payouts.svg']" alt="" />
							</div>

							<h4 class="text-center">Payouts</h4>

							<p>
								Withdraw your earnings whenever you'd like or keep them in your Game
								Jolt Wallet to buy games from other indies.
							</p>
						</div>

						<div class="landing-break-md landing-break-lg" />

						<div class="col-sm-6 col-md-4 col-md-offset-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./wallet.svg']" alt="" />
							</div>

							<h4 class="text-center">Game Jolt Wallet</h4>

							<p>
								Your earnings accumulate in your Wallet. Developers have the option
								of supporting one another by using funds from their Wallet to buy
								games without paying any payment processing fees. Additionally, when
								using your Wallet to buy games, we won't take a cut from the sale!
							</p>
						</div>
					</div>
				</div>
			</section>

			<hr class="underbar underbar-center" />

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./selling-options.svg']" alt="" />
							</div>

							<h4 class="text-center">Selling Options</h4>

							<p>
								Sell your game, artpack, levels, soundtrack; we've got you covered!
								You can assign an individual price to each item on your game page or
								choose the pay-what-you-want model.
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./keys.svg']" alt="" />
							</div>

							<h4 class="text-center">Flexible Key Management</h4>

							<p>
								Control who has access to your game's packages through keys. Assign
								testers to your game, allowing them to get auto-updates through the
								<router-link :to="{ name: 'landing.app' }">
									Game Jolt Desktop App
								</router-link>
								. Track press keys, and see when they view your games. Generate keys
								for prizes, bundles, etc.
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./early-access.svg']" alt="" />
							</div>

							<h4 class="text-center">Early Access</h4>

							<p>
								Accept support at any stage of development by assigning pay what you
								want or a fixed price for your work in progress builds. Through your
								game's devlog, keep your supporters up to date with what you're
								working on, and gather feedback from early testers.
							</p>
						</div>

						<div class="landing-break-md landing-break-lg" />

						<div class="col-sm-6 col-md-4 col-md-offset-2">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./analytics.svg']" alt="" />
							</div>

							<h4 class="text-center">Powerful Analytics</h4>

							<p>
								View detailed analytics for your game's sales, views, downloads, and
								even installs done through the Client. Find out what operating
								systems/devices your games are being downloaded on, geographical
								details of your audience, and which referring sites your sales are
								coming from.
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./supporter-focused.svg']" alt="" />
							</div>

							<h4 class="text-center">Supporter Focused</h4>

							<p>
								As a reminder that we're all in this together, when people choose to
								buy your games for more than the asking price, they will show up as
								Supporters on your game pages!
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">Start Selling Your Games</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-5 col-lg-4 col-centered">
							<template v-if="!app.user">
								<AppAuthJoin />
								<br />
							</template>
							<div v-else class="text-center">
								<p>Get started at</p>
								<p>
									<AppButton primary :to="{ name: 'dash.account.financials' }">
										Marketplace Account Setup
									</AppButton>
								</p>
							</div>

							<p class="text-muted text-center">
								Or
								<AppContactLink email="contact@gamejolt.com">
									contact us
								</AppContactLink>
								if you have questions!
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>
