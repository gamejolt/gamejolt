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

		<app-form-group name="path" :label="$gettext(`URL Path`)">
			<app-form-control-prefixed-input
				prefix="gamejolt.com/c/"
				data-vv-delay="500"
				:rules="{
					pattern: 'urlPath',
					max: 50,
					availability: {
						url: '/web/dash/communities/check-field-availability/path',
						initVal: model ? model.path : undefined,
					},
				}"
				:disabled="!!formModel.game"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button v-if="!formModel.game">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./details"></script>
