<template>
	<app-theme class="user-card sheet sheet-full sheet-no-full-bleed" :theme="user.theme">
		<app-tooltip-container>
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
						<router-link :to="user.url" class="link-unstyled">@{{ user.username }}</router-link>
					</div>

					<div class="-follow-counts small">
						<router-link
							:to="{
								name: 'profile.following',
								params: { username: user.username },
							}"
							:translate-n="followingCount"
							v-translate="{ count: number(followingCount || 0) }"
							translate-plural="<b>%{count}</b> following"
						>
							<b>1</b>
							following
						</router-link>
						<span class="dot-separator" />
						<router-link
							:to="{
								name: 'profile.followers',
								params: { username: user.username },
							}"
							:translate-n="followerCount"
							v-translate="{ count: number(followerCount) }"
							translate-plural="<b>%{count}</b> followers"
						>
							<b>1</b>
							follower
						</router-link>
					</div>

					<div class="-follow" v-if="app.user">
						<app-user-follow-widget
							v-if="user.id !== app.user.id"
							:user="user"
							block
							hide-count
							event-label="user-card"
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
				<ul class="stat-list" v-else>
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
								{{ postCount | number }}
							</div>
						</router-link>
					</li>
					<li class="stat-big stat-big-smaller" v-if="gameCount">
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
								{{ gameCount | number }}
							</div>
						</router-link>
					</li>
					<li class="stat-big stat-big-smaller" v-if="videoCount">
						<router-link
							class="link-unstyled"
							:to="{
								name: 'profile.videos',
								params: { username: user.username },
							}"
						>
							<div class="stat-big-label">
								<translate>Videos</translate>
							</div>
							<div class="stat-big-digit">
								{{ videoCount | number }}
							</div>
						</router-link>
					</li>
				</ul>
			</div>
		</app-tooltip-container>
	</app-theme>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
