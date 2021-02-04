<script lang="ts" src="./add"></script>

<template>
	<app-form ref="form" name="communityChannelAddForm">
		<app-form-group name="display_title" optional>
			<app-form-control
				:rules="{ min: 3, max: 30 }"
				:validate-on="['blur']"
				:placeholder="formModel.title"
				@changed="onChangedDisplayTitle"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`URL`)">
			<app-form-control
				type="text"
				:rules="{
					pattern: /^[a-z0-9_]+$/i,
					min: 3,
					max: 30,
					availability: {
						url: `/web/dash/communities/channels/check-field-availability/${community.id}`,
					},
				}"
				data-vv-delay="500"
				:validate-on="['blur']"
				:placeholder="
					isTitleInitial ? $gettext(`Type a display title to auto-generate`) : ''
				"
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
					:message="$gettext('A channel with that name already exists.')"
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

		<app-form-group name="type" :label="$gettext(`Channel content`)">
			<div v-for="type of types" :key="type.radioValue" class="radio">
				<label>
					<app-form-control-radio type="radio" :value="type.radioValue" />
					{{ type.text }}
					<span v-if="type.helpText" class="help-inline">- {{ type.helpText }}</span>
				</label>
			</div>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Add</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
