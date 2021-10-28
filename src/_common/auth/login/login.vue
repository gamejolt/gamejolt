<script lang="ts" src="./login"></script>

<template>
	<div class="auth-login">
		<app-auth-login-form
			:overlay="overlay"
			@submit="onLoggedIn"
			@needs-approved-login="onNeedsApprovedLogin"
		/>
	</div>
</template>
