<script lang="ts" src="./user-list"></script>

<template>
	<div class="chat-user-list">
		<div class="nav-controls">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<ul v-show="entries.length" class="shell-nav">
			<app-chat-user-list-item
				v-for="user of filteredEntries"
				:key="getKeyForEntry(user)"
				:item="user"
			/>
		</ul>
	</div>
</template>
