import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./placeholder.html?style=./placeholder.styl';

@View
@Component({})
export class AppGameThumbnailPlaceholder extends Vue {}
