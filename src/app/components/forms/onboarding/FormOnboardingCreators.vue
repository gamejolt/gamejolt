<script lang="ts" setup>
import { computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { arrayShuffle } from '../../../../utils/array';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { configOnboardingResources } from '../../../../_common/config/config.service';
import AppCreatorCard from '../../../../_common/creator/AppCreatorCard.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

const CachedCreatorsKey = 'OnboardingCreators';

type FormModel = {
	// nothing
};

const emit = defineEmits({
	next: () => true,
});

const route = useRoute();

const creatorPosts = shallowRef<FiresidePost[]>([]);
const creators = computed(() => creatorPosts.value.map(i => i.user));

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('follows');
		creatorPosts.value = HistoryCache.get(route, CachedCreatorsKey) ?? [];
	},
	loadUrl: '/mobile/galaxy',
	loadData: {
		_fields: {
			creatorPosts: true,
		},
	},
	sanitizeComplexData: false,
	onLoad(payload) {
		const cachedCreatorPosts = HistoryCache.get(route, CachedCreatorsKey);

		let newCreatorPosts: FiresidePost[];

		if (cachedCreatorPosts) {
			newCreatorPosts = cachedCreatorPosts;
		} else {
			newCreatorPosts = payload.creatorPosts
				? arrayShuffle(FiresidePost.populate(payload.creatorPosts))
				: [];

			// Filter out posts so we only display one per user.
			const uniqueCreatorPosts = newCreatorPosts.reduce<FiresidePost[]>((prev, current) => {
				if (prev.every(i => i.displayUser.id !== current.displayUser.id)) {
					prev.push(current);
				}
				return prev;
			}, []);

			newCreatorPosts = uniqueCreatorPosts;

			HistoryCache.store(route, newCreatorPosts, CachedCreatorsKey);
		}

		creatorPosts.value = newCreatorPosts;
		trackExperimentEngagement(configOnboardingResources);
	},
	onBeforeSubmit() {
		Onboarding.trackEvent(
			followsAnyCreator.value ? 'follow-creators-set' : 'follow-creators-skip'
		);
	},
	onSubmitSuccess() {
		Onboarding.endStep(shouldShowSkip.value);
		emit('next');
	},
});

const canContinue = computed(() => form.valid);
const shouldShowSkip = computed(() => !followsAnyCreator.value);
const followsAnyCreator = computed(() => creators.value.find(i => !!i.is_following));
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<AppTranslate>Follow Interesting Creators</AppTranslate>
				</h3>

				<p class="text-muted">
					<AppTranslate>
						Explore fan-created artwork, videos, guides and more.
					</AppTranslate>
				</p>
			</section>

			<section class="-creators">
				<AppScrollScroller thin>
					<div class="-list">
						<AppCreatorCard
							v-for="post of creatorPosts"
							:key="post.id"
							:post="post"
							follow-button-type="no-count"
							no-link
						/>
					</div>
				</AppScrollScroller>
			</section>

			<slot name="controls" :can-continue="canContinue" :should-show-skip="shouldShowSkip" />
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import './variables'

.-form
	display: flex
	flex-direction: column
	max-width: 1100px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-creators
	p
		margin-bottom: 5px

	.-list
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
		grid-gap: 8px
		justify-content: space-between

@media $media-mobile
	.-list
		padding-bottom: 40px
</style>
