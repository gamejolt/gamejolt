<template>
	<app-common-shell>
		<div id="shell">
			<div id="content">
				<app-error-page>
					<app-site-editor />
					<router-view />
				</app-error-page>
			</div>
		</div>
	</app-common-shell>
</template>

<script lang="ts" src="./app"></script>
