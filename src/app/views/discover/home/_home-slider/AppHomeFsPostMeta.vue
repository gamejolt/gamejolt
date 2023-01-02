<script lang="ts" setup>
import { PropType } from 'vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppCommunityOverlayPill from './AppCommunityOverlayPill.vue';

defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});
</script>

<template>
	<div class="-meta">
		<div class="-avatar">
			<AppUserAvatarImg :user="post.user" />
		</div>
		<div class="-info">
			<div class="-username">@{{ post.user.username }}</div>
			<div class="-communities">
				<AppCommunityOverlayPill
					v-for="postCommunity of post.communities"
					:key="postCommunity.id"
					:community="postCommunity.community"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-meta
	position: absolute
	bottom: 0
	right: 0
	left: 0
	display: flex
	flex-direction: row
	align-items: center
	padding: 24px
	background: linear-gradient(180deg, rgba($black 0) 0%, $black 100%)
	z-index: 1

.-info
	display: flex
	flex-direction: column
	margin-left: 16px

.-avatar
	width: 64px
	height: 64px
	flex: none

.-username
	font-weight: bold

.-communities
	margin-top: 4px
	white-space: nowrap
	overflow: hidden

@media $media-xs
	.-meta
		padding: 8px 16px

	.-info
		flex-direction: row
		align-items: center
		margin-left: 8px

	.-avatar
		width: 32px
		height: 32px

	.-username
		text-overflow()
		font-size: 11px
		max-width: 100px

	.-communities
		margin-left: 16px
</style>
