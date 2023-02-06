<script lang="ts">
import { computed, ref } from 'vue';
import { arrayIndexBy, arrayShuffle } from '../../../../utils/array';
import { trackCreatorApply } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../_common/background/background.model';
import AppBean from '../../../../_common/bean/AppBean.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCreatorsList from '../../../../_common/creator/AppCreatorsList.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import { ImgHelper } from '../../../../_common/img/helper/helper-service';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { User } from '../../../../_common/user/user.model';
import {
	illMobileKikkerstein,
	illPointyThing,
	illStreamingJelly,
} from '../../../img/ill/illustrations';
import AppCreatorMooMoo from './AppCreatorMooMoo.vue';
import socialImage from './social.png';
import { creatorApplyDesktop, creatorApplySm, creatorApplyXs } from './_backgrounds/backgrounds';

const postImages = import.meta.glob('./_posts/*.jpg', {eager: true, as: 'url'});

const boltHeight = computed(() => (Screen.isDesktop ? 182 : 164));
const boltWidth = computed(() => (104 / 154) * boltHeight.value);

const boltPath = `M103.51 7.56474L36.9422 0.148525L0.589619 87.1413L36.0049 87.2411L15.2471 153.757L99.5527 61.591L67.4268 54.046L103.51 7.56474Z`;
const boltGap = 24;

const boltCount = computed(() => {
	const bleed = 24;
	return Math.ceil((Screen.width + bleed * 2) / (boltWidth.value + boltGap));
});

const stickers = [
	'https://m.gjcdn.net/sticker/200/10-pwkhwvdr-v4.png',
	'https://m.gjcdn.net/sticker/200/12-4fey9diw-v4.png',
	'https://m.gjcdn.net/sticker/200/13-qzwgzbbx-v4.png',
	'https://m.gjcdn.net/sticker/200/14-rb7rkxy6-v4.png',
	'https://m.gjcdn.net/sticker/200/23-dbi5hybb-v4.png',
	'https://m.gjcdn.net/sticker/200/30-5ajvr3nm-v4.png',
	'https://m.gjcdn.net/sticker/200/43-cdjdwgxf-v4.png',
	'https://m.gjcdn.net/sticker/200/45-jgauy7ue-v4.png',
	'https://m.gjcdn.net/sticker/200/49-jnw3guqm-v4.png',
	'https://m.gjcdn.net/sticker/200/50-fumsmcyt-v4.png',
	'https://m.gjcdn.net/sticker/200/56-gdkv2xfg-v4.png',
	'https://m.gjcdn.net/sticker/200/69-tzvc5pd3-v4.png',
];

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/landing/creator'),
	}),
};
</script>

<script lang="ts" setup>
interface Testimonial {
	user: number;
	text: string;
	tag: string;
}

const postImageKeys = arrayShuffle(Object.keys(postImages));

let _hasPostTimer = false;

const applyUrl = ref<string>();
const postIndex = ref(0);
const creatorPosts = ref<FiresidePost[]>([]);
const whyBackground = ref<Background>();
const testimonialUsers = ref<User[]>([]);
const testimonials = ref<Testimonial[]>([]);

const headerPost = computed(() => getPostFromIndex(postIndex.value));
const postsCount = computed(() => postImageKeys.length);
const testimonialUsersIndexed = computed(() => arrayIndexBy(testimonialUsers.value, 'id'));

const applyBackground = computed(() => {
	if (Screen.isXs) {
		return creatorApplyXs;
	} else if (Screen.isSm) {
		return creatorApplySm;
	}

	return creatorApplyDesktop;
});

const displayStickers = computed(() => {
	// Watch the post index here so our displayStickers recalculate anytime
	// we're showing the next post header slide.
	postIndex.value;

	return getRandomStickers();
});

// Force all the page content to use the default theme so our pink backgrounds
// match well with overlayed buttons.
const theme = computed(() => DefaultTheme);

const routeTitle = `Become a Game Jolt Creator`;

