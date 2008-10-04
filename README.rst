====================
Django Debug Toolbar
====================

This is a fork of Rob Hudson's Debug Toolbar. It includes an alternative style, and some panels which may not be available in the main repository.

The Django Debug Toolbar is a configurable set of panels that display various
debug information about the current request/response.  It is a small toolbar
that, when activated, situates itself in the top-right location of the browser
window.  When particular panels are clicked, more details about that panel's
content are displayed.

Currently, the following panels have been written and are working:

- Detailed SQL queries
- Request timer
- Common HTTP headers
- Cache statistics
- HTTP variables
- Profile module
- Templates rendered
- Logging message output

If you have ideas for other panels please let us know.

Installation
============

#. Add the `debug_toolbar` directory to your Python path.

#. Add the following middleware to your project's `settings.py` file:

	``'debug_toolbar.middleware.DebugToolbarMiddleware',``

   Tying into middleware allows each panel to be instantiated on request and
   rendering to happen on response.

#. Add `debug_toolbar` to your `INSTALLED_APPS` setting so Django can find the
   the template files associated with the Debug Toolbar.

#. Add your IP address to ``INTERNAL_IPS`` or login with a user who is flagged as ``is_superuser``

#. (Optional) Add a tuple called `DEBUG_TOOLBAR_PANELS` to your ``settings.py`` file that
   specifies the full Python path to the panel that you want included in the 
   Toolbar.  This setting looks very much like the `MIDDLEWARE_CLASSES` setting.
   For example::

	# This example is all working panels, not all are active with default settings
	DEBUG_TOOLBAR_PANELS = (
	    'debug_toolbar.panels.sql.SQLDebugPanel',
	    'debug_toolbar.panels.headers.HeaderDebugPanel',
	    'debug_toolbar.panels.cache.CacheDebugPanel',
	    'debug_toolbar.panels.profiler.ProfilerDebugPanel',
	    'debug_toolbar.panels.request_vars.RequestVarsDebugPanel',
	    'debug_toolbar.panels.templates.TemplatesDebugPanel',
	    # If you are using the profiler panel you don't need the timer
	    # 'debug_toolbar.panels.timer.TimerDebugPanel',
	)

   You can change the ordering of this tuple to customize the order of the
   panels you want to display.