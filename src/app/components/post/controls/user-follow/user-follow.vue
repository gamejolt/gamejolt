<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserFollowButton from '../../../../../_common/user/follow/AppUserFollowButton.vue';

@Options({
	components: {
		AppUserFollowButton,
	},
})
export default class AppPostControlsUserFollow extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePostModel;

	@Prop({ type: Boolean, required: false, default: false })
	shouldShow!: boolean;

	readonly Screen = Screen;

	@Emit('close') emitClose() {}

	get user() {
		if (this.post.game && this.post.as_game_owner) {
			return this.post.game.developer;
		}

		return this.post.user;
	}
}
</script>

<template>
	<transition>
		<div v-if="shouldShow" class="-user-follow anim-fade-enter alert">
			<div class="-content">
				<p class="-flex-auto small">
					<AppTranslate>Would you also like to follow this user?</AppTranslate>
					<br />
					<AppTranslate>You will get notified when they post new stuff.</AppTranslate>
				</p>
				<AppUserFollowButton
					class="-flex-none"
					:sm="Screen.isXs"
					:user="user"
					location="postLike"
				/>
			</div>
			<div class="-cancel">
				<AppButton class="-cancel" circle trans icon="remove" @click="emitClose()" />
			</div>
		</div>
	</transition>
</template>

<style lang="stylus" scoped>
.-user-follow
	display: flex
	margin-top: $grid-gutter-width * 0.5
	margin-bottom: 0
	padding: 0

.-content
	display: flex
	flex-wrap: wrap
	align-items: center
	padding: 16px 0 16px 16px
	width: 100%

	> p
		margin: 4px 0

	> button
		margin: 4px 8px 4px 0

.-cancel
	margin: 20px 16px auto 8px

	button
		margin: 0

.-flex-auto
	flex: auto

.-flex-none
	flex: none
</style>