const { isBootstrapped, isDestroyed } = createAppRoute({
	routeTitle,
	disableTitleSuffix: true,
	onInit() {
		Meta.description = `BOOM! Be a Game Jolt Creator and make money with your gaming content. Your fans never have to jump through hoops to see your latest post, video, or stream.`;

		Meta.fb = {
			type: 'website',
			title: routeTitle,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: routeTitle,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = socialImage;

		if (!_hasPostTimer) {
			setHeaderPostTimer(true);
			_hasPostTimer = true;
		}
	},
	onResolved({ payload }) {
		const posts = FiresidePost.populate(payload.posts);

		creatorPosts.value = posts.sort(() => Math.random() - 0.5);
		testimonialUsers.value = User.populate(payload.testimonialUsers);
		testimonials.value = payload.testimonials;
		whyBackground.value = payload.background ? new Background(payload.background) : undefined;
		applyUrl.value = payload.applyUrl;
	},
});

async function setHeaderPostTimer(initial = false) {
	if (isDestroyed) {
		return;
	}

	await new Promise<void>(resolve => {
		let requiredCompletions = 2;

		const tryResolve = () => {
			--requiredCompletions;

			if (requiredCompletions <= 0) {
				resolve();
			}
		};

		const current = postIndex.value;

		const nextIndex = initial || current === postsCount.value - 1 ? 0 : current + 1;
		const nextPost = getPostFromIndex(nextIndex);

		ImgHelper.loaded(nextPost).finally(tryResolve);
		setTimeout(tryResolve, 5_000);
	});

	if (isDestroyed) {
		return;
	}

	if (postIndex.value === postsCount.value - 1) {
		postIndex.value = 0;
	} else {
		++postIndex.value;
	}

	setHeaderPostTimer();
}

function getPostFromIndex(index: number) {
	return postImages[postImageKeys[index]];
}

function onClickApply(section: 'header' | 'why' | 'apply') {
	trackCreatorApply({ creator_landing_section: section });
}

function getRandomStickers(count = 3) {
	const list = [...stickers];
	const result: string[] = [];

	for (let i = 0; i < count; ++i) {
		const index = Math.floor(Math.random() * list.length);
		result.push(...list.splice(index, 1));
	}

	return result;
}
</script>

<template>
	<AppTheme class="route-creator" :theme="theme" force-dark>
		<div class="-page-header">
			<div
				class="-bolts"
				:style="{
					gap: boltGap + 'px',
				}"
			>
				<div
					v-for="i of boltCount"
					:key="i"
					class="-bolt"
					:style="{
						width: boltWidth + 'px',
						height: boltHeight + 'px',
						animationDuration: 3_000 + 'ms',
						animationDelay: -(3_000 / 2.4) * i + 'ms',
					}"
				>
					<svg :width="boltWidth + 'px'" :height="boltHeight + 'px'">
						<g :transform="`scale(${boltWidth / 104})`">
							<path
								:d="boltPath"
								:width="boltWidth + 'px'"
								:height="boltHeight + 'px'"
								fill="#CCFF00"
							/>
						</g>
					</svg>
				</div>
			</div>

			<div class="-page-header-content -col-mobile">
				<div class="-header-lead -shadow">
					<div v-if="Screen.isDesktop" class="-header-lead-spacer" />

					<div class="-header-lead-text -main-header-text">
						Become a Game Jolt Creator
					</div>

					<AppLinkExternal class="-header-lead-spacer" :href="applyUrl">
						<AppButton primary solid block overlay lg @click="onClickApply('header')">
							APPLY NOW
						</AppButton>
					</AppLinkExternal>
				</div>

				<div class="-header-post-container">
					<AppAspectRatio :ratio="488 / 570" show-overflow>
						<div style="position: relative; width: 100%; height: 100%">
							<transition name="fade" appear>
								<div
									:key="postIndex"
									class="-header-post"
									style="
										left: 0;
										right: 0;
										bottom: 0;
										position: absolute;
										z-index: 3;
									"
								>
									<AppImgResponsive :src="headerPost" />

									<div
										v-for="(sticker, index) of displayStickers"
										:key="sticker"
										class="-header-sticker"
										:class="`-sticker-${index + 1}`"
									>
										<img
											:src="sticker"
											:style="{
												width: '100%',
												height: '100%',
												transform: `rotate(${
													Math.random() * 60 - 30
												}deg) !important`,
											}"
											alt=""
										/>
									</div>
								</div>
							</transition>
						</div>
					</AppAspectRatio>
				</div>
			</div>
		</div>

		<div class="-where -section-row">
			<div class="-where-header -sub-header-text">
				<span class="-where-header-text">
					<AppCreatorMooMoo />
					<span class="-text-primary"> Get paid to engage with your audience! </span>
					<br />
					<span> Where your existing followers can </span>
					<span class="-text-primary"> {{ ' <' }}gasp{{ '> ' }} </span>
					<span>follow</span>
				</span>
			</div>

			<div class="-where-content">
				<div class="-where-inner -col-mobile">
					<div class="-where-lead">
						<AppBean :variant="1" flip>
							<img
								:style="{
									width: Screen.isDesktop ? '140px' : '124px',
									marginRight: '10%',
								}"
								:src="illMobileKikkerstein.path"
								alt=""
							/>
						</AppBean>
					</div>

					<div class="-where-trail">
						<div class="-where-inner-header -tiny-header-text">BE SEEN</div>

						<div>
							Your audience won't need to jump through hoops or ding bells just to see
							your latest post, video, or stream. We don't hide your content via
							ambiguous algorithms from your own followers.
						</div>
					</div>
				</div>

				<div class="-where-inner -col-mobile">
					<div class="-where-lead">
						<AppBean :variant="2">
							<img
								:style="{
									width: Screen.isDesktop ? '248px' : '220px',
									marginBottom: '5%',
								}"
								:src="illStreamingJelly.path"
								alt=""
							/>
						</AppBean>
					</div>

					<div class="-where-trail">
						<div class="-where-inner-header -tiny-header-text">BE AUTHENTIC</div>

						<div>
							Unlike Twitter and Instagram you'll actually be paid for your content,
							and stop living in fear of getting demonetized on platforms like
							YouTube.
						</div>
					</div>
				</div>
				<div class="-where-inner -col-mobile">
					<div class="-where-lead">
						<AppBean :variant="1">
							<img
								:style="{
									width: Screen.isDesktop ? '240px' : '213px',
									marginLeft: '5%',
									marginBottom: '5%',
								}"
								:src="illPointyThing.path"
								alt=""
							/>
						</AppBean>
					</div>

					<div class="-where-trail">
						<div class="-where-inner-header -tiny-header-text">
							EXPRESS YOURSELF IN ANY FORMAT
						</div>

						<div>
							Don't tie yourself down to a single communication format with your fans.
							Chat, post images, upload videos, livestream and share your status all
							from your profile.
						</div>
					</div>
				</div>
			</div>
		</div>

		<AppBackground
			class="-testimonial -section-row"
			:background="whyBackground"
			darken
			scroll-direction="up"
		>
			<div class="-testimonial-content -shadow">
				<div class="-testimonial-header -sub-header-text">What creators are saying</div>

				<div
					v-for="testimonial of testimonials"
					:key="testimonial.user"
					class="-testimonial-item"
				>
					<div class="-testimonial-avatar">
						<AppUserAvatarImg :user="testimonialUsersIndexed[testimonial.user]" />
					</div>

					<div class="-testimonial-text">
						{{ testimonial.text }}
						<br />
						-
						<strong>@{{ testimonialUsersIndexed[testimonial.user].username }},</strong>
						{{ ' ' }}
						<em>{{ testimonial.tag }}</em>
					</div>
				</div>
			</div>
		</AppBackground>

		<div class="-who">
			<div class="-who-content">
				<div class="-grid-center">
					<AppCreatorsList
						:is-loading="!isBootstrapped"
						:posts="creatorPosts"
						list-type="scroll"
						fancy-hover
					>
						<template #left>
							<AppSpacer horizontal :scale="4" />
						</template>

						<template #right>
							<AppSpacer horizontal :scale="4" />
						</template>
					</AppCreatorsList>
				</div>
			</div>
		</div>

		<div
			class="-apply -section-row"
			:style="{
				backgroundImage: `url(${applyBackground.src})`,
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}"
		>
			<div class="-apply-content -shadow">
				<div class="-main-header-text -apply-header">
					Apply now,
					<br />
					let's gooooo
				</div>

				<AppLinkExternal :href="applyUrl">
					<AppButton
						:style="{ maxWidth: '384px' }"
						primary
						solid
						block
						overlay
						lg
						@click="onClickApply('apply')"
					>
						PRESS START
					</AppButton>
				</AppLinkExternal>
			</div>
		</div>

		<div class="-faqs -section-row">
			<div class="-sub-header-text -faqs-header">FAQ</div>

			<div class="-faqs-content -col-mobile">
				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						How do I become a Game Jolt Creator?
					</div>

					<div>
						Apply! We'll reach out with next steps or let you know what we need in order
						to get you in.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						What are the requirements to become a Game Jolt creator?
					</div>

					<div>
						Game Jolt users with 1,000 or more followers or users on platforms like
						YouTube, TikTok, Twitter, Instagram, Twitch and Patreon that have 3,000 or
						more followers will be considered.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						Do I have to sign an exclusivity deal?
					</div>

					<div>
						No way! We want you to be successful even if opportunities take you
						elsewhere.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">Am I a creator?</div>

					<div>
						Creator is a loose term. If you consider yourself to be an artist, musician,
						streamer, crafter or a builder, you are a creator and should apply!
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						What's the deal with your algorithms?
					</div>

					<div>
						We have 2 feeds on Game Jolt. The Following feed will ensure anyone that
						puts in the effort to follow you on Game Jolt will get your content in their
						feed. Our For You feed will help other users discover you.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						Why do you need tax forms?
					</div>

					<div>
						As a company based in the United States, our government requires us to
						collect the proper tax forms in order to continue our operations. This is a
						legal requirement.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						When will you add new payment withdrawal methods?
					</div>

					<div>
						Soon! We support PayPal withdrawals for now, but our goal is to support more
						currencies and banks across the globe.
					</div>
				</div>
			</div>
		</div>

		<div class="-footer -section-row">
			<div class="-footer-content">
				<AppLinkExternal :href="applyUrl">
					<AppButton
						:style="{ maxWidth: '384px' }"
						primary
						solid
						block
						overlay
						lg
						@click="onClickApply('apply')"
					>
						Apply
					</AppButton>
				</AppLinkExternal>

				<div>
					<div class="-footer-header-text -tiny-header-text">More questions?</div>
					<div class="-footer-header-text -tiny-header-text">
						We've got answers in
						<a
							href="https://gamejolt.com/p/why-game-jolt-eny749ba"
							target="_blank"
							style="white-space: nowrap"
						>
							our Creator FAQ
						</a>
					</div>
				</div>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.fade-enter-active
	transition: opacity 1.5s $strong-ease-out, transform 1s
	z-index: 2

