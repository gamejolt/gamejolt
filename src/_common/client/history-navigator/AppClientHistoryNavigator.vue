<script lang="ts" setup>
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { ClientHistoryNavigator } from './history-navigator.service';

const HistoryNavigator = ClientHistoryNavigator;
</script>

<template>
	<span>
		<a
			v-if="HistoryNavigator.canGoBack"
			class="navbar-item"
			title="Go back"
			@click="HistoryNavigator.back()"
		>
			<AppJolticon icon="chevron-left" />
		</a>
		<a
			v-if="HistoryNavigator.canGoForward"
			class="navbar-item"
			title="Go forward"
			@click="HistoryNavigator.forward()"
		>
			<AppJolticon icon="chevron-right" />
		</a>
	</span>
</template>
