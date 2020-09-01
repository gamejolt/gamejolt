<script lang="ts" src="./card"></script>

<template>
	<component :is="cardComponent" v-bind="cardProps">
		<template #thumbnail>
			<app-editable-thumbnail />
		</template>
	</component>
</template>
