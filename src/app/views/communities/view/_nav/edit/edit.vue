<template>
	<component
		:is="Screen.isLg ? 'nav' : 'app-nav-tab-list'"
		:class="Screen.isLg ? 'platform-list' : '-nav-inline'"
		v-bind="
			Screen.isLg
				? {}
				: {
						center: true,
				  }
		"
	>
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
					@click.native="isNavExpanded = false"
				>
					<span class="-label">
						<translate>Details</translate>
					</span>
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
					@click.native="isNavExpanded = false"
				>
					<span class="-label">
						<translate>Channels</translate>
					</span>
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
					@click.native="isNavExpanded = false"
				>
					<span class="-label">
						<translate>Games</translate>
					</span>
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
					@click.native="isNavExpanded = false"
				>
					<span class="-label">
						<translate>Moderators</translate>
					</span>
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
					@click.native="isNavExpanded = false"
				>
					<span class="-label">
						<translate>Blocked Users</translate>
					</span>
				</router-link>
			</app-community-perms>
		</ul>
	</component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-nav-inline
	margin-top: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-top: ($grid-gutter-width / 2)
</style>

<script lang="ts" src="./edit"></script>
