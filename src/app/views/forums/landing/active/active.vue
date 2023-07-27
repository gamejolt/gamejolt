<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import AppForumTopicList from '../../../../components/forum/topic-list/topic-list.vue';

@Options({
	name: 'RouteForumsLandingActive',
	components: {
		AppForumTopicList,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/forums/active-topics'),
})
export default class RouteForumsLandingActive extends LegacyRouteComponent {
	topics: ForumTopic[] = [];
	postCountPerPage = 0;

	get routeTitle() {
		return this.$gettext(`Active Topics in All Forums`);
	}

	routeResolved($payload: any) {
		this.topics = ForumTopic.populate($payload.topics);
		this.postCountPerPage = $payload.postCountPerPage;
	}
}
</script>

<template>
	<div class="section">
		<div class="container">
			<div class="alert full-bleed-xs">
				<p>
					<AppTranslate>
						Some topics from all channels sorted by when they last had a post. Smell how
						fresh.
					</AppTranslate>
				</p>
			</div>
			<br />

			<AppForumTopicList :topics="topics" :post-count-per-page="postCountPerPage" />
		</div>
	</div>
</template>
