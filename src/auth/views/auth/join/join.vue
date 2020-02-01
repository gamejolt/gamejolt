<template>
	<div>
		<app-auth-join overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<router-link class="link-unstyled" :to="{ name: 'auth.login' }">
					<translate>or Log In</translate>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./join"></script>
