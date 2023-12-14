<script lang="ts">
import { computed, toRef } from 'vue';
import AppAuthJoin from '../../../../_common/auth/join/AppAuthJoin.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import socialImage from './social.png';

const slogans = [
	`Drive indie traffic to your AAA games`,
	`A better platform for AAA`,
	`Real games for real people`,
	`AAA games with indie branding`,
	`You too can be indie`,
	`A direct way to distribute your games and grow an audience for AAA studios`,
	`Turn those AAAs to $$$s`,
	`Bringing hope to AAA studios`,
	`Helping AAA studios to make a name for themselves`,
	`Putting the indie in AAA`,
	`Roses are red, violets are blue, indies are cool, now AAAs too!`,
];

const handles = [
	'Blizzard_Ent',
	'SquareEnix',
	'Konami',
	'Capcom_Unity',
	'Ubisoft',
	'Activision',
	'CDPROJEKTRED',
	'SNKPofficial',
	'NISAmerica',
	'EA',
	'Rebellion',
	'InfinityWard',
	'SHGames',
	'riotgames',
	'Bungie',
];

const assetPaths = import.meta.glob('./*.(svg|png)', { eager: true, as: 'url' });

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

const chosenHandle = handles[getRandomInt(0, handles.length)];
const slogan = toRef(() => slogans[getRandomInt(0, slogans.length)]);
const tweet = computed(
	() =>
		`Hey @${chosenHandle}! I think your games would be a good fit for Game Jolt #redlight #gamedev`
);

const routeTitle = toRef(() => `Redlight`);

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

