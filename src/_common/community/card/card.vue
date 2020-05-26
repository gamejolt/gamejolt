<template>
	<app-theme class="community-card sheet sheet-full sheet-no-full-bleed" :theme="community.theme">
		<div class="-info">
			<div
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<router-link :to="community.routeLocation" class="-thumbnail">
				<app-media-item-backdrop :media-item="community.thumbnail">
					<app-community-thumbnail-img :community="community" />
				</app-media-item-backdrop>
			</router-link>

			<div class="-well fill-bg">
				<div class="-name">
					<router-link :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
						<app-community-verified-tick :community="community" />
					</router-link>
				</div>

				<div class="-member-counts small">
					<router-link
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
						:translate-n="memberCount"
						v-translate="{ count: number(memberCount) }"
						translate-plural="<b>%{count}</b> members"
					>
						<b>1</b>
						member
					</router-link>
				</div>

				<div class="-join">
					<template v-if="community.hasPerms()">
						<app-button v-if="!isEditing" primary block :to="community.routeEditLocation">
							<translate>Edit Community</translate>
						</app-button>
						<app-button v-else primary block :to="community.routeLocation">
							<translate>View Community</translate>
						</app-button>
					</template>
					<app-community-join-widget
						v-else
						:community="community"
						block
						hide-count
						event-label="community-card"
					/>
				</div>
			</div>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
