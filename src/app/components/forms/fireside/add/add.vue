<script lang="ts" src="./add"></script>

<template>
	<app-form name="firesideAddForm">
		<app-form-group name="title" hide-label>
			<div class="help-block">
				<translate>Give your Fireside a snappy title to draw people in.</translate>
			</div>
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

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>Create</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
