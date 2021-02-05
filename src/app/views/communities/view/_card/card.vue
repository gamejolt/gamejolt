<script lang="ts" src="./card"></script>

<template>
	<app-community-card-base :community="community" overflow>
		<template #thumbnail>
			<app-editable-thumbnail />
		</template>
	</app-community-card-base>
</template>
