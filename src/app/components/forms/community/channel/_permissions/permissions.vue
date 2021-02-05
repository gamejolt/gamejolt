<script lang="ts" src="./permissions"></script>

<template>
	<app-form-group name="permission_posting" :label="$gettext('Channel Posting Permissions')">
		<div class="help-inline">
			<translate>Choose who can post to this channel.</translate>
		</div>
		<div
			v-for="(permissionDisplay, permission) of permissionPostingOptions"
			:key="permission"
			class="radio"
		>
			<label>
				<app-form-control-radio :value="permission" />
				{{ permissionDisplay }}
			</label>
		</div>
		<app-form-control-errors />
	</app-form-group>
</template>
