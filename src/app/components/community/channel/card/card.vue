<template>
	<router-link
		:to="{
			name: 'communities.view.overview',
			params: {
				channel: channel.title,
			},
		}"
		class="-card-link"
	>
		<div class="-card" :class="{ '-active': isActive, '-card-dark': hasBackgroundImg }">
			<div class="-card-bg" v-if="hasBackgroundImg">
				<img class="-card-bg-img" :src="backgroundSrc" />
				<div class="-card-bg-gradient"></div>
			</div>
			<div class="-card-content">
				<div class="-card-title" :class="{ '-card-title-unread': isUnread }">
					<div v-if="isUnread" class="-unread-dot"></div>
					{{ channel.title }}
				</div>
				<div class="-card-description small">
					<template v-if="channel.description">
						{{ channel.description }}
					</template>
					<template v-else>
						<!-- <span v-translate="{ title: channel.title }">
							The place for '%{ title }' posts
						</span> -->
					</template>
				</div>
			</div>
			<div class="-hover-glare"></div>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
