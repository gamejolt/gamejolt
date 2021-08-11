import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { arrayShuffle } from '../../../../utils/array';
import { Growls } from '../../../growls/growls.service';
import AppLoading from '../../../loading/loading.vue';
import AppVideoEmbed from '../../../video/embed/embed.vue';
import { ContentEmbedService } from '../../content-editor/content-embed.service';
import { ContentOwner } from '../../content-owner';
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

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	@Prop(String)
	inputValue!: string;

	loading = false;
	previewEmbeds: any[] = [];

	@Emit('removed') emitRemoved() {}
	@Emit('update-attrs') emitUpdateAttrs(_attrs: Record<string, any>) {}

	declare $refs: {
		inputElement: HTMLInputElement;
	};

	get capabilities() {
		return this.owner.getCapabilities();
	}

	get hydrator() {
		return this.owner.getHydrator();
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
						Growls.error({
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
