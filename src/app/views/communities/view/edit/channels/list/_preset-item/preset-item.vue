<script lang="ts" src="./preset-item"></script>

<template>
	<app-card-list-item :id="elementId" :item="{ presetType }">
		<div class="card-title">
			<h5>
				{{ label }}
			</h5>
		</div>

		<template #body>
			<app-community-channel-card-edit
				:background="background"
				@click="onClickEditBackground"
			/>
		</template>
	</app-card-list-item>
</template>
