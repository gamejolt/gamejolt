// Gotta define all vendor imports we ever use in the lib.
// This way we can make a vendor.js file that we include for all sections of the site.
// It also means that changes to the app.js files won't change the vendor.js file
// so that we can keep this in cache.

import 'reflect-metadata';
import {
	Inject,
	Injectable,
	provide,
	Component,
	Directive,
	Input,
	Output,
	enableProdMode,
	HostListener,
} from 'ng-metadata/core';
import { bootstrap } from 'ng-metadata/platform';

const ngMetadata_core = {
	Inject,
	Injectable,
	provide,
	Component,
	Directive,
	Input,
	Output,
	enableProdMode,
	HostListener,
};

const ngMetadata_platform = {
	bootstrap,
};

export default {
	ngMetadata_core,
	ngMetadata_platform,
};
