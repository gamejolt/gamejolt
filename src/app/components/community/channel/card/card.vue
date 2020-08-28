<script lang="ts" src="./card"></script>

<template>
	<div class="community-channel-card-container">
		<router-link
			v-app-observe-dimensions="updateCardHeight"
			class="community-channel-card sheet sheet-no-full-bleed sheet-full"
			:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
			:to="linkTo"
			:title="label"
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
						v-if="isLocked"
						v-app-tooltip.left="
							$gettext(`You do not have permissions to post to this channel.`)
						"
						icon="lock"
					/>
					{{ label }}
				</div>

				<div
					v-if="isUnread"
					v-app-tooltip="
						$gettext(`There are new posts since you last viewed this channel`)
					"
					class="-card-content-unread"
				/>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