.fade-leave-active
	transition: opacity 1.5s $weak-ease-out, transform 1s
	z-index: 1

.fade-leave-to
.fade-leave-active
	transform: translate(0, 25%) scale(0.8)
	position: absolute

	.-header-sticker > *
		transition: opacity 1s $strong-ease-out !important
		opacity: 0 !important

.fade-enter-from
	transform: translate(0, 75%) scale(1.1)

.fade-enter-from
.fade-leave-to
	opacity: 0 !important

.route-creator
	display: flex
	flex-direction: column
	width: 100%
	min-height: 100vh
	font-size: 19px
	color: var(--theme-fg)
	change-bg(bg)

	::v-deep(.button.-lg)
		rounded-corners()

.-shadow
	filter: drop-shadow(0px 4px 12px rgba($black, 0.25))

.-bg-pink
	background-color: $gj-pink
	color: $gj-green

.-bg-black
	background-color: black
	color: white

.-col
	display: flex
	flex-direction: column

.-main-header-text
	font-family: $font-family-display
	font-size: 96px
	line-height: 1
	text-shadow: -2px 8px 0px rgba(204, 255, 0, 0.4), -6px 4px 0px rgba(49, 214, 255, 0.5)

	@media $media-xs
		font-size: 64px

.-sub-header-text
	font-family: $font-family-display
	font-size: 48px
	text-shadow: -2px 4px 0px rgba(47, 127, 111, 0.5), -4px 2px 0px rgba(204, 255, 0, 0.5)

	@media $media-xs
		font-size: 36px

