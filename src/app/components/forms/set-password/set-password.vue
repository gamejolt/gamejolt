<template>
	<app-form :controller="form">
		<app-form-group name="password">
			<app-form-control
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate>Set Account Password</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./set-password"></script>
