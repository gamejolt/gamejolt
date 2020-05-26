<template>
	<nav>
		<h5 class="-heading">
			<translate>Edit Community</translate>
		</h5>

		<template v-if="Screen.isMobile">
			<div class="-item active" @click="isNavExpanded = !isNavExpanded">
				<span class="-menu-icon">
					<app-jolticon icon="menu" class="-jolticon middle" />
				</span>
				<span class="-label">
					{{ activeItem }}
				</span>
			</div>
		</template>

		<div
			v-if="!Screen.isMobile || isNavExpanded"
			:class="{
				'-mobile-nav-container fill-darker anim-fade-in-up': Screen.isMobile,
			}"
		>
			<ol>
				<app-community-perms
					:community="community"
					required="community-media,community-details"
					either
				>
					<li>
						<router-link
							class="-item"
							:to="{
								name: 'communities.view.edit.details',
								params: {
									id: community.id,
								},
							}"
							active-class="active"
							exact
							block
							@click.native="isNavExpanded = false"
						>
							<span class="-label">
								<translate>Details</translate>
							</span>
						</router-link>
					</li>
				</app-community-perms>
				<app-community-perms :community="community" required="community-channels">
					<li>
						<router-link
							class="-item"
							:to="{
								name: 'communities.view.edit.channels',
								params: {
									id: community.id,
								},
							}"
							active-class="active"
							block
							@click.native="isNavExpanded = false"
						>
							<span class="-label">
								<translate>Channels</translate>
							</span>
						</router-link>
					</li>
				</app-community-perms>
				<app-community-perms :community="community" required="community-games">
					<li>
						<router-link
							class="-item"
							:to="{
								name: 'communities.view.edit.games',
								params: {
									id: community.id,
								},
							}"
							active-class="active"
							block
							@click.native="isNavExpanded = false"
						>
							<span class="-label">
								<translate>Games</translate>
							</span>
						</router-link>
					</li>
				</app-community-perms>
				<app-community-perms :community="community" required="community-moderators">
					<li>
						<router-link
							class="-item"
							:to="{
								name: 'communities.view.edit.moderators',
								params: {
									id: community.id,
								},
							}"
							active-class="active"
							block
							@click.native="isNavExpanded = false"
						>
							<span class="-label">
								<translate>Moderators</translate>
							</span>
						</router-link>
					</li>
				</app-community-perms>
				<app-community-perms :community="community" required="community-blocks">
					<li>
						<router-link
							class="-item"
							:to="{
								name: 'communities.view.edit.blocks',
								params: {
									id: community.id,
								},
							}"
							active-class="active"
							block
							@click.native="isNavExpanded = false"
						>
							<span class="-label">
								<translate>Blocked Users</translate>
							</span>
						</router-link>
					</li>
				</app-community-perms>
			</ol>
		</div>
	</nav>
</template>

<style lang="stylus" src="./nav-edit.styl" scoped></style>

<script lang="ts" src="./nav-edit"></script>
