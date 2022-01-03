<script lang="ts" src="./edit"></script>

<template>
	<nav class="platform-list">
		<ul>
			<li @click.capture="onChangeSection('communities.view.edit.details')">
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
			<app-community-perms
				tag="li"
				:community="community"
				required="community-channels,community-competitions"
				either
				@click.capture="onChangeSection('communities.view.edit.channels.list')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.channels.list',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Channels</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms
				tag="li"
				:community="community"
				required="community-games"
				@click.capture="onChangeSection('communities.view.edit.games')"
			>
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
			<app-community-perms
				tag="li"
				:community="community"
				required="community-moderators"
				@click.capture="onChangeSection('communities.view.edit.moderators')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.moderators',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<translate>Collaborators</translate>
				</router-link>
			</app-community-perms>
			<app-community-perms
				tag="li"
				:community="community"
				required="community-blocks"
				@click.capture="onChangeSection('communities.view.edit.blocks')"
			>
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
					@click.capture="onChangeSection('communities.view.edit.blocks')"
				>
					<translate>Audit Log</translate>
				</router-link>
			</app-community-perms>
		</ul>
	</nav>
</template>

<style lang="stylus" scoped>
.platform-list
	margin-left: 12px
</style>
