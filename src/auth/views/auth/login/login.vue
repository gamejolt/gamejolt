<template>
	<div>
		<app-auth-login overlay :redirect-to="redirect" />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<router-link class="link-unstyled" :to="{ name: 'auth.join' }">
					<translate>or Sign Up</translate>
				</router-link>
			</div>
			<div class="auth-page-link">
				<router-link class="link-unstyled" :to="{ name: 'auth.forgot' }">
					<translate>Forgot Username or Password?</translate>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./login"></script>
