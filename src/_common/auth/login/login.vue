<script lang="ts" src="./login"></script>

<template>
	<div class="auth-login">
		<app-auth-login-form :overlay="overlay" @submit="onLoggedIn" />
	</div>
</template>
