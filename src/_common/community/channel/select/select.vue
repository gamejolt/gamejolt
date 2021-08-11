<script lang="ts" src="./select"></script>

<template>
	<div v-if="validChannels.length">
		<span v-for="channel of validChannels" :key="channel.id">
			<app-pill
				:class="{ active: modelValue && modelValue.id === channel.id }"
				@click="emitUpdate(channel)"
			>
				{{ channel.displayTitle }}
			</app-pill>
		</span>
	</div>
</template>
