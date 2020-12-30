<script lang="ts" src="./title"></script>

<template>
	<app-form-group name="title" :label="$gettext(`URL`)" :hide-label="hideLabel">
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
					$gettext(
						'Channel names can only contain numbers, letters, and underscores (_).'
					)
				"
			/>
		</app-form-control-errors>
	</app-form-group>
</template>
