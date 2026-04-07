<script lang="ts" setup>
import { computed } from 'vue';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserFollowButton from '../../../../../_common/user/follow/AppUserFollowButton.vue';

type Props = {
	post: FiresidePostModel;
	shouldShow?: boolean;
};

const { post, shouldShow = false } = defineProps<Props>();

const emit = defineEmits<{
	close: [];
}>();

const user = computed(() => {
	if (post.game && post.as_game_owner) {
		return post.game.developer;
	}

	return post.user;
});
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
				<AppButton class="-cancel" circle trans icon="remove" @click="emit('close')" />
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
