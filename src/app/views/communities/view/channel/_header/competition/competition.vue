<script lang="ts" src="./competition"></script>

<template>
	<app-communities-view-page-container full>
		<h1 class="section-header" :class="{ 'text-center': Screen.isXs, h2: Screen.isMobile }">
			{{ channel.displayTitle }}
		</h1>
		<br />

		<app-nav-tab-list>
			<ul>
				<li>
					<router-link
						v-app-no-autoscroll
						:to="{
							name: 'communities.view.channel.feed',
						}"
						:class="{ active: $route.name === 'communities.view.channel.feed' }"
					>
						<translate>Overview</translate>
					</router-link>
				</li>
				<li>
					<router-link
						v-app-no-autoscroll
						:to="{
							name: 'communities.view.channel.entries',
						}"
						active-class="active"
					>
						<translate>Games</translate>
						<span class="badge">
							{{ number(competition.entry_count) }}
						</span>
					</router-link>
				</li>
			</ul>
		</app-nav-tab-list>
	</app-communities-view-page-container>
</template>
