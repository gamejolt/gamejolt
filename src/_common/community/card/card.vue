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
				<app-community-thumbnail-img :community="community" />
			</router-link>

			<div class="-well fill-bg">
				<div class="-name">
					<router-link :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
						<app-community-verified-tick :community="community" />
					</router-link>
				</div>

				<div class="-path">
					<router-link :to="community.routeLocation" class="link-unstyled"
						>c/{{ community.path }}</router-link
					>
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
			</div>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
