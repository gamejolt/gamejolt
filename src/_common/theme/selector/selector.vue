<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppPopper from '../../popper/AppPopper.vue';
import { Popper } from '../../popper/popper.service';
import { SiteTemplate } from '../../site/template/template-model';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppThemeSelector extends Vue {
	@Prop(Array)
	templates!: SiteTemplate[];

	@Prop(Number)
	currentTemplate!: number;

	current: SiteTemplate | null = null;

	@Emit('change')
	emitChange(_id: number) {}

	@Watch('currentTemplate')
	onTemplateChange() {
		this.current = this.templates.find(t => t.id === this.currentTemplate) || null;
	}

	created() {
		if (this.currentTemplate) {
			this.onTemplateChange();
		}
	}

	select(id: number) {
		this.emitChange(id);
		Popper.hideAll();
	}
}
</script>

<template>
	<div>
		<div id="theme-selector-selection" class="list-group">
			<AppPopper block track-trigger-width>
				<a class="list-group-item has-icon">
					<template v-if="!current">
						<AppJolticon icon="chevron-down" class="list-group-item-icon" />
						<em><AppTranslate>Please choose a theme...</AppTranslate></em>
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
