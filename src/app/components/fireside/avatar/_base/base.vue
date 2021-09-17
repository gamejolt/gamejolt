<script lang="ts" src="./base"></script>

<template>
	<div class="fireside-avatar" :class="{ '-placeholder': isPlaceholder }">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<div v-if="isLive" class="-avatar-anim" />

					<app-media-item-backdrop class="-avatar-img" :media-item="avatarMediaItem">
						<slot v-if="!isPlaceholder" name="avatar" />
					</app-media-item-backdrop>

					<slot v-if="!isPlaceholder" name="extras" />
				</div>
			</div>

			<div v-if="community" class="-community">
				<app-community-thumbnail-img
					v-if="!isPlaceholder"
					class="-community-img"
					:community="community"
				/>
			</div>

			<div v-if="hasTag" class="-tag" :class="{ '-live': isLive }">
				<slot v-if="!isPlaceholder" name="tag" />
				<translate v-else>CHAT</translate>
			</div>
		</div>

		<div v-if="hasTitle" class="-title">
			<slot v-if="!isPlaceholder" name="title" />
		</div>

		<div v-if="hasLink" class="-link">
			<slot v-if="!isPlaceholder" name="link" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-subtle
	background-color: var(--theme-bg-subtle)
	border-color: var(--theme-bg-subtle)

.-link
	> *
		@extend .-link

.-placeholder
	.-tag
		elevate-0()

		> *
			visibility: hidden

	.-title
		lazy-placeholder-block()
		width: 60%

	.-avatar-img
	.-community
	.-tag
		@extend .-subtle
</style>
