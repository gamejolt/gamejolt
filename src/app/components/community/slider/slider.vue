<template>
	<div class="-list" v-if="communities.length || showAddButton">
		<app-scroll-scroller class="-scroller" horizontal thin>
			<div class="-flex">
				<app-community-slider-item
					v-for="community of communities"
					:key="community.id"
					:community="community"
					:event-cat="eventCat"
				/>

				<app-community-slider-discover-item key="discover" />
				<app-community-slider-add-item key="add" v-if="showAddButton" />
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" src="./slider.styl" scoped></style>

<script lang="ts" src="./slider"></script>
