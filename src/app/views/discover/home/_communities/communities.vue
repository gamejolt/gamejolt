<script lang="ts" src="./communities"></script>

<template>
	<div class="container">
		<template v-if="configDiscoverCommunityChunks.value">
			<template v-if="isLoading">
				<div class="row">
					<template v-for="i of 1">
						<app-community-chunk-placeholder :key="i" class="-chunk" />
					</template>
				</div>
			</template>
			<template v-else-if="filteredCommunities.top.length > 0">
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
		</template>

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
			<br />
		</div>

		<div v-if="isLoading" class="row">
			<div v-for="i of 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
				<app-community-card-placeholder />
			</div>
		</div>
		<div v-else class="row">
			<div
				v-for="community of slicedCommunities"
				:key="community.id"
				class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
			>
				<app-community-card
					v-app-track-event="`home:communities:click`"
					:community="community"
					:track-goto="configDiscoverCommunityChunks.value"
					elevate
				/>
			</div>
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
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-chunk
	margin-bottom: $grid-gutter-width
</style>
