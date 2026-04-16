<script lang="ts">
import { computed } from 'vue';

import FormCommunity from '~app/components/forms/community/FormCommunity.vue';
import AppPageContainer from '~app/components/page-container/AppPageContainer.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';
import { touchUser } from '~common/user/user.model';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext('Create a community')),
});
</script>

<template>
	<section class="section">
		<AppPageContainer no-left no-right>
			<h2>
				{{ $gettext(`Create your community`) }}
				<br />
				<small>{{
					$gettext(
						`Communities are magical places where people of similar interests hang out, post interesting content, and stream together.`
					)
				}}</small>
			</h2>

			<br />

			<FormCommunity />
		</AppPageContainer>
	</section>
</template>
