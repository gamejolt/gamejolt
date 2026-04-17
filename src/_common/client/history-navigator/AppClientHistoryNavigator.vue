<script lang="ts" setup>
import { ClientHistoryNavigator } from '~common/client/history-navigator/history-navigator.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
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
