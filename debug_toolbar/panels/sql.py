from debug_toolbar.panels import DebugPanel
from django.db import connection
from django.db.backends import util
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.utils import simplejson
import time
import inspect
import os.path

try: import cPickle as pickle
except ImportError: import pickle
import base64

# XXX: This is exploitable, what do we do?
def ajax_encode(data):
    return base64.b64encode(pickle.dumps(data))

def ajax_decode(data):
    if not data: return data
    return pickle.loads(base64.b64decode(data))
    
class DatabaseStatTracker(util.CursorDebugWrapper):
    """Replacement for CursorDebugWrapper which stores additional information
    in `connection.queries`."""
    
    def execute(self, sql, params=()):
        start = time.time()
        try:
            return self.cursor.execute(sql, params)
        finally:
            stop = time.time()
            # We keep `sql` to maintain backwards compatibility
            self.db.queries.append({
                'sql': self.db.ops.last_executed_query(self.cursor, sql, params),
                'time': (stop - start)*1000,
                'raw_sql': sql,
                'params': params,
                'ajax_params': ajax_encode({
                    'sql': sql,
                    'params': params,
                    'stack': [s[1:] for s in inspect.stack()],
                }),
            })

util.CursorDebugWrapper = DatabaseStatTracker

class SQLDebugPanel(DebugPanel):
    """
    Panel that displays information about the SQL queries run while processing the request.
    """
    name = 'SQL'
    
    def reformat_sql(self, sql):
        sql = sql.replace('`,`', '`, `')
        sql = sql.replace('` FROM `', '` \n  FROM `')
        sql = sql.replace('` WHERE ', '` \n  WHERE ')
        sql = sql.replace('`) WHERE ', '`) \n  WHERE ')
        sql = sql.replace(' ORDER BY ', ' \n  ORDER BY ')
        return sql
    
    def process_ajax(self, request):
        action = request.GET.get('op')
        if action == 'explain':
            # XXX: loop through each sql statement to output explain?
            params = ajax_decode(request.GET.get('params'))
            if not params:
                return
            if params['sql'].lower().startswith('select'):
                cursor = connection.cursor()
                cursor.execute("EXPLAIN %s" % (params['sql'],), params['params'])
                response = cursor.fetchall()
                headers = [h[0].replace('_', ' ') for h in cursor.description]
                cursor.close()
                context = {'headers': headers, 'explain': response, 'sql': self.reformat_sql(params['sql']), 'params': params['params'], 'stack': params['stack']}
                return render_to_response('debug_toolbar/panels/sql_explain.html', context)
            else:
                return HttpResponse('Invalid SQL', mimetype="text/plain")
    
    def process_request(self, request):
        self.queries_offset = len(connection.queries)
    
    def process_response(self, request, response):
        self.queries = connection.queries[self.queries_offset:]
        self.total_time = sum(map(lambda q: q['time'], self.queries))
        return response

    def title(self):
        return 'SQL: %.2fms (%d queries)' % (self.total_time, len(self.queries))

    def url(self):
        return ''

    def content(self):
        queries = [(q['time'], q['sql'], q['raw_sql'], q['ajax_params']) for q in sorted(self.queries, key=lambda x: x['time'])[::-1]]

        query_groups = {}
        for time, sql, raw_sql, ajax_params in queries:
            group = query_groups.get(raw_sql, (0, 0))
            query_groups[raw_sql] = (group[0]+time, group[1]+1)
        query_groups = sorted([(k, v[0], v[1]) for k, v in query_groups.iteritems()], key=lambda x: x[1])[::-1]
        
        context = {
            'queries': queries,
            'query_groups': query_groups,
        }
        return render_to_string('debug_toolbar/panels/sql.html', context)