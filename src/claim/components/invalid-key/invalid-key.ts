import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./invalid-key.html';

@View
@Component({})
export class AppInvalidKey extends Vue {}
