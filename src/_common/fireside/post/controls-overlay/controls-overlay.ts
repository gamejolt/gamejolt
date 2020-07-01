import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Component({})
export default class AppFiresidePostControlsOverlay extends Vue {
	// Extends the overlay 4px past the content on the bottom,
	// rather than being inset 4px on the bottom.
	@Prop(propOptional(Boolean, false)) end!: boolean;
}
