<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
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
@RouteResolver({
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
		<app-page-container no-left order="right,main">
			<template #right>
				<h3><translate>What are Communities?</translate></h3>
				<p>
					<translate>
						Communities gather people around a specific game or interest to share
						thoughts, art, wiki, guides, videos, and more.
					</translate>
				</p>

				<h3><translate>Get Featured</translate></h3>
				<p>
					<translate>
						We are looking for Communities that can act as role models. We feature the
						most active communities with a constant stream of awesome content, all over
						Game Jolt.
					</translate>
				</p>

				<h3><translate>Communities are Beta</translate></h3>
				<p>
					<translate>
						we will be updating and changing how communities function as we gather
						feedback from users. Have a suggestions? Let us know!
					</translate>
				</p>
			</template>

			<h2>
				<translate>Create Your Community</translate>
				<br />
				<small>
					<translate>
						Communities are a magical place where people of similar interests gather.
					</translate>
				</small>
			</h2>

			<form-community @submit="onSubmit" />
		</app-page-container>
	</section>
</template>
