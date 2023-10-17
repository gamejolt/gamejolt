<script lang="ts" setup>
import { PropType, computed, ref, toRef, toRefs } from 'vue';
import { PostControlsLocation, trackPostLike } from '../../../../analytics/analytics.service';
import { vAppTrackEvent } from '../../../../analytics/track-event.directive';
import { vAppAuthRequired } from '../../../../auth/auth-required-directive';
import AppButton from '../../../../button/AppButton.vue';
import { formatFuzzynumber } from '../../../../filters/fuzzynumber';
import { showErrorGrowl } from '../../../../growls/growls.service';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import { showLikersModal } from '../../../../likers/modal.service';
import { Screen } from '../../../../screen/screen-service';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { $gettext } from '../../../../translate/translate.service';
import { FiresidePostModel } from '../../post-model';
import {
	$removeFiresidePostLike,
	$saveFiresidePostLike,
	FiresidePostLikeModel,
} from '../like-model';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	location: {
		type: String as PropType<PostControlsLocation>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	trans: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
});

const emit = defineEmits({
	change: (_value: boolean) => true,
});

const { post, location } = toRefs(props);
const showLikeAnim = ref(false);
const showDislikeAnim = ref(false);

const likeCount = computed(() => formatFuzzynumber(post.value.like_count));

const liked = toRef(() => !!post.value.user_like);

const tooltip = computed(() => (liked.value ? $gettext(`Liked!`) : $gettext(`Like This Post`)));

async function toggleLike() {
	const currentLike = post.value.user_like;

	if (!currentLike) {
		emit('change', true);

		const newLike = new FiresidePostLikeModel({
			fireside_post_id: post.value.id,
		});

		post.value.user_like = newLike;
		++post.value.like_count;
		showLikeAnim.value = true;
		showDislikeAnim.value = false;

		let failed = false;
		try {
			await $saveFiresidePostLike(newLike);
		} catch (e) {
			failed = true;
			post.value.user_like = null;
			--post.value.like_count;
			showErrorGrowl($gettext(`Can't do that now. Try again later?`));
		} finally {
			trackPostLike(true, { failed, location: location.value });
		}
	} else {
		emit('change', false);

		post.value.user_like = null;
		--post.value.like_count;
		showLikeAnim.value = false;
		showDislikeAnim.value = true;

		let failed = false;
		try {
			await $removeFiresidePostLike(currentLike);
		} catch (e) {
			failed = true;
			post.value.user_like = currentLike;
			++post.value.like_count;
			showErrorGrowl($gettext(`Can't do that now. Try again later?`));
		} finally {
			trackPostLike(false, { failed, location: location.value });
		}
	}
}

function showLikers() {
	showLikersModal({ count: post.value.like_count, resource: post.value });
}
</script>

<template>
	<span class="fireside-post-like-widget">
		<span class="-like">
			<AppButton
				v-app-tooltip="tooltip"
				v-app-track-event="`fireside-post-like-widget:click`"
				v-app-auth-required
				class="-like-button"
				:class="{
					'-overlay-text': !liked && overlay,
				}"
				icon="heart-filled"
				circle
				:trans="trans"
				:block="block"
				:primary="liked"
				:solid="liked"
				@click="toggleLike"
			/>

			<div v-if="showLikeAnim" class="-like-anim-container">
				<AppJolticon class="-like-anim" icon="heart-filled" notice />
			</div>
			<div v-if="showDislikeAnim" class="-like-anim-container">
				<span class="-dislike-anim-piece">
					<AppJolticon class="-dislike-anim -left" icon="heart-filled" notice />
				</span>
				<span class="-dislike-anim-piece">
					<AppJolticon class="-dislike-anim -right" icon="heart-filled" notice />
				</span>
			</div>
		</span>

		<a
			v-if="post.like_count > 0"
			v-app-tooltip="$gettext(`View all people that liked this post`)"
			class="blip"
			:class="{
				'blip-active': liked,
				mobile: Screen.isXs,
				'-overlay-text': overlay,
				'-highlight': liked,
			}"
			@click="showLikers()"
		>
			{{ likeCount }}
		</a>
		<span v-else class="blip-missing" />
	</span>
</template>

<style lang="stylus" scoped>
.fireside-post-like-widget
	display: inline-flex

	.-like
		position: relative

		&-button
			width: 36px
			height: 36px

	.-like-anim-container
		position: absolute
		top: 0
		width: 100%
		height: 100%
		display: flex
		justify-content: center
		align-items: center
		pointer-events: none

		.jolticon
			margin: 0

	.-like-anim
		animation-name: like-anim
		animation-duration: 1s
		animation-iteration-count: 1
		animation-fill-mode: forwards
		filter: drop-shadow(0 0 3px black)

	// For dislike, we have to do each piece separate so we can put the drop-shadow around the
	// individual piece after it's been clipped.
	.-dislike-anim-piece
		position: absolute
		filter: drop-shadow(0 0 3px black)

	.-dislike-anim
		animation-duration: 1s
		animation-iteration-count: 1
		animation-fill-mode: forwards

		&.-left
			animation-name: dislike-anim-left
			clip-path: polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)

		&.-right
			animation-name: dislike-anim-right
			clip-path: polygon(50% 0%, 50% 100%, 100% 100%, 100% 0%)

.-overlay-text
	color: white
	text-shadow: black 1px 1px 4px

.-highlight
	color: var(--theme-link)

@keyframes like-anim
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(6)
		opacity: 0

@keyframes dislike-anim-left
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(2) rotate(-45deg) translate(-6px, -6px)
		opacity: 0

@keyframes dislike-anim-right
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(2) rotate(45deg) translate(6px, -6px)
		opacity: 0
</style>
