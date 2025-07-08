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
  
exports.getFormattedDate = (dateString) => {
	const date = new Date(dateString);
	const pad = (num) => { if(num < 10 ) { return `0${num}`} else return `${num}` };
	const monthNameArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const daySuffix = (day) => {
		if (day >= 11 && day <= 13) {
			return `${day}th`;
		}
		switch(day % 10){
			case 1: return `${day}st`;
			case 2: return `${day}nd`; 
			case 3: return `${day}rd`; 
			default: return `${day}th`; 
		}
	}
	const month = monthNameArray[date.getMonth()];
	const day = daySuffix(date.getDate());
	const year = date.getFullYear();
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const ampm = date?.getHours() > 12 ? 'pm' : 'am'
	return `${month} ${day} ${year}, ${hours}:${minutes}${ampm}`
}

exports.generateOTP = () => {
	const randomNumber = Math.floor(Math.random() * 90000) + 10000;
  	return randomNumber;
}

exports.getTrimmedObject = (obj) => {
	if(!Object.keys(obj)?.length > 0) return null;
	for(let key of Object.keys(obj)){
		if(typeof obj[key] === 'string'){
			obj[key] = obj[key].trim();
		} 
		else if ( typeof obj[key] === 'object'){
			obj[key] = getTrimmedObject(obj[key])
		}
	}
	return obj;
}