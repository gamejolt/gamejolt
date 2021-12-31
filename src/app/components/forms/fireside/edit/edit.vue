<script lang="ts" src="./edit"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="title">
			<app-form-control
				v-app-focus-when
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
