import 'core-js/modules/es.object.entries';
import 'core-js/modules/es.object.values';

// Reflect attaches to global.Reflect if it's in node context, so we want to
// also put it on Window.
if (GJ_IS_DESKTOP_APP) {
	(window as any).Reflect = (global as any).Reflect;
}
