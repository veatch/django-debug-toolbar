#!/usr/bin/env python

from setuptools import setup, find_packages

setup(
    name='django-debug-toolbar',
    version='.'.join(map(str, __import__('debug_toolbar').__version__)),
    url='http://github.com/dcramer/django-debug-toolbar/',
    description = 'A debug toolbar overlay for Django.',
    author='David Cramer',
    author_email='dcramer@gmail.com',
    packages=find_packages(),
    include_package_data=True,
)
