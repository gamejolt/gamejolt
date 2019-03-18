<template>
	<section class="section">
		<div class="container">
			<div class="alert alert-info" v-if="!community.member_count">
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
		</div>
	</section>
</template>

<script lang="ts" src="./members" />