.-tiny-header-text
	font-family: $font-family-display
	font-size: 27px

	a
		text-decoration: underline

.-body-text
	font-weight: bold
	line-height: 1.7
	font-size: 21px

.-text-primary
	color: var(--theme-primary)

.-grid-center
	display: grid
	justify-content: center

.-page-header
	@extends .-bg-pink
	@extends .-grid-center
	padding: 32px 64px 0
	position: relative
	overflow: hidden

	@media $media-sm
		padding: 97px 64px 0

	@media $media-xs
		padding: 97px 16px 0

.-bolts
	position: absolute
	opacity: 0.4
	display: flex
	align-items: center
	justify-content: center
	left: -24px
	right: -24px
	z-index: 0

	@media $media-md-up
		bottom: 14%

	@media $media-sm
		top: 35%

	@media $media-xs
		top: 40%

.-bolt
	transform: rotate(0deg)
	animation-name: anim-bolt
	animation-duration: 2s
	animation-iteration-count: infinite
	animation-timing-function: linear
	animation-fill-mode: both

@keyframes anim-bolt
	0%
		transform: rotate(0deg)
		animation-timing-function: ease

	25%
		transform: rotate(18deg)
		animation-timing-function: $weak-ease-in

	50%
		transform: rotate(0deg)
		animation-timing-function: ease

	75%
		transform: rotate(-18deg)
		animation-timing-function: $weak-ease-in

