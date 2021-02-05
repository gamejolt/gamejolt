<script lang="ts" src="./preset-item"></script>

<template>
	<app-card-list-item :id="elementId" :item="presetType">
		<div class="card-title">
			<h5>
				{{ label }}
			</h5>
		</div>

		<template #body>
			<form-community-channel-edit-preset
				:model="community"
				:preset-type="presetType"
				@save="emitEdit"
				@clear="emitEdit"
			/>
		</template>
	</app-card-list-item>
</template>
