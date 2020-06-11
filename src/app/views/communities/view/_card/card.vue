<template>
	<app-community-card-base :community="community" :overflow="overflow">
		<template #thumbnail>
			<app-editable-thumbnail />
		</template>
	</app-community-card-base>
</template>

<script lang="ts" src="./card"></script>
