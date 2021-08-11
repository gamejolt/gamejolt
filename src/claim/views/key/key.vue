<script lang="ts" src="./key"></script>

<template>
	<div v-if="isRouteBootstrapped">
		<app-invalid-key v-if="invalidKey" />
		<section v-else class="container">
			<component
				:is="component"
				v-if="payload"
				:access-key="accessKey"
				:payload="payload"
				:login-url="loginUrl"
				@claim="claim"
			/>
		</section>
	</div>
</template>
