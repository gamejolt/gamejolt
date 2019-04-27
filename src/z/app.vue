<template>
	<div>
		<app-theme />
		<app-cookie-banner />

		<div id="content">
			<app-error-page>
				<router-view />
			</app-error-page>
		</div>

		<app-loading-bar />
		<app-growls />
	</div>
</template>

<script lang="ts" src="./app"></script>
