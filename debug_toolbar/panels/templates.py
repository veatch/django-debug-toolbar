from debug_toolbar.panels import DebugPanel
from django.conf import settings
from django.dispatch import dispatcher
from django.core.signals import request_started
from django.test.signals import template_rendered
from django.template.loader import render_to_string

from django import template

import time


class TemplateStatTracker(template.Template):
    def __init__(self, *args, **kwargs):
        self.templates = []
        super(TemplateStatTracker, self).__init__(*args, **kwargs)

    def render(self, *args, **kwargs):
        start = time.time()
        try:
            return super(TemplateStatTracker, self).render(*args, **kwargs)
        finally:
            stop = time.time()
            # We keep `sql` to maintain backwards compatibility
            self.templates.append({
                'name': self.name,
                'time': stop - start,
            })

stats = TemplateStatTracker()
template.Template.render = stats.render

class DjangoTemplatesDebugPanel(DebugPanel):
    """
    Panel that displays information about the SQL queries run while processing the request.
    """
    name = 'Templates'
    
    def __init__(self, *args, **kwargs):
        super(DjangoTemplatesDebugPanel, self).__init__(*args, **kwargs)
        self.templates_used = []
        self.contexts_used = []
        template_rendered.connect(self._storeRenderedTemplates)
        
    def _storeRenderedTemplates(self, **kwargs):
        template = kwargs.pop('template')
        if template:
            self.templates_used.append(template)
        context = kwargs.pop('context')
        if context:
            self.contexts_used.append(context)

    def process_response(self, request, response):
        self.templates = [
            (t.name, t.origin and t.origin.name or 'No origin')
            for t in self.templates_used
        ]
        return response

    def title(self):
        return 'Templates: %.2fms'

    def url(self):
        return ''

    def content(self):
        context = {
            'templates': self.templates,
            'template_dirs': settings.TEMPLATE_DIRS,
        }
        
        return render_to_string('debug_toolbar/panels/templates.html', context)