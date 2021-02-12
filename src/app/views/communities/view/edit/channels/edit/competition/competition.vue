<script lang="ts" src="./competition"></script>

<template>
	<app-communities-view-page-container full>
		<app-nav-tab-list>
			<app-communities-edit-competition-nav />
		</app-nav-tab-list>

		<div class="row">
			<div class="col-md-8">
				<router-view />
			</div>
		</div>
	</app-communities-view-page-container>
</template>
