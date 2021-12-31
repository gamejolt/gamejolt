<script lang="ts" src="./change-url"></script>

<template>
	<app-form :controller="form">
		<div>
			<app-form-community-channel-title :community="community" hide-label />
		</div>

		<app-form-button :disabled="!isValid">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	align-items: flex-start

	&-input
		flex: auto

	button
		margin-left: 5px
</style>
