<template>
	<div :id="id">
		<app-common-shell>
			<app-shell>
				<div id="content">
					<app-error-page>
						<router-view />
					</app-error-page>
				</div>
			</app-shell>
		</app-common-shell>
	</div>
</template>

<script lang="ts" src="./app"></script>
