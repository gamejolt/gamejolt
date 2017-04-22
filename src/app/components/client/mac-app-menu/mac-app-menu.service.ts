import * as gui from 'nw.gui';
import { ClientControl } from '../control/client.service';

export class ClientMacAppMenu
{
	static init()
	{
		const win = gui.Window.get();
		const menu = new gui.Menu( { type: 'menubar' } );

		menu.createMacBuiltin( 'Game Jolt Client' );

		win.menu = menu;

		win.on( 'close', ( intent: string ) =>
		{
			// If we should just minimize instead of quitting.
			// Many applications on mac just minimize instead of actually close.
			if ( intent !== 'quit' ) {
				ClientControl.close();
			}
			else {
				ClientControl.quit();
			}
		} );

		// reopen is Mac specific
		// When they click the dock, we need to show it in case they hid it with the close.
		gui.App.on( 'reopen', function()
		{
			ClientControl.show();
		} );
	}
}
