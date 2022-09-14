<script lang="ts">
export const AppCreatorCardAspectRatio = 11 / 17;
</script>

<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppPostCardBase from '../fireside/post/card/AppPostCardBase.vue';
import { FiresidePost } from '../fireside/post/post-model';
import AppUserAvatarImg from '../user/user-avatar/AppUserAvatarImg.vue';

defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	fancyHover: {
		type: Boolean,
	},
	noVideo: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="creator-card">
		<div v-if="fancyHover" class="-card-shadow" />

		<AppPostCardBase
			class="-card-base"
			:post="post"
			no-elevate-hover
			full-gradient
			:video-context="noVideo ? undefined : 'gif'"
			:aspect-ratio="true ? AppCreatorCardAspectRatio : undefined"
		>
			<template #controls>
				<RouterLink class="-card-controls" :to="post.displayUser.routeLocation">
					<div class="-card-header">
						<AppUserAvatarImg class="-card-avatar" :user="post.displayUser" />

						<div class="-card-names">
							<div class="-card-displayname">
								{{ post.displayUser.display_name }}
							</div>
							<div class="-card-username">@{{ post.displayUser.username }}</div>
						</div>
					</div>
				</RouterLink>

				<div class="-card-border" />
			</template>
		</AppPostCardBase>
	</div>
</template>

<style lang="stylus" scoped>
.creator-card
	position: relative
	flex: none

	&:hover
		.-card-shadow
		.-card-border
			transition: none
			opacity: 1

.-card-shadow
.-card-border
	rounded-corners-lg()
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	opacity: 0
	pointer-events: none
	transition: opacity 1s $strong-ease-out

.-card-shadow
	transform: translate(-6px, 8px)
	background-color: #FF3FAC

.-card-border
	border: $border-width-base solid var(--theme-primary)

.-card-base
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 1px 8px rgba(0, 0, 0, 0.09))

.-card-controls
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	padding: 16px
	display: flex
	flex-direction: column
	color: white

.-card-header
	display: flex

.-card-avatar
	width: 40px
	height: @width
	flex: none
	margin-right: 8px

.-card-names
	overlay-text-shadow()

	&
	> *
		text-overflow()

.-card-displayname
	font-weight: bold

.-card-username
	font-size: $font-size-small

.-card-follow
	margin-top: auto
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))
</style>
