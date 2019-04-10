<template>
	<div class="list-group game-collection-list">
		<router-link
			class="list-group-item clearfix"
			v-for="collection of collections"
			:key="collection._id"
			:to="collection.routeLocation"
			:title="collection.getTitle()"
			v-app-track-event="eventLabel"
		>
			<div class="row">
				<div class="col-xs-3">
					<app-game-collection-thumbnail :collection="collection" :hide-tag="true" />
				</div>
				<div class="col-xs-9">
					<div class="game-collection-title h5">
						{{ collection.name }}

						<small v-if="collection.from_subscription">
							<translate>library.by</translate>
							@{{ collection.owner.username }}
						</small>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.game-collection-list

	// Override from the grid to make this smaller.
	.game-collection-title
		margin-top: 0
</style>

<script lang="ts" src="./list"></script>
