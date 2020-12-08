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
				<app-form-control
					type="text"
					:rules="{ min: titleMinLength, max: titleMaxLength }"
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
