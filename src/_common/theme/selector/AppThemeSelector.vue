<script lang="ts" setup>
import { ref, watch } from 'vue';

import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppPopper from '../../popper/AppPopper.vue';
import { Popper } from '../../popper/popper.service';
import { SiteTemplateModel } from '../../site/template/template-model';

type Props = {
	templates: SiteTemplateModel[];
	currentTemplate: number;
};
const { templates, currentTemplate } = defineProps<Props>();

const emit = defineEmits<{
	change: [id: number];
}>();

const current = ref<SiteTemplateModel | null>(null);

if (currentTemplate) {
	onTemplateChange();
}

watch(
	() => currentTemplate,
	() => {
		onTemplateChange();
	},
	{ immediate: true }
);

function onTemplateChange() {
	current.value = templates.find(t => t.id === currentTemplate) || null;
}

function select(id: number) {
	emit('change', id);
	Popper.hideAll();
}
</script>

<template>
	<div>
		<div id="theme-selector-selection" class="list-group">
			<AppPopper block track-trigger-width>
				<a class="list-group-item has-icon">
					<template v-if="!current">
						<AppJolticon icon="chevron-down" class="list-group-item-icon" />
						<em>{{ $gettext(`Please choose a theme...`) }}</em>
					</template>
					<template v-else>
						<div class="list-group-item-heading">
							<AppJolticon icon="chevron-down" class="list-group-item-icon" />
							<strong>{{ current.name }}</strong>
							{{ ' ' }}
							<small class="text-muted">by @{{ current.user.username }}</small>
						</div>
						<p class="list-group-item-text">
							{{ current.description }}
						</p>
					</template>
				</a>

				<template #popover>
					<div class="list-group">
						<a
							v-for="template of templates"
							:key="template.id"
							class="list-group-item"
							@click="select(template.id)"
						>
							<div class="list-group-item-heading">
								<strong>{{ template.name }}</strong>
								{{ ' ' }}
								<small class="text-muted">by @{{ template.user.username }}</small>
							</div>
							<p class="list-group-item-text">
								{{ template.description }}
							</p>
						</a>
					</div>
				</template>
			</AppPopper>
		</div>
	</div>
</template>
