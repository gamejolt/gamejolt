<script lang="ts" src="./publish"></script>

<template>
	<app-form>
		<app-form-group
			v-if="showAdvancedCommunityOptions"
			name="auto_feature"
			:label="$gettext(`Automatically feature in community?`)"
		>
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will automatically feature this fireside in your selected community. This will
					notify every member in the community that the fireside has started.
				</translate>
			</p>
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Publish</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
