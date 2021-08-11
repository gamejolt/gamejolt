<script lang="ts" src="./slider"></script>

<template>
	<div v-if="communities.length || withAddButton" class="-list">
		<app-scroll-scroller class="-scroller" horizontal thin>
			<div class="-flex">
				<app-community-slider-item
					v-for="community of communities"
					:key="community.id"
					:community="community"
					:event-cat="eventCat"
				/>

				<app-community-slider-discover-item />
				<app-community-slider-add-item v-if="withAddButton" />
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" src="./slider.styl" scoped></style>
