<template>
	<div class="-blocked-comment alert">
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
		<app-button trans @click="unblock">
			<translate>Show</translate>
		</app-button>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-blocked-comment
	display: flex
	justify-content: space-between
	align-items: center
	padding-top: 10px
	padding-bottom: 10px

	button
		margin: 0

</style>

<script lang="ts" src="./block-overlay"></script>
