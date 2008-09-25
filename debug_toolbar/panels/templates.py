from debug_toolbar.panels import DebugPanel
from django.conf import settings
from django.dispatch import dispatcher
from django.core.signals import request_started
from django.test.signals import template_rendered
from django.template.loader import render_to_string
from django.utils import simplejson
from django import template

from debug_toolbar.stats import track, STATS

template.Template.render = track(template.Template.render, 'templates')
    
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
        return 'Template: %.2fms' % STATS.get_total_time('templates')

    def url(self):
        return ''

    def content(self):
        context = dict(
            template_calls = STATS.get_total_calls('templates'),
            template_time = STATS.get_total_time('templates'),
            template_calls_list = [(c['time'], c['func'].__name__, c['args'], c['kwargs'], simplejson.dumps(c['stack'])) for c in STATS.get_calls('templates')],
        )
        return render_to_string('debug_toolbar/panels/templates.html', context)