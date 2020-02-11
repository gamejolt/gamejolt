<template>
	<div>
		<div class="page-help">
			<translate>
				When you block someone, that user won't be able to shout at you, comment on your posts or
				comments, and you won't get any notifications from them.
			</translate>
			<app-link-help page="user-blocks" class="link-help">
				<translate>More info.</translate>
			</app-link-help>
		</div>

		<template v-if="isLoading">
			<app-loading />
		</template>
		<template v-else>
			<app-card-list :is-adding="isBlocking">
				<app-card-list-add :label="$gettext('Block User')" @toggle="isBlocking = !isBlocking">
					<form-user-block @submit="onBlockSubmit" />
				</app-card-list-add>
			</app-card-list>
			<div v-if="totalCount === 0">
				<br />
				<div class="col-md-6 col-centered">
					<p class="lead text-center">
						<translate>You aren't blocking anyone.</translate>
					</p>
				</div>
			</div>
			<div v-else>
				<div class="-block-list">
					<div v-for="block of blocks" :key="block.id" class="-block-item">
						<app-user-avatar class="-block-item-avatar" :user="block.user" />

						<div class="-block-item-label">
							<div class="-block-item-name">
								{{ block.user.display_name }}
								<app-user-verified-tick :user="block.user" />
							</div>

							<div class="-block-item-username">@{{ block.user.username }}</div>

							<small>
								<translate>Blocked:</translate>
								<app-time-ago :date="block.blocked_on" />
							</small>
						</div>

						<app-button @click="onClickUnblock(block)">
							<translate>Unblock</translate>
						</app-button>
					</div>
				</div>

				<div class="page-cut" v-if="shouldShowLoadMore">
					<app-button trans @click="onClickLoadMore" v-app-track-event="`profile-edit-blocks:more`">
						<translate>Load More</translate>
					</app-button>
				</div>
				<app-loading v-else-if="isLoadingMore" centered />
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-height = 50px
$-avatar-height = 40px
$-v-padding = 15px
$-h-padding = 20px

.-block
	&-item
		border-bottom-style: solid
		border-bottom-color: var(--theme-bg-subtle)
		border-bottom-width: $border-width-small
		display: flex
		align-items: center
		padding: $-v-padding 0
		height: $-height + $-v-padding * 2
		overflow: hidden

		&:last-child
			border-bottom: 0

		&-avatar
			flex: none
			width: $-avatar-height
			margin-right: $-h-padding

		&-label
			flex: auto
			overflow: hidden

		&-name, &-username
			text-overflow()

		&-name
			font-weight: bold

		&-username
			theme-prop('color', 'fg-muted')
			font-size: $font-size-small

</style>

<script lang="ts" src="./blocks"></script>
