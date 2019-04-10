<template>
	<app-form name="setPasswordForm">
		<app-form-group name="password">
			<app-form-control
				type="password"
				:rules="{
					min: 4,
					max: 30,
				}"
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
