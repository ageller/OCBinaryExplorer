#!/bin/bash

source /home/www-worker/.bashrc

gunicorn server:app --workers 9 --bind 127.0.0.1:5000