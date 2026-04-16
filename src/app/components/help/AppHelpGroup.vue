<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { routeLandingHelpPage } from '../../views/landing/help/help.route';
import { HelpCategoryModel } from './category/category.model';
import { HelpPageModel } from './page/page.model';

type Props = {
	category: HelpCategoryModel;
	pages: HelpPageModel[];
};
defineProps<Props>();
</script>

<template>
	<div class="list-group anim-fade-in-enlarge">
		<div class="list-group-item" :class="{ 'has-icon': category.icon }">
			<h3 class="list-group-item-heading">
				<AppJolticon v-if="category.icon" :icon="(category.icon as any)" notice />
				{{ category.name }}
			</h3>
		</div>
		<RouterLink
			v-for="page of pages"
			:key="page.id"
			class="list-group-item"
			:to="{
				name: routeLandingHelpPage.name,
				params: {
					category: category.url,
					page: page.url,
				},
			}"
		>
			{{ page.title }}
		</RouterLink>
	</div>
</template>
