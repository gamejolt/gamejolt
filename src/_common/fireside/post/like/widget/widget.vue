<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { PostControlsLocation, trackPostLike } from '../../../../analytics/analytics.service';
import { vAppAuthRequired } from '../../../../auth/auth-required-directive';
import { formatFuzzynumber } from '../../../../filters/fuzzynumber';
import { showErrorGrowl } from '../../../../growls/growls.service';
import { showLikersModal } from '../../../../likers/modal.service';
import { Screen } from '../../../../screen/screen-service';
import { useCommonStore } from '../../../../store/common-store';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { FiresidePost } from '../../post-model';
import { FiresidePostLike, removeFiresidePostLike, saveFiresidePostLike } from '../like-model';

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
	},
})
export default class AppFiresidePostLikeWidget extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: String, required: true })
	location!: PostControlsLocation;

	@Prop({ type: Boolean, default: false, required: false })
	overlay!: boolean;

	@Prop({ type: Boolean, default: false, required: false })
	trans!: boolean;

	@Prop({ type: Boolean, default: false, required: false })
	block!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	showLikeAnim = false;
	showDislikeAnim = false;
	readonly Screen = Screen;

	@Emit('change')
	emitChange(_value: boolean) {}

	get likeCount() {
		return formatFuzzynumber(this.post.like_count);
	}

	get liked() {
		return !!this.post.user_like;
	}

	get tooltip() {
		if (!this.post.user_like) {
			return this.$gettext('Like This Post');
		} else {
			return this.$gettext('Liked!');
		}
	}

	async toggleLike() {
		const currentLike = this.post.user_like;

		if (!currentLike) {
			this.emitChange(true);

			const newLike = new FiresidePostLike({
				fireside_post_id: this.post.id,
			});

			this.post.user_like = newLike;
			++this.post.like_count;
			this.showLikeAnim = true;
			this.showDislikeAnim = false;

			let failed = false;
			try {
				await saveFiresidePostLike(newLike);
			} catch (e) {
				failed = true;
				this.post.user_like = null;
				--this.post.like_count;
				showErrorGrowl(`Can't do that now. Try again later?`);
			} finally {
				trackPostLike(true, { failed, location: this.location });
			}
		} else {
			this.emitChange(false);

			this.post.user_like = null;
			--this.post.like_count;
			this.showLikeAnim = false;
			this.showDislikeAnim = true;

			let failed = false;
			try {
				await removeFiresidePostLike(currentLike);
			} catch (e) {
				failed = true;
				this.post.user_like = currentLike;
				++this.post.like_count;
				showErrorGrowl(`Can't do that now. Try again later?`);
			} finally {
				trackPostLike(false, { failed, location: this.location });
			}
		}
	}

	showLikers() {
		showLikersModal({ count: this.post.like_count, resource: this.post });
	}
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
