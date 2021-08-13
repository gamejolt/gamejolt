<script lang="ts" src="./edit"></script>

<template>
	<app-form name="firesideEditForm">
		<app-form-group name="title">
			<app-form-control
				v-app-focus-when
				type="text"
				:rules="{
					min: 4,
					max: 100,
				}"
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
