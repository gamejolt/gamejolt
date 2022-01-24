<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppActivityFeedPostTime extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: String, required: true })
	link!: string;

	get date() {
		return this.post.isActive ? this.post.published_on : this.post.added_on;
	}
}
</script>

<template>
	<router-link :to="link" class="link-unstyled">
		<template v-if="post.isScheduled">
			<span class="tag" style="vertical-align: middle">
				<app-jolticon icon="calendar-grid" />
				{{ ' ' }}
				<translate>Scheduled</translate>
			</span>
			{{ ' ' }}
			<app-time-ago :date="post.scheduled_for" strict without-suffix />
		</template>
		<template v-else>
			<app-time-ago :date="date" strict without-suffix />
		</template>
	</router-link>
</template>
