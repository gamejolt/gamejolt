<script lang="ts" src="./add"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="title" hide-label>
			<div class="help-block">
				<translate>Give your Fireside a snappy title to draw people in.</translate>
			</div>
			<app-form-control
				v-app-focus-when
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>LET'S GO</translate>
		</app-form-button>
		<app-form-button
			:solid="false"
			:primary="false"
			:disabled="!valid"
			trans
			@before-submit="onDraftSubmit()"
		>
			<translate>Start as Draft</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
