<template>
	<router-link
		class="-card sheet sheet-no-full-bleed sheet-full"
		:class="{ '-active': isActive, 'theme-dark': backgroundItem }"
		:to="linkTo"
		:title="title"
	>
		<div class="-card-bg" v-if="backgroundItem">
			<div
				class="-card-bg-img"
				:style="{
					'background-image': `url('${backgroundItem.mediaserver_url}')`,
				}"
			/>
		</div>

		<div class="-card-content">
			<div class="-card-content-title">
				{{ title }}
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