.-page-header-content
	max-width: 1000px
	width: 100%
	display: flex
	gap: 64px 10%
	justify-content: space-between
	align-items: flex-start

	@media $media-mobile
		align-items: center

	> *
		z-index: 1

.-header-lead
	@extends .-col
	text-align: center
	width: 100%
	flex: 1 1 384px
	gap: 40px

	@media $media-md-up
		height: 100%
		padding-bottom: 32px

	@media $media-mobile
		flex: none
		max-width: 450px
		align-self: center

	@media $media-xs
		gap: 32px

.-header-lead-spacer
	flex: 1

.-header-lead-text
	@media $media-xs
		max-width: 325px

.-header-post-container
	flex: 1 1 488px

	@media $media-md-up
		align-self: flex-end

	@media $media-mobile
		flex: none
		padding: 0 40px
		width: 100%

.-header-post
	opacity: 1
	position: absolute
	left: 0
	right: 0
	bottom: 0
	z-index: 3

.-header-sticker
	--sticker-max: 128px
	--sticker-size: unquote('calc(max(64px, min(20vw, var(--sticker-max))))')
	--sticker-offset: unquote('calc(var(--sticker-size) * -0.5)')
	position: absolute
	width: var(--sticker-size)
	height: @width
	margin-left: var(--sticker-offset)
	margin-top: @margin-left
	animation: anim-sticker 1s $strong-ease-out
	animation-fill-mode: both
	opacity: 1

	@media $media-mobile
		--sticker-max: 96px

	&.-sticker-1
		left: 100%
		top: 25%
		animation-delay: 1000ms

	&.-sticker-2
		left: 100%
		top: 60%
		animation-delay: 1100ms

	&.-sticker-3
		left: 0
		top: 70%
		animation-delay: 1400ms

