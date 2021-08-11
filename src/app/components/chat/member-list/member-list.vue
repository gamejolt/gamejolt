<script lang="ts" src="./member-list"></script>

<template>
	<div class="chat-user-list">
		<div v-if="!hideFilter" class="nav-controls">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<ul v-show="users.length" class="shell-nav">
			<app-chat-member-list-item
				v-for="user of filteredUsers"
				:key="user.id"
				:user="user"
				:room="room"
			/>
		</ul>
	</div>
</template>
