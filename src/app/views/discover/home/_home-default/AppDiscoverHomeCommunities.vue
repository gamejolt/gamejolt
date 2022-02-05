<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppCommunityCardPlaceholder from '../../../../../_common/community/card-placeholder/card-placeholder.vue';
import AppCommunityCard from '../../../../../_common/community/card/card.vue';
import { Community } from '../../../../../_common/community/community.model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';

const props = defineProps({
	communities: {
		type: Array as PropType<Community[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
});

const slicedCommunities = computed(() => props.communities.slice(0, Screen.isMobile ? 18 : 24));
</script>

<template>
	<div class="container">
		<div class="text-center">
			<h2 class="section-header">
				<AppTranslate>Browse Communities</AppTranslate>
			</h2>

			<p>
				<AppTranslate>
					Find a community to create and explore gaming videos, fanart, discussions and
					more!
				</AppTranslate>
			</p>

			<hr class="underbar underbar-center" />
		</div>

		<div v-if="isLoading" class="row">
			<div v-for="i of 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
				<AppCommunityCardPlaceholder />
			</div>
		</div>
		<template v-else>
			<div class="row">
				<div
					v-for="community of slicedCommunities"
					:key="community.id"
					class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
				>
					<AppCommunityCard
						v-app-track-event="`home:communities:click`"
						:community="community"
						track-goto
						elevate
					/>
				</div>
			</div>
		</template>

		<br />

		<div class="page-cut">
			<AppButton
				v-app-track-event="`home:more-btn:communities`"
				:to="{ name: 'discover.communities' }"
			>
				<AppTranslate>Browse More Communities</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>
