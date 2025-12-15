#!/bin/bash

source /home/www-worker/.bashrc

gunicorn server:app --workers 9 --bind 0.0.0.0:5000 --reload