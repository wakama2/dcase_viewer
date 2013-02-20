#!/bin/bash
mysql -u root -p < drop.sql
mysql -u root -p < DCaseCloud.sql
mysql -u root -p < init.sql
