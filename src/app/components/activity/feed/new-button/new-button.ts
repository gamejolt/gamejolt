import View from '!view!./new-button.html?style=./new-button.styl';
import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';

@View
@Component({})
export class AppActivityFeedNewButton extends Vue {
	@Emit('click')
	emitClick(_e: Event) {}
}
