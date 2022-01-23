<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../_common/card/AppCard.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';

@Options({
	components: {
		AppCard,
	},
})
export default class AppBroadcastCard extends Vue {
	@Prop(Object)
	post!: FiresidePost;
}
</script>

<template>
	<div>
		<router-link v-app-track-event="`dash:overview:broadcast-view`" :to="post.routeLocation">
			<app-card>
				<div class="clearfix">
					<app-jolticon class="-icon" icon="broadcast" big />
					<div class="-content">
						{{ post.getShortLead() }}
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
.-icon
	float: left

.-content
	margin-left: 50px
</style>
