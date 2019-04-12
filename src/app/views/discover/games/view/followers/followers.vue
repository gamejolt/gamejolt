<template>
	<section class="section">
		<div class="container">
			<div class="alert alert-info" v-if="!game.follower_count">
				<translate>No one is following this game yet.</translate>
			</div>
			<app-follower-list
				v-else
				:url="loadUrl"
				:initial-users="users"
				:count="game.follower_count || 0"
			/>
		</div>
	</section>
</template>

<script lang="ts" src="./followers"></script>
