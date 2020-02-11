<template>
	<app-form name="communityBlockForm">
		<app-form-group name="username">
			<app-form-control
				type="text"
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/blocks/check-field-availability`,
						initVal: undefined,
					},
				}"
				:validate-on="['blur']"
			/>

			<app-form-control-errors :label="$gettext('username')">
				<app-form-control-error
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-button>
			<translate>Block</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./block"></script>
