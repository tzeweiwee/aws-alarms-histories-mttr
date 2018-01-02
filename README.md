# aws-alarms-histories-mttr

### Requires
1. Node
2. AWS Account/Setup your credentials first

This helps to measure *Mean Time To Recover* for DevOps metric for Cloudwatch Alarms. The measurements began when the alarm state change state from OK to ALARM. When the alarm turns to OK, the measurement stops.

The script basically runs an aws command that provides alarm histories (some sort of logs). Simple javascript is used to process the histories and outputs 2 csvs.

### Usage

0. insert alarm names in pull-alarms-history.sh
1. npm install
2. run pull-alarms-history.sh with bash
3. sh pull-alarms-history.sh
