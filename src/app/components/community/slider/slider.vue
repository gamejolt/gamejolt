<template>
	<div class="-list" v-if="communities.length || showAddButton">
		<app-scroll-scroller class="-scroller" horizontal thin>
			<app-community-slider-item
				v-for="community of communities"
				:key="community.id"
				:community="community"
				:event-cat="eventCat"
			/>

			<app-community-slider-discover-item key="discover" />
			<app-community-slider-add-item key="add" v-if="showAddButton" />
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" src="./slider.styl" scoped></style>

<script lang="ts" src="./slider"></script>
