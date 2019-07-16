<template>
	<div v-if="community">
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p v-translate>
					<b>You've been invited you to collaborate on this community.</b>
				</p>
				<app-button primary @click="acceptCollaboration()">
					<translate>Accept</translate>
				</app-button>
				<app-button trans @click="declineCollaboration()">
					<translate>Decline</translate>
				</app-button>
			</div>
		</section>

		<!-- Blur the header to signify they can't edit it -->
		<app-page-header
			:cover-media-item="community.header"
			should-affix-nav
			:blur-header="isEditing && !!community.game"
		>
			<span class="tag">
				<template v-if="community.game">
					<translate>Game Community</translate>
				</template>
				<template v-else>
					<translate>Community</translate>
				</template>
			</span>
			<h1>
				<router-link :to="{ name: 'communities.view.overview' }">
					{{ community.name }}
				</router-link>
			</h1>

			<app-editable-overlay
				v-if="isEditing && canEditMedia"
				slot="spotlight"
				class="-fill"
				@click="showEditAvatar()"
			>
				<translate slot="overlay">Change</translate>
				<app-community-thumbnail-img :community="community" />
			</app-editable-overlay>
			<router-link v-else :to="{ name: 'communities.view.overview' }" slot="spotlight">
				<app-community-thumbnail-img :community="community" />
			</router-link>

			<nav slot="nav" class="platform-list inline">
				<ul>
					<li>
						<router-link
							:to="{ name: 'communities.view.overview' }"
							:class="{ active: $route.name === 'communities.view.overview' }"
						>
							<translate>Overview</translate>
						</router-link>
					</li>
					<li v-if="community.game">
						<router-link :to="community.game.getUrl()">
							<translate>Game</translate>
						</router-link>
					</li>
					<li>
						<router-link :to="{ name: 'communities.view.members' }" active-class="active">
							<translate>Members</translate>
							<span class="badge" v-if="community.member_count">
								{{ community.member_count | number }}
							</span>
						</router-link>
					</li>
				</ul>
			</nav>

			<div slot="controls">
				<app-community-join-widget :community="community" @join="onJoin" @leave="onLeave" block />
			</div>
		</app-page-header>

		<router-view
			:community="community"
			:unread-watermark="unreadWatermark"
			:is-editing="isEditing"
			@refresh="refresh()"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

</style>

<script lang="ts" src="./view"></script>
