exports.getLastTwelveMonths = () => {
	const months = [];
	const currentDate = new Date();
	for (let i = 0; i < 12; i++) {
	  const month = currentDate.getMonth() - i;
	  const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() - i) / 12);
	  const date = new Date(year, month, 1);
	  const monthNumber = date?.getMonth() + 1; // Get the month number
	  const formattedMonth = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
	  months.push(`${year}-${formattedMonth}&&${date.toLocaleString("default",{month:"long"})} ${year}`);
	}
	return months;
}
  
  