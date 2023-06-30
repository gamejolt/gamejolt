<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { AppAuthJoinLazy } from '../../../../_common/lazy';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { vAppScrollTo } from '../../../../_common/scroll/to/to.directive';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { useCommonStore } from '../../../../_common/store/common-store';
import socialImage from './social.png';

@Options({
	name: 'RouteLandingIndieaf',
	components: {
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppAuthJoin: AppAuthJoinLazy,
	},
	directives: {
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForRoute()
export default class RouteLandingIndieaf extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	state: 'bogus' | 'indie' = 'bogus';

	readonly assetPaths = import.meta.glob('./*.(svg|jpg|png)', { eager: true, as: 'url' });

	get routeTitle() {
		return `Get Indie.AF // Freakin' legit customizable game sites`;
	}

	routeCreated() {
		Meta.description = `Build your own customizable site with an indie.af domain through Game Jolt Sites!`;

		Meta.fb = {
			type: 'website',
			title: this.routeTitle,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: this.routeTitle,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = socialImage;
	}
}
</script>

<template>
	<div class="route-landing-indieaf fill-darkest">
		<div class="indieaf-header">
			<div class="container">
				<p class="lead">Don't you want to be</p>

				<img class="img-responsive indieaf-logo" :src="assetPaths['./header.jpg']" alt="" />
			</div>
		</div>

		<section class="section indieaf-body">
			<div class="container">
				<div class="row">
					<div class="col-sm-7 col-centered">
						<div class="social-widgets text-center">
							<AppSocialTwitterShare
								:content="
									$gettext('Get indie.AF with Game Jolt Sites #indiedev #gamedev')
								"
							/>

							<span class="dot-separator hidden-xs" />

							<AppSocialFacebookLike />
						</div>
						<br />

						<p class="text-center">
							Build your own customizable portfolio and game sites with an indie.af
							domain name through
							<a
								href="http://fireside.gamejolt.com/post/custom-game-sites-portfolios-fgjzjsa8"
								target="_blank"
							>
								Game Jolt Sites
							</a>
							!
						</p>
						<br />

						<div class="text-center">
							<div>
								<a v-app-scroll-to class="button-af" href="#get-indie-af">
									Get Indie.AF
								</a>
							</div>
							<br />
							<p class="small text-muted">
								don't be
								<em>ew</em>
							</p>
						</div>

						<br class="hidden-xs" />
						<hr class="underbar underbar-center" />

						<div class="spacer" />

						<div v-if="state === 'bogus'" class="row">
							<div class="col-xs-7">
								<img
									class="img-responsive"
									:src="assetPaths['./site-io.jpg']"
									alt=""
								/>
							</div>
							<div class="col-xs-5">
								<img
									class="img-responsive"
									:src="assetPaths['./bogusdude.svg']"
									alt=""
								/>
							</div>
						</div>
						<div v-if="state === 'indie'" class="row">
							<div class="col-xs-7">
								<img
									class="img-responsive"
									:src="assetPaths['./site-af.jpg']"
									alt=""
								/>
							</div>
							<div class="col-xs-5">
								<img
									class="img-responsive"
									:src="assetPaths['./cooldude.svg']"
									alt=""
								/>
							</div>
						</div>

						<template v-if="state !== 'indie'">
							<br />
							<p class="text-center">
								<a class="button-af" @click="state = 'indie'">
									Make this Indie.AF!
								</a>
							</p>
						</template>

						<h2 class="text-center">Why should you be INDIE.AF?</h2>
						<hr class="underbar underbar-center" />
						<br />

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left"><strong>gamejolt.io</strong></div>
							<div class="indieaf-vs-col right"><strong>indie.af</strong></div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">Trendy, but also bogus</div>
							<div class="indieaf-vs-col right">
								Not bogus, not trendy. Radical AF!
							</div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">
								Sounds like
								<em>ew</em>
							</div>
							<div class="indieaf-vs-col right">Has a curse word AF!</div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">Child's play</div>
							<div class="indieaf-vs-col right">Grown up AF!</div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">People wonder why it's not .com</div>
							<div class="indieaf-vs-col right">.af AF!</div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">Over saturated</div>
							<div class="indieaf-vs-col right">No one is using AF!</div>
						</div>

						<div class="indieaf-vs-row">
							<img class="indieaf-vs-img" :src="assetPaths['./vs.png']" alt="" />
							<div class="indieaf-vs-col left">
								Are you a startup, or are you indie?
							</div>
							<div class="indieaf-vs-col right">INDIE AF!!!</div>
						</div>

						<h2 class="text-center">What people are saying</h2>
						<hr class="underbar underbar-center" />
						<br />

						<div class="indieaf-quote">
							<p>
								When I used to walk down the street, people would point and say,
								"Look at them, they're grody." Now I'm cool AF.
							</p>
							<div class="indieaf-quote-who">- Cool AF kid</div>
						</div>

						<div class="indieaf-quote">
							<p>Everyone wants to get with me now I'm indie.af. Thanks Game Jolt!</p>
							<div class="indieaf-quote-who">- Popular AF kid</div>
						</div>

						<div class="indieaf-quote">
							<p>
								Before I became indie.af, I was a nobody, and no one played my
								games. Now I've been getting plays for days!
							</p>
							<div class="indieaf-quote-who">- Indie AF kid</div>
						</div>

						<div class="indieaf-quote">
							<p>
								Ever since I made the move, I've got a couple more Twitter
								followers!
							</p>
							<div class="indieaf-quote-who">- Twitter AF kid</div>
						</div>

						<div class="indieaf-quote">
							<p>
								I don't really see the point. It's just a stupid domain name. No one
								will think you're actually cooler.
							</p>
							<div class="indieaf-quote-who">- Bogus IO kid</div>
						</div>

						<h2 id="get-indie-af" class="text-center">Get Indie.AF</h2>
						<hr class="underbar underbar-center" />
						<br />

						<p>
							Create a portfolio site in your
							<router-link :to="{ name: 'dash.account.site' }">
								Edit Account
							</router-link>
							section. To create custom game sites, click on the
							<strong>Sites</strong>
							tab when managing your game.
						</p>

						<p>
							For the magic to begin, simply replace
							<code>gamejolt.io</code>
							in your Sites URL to
							<code>indie.af</code>
							. For example,
							<code>cros.gamejolt.io</code>
							becomes
							<code>cros.indie.af</code>
							. Now you're legit.
						</p>

						<section v-if="!user">
							<h2 class="section-header text-center">Join</h2>

							<hr class="underbar underbar-center" />
							<br />

							<div class="row">
								<div class="col-lg-8 col-centered">
									<AppAuthJoin />
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<!-- Import the font we use on this page through a normal CSS import. -->
<style lang="css">
@import url('https://fonts.googleapis.com/css?family=Megrim');
</style>

<style lang="stylus" src="./indieaf.styl" scoped></style>
