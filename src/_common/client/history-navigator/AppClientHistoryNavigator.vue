<script lang="ts" setup>
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { ClientHistoryNavigator } from './history-navigator.service';
</script>

<template>
	<span>
		<a
			v-if="ClientHistoryNavigator.canGoBack"
			class="navbar-item"
			title="Go back"
			@click="ClientHistoryNavigator.back()"
		>
			<AppJolticon icon="chevron-left" />
		</a>
		<a
			v-if="ClientHistoryNavigator.canGoForward"
			class="navbar-item"
			title="Go forward"
			@click="ClientHistoryNavigator.forward()"
		>
			<AppJolticon icon="chevron-right" />
		</a>
	</span>
</template>
