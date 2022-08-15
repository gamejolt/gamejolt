<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { arrayShuffle } from '../../../../utils/array';
import { useFullscreenHeight } from '../../../../utils/fullscreen';
import { Environment } from '../../../../_common/environment/environment.service';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { imageGameJoltLogo } from '../../../img/images';
import AppHomeFsPost from './_home-slider/AppHomeFsPost.vue';
import AppHomeFsPostMeta from './_home-slider/AppHomeFsPostMeta.vue';

const props = defineProps({
	posts: {
		type: Array as PropType<FiresidePost[]>,
		required: true,
	},
});

const { posts } = toRefs(props);
const fullscreenHeight = useFullscreenHeight();

const shuffledPosts = ref<FiresidePost[]>([]);
const currentPostIndex = ref(0);
const firstPost = ref<FiresidePost | null>(null);
const secondPost = ref<FiresidePost | null>(null);
const nextPostLoaded = ref(false);

const shouldTransitionPosts = ref(false);
const transitioningPosts = ref(false);

const bylinePost = computed(() => {
	if (!firstPost.value || !secondPost.value) {
		return null;
	}

	return transitioningPosts.value ? secondPost.value : firstPost.value;
});

watch(
	() => posts.value,
	() => {
		if (posts.value.length >= 2) {
			shuffledPosts.value = arrayShuffle([...posts.value]);
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

function onPostLoaded(post: FiresidePost) {
	if (post === secondPost.value) {
		nextPostLoaded.value = true;
	}
}
</script>

<template>
	<div class="-fs theme-dark" :style="{ minHeight: fullscreenHeight }">
		<div class="container -content">
			<AppThemeSvg
				v-if="Screen.isXs"
				class="-logo"
				:src="imageGameJoltLogo"
				width="328"
				height="36"
				alt=""
				strict-colors
			/>

			<div class="-hero-text -text-shadow">
				Discover gaming communities filled with millions of videos, art and discussions
			</div>

			<div class="-auth-island">
				<template v-if="Screen.isXs">
					<div class="-app-buttons">
						<AppMobileAppButtons justified source="home-hero" />
					</div>

					<div class="-links -text-shadow">
						<a :href="Environment.authBaseUrl + '/join'">
							<AppTranslate>Sign up</AppTranslate>
						</a>
						{{ ' ' }}
						<AppTranslate>or</AppTranslate>
						{{ ' ' }}
						<a :href="Environment.authBaseUrl + '/login'">
							<AppTranslate>Log in</AppTranslate>
						</a>
					</div>
				</template>
				<template v-else>
					<div class="-form">
						<AppAuthJoinLazy overlay />
					</div>

					<div class="-trouble-text -text-shadow">
						<AppTranslate>Already have an account?</AppTranslate>
						{{ ' ' }}
						<a :href="Environment.authBaseUrl + '/login'">
							<AppTranslate>Log in!</AppTranslate>
						</a>
					</div>

					<div class="-app-buttons">
						<AppMobileAppButtons justified source="home-hero" />
					</div>
				</template>
			</div>
		</div>

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

.-content
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	margin-top: 24px
	// Take some bottom margin for the fs post meta info
	margin-bottom: 60px
	z-index: 2

.-auth-island
	width: 100%
	max-width: 350px

.-logo
	margin-bottom: 24px

.-hero-text
	font-size: 36px
	line-height: 36px
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
.-trouble-text
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
