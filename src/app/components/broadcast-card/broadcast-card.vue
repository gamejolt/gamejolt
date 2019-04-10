<template>
	<div>
		<router-link :to="post.routeLocation" v-app-track-event="`dash:overview:broadcast-view`">
			<app-card>
				<div class="clearfix">
					<app-jolticon class="-icon" icon="broadcast" big />
					<div class="-content">
						{{ post.lead_snippet }}
					</div>
				</div>
			</app-card>
		</router-link>

		<!-- <div class="text-right small">
		<a class="link-muted" :href="Environment.firesideBaseUrl + `/tag/gjbroadcast`" target="_blank" v-app-track-event="`dash:overview:broadcast-all`">
			<translate>dash.overview.broadcast_view_all</translate>
		</a>
	</div> -->
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-icon
	float: left

.-content
	margin-left: 50px
</style>

<script lang="ts" src="./broadcast-card"></script>
