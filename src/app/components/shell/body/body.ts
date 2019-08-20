import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import AppShellFooter from '../footer/footer.vue';

// Includes global styling.
require('./body.styl');

@Component({
	components: {
		AppShellFooter,
		AppAdWidget,
	},
})
export default class AppShellBody extends Vue {}
