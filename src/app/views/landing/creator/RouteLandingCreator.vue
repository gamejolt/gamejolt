<script lang="ts">
const boltWidth = computed(() => (Screen.isDesktop ? 90 : 81));
const boltHeight = computed(() => boltWidth.value / (104 / 154));
const boltPath = `M103.51 7.56474L36.9422 0.148525L0.589619 87.1413L36.0049 87.2411L15.2471 153.757L99.5527 61.591L67.4268 54.046L103.51 7.56474Z`;
const boltGap = 24;

const boltCount = computed(() => {
	const bleed = 24;
	return Math.ceil((Screen.width + bleed * 2) / (boltWidth.value + boltGap));
});

const moomooWidth = 70;
const moomooHeight = 35;
const mPath = `M24.1737 14.3505L8.38119 33.0065L0.772005 22.1169L21.7373 3.34891L37.1056 14.0705L47.386 0.252628L70.7271 23.5059L61.1165 32.5245L47.6693 14.8317L35.1359 27.0814L24.1737 14.3505Z`;
const wPath = `M22.9344 19.9755L8.15959 0.789419L0.202878 11.3923L20.0699 30.8736L35.665 20.7133L45.2124 34.8736L69.1917 12.4838L60.102 3.13888L46.1061 20.3275L34.2726 7.653L22.9344 19.9755Z`;

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
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { trackCreatorApply } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../_common/background/background.model';
import AppBean from '../../../../_common/bean/AppBean.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppPostCardBase from '../../../../_common/fireside/post/card/AppPostCardBase.vue';
import AppPostCardPlaceholder from '../../../../_common/fireside/post/card/AppPostCardPlaceholder.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import { ImgHelper } from '../../../../_common/img/helper/helper-service';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import {
	illCreatorInfographic,
	illMobileKikkerstein,
	illPointyThing,
	illStreamingJelly,
} from '../../../img/ill/illustrations';
import { creatorApplyDesktop, creatorApplySm, creatorApplyXs } from './_backgrounds/backgrounds';

const postImages = import.meta.globEager('./_posts/*.jpg');
const postImageKeys = Object.keys(postImages).sort(() => Math.random() - 0.5);

let _routeDestroyed = false;
let _hasPostTimer = false;

const applyUrl = ref<string>();

const postIndex = ref(0);

const creatorPosts = ref<FiresidePost[]>([]);
const whyBackground = ref<Background>();

const headerPost = computed(() => getPostFromIndex(postIndex.value));
const postsCount = computed(() => postImageKeys.length);

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

const { isBootstrapped } = createAppRoute({
	routeTitle: 'Creator',
	onInit() {
		if (!_hasPostTimer) {
			setHeaderPostTimer(true);
			_hasPostTimer = true;
		}
	},
	onResolved({ payload }) {
		const posts = FiresidePost.populate(payload.posts);

		creatorPosts.value = posts.sort(() => Math.random() - 0.5);
		whyBackground.value = payload.background ? new Background(payload.background) : undefined;
		applyUrl.value = payload.applyUrl;
	},
	onDestroyed() {
		_routeDestroyed = true;
	},
});

