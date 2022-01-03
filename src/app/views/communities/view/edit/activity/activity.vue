<script lang="ts" src="./activity"></script>

<template>
	<app-communities-view-page-container full>
		<h2 class="section-header">
			<translate>Audit Log</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					Chronological list of moderation activity in this community.
				</translate>
			</p>
		</div>

		<div>
			<div v-for="item of items" :key="item.item.id">
				<div v-if="item.timesplit" class="-date-split">
					<span class="-inner">{{ formatDate(item.item.added_on, 'mediumDate') }}</span>
				</div>

				<app-community-activity-item
					:item="item.item"
					:usersplit="item.usersplit"
					:show-icon="item.showIcon"
				/>
			</div>
		</div>

		<template v-if="isLoading">
			<app-loading centered />
		</template>
		<div v-else-if="!isAtEnd" class="page-cut -more">
			<app-button v-app-track-event="`community-edit-activity:more`" trans @click="loadMore">
				<translate>Load More</translate>
			</app-button>
		</div>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
.-date-split
	position: relative
	display: block
	margin-top: $line-height-computed * 0.5
	margin-bottom: $line-height-computed * 0.5
	width: 100%
	text-align: center
	cursor: default

	&::before
		border-bottom-color: var(--theme-bg-offset)
		content: ''
		position: absolute
		left: 0
		right: 0
		top: 50%
		margin-top: 0
		height: 0
		border-bottom-width: $border-width-large
		border-bottom-style: solid
		z-index: 0

	& > .-inner
		change-bg('bg-offset')
		color: var(--theme-fg-muted)
		position: relative
		padding-left: 8px
		padding-right: 8px
		font-weight: bold
		font-size: $font-size-small
		z-index: 1
		rounded-corners()

.-more
	margin-top: 12px
</style>
