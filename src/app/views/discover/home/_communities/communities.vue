<script lang="ts" src="./communities"></script>

<template>
	<div>
		<div :class="{ 'text-center': isInSplit }">
			<h2 class="section-header">
				<translate>Browse Communities</translate>
			</h2>

			<p>
				<translate>
					Find a community to create and explore fanart, videos, walkthroughs and more!
				</translate>
			</p>

			<template v-if="isInSplit">
				<hr class="underbar underbar-center" />
				<br />
			</template>
		</div>

		<template v-if="!isInSplit">
			<app-community-slider-placeholder v-if="isLoading" :num="10" with-add-button />
			<app-community-slider
				v-else-if="communities.length"
				:communities="communities"
				with-add-button
				event-cat="home"
			/>
		</template>
		<template v-else>
			<div class="row">
				<app-discover-home-communities-item
					v-for="community of communities"
					:key="community.id"
					:community="community"
				/>
			</div>

			<br />

			<div class="page-cut">
				<app-button
					v-app-track-event="`home:more-btn:communities`"
					:to="{ name: 'discover.communities' }"
				>
					<translate>Browse More Communities</translate>
				</app-button>
			</div>

			<h2 class="text-center">
				<translate>Can't find your dream community?</translate>
			</h2>

			<app-community-card-create-placeholder style="margin: 0 auto;" />
		</template>
	</div>
</template>
