<script lang="ts" src="./dismissable"></script>

<template>
	<app-expand :when="shouldShow">
		<div class="alert sans-margin-bottom" :class="`alert-${alertType}`">
			<a v-app-tooltip="dismissTooltip" class="alert-dismiss" @click="dismiss">
				<app-jolticon icon="remove" />
			</a>
			<div class="alert-content">
				<slot />
			</div>
		</div>
		<br v-if="!noMargin" />
	</app-expand>
</template>
