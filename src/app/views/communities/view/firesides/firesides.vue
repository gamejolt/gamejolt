<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppFiresideAvatar from '../../../../components/fireside/avatar/AppFiresideAvatar.vue';
import AppFiresideAvatarBase from '../../../../components/fireside/avatar/AppFiresideAvatarBase.vue';
import { illNoComments } from '../../../../img/ill/illustrations';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/communities/firesides/${route.params.path}`;
}

@Options({
	name: 'RouteCommunitiesViewFiresides',
	components: {
		AppCommunitiesViewPageContainer,
		AppIllustration,
		AppFiresideAvatar,
		AppFiresideAvatarBase,
	},
})
@OptionsForRoute({
	cache: true,
	lazy: true,
	deps: {
		params: ['path'],
	},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewFiresides extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	firesides: Fireside[] = [];

	readonly Screen = Screen;
	readonly illNoComments = illNoComments;

	get community() {
		return this.routeStore.community;
	}

	get routeTitle() {
		return this.community ? `Firesides in the ${this.community.name} Community` : null;
	}

	get placeholderCount() {
		// 2 rows for all breakpoints
		return this.gridColumns * 2;
	}

	get gridStyling() {
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${this.gridColumns}, 1fr)`,
			gridGap: '16px',
		};
	}

	get gridColumns() {
		if (Screen.isXs) {
			return 4;
		} else if (Screen.isSm) {
			return 5;
		}

		return 6;
	}

	routeResolved($payload: any) {
		this.firesides = Fireside.populate($payload.firesides);
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
			<AppTranslate>Active Firesides</AppTranslate>
			<small v-if="Screen.isDesktop">in {{ community.name }}</small>
		</h1>
		<br />

		<AppIllustration
			v-if="isRouteBootstrapped && firesides.length === 0"
			:asset="illNoComments"
		>
			<p>
				<AppTranslate>There are no active firesides in this community yet.</AppTranslate>
			</p>
		</AppIllustration>
		<div v-else :style="gridStyling">
			<template v-if="!firesides.length">
				<AppFiresideAvatarBase
					v-for="i of placeholderCount"
					:key="`placeholder-${i}`"
					:is-placeholder="true"
				/>
			</template>
			<template v-else>
				<AppFiresideAvatar
					v-for="fireside of firesides"
					:key="fireside.id"
					:fireside="fireside"
					hide-community
				/>
			</template>
		</div>
	</AppCommunitiesViewPageContainer>
</template>
