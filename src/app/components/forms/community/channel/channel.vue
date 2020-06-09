<template>
	<app-form name="communityChannelForm">
		<div class="-form">
			<app-form-group name="title" :label="$gettext(`Title`)" hide-label optional>
				<app-form-control
					type="text"
					:rules="{
						pattern: /^[a-z0-9_]$/i,
						min: 3,
						max: 30,
						availability: {
							url: `/web/dash/communities/channels/check-field-availability/${community.id}`,
						},
					}"
					data-vv-delay="500"
					:validate-on="['blur']"
				/>
				<app-form-control-errors>
					<app-form-control-error
						when="too_many_channels"
						:message="
							$gettext('This community already has the maximum number of channels allowed.')
						"
					/>

					<app-form-control-error
						when="availability"
						:message="$gettext('A channel with that name already exists.')"
					/>

					<app-form-control-error
						when="pattern"
						:message="
							$gettext('Channel names can only contain numbers, letters, and underscores (_).')
						"
					/>
				</app-form-control-errors>
			</app-form-group>

			<app-form-button :disabled="!isValid">
				<translate>Add</translate>
			</app-form-button>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	align-items: flex-start

	button
		margin-left: 5px
</style>

<script lang="ts" src="./channel"></script>