createAppRoute({
	routeTitle,
	onInit() {
		Meta.description = `A unique platform for AAA studios and non-indie publishers.`;

		Meta.fb = {
			type: 'website',
			title: routeTitle.value,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: routeTitle.value,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = socialImage;
	},
});
</script>

<template>
	<div>
		<section class="section landing-header text-center">
			<div class="container">
				<h1 class="anim-fade-in-down">
					<img
						:width="1068 / (Screen.isXs ? 4 : 2)"
						:height="108 / (Screen.isXs ? 4 : 2)"
						:src="assetPaths['./logo.png']"
						alt="Redlight"
					/>
				</h1>

				<div class="row anim-fade-in-up">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<p class="lead">{{ slogan }}</p>
					</div>
				</div>

				<div class="social-widgets text-center">
					<AppSocialTwitterShare
						:content="
							$gettext(
								'Check out Game Jolt #Redlight. Helping AAA studios reach critical mass. #gamedev'
							)
						"
					/>

					<span class="dot-separator hidden-xs" />

					<AppSocialFacebookLike />
				</div>
			</div>
		</section>

		<div class="landing-body redlight-landing-body">
			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-7 col-centered">
							<p class="lead">
								We've embraced inclusivity since 2002 and now, with your help, we're
								<strong>expanding Game Jolt to incorporate AAA games</strong>
								to our niche indie community.
							</p>

							<p>
								We've created a unique platform for AAA studios and non-indie
								publishers. Members will
								<strong>vote on your games</strong>
								in the Redlight program to judge if they're
								<strong>good enough quality to be redlit</strong>
								and part of Game Jolt.
							</p>
						</div>
					</div>

					<h1 class="text-center">The process is simple and direct!</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<img :src="assetPaths['./laptop.svg']" alt="" />
							</div>

							<p class="text-center">
								<b>
									Create a Game Jolt account yourself directly. No need for an
									account manager.
									<br />
									<em>Finally!</em>
								</b>
							</p>
						</div>

						<div class="col-sm-6 col-md-4">
							<div class="landing-graphic">
								<img :src="assetPaths['./poster.svg']" alt="" />
							</div>

							<p class="text-center">
								<b>
									Upload your game directly and add
									<code>#redlight</code>
									to your description.
								</b>
							</p>
						</div>

						<div class="landing-break-sm" />

						<div class="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0">
							<div class="landing-graphic">
								<img :src="assetPaths['./shout.svg']" alt="" />
							</div>

							<p class="text-center">
								<b>
									Let your fans know that you're on Redlight and require their
									help directly.
								</b>
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
							<h2 class="section-header">
								Optional Steps
								<br />
								<small>(but required for success)</small>
							</h2>
							<hr class="underbar" />

							<p>
								<AppJolticon icon="checkbox" />
								Desperately fumble around trying to get votes from anywhere on the
								internet.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Spend all your money and free time trying to get redlit.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Include the Game Jolt Redlight logo on your game pages across all
								other platforms.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Add into your game demo "Vote for us on Game Jolt Redlight".
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Upload said demo to all platforms to direct traffic to your Game
								Jolt Redlight page.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Wipe away the tears and include Redlight every time you tweet
								whether your tweet is related or not.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Employ a team of people devoted to Redlight. After all, you have the
								money.
							</p>
							<p>
								<AppJolticon icon="checkbox" />
								Once you're redlit,
								<RouterLink :to="{ name: 'landing.indieaf' }">
									get indie AF!
								</RouterLink>
							</p>
						</div>
						<div class="col-md-1" />
						<div class="col-sm-5">
							<div class="landing-graphic-full hidden-xs">
								<img :src="assetPaths['./redlight-comic.png']" alt="" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-7 col-centered">
							<p class="lead">
								Redlight simultaneously prevents our marketplace from becoming
								overly saturated while
								<strong>maintaining the high standards</strong>
								our users have come to expect from a Game Jolt game.
							</p>

							<h2 class="text-center">Spread the Word</h2>
							<hr class="underbar underbar-center" />

							<p>
								Do you love indie games, but also love AAA? Do you have a massive
								library of games built up on Game Jolt and don't want to use other
								platforms for your AAA content?
							</p>

							<p>
								<strong>Help us spread the word!</strong>
								Tweet at all your favorite game publishers and AAA studios. Get them
								on board. Join the
								<strong>#REDLIGHT</strong>
								movement.
							</p>

							<div class="social-widgets">
								<AppSocialTwitterShare :content="tweet" />

								<span class="dot-separator hidden-xs" />

								<AppSocialFacebookLike />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-black">
				<div class="container">
					<div class="row">
						<div class="col-sm-7 col-centered">
							<h2 class="text-center section-header">What the Industry is Saying</h2>
							<hr class="underbar underbar-center" />

							<p>
								<AppLinkExternal
									href="https://docs.google.com/document/d/1RMMr-9ZTfTFSQMD8Q-1JFkFo9ztX0OktORAn9Se02fg/edit"
								>
									We sent out an email to all the top players.
								</AppLinkExternal>
								No one has gotten back to us yet. We will update here when they do.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-7 col-centered">
							<h2 class="text-center section-header">FAQ</h2>
							<hr class="underbar underbar-center" />

							<br />
							<h4 class="sans-margin-top">What is Redlight?</h4>
							<p>
								Game Jolt Redlight is a system that enlists the community's help in
								choosing new games to be released on Game Jolt. Publishers and AAA
								studios upload their games to seek a critical mass of community
								support in order to get selected for distribution.
							</p>

							<br />
							<h4 class="sans-margin-top">
								Who should submit their games to Redlight?
							</h4>
							<p>
								AAA studios and non-indie publishers looking to expand their
								audience to niche indie gamers.
							</p>

							<br />
							<h4 class="sans-margin-top">
								I know of a game that should be on here? What do I do?
							</h4>
							<ol>
								<li>
									Publicly tweet at the developers/publishers until they add their
									games to Redlight.
								</li>
								<li>Repeat this process on several different accounts.</li>
							</ol>

							<br />
							<h4 class="sans-margin-top">
								There's a game on Redlight that I really want to see succeed. What
								can I do?
							</h4>
							<p>Go tell your friends; be super annoying about it.</p>

							<br />
							<h4 class="sans-margin-top">What about non-game Software?</h4>
							<p>Games only. So don't try to upload your desktop application.</p>

							<br />
							<h4 class="sans-margin-top">
								What do I need in order to submit my game?
							</h4>
							<ul>
								<li>Create a Game Jolt account</li>
								<li>Set up your marketplace account</li>
								<li>Upload your game</li>
								<li>
									Add
									<code>#redlight</code>
									to your game page description
								</li>
							</ul>

							<br />
							<h4 class="sans-margin-top">
								Are there any restrictions on what can be submitted?
							</h4>
							<p>You must have distribution rights for the game.</p>

							<br />
							<h4 class="sans-margin-top">How can I get more votes for my game?</h4>
							<p>
								Pay influencers to talk about it constantly. Make sure they include
								the Redlight link at the beginning, middle, and end of their videos.
								And in their descriptions. And in their twitter bios.
							</p>

							<br />
							<h4 class="sans-margin-top">
								How are games ranked on Redlight? How will I know if my game gets
								redlit?
							</h4>
							<p>
								It's a completely new and unique system. Games are ranked by the
								number of up-votes from the community. Once your game is submitted,
								you will receive an e-mail at the address associated with your
								account, notifying you when Redlit.
							</p>

							<br />
							<h4 class="sans-margin-top">
								I have specific questions about selling on Game Jolt and taxes/VAT.
							</h4>
							<p>
								<RouterLink :to="{ name: 'landing.marketplace' }">
									Visit gamejolt.com/marketplace
								</RouterLink>
								for questions about selling on Game Jolt and taxes. If you don't
								find an answer there, email us. We'll just direct you to the forums.
							</p>

							<br />
							<h4 class="sans-margin-top">Does Redlight cost money to submit to?</h4>
							<p>
								For the initial months, we've decided to waive the $5,000-$10,000
								submission fee. We'll continue discussing this internally to see if
								we should add a few extra zeros in there. This is obviously for QA
								reasons. Only people who make good games have money.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section v-if="!user" class="section fill-offset">
				<div class="container">
					<h1 class="section-header text-center">Join</h1>

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
.redlight-landing-body
	$redlight-red = #ff3300

	.fill-black
		h1, h2, h3
			color: $redlight-red

		a
			link-underlines($redlight-red, $black, $black)
</style>
