<script lang="ts" src="./form"></script>

<template>
	<app-form name="roomDetailsForm">
		<div class="-form">
			<app-form-group
				name="title"
				class="-form-input"
				:label="$gettext(`Title`)"
				hide-label
				optional
			>
				<app-form-control type="text" />
			</app-form-group>

			<app-form-button @click="onSubmit">
				<translate>Rename</translate>
			</app-form-button>
		</div>
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
