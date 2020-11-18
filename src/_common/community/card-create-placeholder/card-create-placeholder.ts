import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppCommunityAddWidget from '../add-widget/add-widget.vue';

@Component({
	components: {
		AppCommunityAddWidget,
	},
})
export default class AppCommunityCardCreatePlaceholder extends Vue {}
