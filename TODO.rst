* Change all stack traces to capture the entire traceback and output it similar to Django errors.
* Add options for managing middleware security.
* Add pygments support (or an alternative js syntax highlighter).
* Add priorities to panels. Higher priority means execute request sooner, and response later.
* Remove the use of the GET request to store variables which aren't needed by the ajax request (e.g. SQL panel). This means the window which shows the results needs to be able to store both ajax results + already built html.