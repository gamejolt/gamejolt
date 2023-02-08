<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { routeLandingHelpPage } from '../../views/landing/help/help.route';
import HelpCategory from './category/category.model';
import HelpPage from './page/page.model';

defineProps({
	category: {
		type: Object as PropType<HelpCategory>,
		required: true,
	},
	pages: {
		type: Array as PropType<HelpPage[]>,
		required: true,
	},
});
</script>

<template>
	<div class="list-group anim-fade-in-enlarge">
		<div class="list-group-item" :class="{ 'has-icon': category.icon }">
			<h3 class="list-group-item-heading">
				<AppJolticon v-if="category.icon" :icon="category.icon" notice />
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
