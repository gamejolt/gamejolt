import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import { EventSubscription } from '../../system/event/event-topic';

const RATIO = 0.5625; // 16:9

/**
 * Regex used for app-form components to validate text input to be valid sketchfab input.
 * Matches all 3 valid sketchfab input formats: new urls, old urls, standalone ids.
 * @see getSketchfabIdFromInput for more info on the formats.
 */
export const SKETCHFAB_FIELD_VALIDATION_REGEX =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$|^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/models\/([0-9a-f]{32})\/?))$|^([0-9a-f]{32})$/i;

const SKETCHFAB_URL_REGEX_1 =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$/i;
const SKETCHFAB_URL_REGEX_2 =
	/^(?:(?:https:\/\/)?(?:www\.)?(?:sketchfab\.com\/models\/([0-9a-f]{32})\/?))$/i;

export function getSketchfabIdFromInput(input: string) {
	// The input has to be validated with the SKETCHFAB_FIELD_VALIDATOR_REGEX.
	// That means that the input has to take one of these 3 forms:
	// - new sketchfab url format (https://sketchfab.com/3d-models/name-id), matched with SKETCHFAB_URL_REGEX_1
	// - old sketchfab url format (https://sketchfab.com/models/id), matched with SKETCHFAB_URL_REGEX_2
	// - standalone sketchfab id (example: 70001ecdc29c43ceba1d766f09fe79c0)

	// Try to extract the sketchfab model ID from a url using the two different model url regex matchers.
	for (const regex of [SKETCHFAB_URL_REGEX_1, SKETCHFAB_URL_REGEX_2]) {
		const urlMatches = regex.exec(input.trim());
		if (urlMatches !== null && urlMatches.length === 2) {
			const id = urlMatches[1];
			return id;
		}
	}
	// Does not match either of the two regexes above. Due to the above assumption, this must be a standalone sketchfab model id.
	return input;
}

@Options({})
export default class AppSketchfabEmbed extends Vue {
	@Prop(String) sketchfabId!: string;
	@Prop(Number) maxWidth!: number;
	@Prop(Number) maxHeight!: number;
	@Prop({ type: Boolean, default: false })
	autoplay!: boolean;

	embedUrl = '';
	width = 0;
	height = 0;

	private resize$: EventSubscription | undefined;

	mounted() {
		this.recalculateDimensions();
		this.resize$ = Screen.resizeChanges.subscribe(() => this.recalculateDimensions());
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	@Watch('sketchfabId', { immediate: true })
	idChange() {
		if (!this.sketchfabId) {
			return;
		}

		let url = `https://sketchfab.com/models/${this.sketchfabId}/embed`;

		if (this.autoplay) {
			url += '?autostart=1';
		}

		this.embedUrl = url;
	}

	async recalculateDimensions() {
		await nextTick();

		this.width = Ruler.width(
			this.$el.getElementsByClassName('sketchfab-embed-inner')[0] as HTMLElement
		);

		if (this.maxWidth) {
			this.width = Math.min(this.maxWidth, this.width);
		}

		this.height = this.width * RATIO;

		if (this.maxHeight && this.height > this.maxHeight) {
			this.height = this.maxHeight;
			this.width = this.height / RATIO;
		}
	}
}