@keyframes anim-sticker
	0%
		transform: translate(0, -100px)
		opacity: 0

	100%
		transform: translate(0, 0)
		opacity: 1

.-section-row
	padding: 64px

	@media $media-sm
		padding: 64px 32px

	@media $media-xs
		padding: 64px 16px

.-where
	@extends .-bg-black
	@extends .-grid-center

.-where-content
	display: flex
	flex-direction: column
	align-items: stretch
	gap: 80px

	@media $media-mobile
		align-items: center
		text-align: center
		gap: 96px

.-where-header
	position: relative
	text-align: center
	margin-bottom: 96px

	@media $media-sm
		margin-bottom: 71px

	@media $media-xs
		margin-bottom: 80px

.-where-header-text
	position: relative
	z-index: 1

.-where-inner
	display: flex
	align-items: center
	gap: 24px 80px
	max-width: 800px
	z-index: 1

	@media $media-mobile
		max-width: 450px

.-where-lead
	flex: 1 1 282px

	@media $media-mobile
		flex: none
		max-width: 250px
		width: 100%
		align-self: center

.-where-trail
	flex: 1 1 430px

	@media $media-mobile
		flex: none

.-where-inner-header
	margin-bottom: 24px

.-testimonial
	@extends .-grid-center

.-testimonial-content
	display: flex
	flex-direction: column
	gap: 32px
	align-items: center
	max-width: 800px

.-testimonial-header
	max-width: unset
	text-align: center

.-testimonial-item
	--testimonial-avatar-size: 100px
	display: flex
	flex-direction: row
	align-items: center
	gap: 20px
	background-color: black
	min-height: var(--testimonial-avatar-size)
	border-radius: var(--testimonial-avatar-size)
	padding: 12px calc(var(--testimonial-avatar-size) / 2) 12px 12px

.-testimonial-avatar
	width: var(--testimonial-avatar-size)
	height: var(--testimonial-avatar-size)
	flex: none
	background-color: white
	border-radius: 50%

@media $media-xs
	.-testimonial-item
		--testimonial-avatar-size: 48px
		font-size: 16px
		align-items: start

.-who
	padding: 32px 0

.-who-content
	display: flex
	flex-direction: column
	gap: 60px

	@media $media-sm
		gap: 53px

	@media $media-xs
		gap: 65px

.-who-header
	text-align: center

.-apply
	@extends .-bg-pink
	@extends .-grid-center
	position: relative
	overflow: hidden

.-apply-content
	display: flex
	flex-direction: column
	align-items: center
	text-align: center
	max-width: 588px
	width: 100%
	z-index: 1

.-apply-header
	margin-bottom: 40px

.-faqs
	display: flex
	flex-direction: column
	align-items: center

.-faqs-header
	text-align: center
	margin-bottom: 77px

	@media $media-mobile
		margin-bottom: 64px

.-faqs-content
	display: grid
	grid-template-areas: "a b" "c d"
	gap: 80px 120px
	max-width: 1000px

	@media $media-mobile
		text-align: center
		align-items: center
		max-width: 450px

.-faqs-content-header
	@media $media-md-up
		margin-bottom: 12px
		min-height: 80px

	@media $media-mobile
		margin-bottom: 32px

.-footer
	@extends .-bg-black
	@extends .-grid-center

.-footer-header
	text-align: center
	margin-bottom: 48px

.-footer-content
	display: flex
	flex-direction: column
	gap: 32px
	align-items: center
	max-width: 800px

.-footer-header-text
	text-align: center

@media $media-mobile
	.-col-mobile
		display: flex
		flex-direction: column

	.-col-mobile-reverse
		display: flex
		flex-direction: column-reverse

.-nowrap
	white-space: nowrap
</style>
