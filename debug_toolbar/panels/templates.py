from debug_toolbar.panels import DebugPanel
from django.conf import settings
from django.dispatch import dispatcher
from django.core.signals import request_started
from django.test.signals import template_rendered
from django.template.loader import render_to_string
from django.utils import simplejson
from django import template

from debug_toolbar.stats import track, STATS

template.Template.render = track(template.Template.render, 'templates:django')

try:
    import jinja2
except ImportError:
    pass
else:
    jinja2.Environment.get_template = track(jinja2.Environment.get_template, 'templates:jinja2')

try:
    import jinja
except ImportError:
    pass
else:
    jinja.Environment.get_template = track(jinja.Environment.get_template, 'templates:jinja')

class TemplatesDebugPanel(DebugPanel):
    """
    Panel that displays information about the SQL queries run while processing the request.
    """
    name = 'Templates'

    def process_ajax(self, request):
        action = request.GET.get('op')
        if action == 'explain':
            return render_to_response('debug_toolbar/panels/templates_explain.html')

    def title(self):
        return 'Templates: %d' % (STATS.get_total_calls('templates:django') + \
                STATS.get_total_calls('templates:jinja') + \
                STATS.get_total_calls('templates:jinja2'),)

    def url(self):
        return ''

    def content(self):
        context = dict(
            template_calls = STATS.get_total_calls('templates:django') + \
                    STATS.get_total_calls('templates:jinja') + \
                    STATS.get_total_calls('templates:jinja2'),
            template_time = STATS.get_total_time('templates:django') + \
                    STATS.get_total_time('templates:jinja') + \
                    STATS.get_total_time('templates:jinja2'),
            template_calls_list = [(c['time'], c['args'][0].name, 'django', simplejson.dumps(c['stack'])) for c in STATS.get_calls('templates:django')] + \
                    [(c['time'], c['args'][1], 'jinja', simplejson.dumps(c['stack'])) for c in STATS.get_calls('templates:jinja')] + \
                    [(c['time'], c['args'][1], 'jinja2', simplejson.dumps(c['stack'])) for c in STATS.get_calls('templates:jinja2')],
        )
        return render_to_string('debug_toolbar/panels/templates.html', context)