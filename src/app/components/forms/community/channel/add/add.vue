<script lang="ts" src="./add"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="display_title" :label="$gettext(`Display Name`)" optional>
			<div class="help-block">
				<translate>
					This should be short and to the point. If you don't fill in a display name,
					we'll use your channel's URL path as its name.
				</translate>
			</div>

			<app-form-control
				:validators="[validateMinLength(3), validateMaxLength(30)]"
				:validate-on="['blur']"
				:placeholder="formModel.title"
				@changed="onChangedDisplayTitle"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`URL Path`)">
			<app-form-control
				type="text"
				:validators="[
					validateMinLength(3),
					validateMaxLength(30),
					validatePattern(/^[a-z0-9_]+$/i),
					validateAvailability({
						url: `/web/dash/communities/channels/check-field-availability/${community.id}`,
					}),
				]"
				data-vv-delay="500"
				:validate-on="['blur']"
				@changed="onChangedTitle"
			/>
			<app-form-control-errors>
				<app-form-control-error
					when="too_many_channels"
					:message="
						$gettext(
							'This community already has the maximum number of channels allowed.'
						)
					"
				/>

				<app-form-control-error
					when="availability"
					:message="
						$gettext('A channel in this community with that URL path already exists.')
					"
				/>

				<app-form-control-error
					when="pattern"
					:message="
						$gettext(
							'Channel names can only contain numbers, letters, and underscores (_).'
						)
					"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-community-channel-permissions />

		<app-form-group v-if="shouldShowType" name="type" :label="$gettext(`Channel Type`)">
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
