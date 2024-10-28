#!/bin/bash

source /home/www-worker/.bashrc

gunicorn server:app -limit-request-field-size 8190 --limit-request-line 4094 --workers 1 --bind 0.0.0.0:5000 --reload