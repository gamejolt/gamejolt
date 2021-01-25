<script lang="ts" src="./card"></script>

<template>
	<div class="community-channel-card-container">
		<router-link
			v-app-observe-dimensions="updateCardHeight"
			class="community-channel-card sheet sheet-no-full-bleed sheet-full"
			:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
			:to="linkTo"
			:style="{ height }"
		>
			<div v-if="backgroundItem" class="-card-bg">
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
						v-if="isArchived"
						v-app-tooltip.top="$gettext(`Archived Channel`)"
						icon="lock"
					/>
					<app-jolticon
						v-else-if="isLocked"
						v-app-tooltip.top="
							$gettext(`You do not have permissions to post to this channel`)
						"
						icon="lock"
					/>
					<app-jolticon
						v-if="isUnpublished"
						v-app-tooltip.top="$gettext(`Channel is not publicly visible`)"
						icon="subscribed"
					/>
					<span :title="label">{{ label }}</span>
				</div>

				<div
					v-if="isUnread"
					v-app-tooltip="
						$gettext(`There are new posts since you last viewed this channel`)
					"
					class="-card-content-unread"
				/>
			</div>

			<div v-if="isUnpublished || isArchived" class="-card-unpublished" />
		</router-link>
	</div>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
