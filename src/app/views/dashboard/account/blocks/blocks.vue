<script lang="ts" src="./blocks"></script>

<template>
	<div class="row">
		<div class="col-md-3 col-md-push-9 col-lg-4 col-lg-push-8">
			<div class="page-help">
				<translate>
					When you block someone, that user won't be able to follow you, send you a friend
					request, or reply to your posts and comments.
				</translate>
				<app-link-help page="blocking-users" class="link-help">
					<translate>Learn more about what happens when you block a user</translate>
				</app-link-help>
			</div>
		</div>
		<div class="col-md-9 col-md-pull-3 col-lg-8 col-lg-pull-4">
			<template v-if="!isRouteBootstrapped || isRouteLoading">
				<app-loading centered />
			</template>
			<template v-else>
				<template v-if="totalCount === 0">
					<p class="lead text-center">
						<translate>You aren't blocking anyone.</translate>
					</p>
					<br />
				</template>

				<app-card-list :is-adding="isBlocking">
					<app-card-list-add
						:label="$gettext('Block User')"
						@toggle="isBlocking = !isBlocking"
					>
						<form-user-block @submit="onBlockSubmit" />
					</app-card-list-add>
				</app-card-list>

				<template v-if="totalCount !== 0">
					<div v-for="block of blocks" :key="block.id" class="-item">
						<app-user-avatar class="-item-avatar" :user="block.user" />

						<div class="-item-label">
							<div class="-item-name">
								{{ block.user.display_name }}
								<app-user-verified-tick :user="block.user" />
							</div>

							<div class="-item-username">@{{ block.user.username }}</div>

							<small>
								<translate>Blocked:</translate>
								<app-time-ago :date="block.blocked_on" />
							</small>
						</div>

						<app-button class="-item-controls" @click="onClickUnblock(block)">
							<translate>Unblock</translate>
						</app-button>
					</div>

					<div v-if="shouldShowLoadMore" class="page-cut">
						<app-button
							v-app-track-event="`profile-edit-blocks:more`"
							trans
							@click="loadMore()"
						>
							<translate>Load More</translate>
						</app-button>
					</div>
					<app-loading v-else-if="isLoadingMore" centered />
				</template>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-height = 50px
$-avatar-height = 40px
$-v-padding = 16px
$-h-padding = 20px

.-item
	display: flex
	align-items: center
	padding: $-v-padding 0
	overflow: hidden
	border-bottom: $border-width-small solid var(--theme-bg-subtle)

	&:last-child
		border-bottom: 0

	&-avatar
		flex: none
		width: $-avatar-height
		margin-right: $-h-padding

	&-controls
		flex: none
		margin-left: $-h-padding

	&-label
		flex: auto
		overflow: hidden

	&-name
	&-username
		text-overflow()

	&-name
		font-weight: bold

	&-username
		color: var(--theme-fg-muted)
		font-size: $font-size-small
</style>