async function setHeaderPostTimer(initial = false) {
	if (_routeDestroyed) {
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

	if (_routeDestroyed) {
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
	return postImages[postImageKeys[index]].default;
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
	<AppTheme class="route-creator" :theme="DefaultTheme">
		<div class="-page-header">
			<div
				class="-bolts"
				:style="{
					top: Screen.isDesktop ? undefined : '15%',
					bottom: Screen.isDesktop ? '15%' : undefined,
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
						animationFillMode: 'both',
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
					<div class="-header-lead-text -main-header-text">
						Become a Game Jolt Creator
					</div>

					<AppLinkExternal :href="applyUrl">
						<AppButton primary solid block overlay lg @click="onClickApply('header')">
							💰 Apply for private beta 💰
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

		<div class="-how">
			<div class="-how-content -col-mobile-reverse">
				<AppImgResponsive class="-how-img" :src="illCreatorInfographic.path" />

				<AppSpacer class="-how-spacer" vertical :scale="6" />

				<div class="-how-text">
					<div class="-sub-header-text -how-text-header">How does it work?</div>

					<div>
						Bring your audience on adventures, earn rewards and start making 💰 REAL
						MONEY 💰
					</div>
				</div>
			</div>
		</div>

		<AppBackground class="-why" :background="whyBackground" darken scroll-direction="up">
			<div class="-why-content -shadow">
				<div class="-why-header -sub-header-text">Why become a Game Jolt Creator?</div>

				<div>
					Stop fighting algorithms and start building lasting relationships with an
					audience who actually sees 👀 and engages ✋ with what you share!
				</div>

				<AppLinkExternal :href="applyUrl">
					<AppButton primary solid block overlay lg @click="onClickApply('why')">
						$$$
						<AppSpacer horizontal :scale="3" style="display: inline-block" />
						APPLY
						<AppSpacer horizontal :scale="3" style="display: inline-block" />
						$$$
					</AppButton>
				</AppLinkExternal>
			</div>
		</AppBackground>

		<div class="-where">
			<div class="-where-header -sub-header-text">
				<span class="-where-header-text">
					<div class="-moomoo">
						<div
							v-for="i of 5"
							:key="`moomoo-${i}`"
							:class="{ [`-moomoo-${i === 1 || i === 4 ? 'w' : 'm'}`]: true }"
							:style="{
								height: moomooHeight * (i === 1 || i === 4 ? 0.5 : 1) + 'px',
							}"
						>
							<svg :width="moomooWidth + 'px'" :height="moomooHeight + 'px'">
								<path
									:d="i === 1 || i === 4 ? wPath : mPath"
									:width="moomooWidth + 'px'"
									:height="moomooHeight + 'px'"
									fill="#FF3FAC"
								/>
							</svg>
						</div>
					</div>

					Where your existing followers can
				</span>
				<span class="-text-primary"> {{ ' <' }}gasp{{ '> ' }} </span>
				<span> follow </span>
			</div>

			<div class="-where-content">
				<div class="-where-inner -col-mobile">
					<div class="-where-lead">
						<AppBean class="-bean" :variant="1" flip>
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
						<AppBean class="-bean" :variant="2">
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
							You're not beholden to advertisers so create what you want to create.
						</div>
					</div>
				</div>
				<div class="-where-inner -col-mobile">
					<div class="-where-lead">
						<AppBean class="-bean" :variant="1">
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
							Engagement should be ✨FUN✨
						</div>

						<div>
							Our goals are aligned with yours. It's all about turning your views into
							supporters.
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="-who">
			<div class="-who-content">
				<div class="-who-header -sub-header-text">MEET OUR CREATORS</div>

				<div class="-grid-center">
					<AppScrollScroller class="-who-scroller" horizontal>
						<div class="-who-list">
							<AppSpacer horizontal :scale="4" />

							<template v-if="!isBootstrapped">
								<template v-for="i of 4" :key="i">
									<div class="-who-card-wrapper">
										<AppPostCardPlaceholder class="-who-card" />
									</div>
								</template>
							</template>
							<template v-else>
								<template v-for="post of creatorPosts" :key="post.id">
									<div class="-who-card-wrapper">
										<div class="-who-card-shadow" />

										<AppPostCardBase
											class="-who-card"
											:post="post"
											no-elevate-hover
										>
											<template #controls>
												<RouterLink
													class="-who-card-controls"
													:to="post.displayUser.routeLocation"
												>
													<div class="-who-card-header">
														<AppUserAvatarImg
															class="-who-card-avatar"
															:user="post.displayUser"
														/>

														<div class="-who-card-names">
															<div class="-who-card-displayname">
																{{ post.displayUser.display_name }}
															</div>
															<div class="-who-card-username">
																@{{ post.displayUser.username }}
															</div>
														</div>
													</div>
												</RouterLink>

												<div class="-who-card-border" />
											</template>
										</AppPostCardBase>
									</div>
								</template>
							</template>

							<AppSpacer horizontal :scale="4" />
						</div>
					</AppScrollScroller>
				</div>
			</div>
		</div>

		<div
			class="-apply"
			:style="{
				backgroundImage: `url(${applyBackground.src})`,
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}"
		>
			<div class="-apply-content -shadow">
				<div class="-main-header-text -apply-header">Apply now for limited spots</div>

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
						💰 Apply for private beta 💰
					</AppButton>
				</AppLinkExternal>
			</div>
		</div>

		<div class="-faqs">
			<div class="-sub-header-text -faqs-header">FAQ</div>

			<div class="-faqs-content -col-mobile">
				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						How do I become a Game Jolt Creator?
					</div>

					<div>
						Apply! We'll be selecting an initial cohort of creators to set them up for
						success in the next few months before opening the platform for everyone.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						Are Game Jolt Creators exclusive?
					</div>

					<div>
						No! We're the best place for you to collect recurring payments but it
						doesn't matter where your audience is. Let them know they can better support
						you financially on Game Jolt.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">
						How often do I need to post or livestream?
					</div>

					<div>
						As often as you'd like! The more frequent and active you are, the more
						💰💰💰 you'll earn.
					</div>
				</div>

				<div class="-col">
					<div class="-tiny-header-text -faqs-content-header">How do I get paid?</div>

					<div>Creators can withdraw directly into their PayPal accounts.</div>
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

.-tiny-header-text
	font-family: $font-family-display
	font-size: 27px

.-text-primary
	color: var(--theme-primary)

.-grid-center
	display: grid
	justify-content: center

.-page-header
	@extends .-bg-pink
	@extends .-grid-center
	padding: 97px 64px 0
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

.-bolt
	transform: rotate(0deg)
	animation-name: anim-bolt
	animation-duration: 2s
	animation-iteration-count: infinite
	animation-timing-function: linear

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
	align-items: center
	width: 100%
	text-align: center
	flex: 1 1 384px

	@media $media-md-up
		padding-bottom: 32px

	@media $media-mobile
		flex: none
		max-width: 450px
		align-self: center

.-header-lead-text
	margin-bottom: 40px

	@media $media-xs
		margin-bottom: 32px
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

.-how
	@extends .-bg-black
	padding: 107px 64px 115px
	display: flex

	@media $media-mobile
		padding: 96px 24px 80px
		text-align: center

.-how-content
	margin-left: auto
	margin-right: auto
	flex: auto
	display: flex
	justify-content: space-between
	width: 100%
	max-width: 1000px

	@media $media-mobile
		flex: none
		max-width: 450px

.-how-img
	min-width: 0

	@media $media-md-up
		flex: 1 1 486px

.-how-spacer
	@media $media-md-up
		flex: 1 4 126px

.-how-text
	align-self: center
	max-width: 100%

	@media $media-md-up
		flex: 1 1 384px

.-how-text-header
	margin-bottom: 32px

	@media $media-mobile
		margin-bottom: 24px

.-why
	@extends .-grid-center
	padding: 160px 64px
	text-align: center

	@media $media-sm
		padding: 160px 32px

	@media $media-xs
		padding: 160px 16px

.-why-content
	display: flex
	flex-direction: column
	gap: 32px
	align-items: center

	@media $media-mobile
		max-width: 450px

	@media $media-md-up
		max-width: 800px

	> *
		max-width: 383px

.-why-header
	max-width: unset

.-where
	@extends .-bg-black
	@extends .-grid-center
	padding: 132px 64px 165px

	@media $media-sm
		padding: 132px 32px 142px

	@media $media-xs
		padding: 104px 16px 122px

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

.-moomoo
	position: absolute
	top: 0
	left: 0
	transform: translate3d(-50%, -15%, 0) rotate(14.73deg)
	width: 147px
	opacity: 0.4
	display: grid
	z-index: -1

	> *
		transform: rotate(-14.73deg)
		display: inline-flex
		justify-content: center
		align-items: center

.-moomoo-m
	justify-self: flex-start
	margin-left: 0px

	&:nth-child(3)
		margin-left: 16px

.-moomoo-w
	margin-right: 8px
	justify-self: flex-end

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

.-bean
	width: 282px
	height: 214px

	@media $media-mobile
		width: 250px
		height: 189px

.-where-trail
	flex: 1 1 430px

	@media $media-mobile
		flex: none

.-where-inner-header
	margin-bottom: 24px

.-who
	padding: 132px 0 165px

	@media $media-sm
		padding-bottom: 132px

	@media $media-xs
		padding-bottom: 151px

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

.-who-scroller
	--who-width: 282px
	--who-height: 434px
	--who-displacement: 26px
	padding-bottom: 'calc(%s * 2)' % var(--who-displacement)

	@media $media-sm
		--who-width: 216px
		--who-height: 330px
		--who-displacement: 20px

	@media $media-xs
		--who-width: 183px
		--who-height: 311px
		--who-displacement: 8px

.-who-list
	display: flex
	gap: 24px

	@media $media-sm
		gap: 17px

	@media $media-xs
		gap: 16px

.-who-card-wrapper
	position: relative
	flex: none

	&:hover
		.-who-card-shadow
		.-who-card-border
			transition: none
			opacity: 1

	&:nth-child(odd)
		top: var(--who-displacement)

.-who-card-shadow
.-who-card-border
	rounded-corners-lg()
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	opacity: 0
	pointer-events: none
	transition: opacity 1s $strong-ease-out

.-who-card-shadow
	transform: translate(-6px, 8px)
	background-color: #FF3FAC

.-who-card-border
	border: $border-width-base solid var(--theme-primary)

.-who-card
	width: var(--who-width)
	height: var(--who-height)
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 1px 8px rgba(0, 0, 0, 0.09))

.-who-card-controls
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	padding: 16px
	display: flex
	flex-direction: column
	color: white

.-who-card-header
	display: flex

.-who-card-avatar
	width: 40px
	height: @width
	flex: none
	margin-right: 8px

.-who-card-names
	text-overflow()
	overlay-text-shadow()

.-who-card-displayname
	font-weight: bold

.-who-card-username
	font-size: $font-size-small

.-who-card-follow
	margin-top: auto
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))

.-apply
	@extends .-bg-pink
	@extends .-grid-center
	padding: 167px 64px
	position: relative
	overflow: hidden

	@media $media-sm
		padding: 246px 32px

	@media $media-xs
		padding: 286px 16px

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
	padding: 96px 64px 158px

	@media $media-mobile
		padding: 64px 16.5px 116px

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

@media $media-mobile
	.-col-mobile
		display: flex
		flex-direction: column

	.-col-mobile-reverse
		display: flex
		flex-direction: column-reverse
</style>
