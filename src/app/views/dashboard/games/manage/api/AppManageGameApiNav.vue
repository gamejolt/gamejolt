<script lang="ts" setup></script>

<template>
	<ul class="sans-margin">
		<li>
			<router-link
				:to="{ name: 'dash.games.manage.api.overview' }"
				:class="{ active: $route.name === 'dash.games.manage.api.overview' }"
			>
				<AppTranslate>Overview</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{ name: 'dash.games.manage.api.trophies.list' }"
				:class="{ active: $route.name.indexOf('dash.games.manage.api.trophies') === 0 }"
			>
				<AppTranslate>Trophies</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{ name: 'dash.games.manage.api.scoreboards.list' }"
				:class="{ active: $route.name.indexOf('dash.games.manage.api.scoreboards') === 0 }"
			>
				<AppTranslate>Scores</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{ name: 'dash.games.manage.api.data-storage.items.list' }"
				:class="{ active: $route.name.indexOf('dash.games.manage.api.data-storage') === 0 }"
			>
				<AppTranslate>Data Storage</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link :to="{ name: 'dash.games.manage.api.settings' }" active-class="active">
				<AppTranslate>API Settings</AppTranslate>
			</router-link>
		</li>
	</ul>
</template>
