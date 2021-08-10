<script lang="ts" src="./scoreboard-selector"></script>

<template>
	<app-list-group-selector :items="tables" :current="currentTable" @change="selectTable($event)">
		<template #default="{ item }">
			<h5 class="list-group-item-heading sans-margin-bottom">
				<strong>{{ item.name }}</strong>
			</h5>
			<p class="list-group-item-text">
				{{ item.description }}
			</p>
		</template>
	</app-list-group-selector>
</template>
