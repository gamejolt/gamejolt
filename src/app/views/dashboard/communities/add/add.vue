<script lang="ts">
import { Options } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../_common/community/community.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { touchUser } from '../../../../../_common/user/user.model';
import FormCommunity from '../../../../components/forms/community/community.vue';
import AppPageContainer from '../../../../components/page-container/AppPageContainer.vue';

@Options({
	name: 'RouteDashCommunitiesAdd',
	components: {
		AppPageContainer,
		FormCommunity,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => touchUser(),
})
export default class RouteDashCommunitiesAdd extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Create a community');
	}

	onSubmit(community: CommunityModel) {
		this.$router.push(community.routeEditLocation);
	}
}
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

			<FormCommunity @submit="onSubmit" />
		</AppPageContainer>
	</section>
</template>
