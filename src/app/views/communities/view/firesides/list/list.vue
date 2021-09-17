<script lang="ts" src="./list"></script>

<template>
	<div class="follower-list">
		<div v-if="!firesides.length" :style="gridStyling">
			<app-fireside-avatar-base
				v-for="i of placeholderCount"
				:key="i"
				:is-placeholder="true"
			/>
		</div>
		<template v-else>
			<div :style="gridStyling">
				<app-fireside-avatar
					v-for="fireside of firesides"
					:key="fireside.id"
					:fireside="fireside"
				/>
			</div>

			<app-loading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<app-button
					v-app-track-event="`community-firesides:more`"
					trans
					@click="loadMore()"
				>
					<translate>Load More</translate>
				</app-button>
			</div>
		</template>
	</div>
</template>
