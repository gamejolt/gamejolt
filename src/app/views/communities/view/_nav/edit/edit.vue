<template>
	<nav class="platform-list">
		<ul>
			<li>
				<router-link
					:to="{
						name: 'communities.view.edit.details',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
					exact
				>
					<translate>Details</translate>
				</router-link>
			</li>
			<app-community-perms tag="li" :community="community" required="community-channels">
				<router-link
					:to="{
						name: 'communities.view.edit.channels',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Channels</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms tag="li" :community="community" required="community-games">
				<router-link
					:to="{
						name: 'communities.view.edit.games',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Games</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms tag="li" :community="community" required="community-moderators">
				<router-link
					:to="{
						name: 'communities.view.edit.moderators',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Moderators</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms tag="li" :community="community" required="community-blocks">
				<router-link
					:to="{
						name: 'communities.view.edit.blocks',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Blocked Users</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms tag="li" :community="community" required="community-activity">
				<router-link
					:to="{
						name: 'communities.view.edit.activity',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Audit Log</translate>
				</router-link>
			</app-community-perms>
		</ul>
	</nav>
</template>

<script lang="ts" src="./edit"></script>

<style lang="stylus" scoped>
@import '~styles/variables'

.platform-list
	margin-left: 12px
</style>
