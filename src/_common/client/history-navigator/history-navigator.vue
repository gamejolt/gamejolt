<template>
	<span>
		<a
			v-if="HistoryNavigator.canGoBack"
			class="navbar-item"
			title="Go back"
			@click="HistoryNavigator.back()"
		>
			<app-jolticon icon="chevron-left" />
		</a>
		<a
			v-if="HistoryNavigator.canGoForward"
			class="navbar-item"
			title="Go forward"
			@click="HistoryNavigator.forward()"
		>
			<app-jolticon icon="chevron-right" />
		</a>
	</span>
</template>

<script lang="ts" src="./history-navigator" />
