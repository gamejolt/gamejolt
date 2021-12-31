<script lang="ts" src="./form"></script>

<template>
	<app-form :controller="form">
		<div class="-form">
			<app-form-group
				name="title"
				class="-form-input"
				:label="$gettext(`Title`)"
				hide-label
				optional
			>
				<app-form-control
					type="text"
					:validators="[
						validateMinLength(titleMinLength),
						validateMaxLength(titleMaxLength),
					]"
					:validate-on="['blur']"
					:placeholder="$gettext(`Empty group title`)"
				/>

				<app-form-control-errors />
			</app-form-group>

			<app-button solid primary :disabled="!valid" @click="onRename">
				<translate>Rename</translate>
			</app-button>
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
