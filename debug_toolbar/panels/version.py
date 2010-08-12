import sys

import django
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _

import debug_toolbar
from debug_toolbar.panels import DebugPanel


class VersionDebugPanel(DebugPanel):
    """
    Panel that displays the Django version.
    """
    name = 'Version'

    def title(self):
        return _('Versions')

    def url(self):
        return ''
    
    def content(self):
        versions = {}
        for app in settings.INSTALLED_APPS + ['django']:
            name = app.split('.')[-1].replace('_', ' ').capitalize()
            __import__(app)
            app = sys.modules[app]
            if hasattr(app, 'get_version'):
                get_version = app.get_version
                if callable(get_version):
                    version = get_version()
                else:
                    version = get_version
            elif hasattr(app, 'VERSION'):
                version = app.VERSION
            elif hasattr(app, '__version__'):
                version = app.__version__
            else:
                continue
            if isinstance(version, (list, tuple)):
                version = '.'.join(str(o) for o in version)
            versions[name] = version

        context = {
            'versions': sorted(versions.items(), key=lambda x: x[0]),
            'paths': sys.path,
        }
        return render_to_string('debug_toolbar/panels/versions.html', context)