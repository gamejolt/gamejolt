<template>
	<div class="user-recommended">
		<div class="-header">
			<h4 class="section-header">
				<translate>Who to follow</translate>
			</h4>
			<span class="help-inline">
				<a @click="onClickRefresh" class="link-unstyled">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>
		<app-user-list :users="users" />
		<div v-if="loading" class="loading-overlay">
			<app-loading hide-label centered />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.user-recommended
	min-height: 200px
	position: relative

.-header
	display: flex
	justify-content: space-between

.loading-overlay
	position: absolute
	top: 40px
	left: 0
	bottom: 0
	width: 100%
	display: flex
	justify-content: center
	align-items: center
	theme-prop('background-color', 'bg')
	opacity: 0.8

</style>

<script lang="ts" src="./recommended"></script>
