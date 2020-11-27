<script lang="ts" src="./card-base"></script>

<template>
	<app-theme
		class="community-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="community.theme"
	>
		<div class="-info">
			<div
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<div class="-thumbnail">
				<slot name="thumbnail" />
			</div>

			<div class="-well fill-bg">
				<div class="-name" :class="{ '-overflow': overflow }">
					<router-link :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
						<app-community-verified-tick :community="community" />
					</router-link>
				</div>

				<div class="-member-counts small">
					<router-link
						v-app-track-event="`community-card:community-members`"
						v-translate="{ count: number(memberCount) }"
						:translate-n="memberCount"
						translate-plural="<b>%{count}</b> members"
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<b>1</b>
						member
					</router-link>
				</div>

				<div class="-controls">
					<template v-if="community.hasPerms() && allowEdit">
						<app-button
							v-if="!isEditing"
							v-app-track-event="`community-card-inline:community-edit`"
							primary
							block
							:to="community.routeEditLocation"
						>
							<translate>Edit Community</translate>
						</app-button>
						<app-button v-else primary block :to="community.routeLocation">
							<translate>View Community</translate>
						</app-button>
					</template>
					<app-community-join-widget
						v-else
						:community="community"
						:disabled="!!community.user_block"
						block
						hide-count
						event-label="community-card"
					/>
					<app-button
						v-if="shouldShowModTools"
						class="-moderate"
						:href="Environment.baseUrl + `/moderate/communities/view/${community.id}`"
						icon="cog"
						circle
						trans
					/>
				</div>
			</div>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card-base.styl" scoped></style>
