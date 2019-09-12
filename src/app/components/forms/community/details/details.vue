<template>
	<app-form name="detailsForm">
		<app-form-group name="name" :label="$gettext(`Name`)">
			<app-form-control
				type="text"
				:rules="{
					max: 100,
				}"
				:disabled="!!formModel.game"
			/>
			<app-form-control-errors />
		</app-form-group>

		<!-- URL Path is never editable in this screen
			it is set once in the community form on creation -->
		<app-form-group name="path" :label="$gettext(`URL Path`)">
			<app-form-control-prefixed-input prefix="gamejolt.com/c/" disabled />
		</app-form-group>

		<app-form-button v-if="!formModel.game">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./details"></script>
