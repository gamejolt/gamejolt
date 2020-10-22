<script lang="ts" src="./list"></script>

<template>
	<div class="follower-list">
		<div v-if="!users.length" class="-list">
			<div v-for="i of placeholderCount" :key="i">
				<app-user-card-placeholder />
			</div>
		</div>
		<template v-else>
			<div class="-list">
				<div v-for="_user of users" :key="_user.id">
					<app-user-card :user="_user" elevate />
				</div>
			</div>

			<app-loading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<app-button v-app-track-event="`profile-followers:more`" trans @click="loadMore()">
					<translate>Load More</translate>
				</app-button>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-list
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
	grid-gap: 0px 16px
</style>
