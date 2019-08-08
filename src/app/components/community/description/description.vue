<template>
	<div>
		<template v-if="shouldShowEdit">
			<form-community-description :model="community" />
		</template>
		<template v-else>
			<app-fade-collapse
				:collapse-height="600"
				:is-open="isDescriptionOpen"
				@require-change="canToggleDescriptionChanged"
			>
				<app-content-viewer :source="community.description_content" />
			</app-fade-collapse>

			<a class="hidden-text-expander" v-if="canToggleDescription" @click="toggleDescription()"></a>
		</template>
	</div>
</template>

<script lang="ts" src="./description"></script>
