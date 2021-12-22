<script lang="ts" src="./communities"></script>

<template>
	<div class="container">
		<div class="text-center">
			<h2 class="section-header">
				<translate>Browse Communities</translate>
			</h2>

			<p>
				<translate>
					Find a community to create and explore gaming videos, fanart, discussions and
					more!
				</translate>
			</p>

			<hr class="underbar underbar-center" />
		</div>

		<div v-if="isLoading" class="row">
			<div v-for="i of 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
				<app-community-card-placeholder />
			</div>
		</div>
		<template v-else>
			<template v-if="filteredCommunities.top.length > 0">
				<div class="row">
					<template v-for="community of filteredCommunities.top">
						<app-community-chunk
							:key="community.id"
							class="-chunk"
							:community="community"
						/>
					</template>
				</div>
			</template>

			<br />

			<div class="row">
				<div
					v-for="community of slicedCommunities"
					:key="community.id"
					class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
				>
					<app-community-card
						v-app-track-event="`home:communities:click`"
						:community="community"
						track-goto
						elevate
					/>
				</div>
			</div>
		</template>

		<br />

		<div class="page-cut">
			<app-button
				v-app-track-event="`home:more-btn:communities`"
				:to="{ name: 'discover.communities' }"
			>
				<translate>Browse More Communities</translate>
			</app-button>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-chunk
	margin-bottom: $grid-gutter-width
</style>
