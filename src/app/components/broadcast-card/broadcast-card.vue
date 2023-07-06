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
			<AppCard>
				<div class="clearfix">
					<AppJolticon class="-icon" icon="broadcast" big />
					<div class="-content">
						{{ post.getShortLead() }}
					</div>
				</div>
			</AppCard>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-content
	margin-left: 50px
</style>
