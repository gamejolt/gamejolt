<template>
	<div v-if="validChannels.length">
		<span v-for="channel of validChannels" :key="channel.id">
			<app-pill :class="{ active: value && value.id === channel.id }" @click="emitInput(channel)">
				{{ channel.title }}
			</app-pill>
		</span>
	</div>
</template>

<script lang="ts" src="./select"></script>
