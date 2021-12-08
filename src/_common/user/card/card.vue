<script lang="ts" src="./card"></script>

<template>
	<app-theme
		class="user-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="user.theme"
	>
		<div class="-user-info">
			<div
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<router-link :to="user.url" class="-avatar">
				<app-user-avatar-img :user="user" />
			</router-link>

			<div class="-well fill-bg">
				<div v-if="user.follows_you" class="-follows-you">
					<span class="tag">
						<translate>Follows You</translate>
					</span>
				</div>

				<div class="-display-name">
					<router-link :to="user.url" class="link-unstyled">
						{{ user.display_name }}
						<app-user-verified-tick :user="user" />
					</router-link>
				</div>

				<div class="-username">
					<router-link :to="user.url" class="link-unstyled">
						@{{ user.username }}
					</router-link>
				</div>

				<div class="-follow-counts small">
					<router-link
						v-translate="{ count: formatNumber(followingCount || 0) }"
						:to="{
							name: 'profile.following',
							params: { username: user.username },
						}"
						:translate-n="followingCount"
						translate-plural="<b>%{count}</b> following"
					>
						<b>1</b>
						following
					</router-link>
					<span class="dot-separator" />
					<router-link
						v-translate="{ count: formatNumber(followerCount) }"
						:to="{
							name: 'profile.followers',
							params: { username: user.username },
						}"
						:translate-n="followerCount"
						translate-plural="<b>%{count}</b> followers"
					>
						<b>1</b>
						follower
					</router-link>
				</div>

				<div v-if="app.user" class="-follow">
					<app-user-follow-widget
						v-if="user.id !== app.user.id"
						:user="user"
						location="card"
						block
						hide-count
					/>
					<app-button
						v-else
						:to="{
							name: 'profile.overview',
							params: { username: app.user.username },
						}"
						block
					>
						<translate>View Profile</translate>
					</app-button>
				</div>
			</div>
		</div>

		<div class="-stats -well">
			<app-loading v-if="isLoading" class="sans-margin" centered />
			<ul v-else class="stat-list">
				<li class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Posts</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(postCount) }}
						</div>
					</router-link>
				</li>
				<li v-if="gameCount" class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'library.collection.developer',
							params: { id: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Games</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(gameCount) }}
						</div>
					</router-link>
				</li>
				<li v-if="likeCount" class="stat-big stat-big-smaller">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<translate>Likes</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatFuzzynumber(likeCount) }}
						</div>
					</router-link>
				</li>
			</ul>
		</div>
	</app-theme>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
