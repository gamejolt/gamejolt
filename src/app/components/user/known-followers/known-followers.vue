<template>
	<div v-if="users.length" class="-known-followers">
		<div class="-known-followers-list">
			<app-user-avatar-list :users="users" sm inline />
		</div>
		<div class="-known-followers-text-container">
			<span class="-known-followers-text text-muted">
				{{ text }}
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-known-followers
	display: flex
	margin-bottom: $line-height-computed

.-known-followers-text-container
	margin-top: 5px

.-known-followers-list
	flex-shrink: 0
	margin-right: 20px

.-known-followers-text
	@media $media-xs
		font-size: $font-size-small

</style>

<script lang="ts" src="./known-followers"></script>
