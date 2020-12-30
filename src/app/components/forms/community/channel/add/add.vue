<script lang="ts" src="./add"></script>

<template>
	<app-form name="communityChannelAddForm">
		<app-form-community-channel-title :community="community" />

		<app-form-community-channel-permissions />

		<app-form-group name="type" :label="$gettext(`Channel content`)">
			<div v-for="type of types" :key="type.radioValue" class="radio">
				<label>
					<app-form-control-radio type="radio" :value="type.radioValue" />
					{{ type.text }}
					<span v-if="type.helpText" class="help-inline">- {{ type.helpText }}</span>
				</label>
			</div>
		</app-form-group>

		<app-form-button :disabled="!isValid">
			<translate>Add</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
