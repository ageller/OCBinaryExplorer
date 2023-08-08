#!/bin/bash

source /home/www-worker/.bashrc

gunicorn server:app --workers 3 --bind 0.0.0.0:5000 --reload