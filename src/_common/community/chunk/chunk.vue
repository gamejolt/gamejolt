<script lang="ts" src="./chunk"></script>

<template>
	<div class="community-chunk">
		<div class="-header">
			<router-link class="-header-lead" :to="community.routeLocation">
				<div class="-thumbnail">
					<div class="-thumbnail-inner">
						<app-media-item-backdrop :media-item="community.thumbnail" radius="full">
							<app-community-thumbnail-img :community="community" />
						</app-media-item-backdrop>
					</div>

					<app-community-verified-tick
						class="-thumbnail-verified"
						:community="community"
						no-tooltip
					/>
				</div>

				<div class="-header-details">
					<div class="-header-name">
						{{ community.name }}
					</div>

					<div
						v-translate="{ count: number(community.member_count) }"
						class="-header-members"
						:translate-n="community.member_count"
						translate-plural="<b>%{count}</b> members"
					>
						<b>1</b>
						member
					</div>
				</div>
			</router-link>

			<div class="-header-button">
				<app-button :to="community.routeLocation" outline primary>
					<translate> View Community </translate>
				</app-button>
			</div>
		</div>

		<component
			:is="Screen.isXs ? 'app-scroll-scroller' : 'div'"
			:horizontal="Screen.isXs"
			:thin="Screen.isXs"
		>
			<div class="-content" :class="{ '-scrollable': Screen.isXs }">
				<template v-if="isLoadingPosts">
					<template v-for="(item, index) of preferredCardsPerRow">
						<div :key="item" class="-card">
							<app-post-card-placeholder />
						</div>

						<div
							:key="'spacer-' + index"
							:class="{
								'-spacer': index + 1 < preferredCardsPerRow,
								'-spacer-large': index + 1 === preferredCardsPerRow && Screen.isXs,
							}"
						/>
					</template>
				</template>
				<template v-else-if="items.length > 0">
					<template v-for="(item, index) of items">
						<div :key="item.id" class="-card">
							<app-post-card :post="item.action" with-user />
						</div>

						<div
							:key="'spacer-' + index"
							:class="{
								'-spacer': index + 1 < preferredCardsPerRow,
								'-spacer-large': index + 1 === preferredCardsPerRow && Screen.isXs,
							}"
						/>
					</template>

					<!-- Add empty flexible items if we haven't met our preferred items per row -->
					<template v-if="items.length < preferredCardsPerRow && !Screen.isXs">
						<template v-for="(item, index) of preferredCardsPerRow - items.length">
							<div :key="item" class="-card" />

							<div
								:key="'spacer-' + index"
								:class="{
									'-spacer': index + 1 < preferredCardsPerRow,
									'-spacer-large':
										index + 1 === preferredCardsPerRow && Screen.isXs,
								}"
							/>
						</template>
					</template>
				</template>
			</div>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
@import './chunk'
</style>
