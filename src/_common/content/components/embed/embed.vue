<script lang="ts">
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { arrayShuffle } from '../../../../utils/array';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppLoading from '../../../loading/loading.vue';
import AppVideoEmbed from '../../../video/embed/embed.vue';
import { ContentEmbedService } from '../../content-editor/content-embed.service';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';
import AppContentEmbedSketchfab from './sketchfab/sketchfab.vue';
import AppContentEmbedSoundcloud from './soundcloud/soundcloud.vue';

@Options({
	components: {
		AppVideoEmbed,
		AppContentEmbedSoundcloud,
		AppBaseContentComponent,
		AppContentEmbedSketchfab,
		AppLoading,
	},
})
export default class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	@Prop(String)
	inputValue!: string;

	loading = false;
	previewEmbeds: any[] = [];

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	@Emit('removed') emitRemoved() {}
	@Emit('update-attrs') emitUpdateAttrs(_attrs: Record<string, any>) {}

	declare $refs: {
		inputElement: HTMLInputElement;
	};

	get capabilities() {
		return this.owner.capabilities;
	}

	get hydrator() {
		return this.owner.hydrator;
	}

	get hasContent() {
		return this.type && this.source;
	}

	get hasMoreEmbedPreviews() {
		return this.previewEmbeds.length < ContentEmbedService.previewSources.length;
	}

	mounted() {
		// If the placeholder input is available, focus it immediately
		if (this.$refs.inputElement) {
			this.$refs.inputElement.focus();
		}

		this.setRandomEmbedPills();
	}

	private setRandomEmbedPills() {
		this.previewEmbeds = arrayShuffle(ContentEmbedService.previewSources).slice(0, 3);
	}

	onInput(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			this.emitUpdateAttrs({ source: e.target.value });
		}
	}

	async onKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Backspace':
				// remove this node if backspace was pressed at the start of the input element.
				if (
					this.$refs.inputElement.selectionStart === 0 &&
					this.$refs.inputElement.selectionEnd === 0
				) {
					this.emitRemoved();
					e.preventDefault();
				}
				break;
			case 'Enter':
				if (this.$refs.inputElement.value.length === 0) {
					this.emitRemoved();
				} else {
					this.loading = true;
					const data = await ContentEmbedService.getEmbedData(
						this.owner,
						this.$refs.inputElement.value
					);
					if (data !== undefined) {
						this.emitUpdateAttrs(data);
					} else {
						showErrorGrowl({
							title: this.$gettext(`Uh oh`),
							message: this.$gettext(
								`Something went wrong embedding your content. Maybe try again with a different link?`
							),
						});
					}
					this.loading = false;
				}
				e.preventDefault();
				break;
			case 'Escape':
				this.emitRemoved();
				e.preventDefault();
				break;
		}
	}
}
</script>

<template>
	<app-base-content-component
		v-if="hasContent"
		class="embed-main"
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="emitRemoved"
	>
		<div class="embed-container">
			<div v-if="isEditing" class="embed-overlay-img" />
			<app-video-embed
				v-if="type === 'youtube-video'"
				video-provider="youtube"
				:video-id="source"
			/>
			<app-content-embed-soundcloud
				v-else-if="type === 'soundcloud-song'"
				:track-id="source"
			/>
			<app-content-embed-sketchfab
				v-else-if="type === 'sketchfab-model'"
				:model-id="source"
			/>
		</div>
	</app-base-content-component>
	<div v-else contenteditable="false" class="input-container">
		<div class="embed-pill-container">
			<span class="help-inline"><translate>We support</translate></span>
			<span v-for="preview of previewEmbeds" :key="preview.name" class="embed-pill">
				<app-jolticon
					:icon="preview.icon"
					class="embed-pill-icon"
					:style="{ color: '#' + preview.color }"
				/>
				{{ preview.name }}
			</span>
			<span
				v-if="hasMoreEmbedPreviews"
				class="embed-pill embed-pill-more"
				@click.prevent="setRandomEmbedPills"
			>
				<app-jolticon icon="ellipsis-h" class="embed-pill-icon embed-pill-icon-more" />
				<translate>More</translate>
			</span>
		</div>
		<input
			ref="inputElement"
			class="-input"
			type="text"
			:value="source"
			:disabled="loading || isDisabled"
			:placeholder="$gettext(`Paste a link to what you want to embed`)"
			@input="onInput"
			@keydown="onKeydown"
		/>
		<div v-if="loading" class="input-overlay">
			<app-loading hide-label />
		</div>
	</div>
</template>

<style lang="stylus" src="./embed.styl" scoped></style>
