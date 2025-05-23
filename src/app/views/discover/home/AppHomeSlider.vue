<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import AppAdTakeoverFloat from '../../../../_common/ad/AppAdTakeoverFloat.vue';
import AppAuthJoin from '../../../../_common/auth/join/AppAuthJoin.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleWhen } from '../../../../_styles/mixins';
import { arrayShuffle } from '../../../../utils/array';
import { useFullscreenHeight } from '../../../../utils/fullscreen';
import { imageGameJoltLogo } from '../../../img/images';
import AppHomeFsPost from './_home-slider/AppHomeFsPost.vue';
import AppHomeFsPostMeta from './_home-slider/AppHomeFsPostMeta.vue';

type Props = {
	posts: FiresidePostModel[];
};

const { posts } = defineProps<Props>();

const fullscreenHeight = useFullscreenHeight();

const shuffledPosts = ref<FiresidePostModel[]>([]);
const currentPostIndex = ref(0);
const firstPost = ref<FiresidePostModel | null>(null);
const secondPost = ref<FiresidePostModel | null>(null);
const nextPostLoaded = ref(false);

const shouldTransitionPosts = ref(false);
const transitioningPosts = ref(false);

// TODO: Turned off the ability to show login takeovers for now.
const shouldShowTakeover = false;

const bylinePost = computed(() => {
	if (!firstPost.value || !secondPost.value) {
		return null;
	}

	return transitioningPosts.value ? secondPost.value : firstPost.value;
});

watch(
	() => posts,
	() => {
		if (posts.length >= 2) {
			shuffledPosts.value = arrayShuffle([...posts]);
			_next();
		}
	},
	{ deep: true }
);

watch(
	() => shouldTransitionPosts.value && nextPostLoaded.value,
	(startTransition: boolean) => {
		if (startTransition) {
			transitioningPosts.value = true;
			setTimeout(_next, 2_000);
		}
	}
);

function _next() {
	firstPost.value = shuffledPosts.value[currentPostIndex.value];

	// Wrap around if needed.
	currentPostIndex.value =
		currentPostIndex.value === shuffledPosts.value.length - 1 ? 0 : currentPostIndex.value + 1;

	secondPost.value = shuffledPosts.value[currentPostIndex.value];
	nextPostLoaded.value = false;
	transitioningPosts.value = false;

	shouldTransitionPosts.value = false;
	setTimeout(() => (shouldTransitionPosts.value = true), 8_000);
}

function onPostLoaded(post: FiresidePostModel) {
	if (post === secondPost.value) {
		nextPostLoaded.value = true;
	}
}
</script>

<template>
	<div class="-fs theme-dark" :style="{ minHeight: fullscreenHeight }">
		<!-- <template v-if="shouldShowTakeover">
			<AppAdTakeoverBackground />

			<div
				:style="{
					position: `fixed`,
					bottom: `20px`,
					left: `20px`,
				}"
			>
				<AppAdTakeoverFloat>
					<AppAdGptTakeoverLazy is-login-page />
				</AppAdTakeoverFloat>
			</div>
		</template> -->

		<div
			class="container -container"
			:style="styleWhen(!shouldShowTakeover, { position: `relative`, zIndex: 2 })"
		>
			<AppThemeSvg
				v-if="Screen.isXs"
				class="-logo"
				:src="imageGameJoltLogo"
				width="328"
				height="36"
				alt=""
				strict-colors
			/>

			<AppAdTakeoverFloat>
				<div class="-hero-text -text-shadow">
					{{
						$gettext(
							`Join a growing community of creators and gamers from around the world!`
						)
					}}
				</div>
			</AppAdTakeoverFloat>

			<div class="-auth-content">
				<template v-if="Screen.isXs">
					<div class="-app-buttons">
						<AppMobileAppButtons justified source="home-hero" />
					</div>

					<div class="-links -text-shadow">
						<a :href="Environment.authBaseUrl + '/join'">
							{{ $gettext(`Sign up`) }}
						</a>
						{{ ' ' }}
						{{ $gettext(`or`) }}
						{{ ' ' }}
						<a :href="Environment.authBaseUrl + '/login'">
							{{ $gettext(`Log in`) }}
						</a>
					</div>
				</template>
				<template v-else>
					<AppAdTakeoverFloat>
						<div class="-desktop-island">
							<div class="-form">
								<AppAuthJoin overlay />
							</div>

							<div class="-trouble-text -text-shadow">
								{{ $gettext(`Already have an account`) }}
								{{ ' ' }}
								<a :href="Environment.authBaseUrl + '/login'">
									{{ $gettext(`Log in`) }}
								</a>
							</div>
						</div>

						<div class="-app-buttons">
							<AppMobileAppButtons justified source="home-hero" />
						</div>
					</AppAdTakeoverFloat>
				</template>
			</div>
		</div>

		<template v-if="!shouldShowTakeover">
			<div v-if="firstPost && secondPost" class="-posts">
				<AppHomeFsPost
					v-for="post of [firstPost, secondPost]"
					:key="post.id"
					class="-post"
					:class="{ '-transition': transitioningPosts }"
					:post="post"
					@loaded="onPostLoaded(post)"
				/>
			</div>

			<transition>
				<AppHomeFsPostMeta
					v-if="bylinePost"
					:key="bylinePost.id"
					class="-byline anim-fade-enter-up anim-fade-leave"
					:post="bylinePost"
				/>
			</transition>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-text-shadow
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3)

.-fs
	position: relative
	display: flex
	align-items: center
	justify-content: center
	color: var(--theme-fg)
	background-color: var(--theme-bg)

.-container
	display: flex
	flex-direction: column
	align-items: center
	margin-top: 24px
	// Take some bottom margin for the fs post meta info
	margin-bottom: 60px

.-auth-content
	width: 100%
	max-width: 350px

.-desktop-island
	rounded-corners-lg()
	padding: 20px
	background-color: var(--theme-bg)

.-logo
	margin-bottom: 24px

.-hero-text
	font-size: 36px
	line-height: 1.2
	font-family: $font-family-heading
	font-weight: 700
	text-align: center
	margin-bottom: 32px
	max-width: 600px

.-trouble-text
.-links
	text-align: center
	font-size: 12px

	> a
		font-weight: bold

.-form
.-desktop-island
.-app-buttons
.-get-app-button
	margin-bottom: 24px

@media $media-xs
	.-hero-text
		font-size: 23px
		line-height: 27px
		margin-bottom: 24px

.-posts
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden
	z-index: 1

.-post
	position: relative
	width: 100%
	height: 100%

	&.-transition
		transition: transform 1.5s
		transform: translateY(-100%)

.-byline
	position: absolute
	bottom: 0
	left: 0
	right: 0
	z-index: 1
</style>
