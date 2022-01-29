<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { User } from '../../../../../_common/user/user.model';
import FormCommunity from '../../../../components/forms/community/community.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';

@Options({
	name: 'RouteDashCommunitiesAdd',
	components: {
		AppPageContainer,
		FormCommunity,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteDashCommunitiesAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Create a Community');
	}

	onSubmit(community: Community) {
		this.$router.push(community.routeEditLocation);
	}
}
</script>

<template>
	<section class="section">
		<AppPageContainer no-left order="right,main">
			<template #right>
				<h3><AppTranslate>What are Communities?</AppTranslate></h3>
				<p>
					<AppTranslate>
						Communities gather people around a specific game or interest to share
						thoughts, art, wiki, guides, videos, and more.
					</AppTranslate>
				</p>

				<h3><AppTranslate>Get Featured</AppTranslate></h3>
				<p>
					<AppTranslate>
						We are looking for Communities that can act as role models. We feature the
						most active communities with a constant stream of awesome content, all over
						Game Jolt.
					</AppTranslate>
				</p>

				<h3><AppTranslate>Communities are Beta</AppTranslate></h3>
				<p>
					<AppTranslate>
						we will be updating and changing how communities function as we gather
						feedback from users. Have a suggestions? Let us know!
					</AppTranslate>
				</p>
			</template>

			<h2>
				<AppTranslate>Create Your Community</AppTranslate>
				<br />
				<small>
					<AppTranslate>
						Communities are a magical place where people of similar interests gather.
					</AppTranslate>
				</small>
			</h2>

			<FormCommunity @submit="onSubmit" />
		</AppPageContainer>
	</section>
</template>
