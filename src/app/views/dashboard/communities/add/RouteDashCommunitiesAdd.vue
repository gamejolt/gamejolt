<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import FormCommunity from '../../../../components/forms/community/FormCommunity.vue';
import AppPageContainer from '../../../../components/page-container/AppPageContainer.vue';

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
