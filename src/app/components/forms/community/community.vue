<template>
	<app-form name="detailsForm">
		<app-form-group name="name" :label="$gettext(`Name`)">
			<app-form-control
				type="text"
				:rules="{
					max: 100,
				}"
				:disabled="method === 'edit' && formModel.game"
			/>
			<app-form-control-errors />
		</app-form-group>

		<!-- URL Path is only editable during community creation -->
		<app-form-group v-if="method === 'add'" name="path" :label="$gettext(`URL Path`)">
			<app-form-control-prefixed-input
				prefix="gamejolt.com/c/"
				:rules="{
					pattern: 'urlPath',
					max: 50,
					availability: {
						url: '/web/dash/communities/check-field-availability/path',
					},
				}"
				data-vv-delay="500"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Create</translate>
			<translate v-else>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./community"></script>
