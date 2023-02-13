<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingPartners',
	components: {
		AppThemeSvg,
	},
})
@OptionsForRoute()
export default class RouteLandingPartners extends BaseRouteComponent {
	readonly imageJolt = imageJolt;
	readonly assetPaths = import.meta.glob('./*.svg', { eager: true, as: 'url' });

	get routeTitle() {
		return `Become a Partner`;
	}
}
</script>

<template>
	<div>
		<section class="section landing-header text-center">
			<div class="container">
				<h1>
					<AppThemeSvg class="bolt" :src="imageJolt" alt="" strict-colors />
					Partners
				</h1>

				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<p class="lead">
							Promote games on your YouTube and Twitch channels and earn revenue when
							people buy the game!
						</p>

						<AppButton
							primary
							href="https://docs.google.com/a/gamejolt.com/forms/d/1d_5jMXtKa8rYndFy1lZhzdiArdhZp6kycX-h1IOwjAU"
							target="_blank"
						>
							Apply Now
						</AppButton>
					</div>
				</div>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./supporting-indies.svg']" alt="" />
							</div>

							<h4 class="text-center">Indies supporting indies</h4>

							<p>
								When you promote games from your favorite indie game developers on
								your YouTube or Twitch channels, they'll support you right back!
								Feel that indie fellowship.
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./revenue-share.svg']" alt="" />
							</div>

							<h4 class="text-center">Revenue Share</h4>

							<p>
								Developers in the program will show appreciation for your hard work
								by sharing 10% of revenue with you on sales resulting from your
								videos/streams! Mmm, 10% profit spells “pumpkin spice latte”, and it
								has your name on it.
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./access-any-game.svg']" alt="" />
							</div>

							<h4 class="text-center">Access any game</h4>

							<p>
								No need to purchase games or ask for keys -- all games in the
								program have been willingly provided by their owners! No really, we
								didn’t force them or anything.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
							<h2 class="section-header text-center">Have some questions?</h2>
							<hr class="underbar underbar-center" />

							<h3>How does it work?</h3>

							<p>
								As a partner, you will be able to generate a referral link for any
								paid game in the partner program. Simply use that link in your video
								description, or while streaming. Any purchase resulting from that
								link gives you 10% of the sale.
							</p>

							<p>
								Gamers will be presented with a message prior to their purchase
								letting them know the game is part of the Game Jolt Partner Program.
								They will be aware that a portion of the revenue will go to you as a
								partner, as well as the developer.
							</p>

							<h3>Who should sign up?</h3>

							<p>
								<AppJolticon icon="youtube" />
								<strong>YouTubers</strong>
								must have at least 50,000 subs and an average of 3,000 views per
								video.
							</p>

							<p>
								<AppJolticon icon="twitch" />
								<strong>Twitch streamers</strong>
								must have at least 3,000 followers. If you're a Twitch partner,
								we'll automatically make you a Game Jolt partner.
							</p>

							<p>
								If you don't meet these requirements, but would like to be
								considered, apply anyway!
							</p>

							<h3>I'm a dev. How do I add my game to the program?</h3>

							<p>
								If it's a new game, you will be presented with the option to include
								it when you add your game to the site.
							</p>

							<p>
								If it's an existing game, you will have to opt it in. Simply go to
								your
								<router-link :to="{ name: 'home' }">Dashboard</router-link>
								, click to manage your game, click
								<strong>Details</strong>
								on the left, and you will see the option to include your game into
								the program.
							</p>

							<AppButton
								primary
								block
								href="https://docs.google.com/a/gamejolt.com/forms/d/1d_5jMXtKa8rYndFy1lZhzdiArdhZp6kycX-h1IOwjAU"
								target="_blank"
							>
								Apply Now
							</AppButton>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>
