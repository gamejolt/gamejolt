<template>
	<router-link
		class="community-channel-card sheet sheet-no-full-bleed sheet-full"
		:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
		:to="linkTo"
		:title="label"
	>
		<div class="-card-bg" v-if="backgroundItem">
			<app-media-item-backdrop :media-item="backgroundItem">
				<div
					class="-card-bg-img"
					:style="{
						'background-image': `url('${backgroundItem.mediaserver_url}')`,
					}"
				/>
				<div class="-overlay" />
			</app-media-item-backdrop>
		</div>

		<div class="-card-content">
			<div class="-card-content-title">
				<app-jolticon
					v-if="isLocked"
					icon="lock"
					v-app-tooltip.left="$gettext(`You do not have permissions to post to this channel.`)"
				/>
				{{ label }}
			</div>

			<div
				v-if="isUnread"
				class="-card-content-unread"
				v-app-tooltip="$gettext(`There are new posts since you last viewed this channel`)"
			></div>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
