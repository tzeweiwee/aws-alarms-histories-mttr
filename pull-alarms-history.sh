alarmsNames=(
"Alarm 1"
"Alarm 2"
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
