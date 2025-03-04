#!/usr/bin/env python
"""
Command-line utility for administrative tasks.

# For more information about this file, visit
# https://docs.djangoproject.com/en/2.1/ref/django-admin/
"""

import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault(
        'DJANGO_SETTINGS_MODULE',
        'o1.settings')
    try:
        from django.core.management import execute_from_command_line
        from django.conf import settings
        print("Installed apps:", settings.INSTALLED_APPS)
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
