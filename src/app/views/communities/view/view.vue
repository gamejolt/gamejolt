<template>
	<div v-if="community">
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

			<router-link :to="{ name: 'communities.view.overview' }" slot="spotlight">
				<app-community-thumbnail-img :community="community" :is-editing="isEditing" />
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

		<router-view :community="community" :unread-watermark="unreadWatermark" @refresh="refresh()" />
	</div>
</template>

<script lang="ts" src="./view"></script>
