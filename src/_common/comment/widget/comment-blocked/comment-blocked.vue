<template>
	<div class="alert">
		<template v-if="reason === 'commenter-blocked'">
			<span v-translate="{ username: comment.user.username }">
				Hidden comment by blocked user <b>@%{ username }</b>.
			</span>
		</template>
		<template v-else-if="reason === 'mentioned-blocked-user'">
			<span>
				<translate>A blocked user is mentioned in this comment.</translate>
			</span>
		</template>
		<app-button trans @click="show">
			<translate>Show</translate>
		</app-button>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.alert
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: 0
	padding-top: 8px
	padding-bottom: 8px

	button
		margin: 0
</style>

<script lang="ts" src="./comment-blocked"></script>
