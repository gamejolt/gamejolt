<script lang="ts" src="./base"></script>

<template>
	<div class="fireside-avatar" :class="{ '-placeholder': isPlaceholder }">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<app-media-item-backdrop
						class="-avatar-img"
						:class="{ '-dashed': borderStyle === 'dashed' }"
						:media-item="avatarMediaItem"
					>
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

.fireside-avatar
	&:not(.-placeholder)
		pressy()

.-subtle
	background-color: var(--theme-bg-subtle)
	border-color: var(--theme-bg-subtle)

.-dashed
	border-style: dashed
	border-color: var(--theme-fg-muted)

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
