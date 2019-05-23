<template>
	<div class="user-recommended">
		<div class="-header">
			<h4 class="section-header">
				<translate>Who to follow</translate>
			</h4>
			<span class="help-inline">
				<a @click="emitRefresh()" class="link-unstyled">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>
		<app-user-list :users="users" event-label="activity" />
		<div v-if="loading" class="loading-overlay">
			<app-loading hide-label centered />
		</div>
	</div>
</template>

<style lang="stylus" scoped src="./recommended.styl"></style>
<script lang="ts" src="./recommended"></script>
