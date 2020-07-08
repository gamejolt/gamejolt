<template>
	<app-communities-view-page-container full>
		<div v-if="!community.member_count" class="alert alert-info">
			<translate>
				No one is a member of this community yet. Maybe you could be the first!
			</translate>
		</div>
		<app-follower-list
			v-else
			:url="loadUrl"
			:initial-users="users"
			:count="community.member_count || 0"
		/>
	</app-communities-view-page-container>
</template>

<script lang="ts" src="./members"></script>
