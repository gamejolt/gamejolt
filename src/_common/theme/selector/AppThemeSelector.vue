<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppPopper from '../../popper/AppPopper.vue';
import { SiteTemplateModel } from '../../site/template/template-model';

const props = defineProps({
	templates: {
		type: Array as PropType<SiteTemplateModel[]>,
		required: true,
	},
	currentTemplate: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	change: (_id: number) => true,
});

const { templates, currentTemplate } = toRefs(props);

const current = ref<SiteTemplateModel | null>(null);

if (currentTemplate.value) {
	onTemplateChange();
}

watch(
	currentTemplate,
	() => {
		onTemplateChange();
	},
	{ immediate: true }
);

function onTemplateChange() {
	current.value = templates.value.find(t => t.id === currentTemplate.value) || null;
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
