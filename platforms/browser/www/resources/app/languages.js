window.LanguagePackages= {
	"zh":{
		
	},
	"en":{
		"COM_MSG00": "SAVE",		
		"COM_MSG02": "Network connection failed.",
		"COM_MSG03": "Command sent",
		"COM_MSG04": "Cancel",
		"COM_MSG05": "Nothing found",
		"COM_MSG06": "Search",
		"COM_MSG07": "Send",
		"COM_MSG08": "Loading...",
		"COM_MSG09": "Latitude",
		"COM_MSG10": "Longitude",
		"COM_MSG11": "No data",
		"COM_MSG12": "show",
		"COM_MSG13": "show last 24h",
		"COM_MSG14": "Passwords do not match",
		"COM_MSG15": "Password should contain at least 6 characters",
		"PROMPT_MSG001": "Live tracking started",
		"PROMPT_MSG002": "Live tracking stopped",
		"PROMPT_MSG003": "Password has been changed. Please, login with new credential",
		"PROMPT_MSG004": "No data position for this device",
		"PROMPT_MSG005": "Playback started",
		"PROMPT_MSG006": "Playback stopped",
		"PROMPT_MSG012": "Are you sure you want to exit the application?",		
		"LOGIN_MSG01": "The login(email) or password you entered is incorrect.",
		"LOGIN_MSG02": "Username / Email",
		"LOGIN_MSG03": "Password",
		"LOGIN_MSG04": "Login",
		"LOGIN_MSG05": "Forget password?",
		"MENU_MSG00": "My assets",
		"MENU_MSG01": "",
		"MENU_MSG02": "",
		"MENU_MSG03": "Profile",
		"MENU_MSG04": "Logout",
		"PROFILE_MSG00": "USER",
		"PROFILE_MSG01": "First Name",
		"PROFILE_MSG02": "Last Name",
		"PROFILE_MSG03": "Mobile",
		"PROFILE_MSG04": "Password",
		"PROFILE_MSG05": "Current",
		"PROFILE_MSG06": "Confirm",
		"PROFILE_MSG07": "Phone",	
		"PROFILE_MSG08": "User profile",
		"PROFILE_MSG09": "New",
		
		"ALARM_MSG00": "Alarm Settings",
		"ALARM_MSG01": "Alarm",
		"ALARM_MSG02": "Bilge Alarm (to stop boat sinking)",
		"ALARM_MSG03": "Shore Power Disconnect",
		"ALARM_MSG04": "Ignition On Alarm",
		"ALARM_MSG05": "Geolock Alarm",
		"ASSET_STATUS_MSG00": "Date, time",
		"ASSET_STATUS_MSG01": "Direction",
		"ASSET_STATUS_MSG02": "Speed",
		"ASSET_STATUS_MSG03": "km/h",
		"ASSET_STATUS_MSG04": "stopped",
		"ASSET_STATUS_MSG05": "moving",
		"ASSET_STATUS_MSG06": "Voltage",
		"ASSET_STATUS_MSG07": "Status",
		"ASSET_STATUS_MSG08": "PlayBack",
		"ASSET_STATUS_MSG09": "Track",
		"ASSET_STATUS_MSG10": "Milage",
		"ASSET_STATUS_MSG11": "Battery",
		"ASSET_STATUS_MSG12": "Fuel",
		"ASSET_TRACK_MSG00": "Date, time",
		"ASSET_TRACK_MSG01": "Direction",
		"ASSET_TRACK_MSG02": "Speed",
		"ASSET_EDIT_MSG00": "Tag",
		"ASSET_EDIT_MSG01": "Name",
		"ASSET_EDIT_MSG02": "Unit Speed",
		"ASSET_EDIT_MSG03": "INITIAL",
		"ASSET_EDIT_MSG04": "Milage",
		"ASSET_EDIT_MSG05": "Runtime",
		"ASSET_EDIT_MSG06": "Attributes",
		"ASSET_EDIT_MSG07": "Make",
		"ASSET_EDIT_MSG08": "Model",
		"ASSET_EDIT_MSG09": "Color",
		"ASSET_EDIT_MSG10": "Year",
		"ASSET_PLAYBACK_MSG00": "SELECT THE START DATE AND TIME",
		"ASSET_PLAYBACK_MSG01": "SELECT THE END DATE AND TIME",
		"ASSET_PLAYBACK_MSG02": "",	
		"PASSWORD_FORGOT_MSG00": "Please, enter your registered E-mail address",
		"PASSWORD_FORGOT_MSG01": "Please, enter E-mail",
		"PASSWORD_FORGOT_MSG02": "Please, enter Verification Code that we have sent to your Email address",
		"PASSWORD_FORGOT_MSG03": "Verification Code",
		"PASSWORD_FORGOT_MSG04": "Please, enter Verification Code",
		"PASSWORD_FORGOT_MSG05": "Please, enter New Password(minimum 6 characters)",
		"PASSWORD_FORGOT_MSG06": "New Password",
		"PASSWORD_FORGOT_MSG07": "Incorrect E-mail",
		"PASSWORD_FORGOT_MSG08": "Incorrect Verification Code",
		"PASSWORD_FORGOT_MSG09": "Repeat password",
		"PASSWORD_FORGOT_MSG10": "Passwords do not match",		
		"PASSWORD_FORGOT_MSG11": "Incorrect Password, please use another",	
		"PASSWORD_FORGOT_MSG12": "Success! Password changed",			
		
		"NOTIFICATION_MSG00": "Notifications",
	},
	"es":{
			
	}
};
var lang = navigator.browserLanguage ? navigator.browserLanguage.toLowerCase() : navigator.language.toLowerCase();
if(lang.indexOf("en") >= 0) {
	lang = "en";
}
else if(lang.indexOf("es") >= 0) {
	lang = "es";
}
else if(lang.indexOf("zh") >= 0) {
	lang = "en";
}	
else {
	lang = "en";		
}
window.LANGUAGE = LanguagePackages[lang];
if(!Template7.global)
{
	Template7.global = {};
}

Template7.global.LANGUAGE = window.LANGUAGE;