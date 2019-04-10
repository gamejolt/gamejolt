<template>
	<div>
		<app-theme />

		<div id="shell">
			<div id="content">
				<app-error-page>
					<app-site-editor />
					<router-view />
				</app-error-page>
			</div>

			<app-loading-bar />
			<app-growls />
		</div>
	</div>
</template>

<script lang="ts" src="./app"></script>
