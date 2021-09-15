<script lang="ts" src="./publish"></script>

<template>
	<app-form>
		<app-form-group
			name="auto_feature"
			:label="$gettext(`Automatically feature in community?`)"
		>
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will automatically feature this fireside in the selected community when it gets
					published.
				</translate>
			</p>
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Publish</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
