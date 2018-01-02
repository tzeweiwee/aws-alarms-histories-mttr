alarmsNames=(
"cpp-review-ingest-service-js-prod-ReviewsDataProcessorQueueDepthAlarm-9EOD9W09F6BA"
"CPP SG Prod PAPI 5XX Errors"
"awseb-e-suxcwyqati-stack-ELB5XXBackendErrorCloudwatchAlarmCPPReact-M80GXSAJ8NHQ"
"awseb-e-s6rcap2wp7-stack-ELB5XXBackendErrorCloudwatchAlarmCPPReact-1G2MLDLKT9ME4"
"CPP SG Prod Reviews Action"
"cpp-review-ingest-service-js-prod-ReviewsDataProcessorQueueOldestMessageAlarm-QCAD41DZQHCZ"
"cpp-review-ingest-service-js-prod-PartialIngestSnsFailedNotificationDeliveryAlarm-XUHO3MVZ0KLS"
"cpp-review-ingest-service-jobsdb-prod-APIGatewayIntegrationLatencyCloudWatchAlarm-J3AO0IVWX3VU"
)

output="alarmsHistory.json"
pos=$(( ${#alarmsNames[*]} - 1 ))
last=${alarmsNames[$pos]}


rm $output
echo { "\"data\":" [ >> $output
for alarm in "${alarmsNames[@]}"
do
  echo "=========="
  echo "fetching " $alarm
  aws cloudwatch describe-alarm-history --alarm-name "$alarm" --history-item-type StateUpdate &>> $output
  if [[ $alarm == $last ]]
  then
     break
  else 
     echo , >> $output
  fi
done
echo ] } >> $output
echo "==========="
echo "Done Pulling Data"
echo "Calculating Mean Time To Recover By Month"
node generateCloudwatchReport.js
echo "==========="