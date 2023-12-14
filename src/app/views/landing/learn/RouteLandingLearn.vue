<script lang="ts">
import AppAuthJoin from '../../../../_common/auth/join/AppAuthJoin.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { imageJolt } from '../../../img/images';

const assetPaths = import.meta.glob('./*.(svg|png)', { eager: true, as: 'url' });

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();
createAppRoute({});
</script>

<template>
	<div class="route-landing-learn">
		<section class="section landing-header text-center">
			<div class="container">
				<h1>
					<AppThemeSvg
						v-app-tooltip="$gettext('This is a lightning bolt.')"
						class="bolt anim-fade-in-down"
						:src="imageJolt"
						alt=""
						strict-colors
					/>
				</h1>

				<div class="row anim-fade-in-up">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<p class="lead">Discover, play, buy, and follow 100,000+ games!</p>
					</div>
				</div>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">Game Jolt Loves</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./gamers.svg']" alt="" />
							</div>

							<h4 class="text-center">Gamers</h4>

							<p>
								Millions of gamers visit to play over 100k (and counting) games!
								Game Jolt is completely free to use so you'll be playing non-stop.
								Literally. Like, forever.
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./lpers.svg']" alt="" />
							</div>

							<h4 class="text-center">Let's Players</h4>

							<p>
								Let's players and streamers have been a massive help in discovering
								and sharing new games! Link your channel to Game Jolt and post
								videos.
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./developers.svg']" alt="" />
							</div>

							<h4 class="text-center">Studios</h4>

							<p>
								Since starting in 2002, the goal of Game Jolt has always been to
								help studios get noticed. We give you the tools to build an
								audience, distribute your games, and manage your base of players.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-offset">
				<div class="container">
					<div class="row">
						<div class="col-lg-1" />
						<div class="col-sm-7 col-md-6 col-lg-5">
							<h2 class="section-header">Discover</h2>
							<hr class="underbar" />
							<br />
							<h4 class="sans-margin-top">Find New Games</h4>
							<p>Browse game listings to discover new and old gems!</p>

							<p>
								Get started now by browsing
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: null },
									}"
								>
									Featured
								</RouterLink>
								,
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: null },
									}"
								>
									Hot
								</RouterLink>
								,
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: 'best' },
										query: { status: 'devlog' },
									}"
								>
									Devlogs
								</RouterLink>
								,
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: 'best' },
										query: { status: 'wip' },
									}"
								>
									Early Access
								</RouterLink>
								or
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: 'best' },
										query: { price: 'paid' },
									}"
								>
									Paid
								</RouterLink>
								games!
							</p>

							<br />
							<h4 class="sans-margin-top">Recommendations</h4>
							<p>
								Once you play, follow, and rate some games we'll start giving you
								personalized game recommendations.
							</p>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-5">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./discover.svg']" alt="" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-5 col-sm-push-7 col-md-push-0">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./interact.svg']" alt="" />
							</div>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-7 col-sm-pull-5 col-md-6 col-md-pull-0 col-lg-5">
							<h2 class="section-header">Interact</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Discuss</h4>
							<p>
								Ask questions, provide feedback, and discuss directly with studios
								by commenting on their game pages.
							</p>

							<br />
							<h4 class="sans-margin-top">Rate games</h4>
							<p>
								You're in control of what becomes popular on Game Jolt and&mdash;for
								all we know&mdash;the gaming industry. Rate games you love onto Game
								Jolt's home page and the top of game listings.
							</p>

							<br />
							<h4 class="sans-margin-top">Let's Players</h4>
							<p>
								If you're a Let's Player, link your YouTube or Twitch channel and
								post video comments to the game page.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-offset">
				<div class="container">
					<div class="row">
						<div class="col-lg-1" />
						<div class="col-sm-7 col-md-6 col-lg-5">
							<h2 class="section-header">Support Studios</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Indie-Friendly</h4>
							<p>
								Be confident that the money you spend goes to the developer. We let
								developers decide the percentage to give to Game Jolt! Every little
								bit counts!
							</p>

							<br />
							<h4 class="sans-margin-top">Be a Supporter</h4>

							<p>
								We'll post your avatar as a supporter on the game's page when you
								pay more than the developer's asking price. Lead by example and show
								your support!
							</p>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-5">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./support.svg']" alt="" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-5 col-sm-push-7 col-md-push-0">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./feeds.svg']" alt="" />
							</div>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-7 col-sm-pull-5 col-md-6 col-md-pull-0 col-lg-5">
							<h2 class="section-header">Devlogs</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Early Access and In-Development</h4>
							<p>
								Discover your future favorite game from its early devlog stage or
								keep up to date with early access games. Gain access before the rest
								of the world!
							</p>

							<br />
							<h4 class="sans-margin-top">Stay Updated</h4>
							<p>
								Be the first to know about new mechanics, concept art, releases and
								anything else devs want to share with the world! Follow games to get
								notified when new posts are added.
							</p>

							<p>
								Browse
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: 'best' },
										query: { status: 'devlog' },
									}"
								>
									Devlogs
								</RouterLink>
								and
								<RouterLink
									:to="{
										name: 'discover.games.list._fetch',
										params: { section: 'best' },
										query: { status: 'wip' },
									}"
								>
									Early Access
								</RouterLink>
								games.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-offset">
				<div class="container">
					<div class="row">
						<div class="col-lg-1" />
						<div class="col-sm-7 col-md-6 col-lg-5">
							<h2 class="section-header">Organize</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Playlists</h4>
							<p>
								Organize the way you follow games, devlogs and developers with ease!
								Others can discover, follow, and share your playlists.
							</p>

							<br />
							<h4 class="sans-margin-top">Activity Feed</h4>
							<p>
								Any game you follow will show up in your Activity Feed. Keep track
								of what matters to you, and stay updated with your slice of the
								gaming world!
							</p>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-5">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./organize.svg']" alt="" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-5 col-sm-push-7 col-md-push-0">
							<div class="landing-graphic-full hidden-xs">
								<AppThemeSvg :src="assetPaths['./achievements.svg']" alt="" />
							</div>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-7 col-sm-pull-5 col-md-6 col-md-pull-0 col-lg-5">
							<h2 class="section-header">Achievements</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Trophies</h4>
							<p>
								Hunt for trophies in games that implement the Game Jolt Game API.
								Gotta get to 100% completion, eh?
							</p>

							<br />
							<h4 class="sans-margin-top">Scores</h4>
							<p>
								Battle to get the top scores in games. Never give up. Never let us
								down. Never run around or desert us.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-black">
				<div class="container">
					<h1 class="section-header text-center">Community</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./friends.svg']" alt="" />
							</div>

							<h4 class="text-center">Friends</h4>

							<p>
								Become friends on Game Jolt and get notified when your friends are
								online, when they're playing games, or send them game
								recommendations.
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./chat.svg']" alt="" />
							</div>

							<h4 class="text-center">Chat</h4>

							<p>
								Meet other gamers, network and get help through private messaging
								and available chat rooms.
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0">
							<div class="landing-graphic">
								<AppThemeSvg :src="assetPaths['./forums.svg']" alt="" />
							</div>

							<h4 class="text-center">Forums</h4>

							<p>
								Find studios looking for testers, discuss the industry, participate
								in existing conversations with let's players and devs, or start your
								own topic! Haikus are encouraged!
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-highlight">
				<div class="container text-center">
					<h1 class="section-header">Everywhere</h1>

					<div class="row">
						<div class="col-lg-7 col-centered">
							<p class="lead">
								Play and follow games in your
								<b>browser</b>, on your
								<RouterLink :to="{ name: 'landing.app' }">desktop</RouterLink>, and
								through the mobile site on your
								<b>tablet</b>
								and
								<b>phone</b>.
							</p>
						</div>
					</div>

					<hr class="underbar underbar-center" />
					<br />

					<div class="landing-graphic-full">
						<img
							class="visible-lg"
							:src="assetPaths['./device-montage.png']"
							alt=""
							style="margin: 0 auto; max-width: none; width: 912px; height: 484px"
						/>
						<img
							class="visible-md"
							:src="assetPaths['./device-montage.png']"
							alt=""
							style="margin: 0 auto; max-width: none; width: 912px; height: 484px"
						/>
						<img
							class="visible-sm"
							:src="assetPaths['./device-montage.png']"
							alt=""
							style="margin: 0 auto; max-width: none; width: 684px; height: 363px"
						/>
						<img
							class="visible-xs"
							:src="assetPaths['./device-montage.png']"
							alt=""
							style="margin: 0 auto; max-width: none; width: 228px; height: 121px"
						/>
					</div>

					<br />
					<br />
					<br />

					<AppButton solid :to="{ name: 'landing.app' }">
						{{ $gettext(`Get the app`) }}
					</AppButton>
				</div>
			</section>

			<section v-if="!user" class="section">
				<div class="container">
					<h1 class="section-header text-center">
						{{ $gettext(`Join`) }}
					</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-5 col-lg-4 col-centered">
							<AppAuthJoin />
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.route-landing-learn .landing-body
	.loading
		color: $white
</style>
