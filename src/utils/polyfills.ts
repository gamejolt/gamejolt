import 'core-js/modules/es7.object.values';
import 'core-js/modules/es7.object.entries';
import 'reflect-metadata';

// Reflect attaches to global.Reflect if it's in node context, so we want to
// also put it on Window.
if (GJ_IS_CLIENT) {
	(window as any).Reflect = (global as any).Reflect;
}
