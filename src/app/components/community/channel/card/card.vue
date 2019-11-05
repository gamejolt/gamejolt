<template>
	<router-link class="-card" :class="{ '-card-active': isActive }" :to="linkTo" :title="title">
		<div class="-card-bg" v-if="hasBackgroundImage">
			<div
				class="-card-bg-img"
				:class="{ '-card-bg-img-active': isActive }"
				:style="{
					'background-image': `url('${backgroundItem.img_url}')`,
				}"
			></div>

			<div class="-card-bg-gradient"></div>
		</div>

		<div v-if="isActive" class="-card-active-indicator"></div>

		<div class="-card-content">
			<div
				class="-card-content-title"
				:class="{ '-card-content-title-overlay': hasBackgroundImage }"
			>
				{{ title }}
			</div>

			<div v-if="isUnread" class="-card-content-unread" v-app-tooltip="$gettext(`Unread`)"></div>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
