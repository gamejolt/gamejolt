<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { vAppTrackEvent } from '../../analytics/track-event.directive';
import { useCommonStore } from '../../store/common-store';
import AppUserCardHover from '../card/AppUserCardHover.vue';
import AppUserFollowButton from '../follow/AppUserFollowButton.vue';
import AppUserAvatarBubble from '../user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../user.model';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	eventLabel: {
		type: String,
		default: 'global',
	},
	userHoverCard: {
		type: Boolean,
	},
});

const emit = defineEmits({
	follow: () => true,
	unfollow: () => true,
});

const { user: sessionUser } = useCommonStore();
</script>

<template>
	<RouterLink
		v-app-track-event="`user-list:click:${eventLabel}`"
		class="user-list-item"
		:to="{
			name: 'profile.overview',
			params: {
				username: user.username,
			},
		}"
	>
		<component :is="userHoverCard ? AppUserCardHover : 'div'" :user="user" class="-avatar">
			<AppUserAvatarBubble :user="user" show-frame show-verified smoosh />
		</component>

		<div class="-label">
			<div class="-name">{{ user.display_name }}</div>
			<div class="-username">@{{ user.username }}</div>
		</div>

		<div v-if="sessionUser && user.id !== sessionUser.id" class="-button">
			<!--
			Gotta prevent default so that the RouterLink doesn't go to the user
			page. The stop is so that we don't double track events.
			-->
			<AppUserFollowButton
				:user="user"
				hide-count
				location="userList"
				@click.capture.prevent
				@click.stop
				@follow="emit('follow')"
				@unfollow="emit('unfollow')"
			/>
		</div>
	</RouterLink>
</template>

<style lang="stylus" scoped>
$-v-padding = 15px
$-h-padding = 20px
$-height = 40px

.user-list-item
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid

	&:last-child
		border-bottom: 0

.-avatar
	flex: none
	width: $-height
	margin-right: $-h-padding

.-label
	flex: auto
	overflow: hidden

.-name
.-username
	text-overflow()

.-name
	font-weight: bold

.-username
	theme-prop('color', 'fg-muted')
	font-size: $font-size-small

.-button
	flex: none
	margin-left: $-h-padding
</style>
