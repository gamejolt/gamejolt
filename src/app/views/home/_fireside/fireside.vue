<script lang="ts" src="./fireside"></script>

<template>
	<app-loading-fade :is-loading="isLoading">
		<div class="-header">
			<h4 class="section-header">
				<translate>Firesides</translate>
			</h4>
			<span class="help-inline">
				<a class="link-unstyled" @click="refresh()">
					<translate>Refresh</translate>
				</a>
			</span>
		</div>
		<p>
			<small>
				<translate>Hang out with your followers in temporary pop-up chats</translate>
			</small>
		</p>

		<template v-if="isInitialLoading">
			<app-fireside-badge-placeholder />
			<hr />
			<app-fireside-badge-placeholder />
			<app-fireside-badge-placeholder />
		</template>

		<div v-else class="-list">
			<app-fireside-badge
				v-if="userFireside"
				:fireside="userFireside"
				@expire="onFiresideExpired()"
			/>
			<app-fireside-badge-add v-else />

			<template v-if="firesides.length">
				<hr />
				<app-fireside-badge
					v-for="fireside of firesides"
					:key="fireside.id"
					:fireside="fireside"
					@expire="onFiresideExpired()"
				/>
			</template>
		</div>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

.-list
	margin-bottom: $line-height-computed
</style>
