<script lang="ts" src="./edit"></script>

<template>
	<app-form ref="form" name="communityChannelFormEdit">
		<app-form-group name="display_title" :label="$gettext(`Display Name`)" optional>
			<div class="help-block">
				<translate>
					This should be short and to the point. If you don't fill in a display name,
					we'll use your channel's URL path as its name.
				</translate>
			</div>

			<app-form-control
				:rules="{ min: 3, max: 30 }"
				:validate-on="['blur']"
				:placeholder="formModel.title"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`URL Path`)">
			<app-form-control
				type="text"
				:rules="{
					pattern: /^[a-z0-9_]+$/i,
					min: 3,
					max: 30,
					availability: {
						url: titleAvailabilityUrl,
					},
				}"
				data-vv-delay="500"
			/>
			<app-form-control-errors>
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
							'Channel URL paths can only contain numbers, letters, and underscores (_).'
						)
					"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-community-channel-card-edit
			:background="formModel.background"
			@click="onClickEditBackground"
		/>

		<br />

		<app-form-community-channel-permissions v-if="shouldShowPermissions" />

		<app-form-button show-when-valid>
			<translate>Save Channel</translate>
		</app-form-button>
	</app-form>
</template>
