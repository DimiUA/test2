$hub = null;
window.NULL = null;
window.COM_TIMEFORMAT = 'YYYY-MM-DD HH:mm:ss';
window.COM_TIMEFORMAT2 = 'YYYY-MM-DDTHH:mm:ss';
function setUserinfo(user){localStorage.setItem("COM.QUIKTRAK.LIVE.USERINFO", JSON.stringify(user));}
function getUserinfo(){var ret = {};var str = localStorage.getItem("COM.QUIKTRAK.LIVE.USERINFO");if(str) {ret = JSON.parse(str);} return ret;}
function isJsonString(str){try{var ret=JSON.parse(str);}catch(e){return false;}return ret;}
function toTitleCase(str){return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}


var inBrowser = 0;
var loginDone = 0;

if( navigator.userAgent.match(/Windows/i) ){    
    inBrowser = 1;
}

function getPlusInfo(){
   /* if(window.plus) {
        window.uuid = plus.device.uuid;
        var info = plus.push.getClientInfo();
        localStorage["PUSH_MOBILE_TOKEN"] = info.token;
        localStorage["PUSH_APPID_ID"] = info.appid;
        localStorage["PUSH_APP_KEY"] = info.appkey;
        localStorage["PUSH_DEVICE_TOKEN"] = info.clientid;
        localStorage["DEVICE_TYPE"] = plus.os.name? plus.os.name : "UNKNOWN";
    }else{
        localStorage["PUSH_MOBILE_TOKEN"] = '';
        localStorage["PUSH_APPID_ID"] = '';
        localStorage["PUSH_APP_KEY"] = '';
        localStorage["PUSH_DEVICE_TOKEN"] = '';
        localStorage["DEVICE_TYPE"] = "UNKNOWN"; 
    }*/
}


document.addEventListener( "plusready", onPlusReady, false ); 

function onPlusReady(){   
	/*var pushManager = plus.android.importClass("com.igexin.sdk.PushManager");
    var context = plus.android.runtimeMainActivity();
    pushManager.getInstance().turnOnPush(context);*/
    getPlusInfo();
    /*if　(!localStorage.ACCOUNT){
        plus.push.clear();
    } */

    /*if (!inBrowser) {
        if(getUserinfo().MinorToken) {
            login();    
        }
        else {
            logout();
        } 
    }*/

    plus.key.addEventListener("backbutton", backFix, false);      
    //document.addEventListener("background", onAppBackground, false);
    //document.addEventListener("foreground", onAppForeground, false);    
    //document.addEventListener("resume", onAppReume, false);
    //document.addEventListener("pause", onAppPause, false);

    //plus.push.addEventListener("receive", onPushRecieve, false );
}

/*function onPushRecieve( msg ){
    //$hub.stop();
    var all_msg = plus.push.getAllMessage();
    if (all_msg.length === 0) {
        var message = {};
        all_msg = [];
        message.payload = msg.payload;        
        all_msg.push(message);
    }
    var popped = all_msg.pop();
    all_msg = [];
    all_msg.push(popped);
    
    setNotificationList(all_msg); 

    var loginTimer = setInterval(function() {
            if (loginDone) {
                clearInterval(loginTimer);
                processClickOnPushNotification(all_msg);
            }
        }, 1000);   
       
}*/
function onAppPause(){ 
    $hub.stop();
} 
function onAppReume(){ 
    $hub.start();
}  
function onAppBackground() {
    $hub.stop();
}
function onAppForeground() {
    $hub.start();
}

function backFix(event){
    var page=App.getCurrentView().activePage;        
    if(page.name=="index"){           
        var ws=plus.webview.currentWebview();
        App.confirm('Are you sure you want to close the application?', function () {        
            ws.close();
        });
    }else{
        mainView.router.back();
    } 
}

// Initialize your app
var App = new Framework7({
    swipePanel: 'left',   
    swipeBackPage: false,
    material: true,
    pushState: false,    
    allowDuplicateUrls: true,    
    sortable: false,    
    modalTitle: 'BoatWatch',
    precompileTemplates: true,
    template7Pages: true,
    onAjaxStart: function(xhr){
        App.showIndicator();
    },
    onAjaxComplete: function(xhr){
        App.hideIndicator();
    }   
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = App.addView('.view-main', {
    domCache: true,  
    swipeBackPage: false
});

window.PosMarker = {};
var MapTrack = null;
var TargetAsset = {};
var searchbar = null;
var virtualAssetList = null;
var trackTimer = false;
var playbackTimer = false;
var verifyCheck = {}; // for password reset
var POSINFOASSETLIST = {}; 
var HistoryArray = [];
var verifyCheck = {}; // for password reset

var API_DOMIAN1 = "http://api.m2mglobaltech.com/QuikTrak/V1/";
var API_DOMIAN2 = "";
var API_DOMIAN3 = "http://api.m2mglobaltech.com/QuikProtect/V1/";
var API_URL = {};
API_URL.URL_GET_LOGIN = API_DOMIAN1 + "User/Auth?username={0}&password={1}&appKey={2}&mobileToken={3}&deviceToken={4}&deviceType={5}";
API_URL.URL_GET_LOGOUT = API_DOMIAN1 + "User/Logoff2?MajorToken={0}&MinorToken={1}&username={2}&mobileToken={3}";
API_URL.URL_EDIT_ACCOUNT = API_DOMIAN1 + "User/Edit?MajorToken={0}&MinorToken={1}&FirstName={2}&SubName={3}&Mobile={4}&Phone={5}&EMail={6}";
API_URL.URL_EDIT_DEVICE = API_DOMIAN1 + "Device/Edit?MinorToken={0}&Code={1}&name={2}&speedUnit={3}&initMileage={4}&initAccHours={5}&attr1={6}&attr2={7}&attr3={8}&attr4={9}&tag={10}";
API_URL.URL_SET_ALARM = API_DOMIAN1 + "AlarmOptions?MajorToken={0}&MinorToken={1}&imei={2}&bilge={3}&power={4}&ignition={5}&geolock={6}";
API_URL.URL_GET_POSITION = API_DOMIAN1 + "Device/GetPosInfo?MinorToken={0}&Code={1}";
API_URL.URL_GET_POSITION_ARR = API_DOMIAN1 + "Device/GetHisPosArray?MinorToken={0}&Code={1}&From={2}&To={3}";
API_URL.URL_GET_ALL_POSITIONS = API_DOMIAN1 + "Device/GetPosInfos?MinorToken={0}";
API_URL.URL_RESET_PASSWORD = API_DOMIAN1 + "User/Password?MinorToken={0}&oldpwd={1}&newpwd={2}";

API_URL.URL_VERIFY_BY_EMAIL = API_DOMIAN3 + "Client/VerifyCodeByEmail?email={0}";
API_URL.URL_FORGOT_PASSWORD = API_DOMIAN3 + "Client/ForgotPassword?account={0}&newPassword={1}&checkNum={2}";


//http://api.m2mglobaltech.com/QuikTrak/V1/User/Auth?username=tongwei&password=888888&appKey=UcPXWJccwm7bcjvu7aZ7j5&deviceType=android&deviceToken=deviceToken&mobileToken=mobileToken
//http://api.m2mglobaltech.com/QuikTrak/V1/User/Logoff2?username=tongwei&MinorToken=8944cbf0-7749-4c5e-bdba-8b7c4e47229b&MajorToken=f9087bb0-47ba-4d31-a038-ea676fdf0de2&mobileToken=push mobiletoken
//http://api.m2mglobaltech.com/QuikTrak/V1/User/Edit?MinorToken=8944cbf0-7749-4c5e-bdba-8b7c4e47229b&MajorToken=f9087bb0-47ba-4d31-a038-ea676fdf0de2&FirstName=Tong&SubName=Wei&Mobile=&Phone=&EMail=tony@quiktrak.net
//http://api.m2mglobaltech.com/QuikTrak/V1/Device/Edit?MinorToken=588bcf33-1af5-4fb3-8939-0cbc8f949fb3&Code=6562656064&name=testname&speedUnit=KPH&initMileage=8&initAccHours=100&tag=testname1&attr1=Toyota &attr2=Landcruiser&attr3=Black&attr4=2010
//http://api.m2mglobaltech.com/QuikTrak/V1/Device/GetPosInfo?MinorToken=588bcf33-1af5-4fb3-8939-0cbc8f949fb3&Code=6562656064
//http://api.m2mglobaltech.com/QuikTrak/V1/Device/GetHisPosArray?MinorToken=588bcf33-1af5-4fb3-8939-0cbc8f949fb3&Code=6562656064&From=2017-02-11T10:00:00&To=2017-02-12T10:00:00
//http://api.m2mglobaltech.com/QuikTrak/V1/Device/GetPosInfos?MinorToken=588bcf33-1af5-4fb3-8939-0cbc8f949fb3
//http://api.m2mglobaltech.com/QuikTrak/V1/User/Password?MinorToken=588bcf33-1af5-4fb&oldpwd=888888&newpwd=888888

var html = Template7.templates.template_Login_Screen();
$$(document.body).append(html); 
html = Template7.templates.template_Popover_Menu();
$$(document.body).append(html);
html = Template7.templates.template_AssetList();
$$('.navbar-fixed').append(html);


//if (inBrowser) {
    if(getUserinfo().MinorToken) {
        login();    
    }
    else {
        logout();
    } 
//}

var virtualAssetList = App.virtualList('.assets_list', {
    // search item by item
    searchAll: function (query, items) {
        var foundItems = [];        
        for (var i = 0; i < items.length; i++) {           
            // Check if title contains query string
            if (items[i].Name.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0) foundItems.push(i);
        }
        // Return array with indexes of matched items
        return foundItems; 
    },       
    //List of array items
    items: [
    ],
    // Display the each item using Template7 template parameter
    renderItem: function (index, item) {
        var ret = '';
        var asset = POSINFOASSETLIST[item.IMEI];        
        var assetFeaturesStatus = Protocol.Helper.getAssetStateInfo(asset);
        if (!assetFeaturesStatus.stats) {
            ret +=  '<li class="item-link item-content item_asset" data-imei="' + item.IMEI + '" data-id="' + item.Id + '" title="No data">';                    
            ret +=      '<div class="item-media"><img src="resources/images/svg_asset.svg" alt=""></div>';
            ret +=      '<div class="item-inner">';
            ret +=          '<div class="item-title-row">';
            ret +=              '<div class="item-title">' + item.Name + '</div>';
            ret +=                  '<div class="item-after"><i class="icon-signal state-0"></i><i class="icon-satellite state-0"></i></div>';
            ret +=          '</div>';
            ret +=          '<div class="item-subtitle state-0"><i class="icon-status"></i>stopped</div>';
            ret +=      '</div>';                   
            ret +=  '</li>';
        }else{
            ret +=  '<li class="item-link item-content item_asset" data-imei="' + item.IMEI + '" data-id="' + item.Id + '">';                    
            ret +=      '<div class="item-media"><img src="resources/images/svg_asset.svg" alt=""></div>';
            ret +=      '<div class="item-inner">';
            ret +=          '<div class="item-title-row">';
            ret +=              '<div class="item-title">' + item.Name + '</div>';
            ret +=                  '<div class="item-after"><i id="signal-state'+item.IMEI+'" class="icon-signal '+assetFeaturesStatus.GSM.state+'"></i><i id="satellite-state'+item.IMEI+'" class="icon-satellite '+assetFeaturesStatus.GPS.state+'"></i></div>';
            ret +=          '</div>';
            ret +=          '<div id="status-state'+item.IMEI+'" class="item-subtitle '+assetFeaturesStatus.status.state+'"><i class="icon-status"></i><span id="status-value'+item.IMEI+'">'+assetFeaturesStatus.status.value+'</span></div>';
            ret +=          '<div class="item-text">';
            ret +=              '<div class="row no-gutter">';                            
                                if (assetFeaturesStatus.speed) {
            ret +=                  '<div class="col-50">';
            ret +=                     '<img class="asset_list_icon" src="resources/images/svg_ico_speed.svg" alt="">';
            ret +=                     '<span id="speed-value'+item.IMEI+'">'+assetFeaturesStatus.speed.value+'</span>'; 
            ret +=                  '</div>';
                                }
                                if (assetFeaturesStatus.voltage) {
            ret +=                  '<div class="col-50">';
            ret +=                     '<img class="asset_list_icon" src="resources/images/svg_ico_voltage.svg" alt="">';                
            ret +=                     '<span id="voltage-value'+item.IMEI+'">'+assetFeaturesStatus.voltage.value+'</span>';
            ret +=                  '</div>';
                                }  
                                if (assetFeaturesStatus.battery) {
            ret +=                  '<div class="col-50">';
            ret +=                     '<img class="asset_list_icon" src="resources/images/svg_ico_battery.svg" alt="">';                
            ret +=                     '<span id="battery-value'+item.IMEI+'">'+assetFeaturesStatus.battery.value+'</span>';
            ret +=                  '</div>';
                                }  
                                if (assetFeaturesStatus.temperature) {
            ret +=                  '<div class="col-50">';
            ret +=                     '<img class="asset_list_icon" src="resources/images/svg_ico_temperature.svg" alt="">';                
            ret +=                     '<span id="temperature-value'+item.IMEI+'">'+assetFeaturesStatus.temperature.value+'</span>';
            ret +=                  '</div>';
                                }
                                if (assetFeaturesStatus.fuel) {
            ret +=                  '<div class="col-50">';
            ret +=                     '<img class="asset_list_icon" src="resources/images/svg_ico_petrol.svg" alt="">';             
            ret +=                     '<span id="fuel-value'+item.IMEI+'">'+assetFeaturesStatus.fuel.value+'</span>'; 
            ret +=                  '</div>';
                                }
                                /*if (assetFeaturesStatus.driver){
            ret +=                  '<div class="col-50">';
            ret +=                      '<img class="asset_list_icon" src="resources/images/svg_ico_driver.svg" alt="">';
            ret +=                       '<span id="driver-value'+item.IMEI+'">'+assetFeaturesStatus.driver.value+'</span>';
            ret +=                  '</div>';
                                } */
            ret +=              '</div>';
            ret +=          '</div>';
            ret +=      '</div>';                   
            ret +=  '</li>';
        }
            
        return ret;
    },
});

$$('.btn_login').on('click', function () {    
    login();
});
$$('body').on('click', '.notification_button', function(e){
    $$('.notification_button').removeClass('new_not');

});
$$('.button_search').on('click', function(){        
    $('.searchbar').slideDown(400, function(){
        $$('.searchbar input').focus();
    });                
});

$$('#menu li').on('click', function () {
    var id = $$(this).attr('id');

    switch (id){
        case 'menuHome':
            mainView.router.back({              
              pageName: 'index', 
              force: true
            });         
            break;
        case 'menuProfile':
            loadProfilePage();
            break;        
        case 'menuLogout':
            App.confirm(LANGUAGE.PROMPT_MSG012, LANGUAGE.MENU_MSG04, function () {        
                logout();
            });
            break;
        
    }
});

$$(document).on('click', 'a.tab-link', function(e){
    e.preventDefault();   
    var currentPage = App.getCurrentView().activePage.name;        
    var page = $$(this).data('id');
    
    if (currentPage != page) {
        switch (page){
            case 'asset.status':
                loadStatusPage();
                break;
            case 'asset.playback':
                loadPlaybackPage();
                break;
            case 'asset.track':
                loadTrackPage();
                break;
            case 'asset.alarm':
                loadAlarmPage();
                break;

            case 'profile':
                loadProfilePage();
                break;
            case 'resetPwd':
                loadResetPwdPage();
                break;
        }
    }
    
    return false;
});

App.onPageInit('notification', function(page){

    virtualNotificationList = App.virtualList('.notification_list', { 
        items: [],
        renderItem: function (index, item) {
            var ret = '';
            switch (item.alarm){
                case 'Status':
                    ret = '<li class="swipeout" data-id="'+item.listIndex+'" data-alarm="'+item.alarm+'" >' +                        
                                '<div class="swipeout-content item-content">' +
                                    '<div class="item-inner">' +
                                        '<div class="item-title-row">' +
                                            '<div class="item-title">'+item.AssetName+'</div>' +
                                            '<div class="item-after">'+item.StatusTime+'</div>' +
                                        '</div>' +
                                        '<div class="item-subtitle">'+item.alarm+'</div>' +                                        
                                    '</div>' +
                                '</div>' +                      
                                '<div class="swipeout-actions-left">' +                             
                                    '<a href="#" class="swipeout-delete swipeout-overswipe" data-confirm="'+LANGUAGE.PROMPT_MSG001+'" data-confirm-title="'+LANGUAGE.PROMPT_MSG000+'" data-close-on-cancel="true">Delete</a>' +
                                '</div>' +
                            '</li>';
                    break;               
                default:
                    ret = '<li class="swipeout" data-id="'+item.listIndex+'" data-alarm="'+item.alarm+'" data-lat="'+item.Lat+'" data-lng="'+item.Lng+'" data-speed="'+item.Speed+'" data-direct="'+item.Direction+'" data-time="'+item.PositionTime+'" data-imei="'+item.Imei+'" data-name="'+item.AssetName+'" >' +                        
                                '<div class="swipeout-content item-content">' +
                                    '<div class="item-inner">' +
                                        '<div class="item-title-row">' +
                                            '<div class="item-title">'+item.AssetName+'</div>' +
                                            '<div class="item-after">'+item.PositionTime+'</div>' +
                                        '</div>' +
                                        '<div class="item-subtitle">'+item.alarm+'</div>' +                                        
                                    '</div>' +
                                '</div>' +                      
                                '<div class="swipeout-actions-left">' +                             
                                    '<a href="#" class="swipeout-delete swipeout-overswipe" data-confirm="'+LANGUAGE.PROMPT_MSG001+'" data-confirm-title="'+LANGUAGE.PROMPT_MSG000+'" data-close-on-cancel="true">Delete</a>' +
                                '</div>' +
                            '</li>';
            }
            return  ret;
        }
    });

    var user = localStorage.ACCOUNT;
    var notList = getNotificationList();                
    //console.log(notList[user]);
    showNotification(notList[user]); 
    
    var notificationWrapper = $$('.notification_list');

    notificationWrapper.on('deleted', '.swipeout', function () {
        var index = $$(this).data('id');       
        removeNotificationListItem(index);
    });    
    
    notificationWrapper.on('click', '.swipeout', function(){
       /* if ( !$$(this).hasClass('transitioning') ) {  //to preven click when swiping           
            var data = {};
            data.lat = $$(this).data('lat');
            data.lng = $$(this).data('lng');
            data.alarm = $$(this).data('alarm');
           
            if (data.lat && data.lng) {                             
                data.asset_id = $$(this).data('imei');                    
                data.name = $$(this).data('name');
                data.speed = $$(this).data('speed');
                data.direct = $$(this).data('direct');
                data.time = $$(this).data('time');

                loadPositionPage(data);
            }else if( data.alarm == 'Status' ){
                
                var index = $$(this).data('id');

                var list = getNotificationList();
                var user = localStorage["ACCOUNT"];
    
                var msg = list[user][index];
                console.log(msg);
                props = JSON.parse(msg.payload);
                mainView.router.load({
                    url:'resources/templates/asset.status.html',
                    context:{
                        Name: props.AssetName,
                        IMEI: props.Imei,
                        props: props,
                    }                      
                });
            }

        } */           
    });
});

App.onPageInit('forgotPwd', function(page) {
    App.closeModal();
    $$('.backToLogin').on('click', function(){
        App.loginScreen();
    });
    $$('.sendEmail').on('click', function(){
        var email = $$(page.container).find('input[name="Email"]').val();
        
        if (!email) {
            App.alert(LANGUAGE.PASSWORD_FORGOT_MSG01);
        }else{
            var url = API_URL.URL_VERIFY_BY_EMAIL.format(email);             
            App.showPreloader();
            JSON.request(url, function(result){                 
                    console.log(result);     

                    if (result.MajorCode == '000' && result.MinorCode == '0000') {
                        verifyCheck.email = email;
                        verifyCheck.CheckCode = result.Data.CheckCode;
                        mainView.router.loadPage('resources/templates/forgotPwdCode.html');    
                    }else{
                        App.alert(LANGUAGE.PASSWORD_FORGOT_MSG07);
                    }
                               
                    App.hidePreloader();   
                },
                function(){ App.hidePreloader();   }
            );
        }
     
    });
});
App.onPageInit('forgotPwdCode', function(page) {
    $$('.sendVerifyCode').on('click', function(){
        var VerifyCode = $$(page.container).find('input[name="VerifyCode"]').val();
        
        if (!VerifyCode) {
            App.alert(LANGUAGE.PASSWORD_FORGOT_MSG04);
        }else{
            if (VerifyCode == verifyCheck.CheckCode) {
                mainView.router.load({
                    url:'resources/templates/forgotPwdNew.html',
                    context:{
                        Email: verifyCheck.email
                    }
                });    
            }else{
                App.alert(LANGUAGE.PASSWORD_FORGOT_MSG08);
            }
        }
     
    });
});
App.onPageInit('forgotPwdNew', function(page) {
    $$('.sendPwdNew').on('click', function(){
        var email = $$(page.container).find('input[name="Email"]').val();
        var newPassword = $$(page.container).find('input[name="newPassword"]').val();
        var newPasswordRepeat = $$(page.container).find('input[name="newPasswordRepeat"]').val();
        
        if (!newPassword && newPassword.length < 6) {
            App.alert(LANGUAGE.PASSWORD_FORGOT_MSG05);
        }else{
            if (newPassword != newPasswordRepeat) {
                App.alert(LANGUAGE.PASSWORD_FORGOT_MSG10);
            }else{
                var url = API_URL.URL_FORGOT_PASSWORD.format(email,newPassword,verifyCheck.CheckCode);             
                App.showPreloader();
                JSON.request(url, function(result){ 
                        if (result.MajorCode == '000' && result.MinorCode == '0000') {
                            App.alert(LANGUAGE.PASSWORD_FORGOT_MSG12);
                            $$('#account').val(email);
                            App.loginScreen();

                            /*mainView.router.back({                             
                              pageName: 'index', 
                              force: true
                            }); */    
                        }else{
                            App.alert(LANGUAGE.PASSWORD_FORGOT_MSG11);
                        }
                                   
                        App.hidePreloader();   
                    },
                    function(){ App.hidePreloader();   }
                );
            }
        }
     
    });
});


$$('.assets_list').on('click', '.item_asset', function(){
    TargetAsset.ASSET_IMEI = $$(this).data("imei");  
    TargetAsset.ASSET_ID = $$(this).data("id");         
    var assetList = getAssetList();  
    var asset = assetList[TargetAsset.ASSET_IMEI];  

    loadStatusPage();
});


App.onPageInit('asset.status', function (page) {  
    $$('.buttonAssetEdit').on('click', function(){
         
        var assetList = getAssetList();  
        var asset = assetList[TargetAsset.ASSET_IMEI]; 

        console.log(asset);
        mainView.router.load({
        url:'resources/templates/asset.edit.html',
            context:{                
                IMEI: asset.IMEI,
                Name: asset.Name,
                Tag: asset.TagName,
                Unit: asset.Unit,
                Milage: asset.InitMilage,
                Runtime: asset.InitAcconHours,
                Describe1: asset.Describe1,
                Describe2: asset.Describe2,
                Describe3: asset.Describe3,
                Describe4: asset.Describe4,
            }
        });
        
    });
});
App.onPageInit('asset.edit', function (page) { 
    var selectUnitSpeed = $$('select[name="Unit"]');   
    selectUnitSpeed.val(selectUnitSpeed.data("set"));

    $$('.saveAssetEdit').on('click', function(){
        var device = {
            IMEI: $$(page.container).find('input[name="IMEI"]').val(),
            Name: $$(page.container).find('input[name="Name"]').val(),
            Tag: $$(page.container).find('input[name="Tag"]').val(),
            Unit: $$(page.container).find('select[name="Unit"]').val(),
            Milage: $$(page.container).find('input[name="Milage"]').val(),
            Runtime: $$(page.container).find('input[name="Runtime"]').val(),            
            Describe1: $$(page.container).find('input[name="Describe1"]').val(),
            Describe2: $$(page.container).find('input[name="Describe2"]').val(),
            Describe3: $$(page.container).find('input[name="Describe3"]').val(),
            Describe4: $$(page.container).find('input[name="Describe4"]').val(),
            
        };
        console.log(device);
        var userInfo = getUserinfo();         
        var url = API_URL.URL_EDIT_DEVICE.format(userInfo.MinorToken,
                TargetAsset.ASSET_ID,
                device.Name,
                device.Unit,
                device.Milage,
                device.Runtime,
                device.Describe1,
                device.Describe2,
                device.Describe3,
                device.Describe4,
                device.Tag
            );
    

        App.showPreloader();
        JSON.request(url, function(result){ 
                console.log(result);                  
                if (result.MajorCode == '000') {
                   
                    updateAssetList(device);
                    init_AssetList();                    
                }else{
                    App.alert('Something wrong');
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );                 
    });

});

App.onPageInit('profile', function (page) {     
    $$('.saveProfile').on('click', function(e){
        var user = {
            FirstName: $$(page.container).find('input[name="FirstName"]').val(),
            SubName: $$(page.container).find('input[name="SubName"]').val(),
            Mobile: $$(page.container).find('input[name="Mobile"]').val(),
            Phone: $$(page.container).find('input[name="Phone"]').val(),
            EMail: $$(page.container).find('input[name="EMail"]').val(),
        };
        var userInfo = getUserinfo(); 
        var url = API_URL.URL_EDIT_ACCOUNT.format(userInfo.MajorToken,
                userInfo.MinorToken,
                user.FirstName,
                user.SubName,
                user.Mobile,
                user.Phone,
                user.EMail
            ); 
        App.showPreloader();
        JSON.request(url, function(result){ 
                console.log(result);                  
                if (result.MajorCode == '000') {                    
                    userInfo.User = {
                        FirstName: FirstName,
                        SubName: SubName,
                        Mobile: Mobile,
                        Phone: Phone,
                        EMail: EMail,
                    };
                   
                    setUserinfo(userInfo);
                    
                    mainView.router.back();
                }else{
                    App.alert('Something wrong');
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        ); 
    });
});

App.onPageInit('resetPwd', function (page) {     
    $$('.saveResetPwd').on('click', function(e){    
        var password = {
            old: $$(page.container).find('input[name="Password"]').val(),
            new: $$(page.container).find('input[name="NewPassword"]').val(),
            confirm: $$(page.container).find('input[name="NewPasswordConfirm"]').val()
        };
        
        if ($$(page.container).find('input[name="NewPassword"]').val().length >= 6) {
            if (password.new == password.confirm) {
                var userInfo = getUserinfo(); 
                var url = API_URL.URL_RESET_PASSWORD.format(userInfo.MinorToken,
                        password.old,
                        password.new               
                    ); 
                console.log(url);
                App.showPreloader();
                JSON.request(url, function(result){ 
                        console.log(result);                  
                        if (result.MajorCode == '000') { 
                            App.alert(LANGUAGE.PROMPT_MSG003, function(){
                                logout();
                            });
                        }else{
                            App.alert('Wrong password');
                        }
                        App.hidePreloader();
                    },
                    function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
                ); 
            }else{
                App.alert(LANGUAGE.COM_MSG14);  //Passwords do not match
            }
        }else{
            App.alert(LANGUAGE.COM_MSG15); // Password should contain at least 6 characters
        }
    });
});

App.onPageInit('asset.alarm', function (page) {
    var alarm = $$(page.container).find('input[name = "checkbox-alarm"]');    
    var bilge = $$(page.container).find('input[name = "checkbox-bilge"]');
    var power = $$(page.container).find('input[name = "checkbox-power"]');
    var ignition = $$(page.container).find('input[name = "checkbox-ignition"]');
    var geolock = $$(page.container).find('input[name = "checkbox-geolock"]');
    var allCheckboxesLabel = $$(page.container).find('label.item-content');
    var allCheckboxes = allCheckboxesLabel.find('input');
    

    alarm.on('change', function(e) { 
        if( $$(this).prop('checked') ){
            allCheckboxes.prop('checked', true);
        }else{
            allCheckboxes.prop('checked', false);
        }
    });

    allCheckboxes.on('change', function(e) { 
        if( $$(this).prop('checked') ){
            alarm.prop('checked', true);
        }
    });    
    
    $$('.saveAlarm').on('click', function(e){        
        var alarmOptions = {
            IMEI: TargetAsset.ASSET_IMEI,
            Alarm: true,
            Bilge: true,
            Power: true,
            Ignition: true,
            Geolock: true
        };
        if (alarm.is(":checked")) {
            alarmOptions.Alarm = false;

            if (bilge.is(":checked")) {
                alarmOptions.Bilge = false;
            }
            if (power.is(":checked")) {
                alarmOptions.Power = false;
            }
            if (ignition.is(":checked")) {
                alarmOptions.Ignition = false;
            }
            if (geolock.is(":checked")) {
                alarmOptions.Geolock = false;
            }
        }

        
        var userInfo = getUserinfo(); 
        var url = API_URL.URL_SET_ALARM.format(userInfo.MajorToken,
                userInfo.MinorToken,
                alarmOptions.IMEI,
                alarmOptions.Bilge,
                alarmOptions.Power,
                alarmOptions.Ignition,
                alarmOptions.Geolock               
            ); 

                    alarmOptions.Alarm = !alarmOptions.Alarm;
                    alarmOptions.Bilge = !alarmOptions.Bilge;
                    alarmOptions.Power = !alarmOptions.Power;
                    alarmOptions.Ignition = !alarmOptions.Ignition;
                    alarmOptions.Geolock = !alarmOptions.Geolock;
                    setAlarmList(alarmOptions);
                    mainView.router.back();

        /*App.showPreloader();
        JSON.request(url, function(result){ 
                console.log(result);                  
                if (result.MajorCode == '000') { 
                    alarmOptions.Alarm = !alarmOptions.Alarm;
                    alarmOptions.Bilge = !alarmOptions.Bilge;
                    alarmOptions.Power = !alarmOptions.Power;
                    alarmOptions.Ignition = !alarmOptions.Ignition;
                    alarmOptions.Geolock = !alarmOptions.Geolock;
                    setAlarmList(alarmOptions);
                    mainView.router.back();
                }else{
                    App.alert('Something wrong');
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(result.ErrorMsg); }
        ); */
        
    });
        
});


App.onPageInit('asset.playback', function (page) {  
    var today = new Date();
 
    var pickerInlineStart = App.picker({
        input: '.picker-date-start',
        container: '.picker-date-start-container',
        toolbar: false,
        rotateEffect: true,
     
        value: [today.getMonth(), today.getDate(), today.getFullYear(), today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
     
        onChange: function (picker, values, displayValues) {
            var daysInMonth = new Date(picker.value[2], picker.value[0]*1 + 1, 0).getDate();
            if (values[1] > daysInMonth) {
                picker.cols[1].setValue(daysInMonth);
            }
        },
     
        formatValue: function (p, values, displayValues) {
            return displayValues[0] + ' ' + values[1] + ', ' + values[2] + ' ' + values[3] + ':' + values[4];
        },
     
        cols: [
            // Months
            {
                values: ('0 1 2 3 4 5 6 7 8 9 10 11').split(' '),
                displayValues: ('January February March April May June July August September October November December').split(' '),
                textAlign: 'left'
            },
            // Days
            {
                values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            },
            // Years
            {
                values: (function () {
                    var arr = [];
                    var endYear = today.getFullYear();
                    for (var i = 1950; i <= endYear; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Space divider
            {
                divider: true,
                content: '  '
            },
            // Hours
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ]
    });

    var pickerInlineEnd = App.picker({
        input: '.picker-date-end',
        container: '.picker-date-end-container',
        toolbar: false,
        rotateEffect: true,
     
        value: [today.getMonth(), today.getDate(), today.getFullYear(), today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
     
        onChange: function (picker, values, displayValues) {
            var daysInMonth = new Date(picker.value[2], picker.value[0]*1 + 1, 0).getDate();
            if (values[1] > daysInMonth) {
                picker.cols[1].setValue(daysInMonth);
            }
        },
     
        formatValue: function (p, values, displayValues) {
            return displayValues[0] + ' ' + values[1] + ', ' + values[2] + ' ' + values[3] + ':' + values[4];
        },
     
        cols: [
            // Months
            {
                values: ('0 1 2 3 4 5 6 7 8 9 10 11').split(' '),
                displayValues: ('January February March April May June July August September October November December').split(' '),
                textAlign: 'left'
            },
            // Days
            {
                values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            },
            // Years
            {
                values: (function () {
                    var arr = [];
                    var endYear = today.getFullYear();
                    for (var i = 1950; i <= endYear; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Space divider
            {
                divider: true,
                content: '  '
            },
            // Hours
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ]
    });  

    $$('.bw_btn_show').on('click', function(){    	
    	var from = $$(page.container).find('input[name="picker-date-start"]').val();
    	var to = $$(page.container).find('input[name="picker-date-end"]').val();
    	var datepickerFormat = 'MMMM D, YYYY H:mm';
    	
    	from = moment(from, datepickerFormat).format(window.COM_TIMEFORMAT2);
    	to = moment(to, datepickerFormat).format(window.COM_TIMEFORMAT2);    	
    	
    	getHisPosArray(from, to);
    });      

    $$('.bw_btn_show_24h').on('click', function(){    	
    	var from = moment().subtract(1, 'd').format(window.COM_TIMEFORMAT2);
    	var to = moment().format(window.COM_TIMEFORMAT2);
    	
    	getHisPosArray(from, to);
    });                            
 
});





App.onPageInit('asset.track', function (page) {     
    showMap();

    var posTime = $$(page.container).find('.position_time');
    var posDir = $$(page.container).find('.position_direction');
    var posSpeed = $$(page.container).find('.position_speed');
    var posAddress = $$(page.container).find('.display_address');

    $$('.startTrack').on('click', function(){       
        if (trackTimer) {
            clearInterval(trackTimer);
            trackTimer = false;
            App.addNotification({
                hold: 3000,
                message: LANGUAGE.PROMPT_MSG002                                   
            });
        }else{
            trackTimer = setInterval(function(){
                updateMarkerPositionTrack();
            }, 10000);
            App.addNotification({
                hold: 3000,
                message: LANGUAGE.PROMPT_MSG001                                       
            });
        } 
    });

    function updateMarkerPositionTrack(){
        var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];
        
        window.PosMarker[TargetAsset.ASSET_IMEI].setLatLng([asset.posInfo.lat, asset.posInfo.lng]);

        posTime.html(asset.posInfo.positionTime.format(window.COM_TIMEFORMAT));
        posDir.html(asset.posInfo.direct);
        posSpeed.html(Protocol.Helper.getSpeedValue(asset.Unit, asset.posInfo.speed) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit));
        MapTrack.setView([asset.posInfo.lat, asset.posInfo.lng]);

        var latlng = {};
        latlng.lat = asset.posInfo.lat;
        latlng.lng = asset.posInfo.lng;
       
        Protocol.Helper.getAddressByGeocoder(latlng,function(address){
            posAddress.html(address);
        });
    }
});

App.onPageBeforeRemove('asset.track', function(page){
    clearInterval(trackTimer);
    trackTimer = false;
});

App.onPageInit('asset.playback.show', function (page) { 

    var rangeInput = $$(page.container).find('input[name="rangeInput"]');
    var startPlayback = $$(page.container).find('.startPlayback');
    showMapPlayback();
    var valueMax = HistoryArray.length - 1;
    rangeInput.attr('max',valueMax);
    var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];

    var lastQueryPosinfo = {};//get last  query  position       

    var posTime = $$(page.container).find('.position_time');
    var posDir = $$(page.container).find('.position_direction');
    var posSpeed = $$(page.container).find('.position_speed');
    var posAddress = $$(page.container).find('.display_address');
    
    rangeInput.on('change input', function(){      
        var value = $$(this).val();
        updateMarkerPositionPlayback(value);
    });    
    
    startPlayback.on('click', function(){
        if (playbackTimer) {
            clearInterval(playbackTimer);
            playbackTimer = false;   
            App.addNotification({
                hold: 2000,
                message: LANGUAGE.PROMPT_MSG006                                       
            });         
        }else{
            App.addNotification({
                hold: 2000,
                message: LANGUAGE.PROMPT_MSG005                                       
            });
            playbackTimer = setInterval(function(){
                var value = rangeInput.val(); 
                if (value != valueMax) {
                    value++;
                    rangeInput.val(value);                    
                }else{
                    rangeInput.val(0);
                    value = 0;
                    clearInterval(playbackTimer);
                    updateMarkerPositionPlayback(0);
                    playbackTimer = false;  
                    App.addNotification({
                        hold: 3000,
                        message: LANGUAGE.PROMPT_MSG006                                       
                    });   
                } 
                updateMarkerPositionPlayback(value); 
            }, 1000);  


        } 
    }); 

    function updateMarkerPositionPlayback(value){
        window.PosMarker[TargetAsset.ASSET_IMEI].setLatLng([HistoryArray[value].lat, HistoryArray[value].lng]);
        posTime.html(moment(HistoryArray[value].positionTime,'X').format(window.COM_TIMEFORMAT));
        posDir.html(HistoryArray[value].direct);
        posSpeed.html(Protocol.Helper.getSpeedValue(asset.Unit, HistoryArray[value].speed) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit));
        MapTrack.setView([HistoryArray[value].lat, HistoryArray[value].lng]);        
        if(lastQueryPosinfo && Math.floor(HistoryArray[value].lat * 10000) / 10000 === lastQueryPosinfo.lat && Math.floor(HistoryArray[value].lng * 10000) / 10000 === lastQueryPosinfo.lng ){            
            posAddress.html(lastQueryPosinfo.address);
        }else{    
            var latlng = {
                lat: HistoryArray[value].lat,
                lng: HistoryArray[value].lng
            };
            Protocol.Helper.getAddressByGeocoder(latlng,function(address){
                lastQueryPosinfo = {lat : Math.floor(latlng.lat * 10000) / 10000, lng : Math.floor(latlng.lng * 10000) / 10000, address: address };
                posAddress.html(address);                
            });
        }
    } 
  
});

App.onPageBeforeRemove('asset.playback.show', function(page){
    clearInterval(playbackTimer);
    playbackTimer = false;
    HistoryArray = [];
});



function clearUserInfo(){
    
    var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
    var appId = !localStorage.PUSH_APPID_ID? '' : localStorage.PUSH_APPID_ID;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '' : localStorage.PUSH_DEVICE_TOKEN;
    var userName = !localStorage.ACCOUNT? '' : localStorage.ACCOUNT;
    var userInfo = getUserinfo();
    var MinorToken = userInfo.MinorToken;      
    var MajorToken = userInfo.MajorToken;
    window.PosMarker = {};
	TargetAsset = {};
	POSINFOASSETLIST = {}; 
    var alarmList = getAlarmList();    
    //var pushList = getNotificationList();
    
    localStorage.clear();   
    
    
    if (alarmList) {
        localStorage.setItem("COM.QUIKTRAK.LIVE.ALARMLIST", JSON.stringify(alarmList)); 
    }
    /*    
    if (pushList) {
        localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST", JSON.stringify(pushList));
    }*/
    
    if(MinorToken){  
    API_URL.URL_GET_LOGOUT = API_DOMIAN1 + "Logoff2?MajorToken={0}&MinorToken={1}&username={2}&mobileToken={3}";      
        JSON.request(API_URL.URL_GET_LOGOUT.format(MajorToken, MinorToken, userName, mobileToken), function(result){ console.log(result); });         
    }   
    $$("input[name='account']").val(userName);
}


function logout(){  
    clearUserInfo();
    App.loginScreen();   
}

function login(){    
    getPlusInfo();
    
    App.showPreloader();
    var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
    var appKey = !localStorage.PUSH_APPID_ID? '' : localStorage.PUSH_APPID_ID;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '' : localStorage.PUSH_DEVICE_TOKEN;
    var deviceType = !localStorage.DEVICE_TYPE? '' : localStorage.DEVICE_TYPE;
    var account = $$("input[name='account']");
    var password = $$("input[name='password']"); 

    var urlLogin = API_URL.URL_GET_LOGIN.format(!account.val()? localStorage.ACCOUNT: account.val(), 
                                     encodeURI(!password.val()? localStorage.PASSWORD: password.val()), 
                                     appKey, 
                                     mobileToken, 
                                     deviceToken, 
                                     deviceType);                                
    JSON.request(urlLogin, function(result){
           
            if(result.MajorCode == '000') {
                if(!!account.val()) {
                    localStorage.ACCOUNT = account.val();
                    localStorage.PASSWORD = password.val();
                }
                account.val(null);
                password.val(null);
                setUserinfo(result.Data);
                setAssetList(result.Data.Devices);               
               
                //init_AssetList(); 
                //initSearchbar();  
                     
                App.closeModal();                
            }else{                
                App.alert(LANGUAGE.LOGIN_MSG01);
            }
            App.hidePreloader();
        },
        function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
    ); 
   
}



function init_AssetList() {
    var assetList = getAssetList();   
    
    var newAssetlist = [];
    var keys = Object.keys(assetList);
    
    $.each(keys, function( index, value ) {        
        newAssetlist.push(assetList[value]);       
    });

    newAssetlist.sort(function(a,b){
        if(a.Name < b.Name) return -1;
        if(a.Name > b.Name) return 1;
        return 0;
    });
    
    mainView.router.back({
        pageName: 'index', 
        force: true
    }); 

    virtualAssetList.replaceAllItems(newAssetlist);   

    
    setTimeout(function(){
        var updateAssetsPosInfoTimer = setInterval(function(){
            updateAssetsPosInfo();
        }, 10000);
    }, 10000);
    
    
}

function initSearchbar(){    
    if (searchbar) {        
        searchbar.destroy();
    }
    searchbar = App.searchbar('.searchbar', {
        searchList: '.list-block-search',
        searchIn: '.item-title',
        found: '.searchbar-found',
        notFound: '.searchbar-not-found',
        onDisable: function(s){
            $(s.container).slideUp();
        }
    });
}



function loadProfilePage(){
    var userInfo = getUserinfo().User;    
    mainView.router.load({
        url:'resources/templates/profile.html',
        context:{
            FirstName: userInfo.FirstName,
            SubName: userInfo.SubName,
            Mobile: userInfo.Mobile,
            Phone: userInfo.Phone,            
            EMail: userInfo.EMail,            
        }
    });
}

function loadResetPwdPage(){
    mainView.router.load({
        url:'resources/templates/resetPwd.html',
        context:{
                     
        }
    });
}


function showMap(){ 
    var asset = TargetAsset.ASSET_IMEI;   
    var latlng = [POSINFOASSETLIST[asset].posInfo.lat, POSINFOASSETLIST[asset].posInfo.lng];
    MapTrack = Protocol.Helper.createMap({ target: 'map', latLng: latlng, zoom: 15 });        
    window.PosMarker[asset].addTo(MapTrack).bindPopup(POSINFOASSETLIST[asset].Name);
}

function showMapPlayback(){
    var asset = TargetAsset.ASSET_IMEI;   
    var latlng = [POSINFOASSETLIST[asset].posInfo.lat, POSINFOASSETLIST[asset].posInfo.lng];
    MapTrack = Protocol.Helper.createMap({ target: 'map', latLng: latlng, zoom: 15 }); 
    window.PosMarker[asset].addTo(MapTrack).bindPopup(POSINFOASSETLIST[asset].Name); 
    
    var polylinePoints = [];
         
    $.each( HistoryArray, function(index,value){  
        var point = new L.LatLng(value.lat, value.lng);
        polylinePoints.push(point);  
    });

    
    var polylineOptionsBG = {
            color: '#6199CC',            
            weight: 6,
            opacity: 1
        };
    var polylineOptions = {
            color: '#00B1FC',            
            weight: 3,
            opacity: 1
        };

    var polylineBG = new L.Polyline(polylinePoints, polylineOptionsBG);
    var polyline = new L.Polyline(polylinePoints, polylineOptions);
            
    MapTrack.addLayer(polylineBG).addLayer(polyline);                        

    // zoom the map to the polyline
    MapTrack.fitBounds(polyline.getBounds());
}


function loadStatusPage(){
    var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];
    var assetFeaturesStatus = Protocol.Helper.getAssetStateInfo(asset);
    var speed = Protocol.Helper.getSpeedValue(asset.Unit, asset.posInfo.speed) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit);
    var time = LANGUAGE.COM_MSG11;
    if (asset.posInfo.positionTime) {
        time = asset.posInfo.positionTime.format(window.COM_TIMEFORMAT);
    }
    
    var latlng = {};
    latlng.lat = asset.posInfo.lat;
    latlng.lng = asset.posInfo.lng;  
    var assetStats = {        
        voltage: false,
        acc: LANGUAGE.COM_MSG11,
        acc2: false,        
        milage: false,
        battery: false,
        fuel: false,
    };

    
    if (assetFeaturesStatus.acc) {
        assetStats.acc = assetFeaturesStatus.acc.value;
    }    
    if (assetFeaturesStatus.acc2) {
        assetStats.acc2 = assetFeaturesStatus.acc.value;
    }    
    if (assetFeaturesStatus.voltage) {
        assetStats.voltage = assetFeaturesStatus.voltage.value;
    }    
    if (assetFeaturesStatus.milage) {
        assetStats.milage = assetFeaturesStatus.milage.value;
    }    
    if (assetFeaturesStatus.battery) {
        assetStats.battery = assetFeaturesStatus.battery.value;
    }    
    if (assetFeaturesStatus.fuel) {
        assetStats.fuel = assetFeaturesStatus.fuel.value;
    }


    mainView.router.load({
        url:'resources/templates/asset.status.html',
        context:{
            Name: asset.Name,                           
            Time: time,
            Direction: asset.posInfo.direct,
            Speed: speed,                    
            Address: LANGUAGE.COM_MSG08,
            Voltage: assetStats.voltage,
            Acc: assetStats.acc,
            Acc2: assetStats.acc2,
            Milage: assetStats.milage,
            Battery: assetStats.battery,
            Fuel: assetStats.fuel
        }
    }); 

    Protocol.Helper.getAddressByGeocoder(latlng,function(address){
        $$('body .display_address').html(address);
    });
    
}

function loadAlarmPage(){
    var alarmList = getAlarmList();
    var alarmAsset = null;
    if (alarmList) {
        alarmAsset = alarmList[TargetAsset.ASSET_IMEI];
    }        
    var stateAlarm = true;
    var stateBilge = true;
    var statePower = true;
    var stateIgnition = true;
    var stateGeolock = true;
    if (alarmAsset) {
        stateAlarm = alarmAsset.Alarm;
        stateBilge = alarmAsset.Bilge;
        statePower = alarmAsset.Power;
        stateIgnition = alarmAsset.Ignition;
        stateGeolock = alarmAsset.Geolock;
    }
    mainView.router.load({
        url:'resources/templates/asset.alarm.html',
        context:{
            Name: POSINFOASSETLIST[TargetAsset.ASSET_IMEI].Name,
            Alarm: stateAlarm,
            Bilge: stateBilge,
            Power: statePower,
            Ignition: stateIgnition,
            Geolock: stateGeolock
        }
    });
}

function loadPlaybackPage(){
	var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];

	mainView.router.load({
        url:'resources/templates/asset.playback.html',
        context:{
            Name: asset.Name, 
        }
    });
}

function loadTrackPage(){
    var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];
    
    if (parseFloat(asset.posInfo.lat) !== 0 && parseFloat(asset.posInfo.lng) !== 0) {
        var boatMarker = L.icon({
            iconUrl: 'resources/images/mark_boat.png',                       
            iconSize:     [100, 100], // size of the icon                        
            iconAnchor:   [50, 99], // point of the icon which will correspond to marker's location                        
            popupAnchor:  [0, -100] // point from which the popup should open relative to the iconAnchor    
        });
        
        window.PosMarker[TargetAsset.ASSET_IMEI] = L.marker([asset.posInfo.lat, asset.posInfo.lng], {icon: boatMarker}); 
        window.PosMarker[TargetAsset.ASSET_IMEI].setLatLng([asset.posInfo.lat, asset.posInfo.lng]);    
        var speed = Protocol.Helper.getSpeedValue(asset.Unit, asset.posInfo.speed) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit);

        mainView.router.load({
            url:'resources/templates/asset.track.html',
            context:{
                Name: asset.Name,                           
                Time: asset.posInfo.positionTime.format(window.COM_TIMEFORMAT),
                Direction: asset.posInfo.direct,
                Speed: speed,                    
                Address: LANGUAGE.COM_MSG08
            }
        });

        var latlng = {};
        latlng.lat = asset.posInfo.lat;
        latlng.lng = asset.posInfo.lng;

        Protocol.Helper.getAddressByGeocoder(latlng,function(address){
            $$('body .display_address').html(address);
        });
    }else{
        App.alert(LANGUAGE.PROMPT_MSG004);
    }
        
}

function getHisPosArray(from, to){
	var MinorToken = getUserinfo().MinorToken;

	var url = API_URL.URL_GET_POSITION_ARR.format(MinorToken, 
    		TargetAsset.ASSET_ID,
    		from,
    		to);      
    App.showPreloader();
   
	JSON.request(url, function(result){	       
	                          
	        if(result.MajorCode == '000') {
	        	var hisArray = result.Data.HisArry;  
	        	if (hisArray.length === 0) {
	        		App.addNotification({
		                hold: 5000,
		                message: LANGUAGE.COM_MSG05                                   
		            });
	        	}else{
                    setHistoryArray(hisArray);

	        		var asset = POSINFOASSETLIST[TargetAsset.ASSET_IMEI];
	        		var firstPoint = hisArray[0];
	        		var latlng = {};
	        		latlng.lat = firstPoint[1];
	        		latlng.lng = firstPoint[2];
	        		
	        		var speed = Protocol.Helper.getSpeedValue(asset.Unit, firstPoint[4]) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit);
                    var direct = firstPoint[3];
					var time = moment(firstPoint[0],'X').format(window.COM_TIMEFORMAT);                    

					var boatMarker = L.icon({
				        iconUrl: 'resources/images/mark_boat.png',                       
				        iconSize:     [100, 100], // size of the icon                        
				        iconAnchor:   [50, 99], // point of the icon which will correspond to marker's location                        
				        popupAnchor:  [0, -100] // point from which the popup should open relative to the iconAnchor    
				    });
				    
				    window.PosMarker[TargetAsset.ASSET_IMEI] = L.marker([latlng.lat, latlng.lng], {icon: boatMarker}); 
				    window.PosMarker[TargetAsset.ASSET_IMEI].setLatLng([latlng.lat, latlng.lng]);
				    POSINFOASSETLIST[TargetAsset.ASSET_IMEI].posInfo.lat = latlng.lat;
					POSINFOASSETLIST[TargetAsset.ASSET_IMEI].posInfo.lng = latlng.lng;

	        		mainView.router.load({
			        url:'resources/templates/asset.playback.show.html',
			            context:{
			                Name: asset.Name,
			                Time: time,
			                Direction: direct,
			                Speed: speed,
			                Address: LANGUAGE.COM_MSG08			                
			            }
			        });

			        Protocol.Helper.getAddressByGeocoder(latlng,function(address){
				        $$('body .display_address').html(address);
				    });
	        	}
	        }else{                
	        	App.alert('Something wrong');
	        }
	        App.hidePreloader();
	    },
	    function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
	); 
}

function setHistoryArray(array){
    //console.log(array);
    HistoryArray = [];
    $.each( array, function(key,value){    	
    	if ( JSON.stringify(array[key]) !== JSON.stringify(array[key-1]) ) {
	        var index = 0;
	        var point = {};
	        point.positionTime = value[index++];
	        point.lat = value[index++];
	        point.lng = value[index++];
	        point.direct = value[index++];
	        point.speed = value[index++];
	        point.timeSpan = value[index++];
	        point.milage = value[index++];
	        point.alerts = value[index++];
	        point.status = value[index++];

	        HistoryArray.push(point);
	    }
    });
}

function updateAssetsPosInfo(){    
    var userInfo = getUserinfo();  
    var url = API_URL.URL_GET_ALL_POSITIONS.format(userInfo.MinorToken); 
    JSON.request(url, function(result){ 
            //console.log(result);                     
            if (result.MajorCode == '000') {
                var data = result.Data;  
                var posData = ''; 
                var imei = '';            
                $.each( data, function( key, value ) {  
                    posData = value;
                    imei = posData[1];                    
                    POSINFOASSETLIST[imei].initPosInfo(posData);                    
                }); 
                updateAssetsListStats();              
            }  
        },
        function(){ }
    ); 
}

function updateAssetsListStats(){
    var assetFeaturesStatus = '';
    var state = '';
    var value = '';        
    $.each( POSINFOASSETLIST, function( key, val ) {          
        assetFeaturesStatus = Protocol.Helper.getAssetStateInfo(POSINFOASSETLIST[key]); 
        if (assetFeaturesStatus.GSM) {
            state = $$("#signal-state"+key);
            state.removeClass('state-0 state-1 state-2 state-3');         
            state.addClass(assetFeaturesStatus.GSM.state);  
        } 
        if (assetFeaturesStatus.GPS) {
            state = $$("#satellite-state"+key);
            state.removeClass('state-0 state-1 state-2 state-3');  
            state.addClass(assetFeaturesStatus.GPS.state); 
        } 
        if (assetFeaturesStatus.status) {
            state = $$("#status-state"+key);
            state.removeClass('state-0 state-1 state-2 state-3');  
            state.addClass(assetFeaturesStatus.status.state);  
            value = $$("#status-value"+key);        
            value.html(assetFeaturesStatus.status.value); 
        }   

        if (assetFeaturesStatus.speed) {
            value = $$("#speed-value"+key);        
            value.html(assetFeaturesStatus.speed.value);   
        }  
        if (assetFeaturesStatus.temperature) {
            value = $$("#temperature-value"+key);        
            value.html(assetFeaturesStatus.temperature.value);   
        }  
        if (assetFeaturesStatus.fuel) {
            value = $$("#fuel-value"+key);        
            value.html(assetFeaturesStatus.fuel.value);   
        } 
        if (assetFeaturesStatus.voltage) {
            value = $$("#voltage-value"+key);        
            value.html(assetFeaturesStatus.voltage.value);   
        }  
        if (assetFeaturesStatus.battery) {
            value = $$("#battery-value"+key);        
            value.html(assetFeaturesStatus.battery.value);   
        }  
        /*if (assetFeaturesStatus.driver) {
            value = $$("#driver-value"+key);        
            value.html(assetFeaturesStatus.battery.value); 
        } */   
    }); 
}

function setAssetList(list){    
    var ary = {};    
    for(var i = 0; i < list.length; i++) { 
        var index = 0;    
        ary[list[i][1]] = {                      
            Id: list[i][index++],
            IMEI: list[i][index++],
            Name: list[i][index++],
            TagName: list[i][index++],
            Icon: list[i][index++],
            Unit: list[i][index++], 
            InitMilage: list[i][index++],
            InitAcconHours: list[i][index++],
            State: list[i][index++],
            ActivateDate: list[i][index++],
            PRDTName: list[i][index++],
            PRDTFeatures: list[i][index++],
            PRDTAlerts: list[i][index++],
            Describe1: list[i][index++],
            Describe2: list[i][index++],
            Describe3: list[i][index++],
            Describe4: list[i][index++],
            Describe5: list[i][index++],
            _FIELD_FLOAT1: list[i][index++],
            _FIELD_FLOAT2: list[i][index++],
        };        
    }
    setAssetListPosInfo(ary);    
    localStorage.setItem("COM.QUIKTRAK.LIVE.ASSETLIST", JSON.stringify(ary));
}
function getAssetList(){
    var ret = null;
    var str = localStorage.getItem("COM.QUIKTRAK.LIVE.ASSETLIST");
    if(str)
    {
        ret = JSON.parse(str);              
    }
    return ret;
}
function updateAssetList(asset){
    var list = getAssetList();    
       
    POSINFOASSETLIST[asset.IMEI].IMEI = list[asset.IMEI].IMEI = asset.IMEI;
    POSINFOASSETLIST[asset.IMEI].Name = list[asset.IMEI].Name = asset.Name;
    POSINFOASSETLIST[asset.IMEI].TagName = list[asset.IMEI].TagName = asset.Tag;
    POSINFOASSETLIST[asset.IMEI].Unit = list[asset.IMEI].Unit = asset.Unit;
    POSINFOASSETLIST[asset.IMEI].Milage = list[asset.IMEI].Milage = asset.Milage;
    POSINFOASSETLIST[asset.IMEI].Runtime = list[asset.IMEI].Runtime = asset.Runtime;
    POSINFOASSETLIST[asset.IMEI].Describe1 = list[asset.IMEI].Describe1 = asset.Describe1;
    POSINFOASSETLIST[asset.IMEI].Describe2 = list[asset.IMEI].Describe2 = asset.Describe2;
    POSINFOASSETLIST[asset.IMEI].Describe3 = list[asset.IMEI].Describe3 = asset.Describe3;
    POSINFOASSETLIST[asset.IMEI].Describe4 = list[asset.IMEI].Describe4 = asset.Describe4; 

    
    localStorage.setItem("COM.QUIKTRAK.LIVE.ASSETLIST", JSON.stringify(list));
}

function setAssetListPosInfo(listObj){    
    var userInfo = getUserinfo();   

    var url = API_URL.URL_GET_ALL_POSITIONS.format(userInfo.MinorToken); 
    JSON.request(url, function(result){                          
            if (result.MajorCode == '000') {
                var data = result.Data;               
                $.each( data, function( key, value ) {  
                    var posData = value;
                    var imei = posData[1];
                    var protocolClass = posData[2];
                    var deviceInfo = listObj[imei];               
                    
                    POSINFOASSETLIST[imei] = Protocol.ClassManager.get(protocolClass, deviceInfo);
                    POSINFOASSETLIST[imei].initPosInfo(posData); 
                });
                init_AssetList(); 
                initSearchbar(); 
                App.hidePreloader();
            }  
        },
        function(){ }
    ); 
}

function updateAssetListPosInfo(posData){                                   
    POSINFOASSETLIST[posData[1]].initPosInfo(posData);
}

function setAlarmList(options){
    var list = getAlarmList();
    if (!list) {        
        list = {};       
    }      
    list[options.IMEI]={
        IMEI: options.IMEI,
        Alarm: options.Alarm,
        Bilge: options.Bilge,
        Power: options.Power,
        Ignition: options.Ignition,
        Geolock: options.Geolock
    };
    console.log(list);
    
    localStorage.setItem("COM.QUIKTRAK.LIVE.ALARMLIST", JSON.stringify(list));   
}
function getAlarmList(){
    var ret = null;var str = localStorage.getItem("COM.QUIKTRAK.LIVE.ALARMLIST");if(str){ret = JSON.parse(str);}return ret;
}


function removeNotificationListItem(index){
    var list = getNotificationList();
    var user = localStorage.ACCOUNT;
    
    list[user].splice(index, 1);
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST", JSON.stringify(list));
    var existLi = $$('.notification_list li');
    index = existLi.length - 2;
    existLi.each(function(){
        var currentLi = $$(this);
        if (!currentLi.hasClass('deleting')) {
            currentLi.attr('data-id', index);
            index--;
        }
    });
    virtualNotificationList.clearCache();    
}
function setNotificationList(list){ 
    var pushList = getNotificationList();    
    var user = localStorage.ACCOUNT; 
    if (pushList) { 
        if (!pushList[user]) {
            pushList[user] = [];
        }
    }else{
        pushList = {};
        pushList[user] = [];
    }     
    if (Array.isArray(list)) {
       
        for (var i = 0; i < list.length; i++) {            
            var msg = isJsonString(list[i].payload);
            if (msg) {
                if (msg.alarm == "status") {
                    msg.StatusTime = moment().format(window.COM_TIMEFORMAT);
                    msg = JSON.stringify(msg);
                    list[i].payload = msg;
                }else{                    
                    if (msg.PositionTime) {
                        var localTime  = moment.utc(msg.PositionTime).toDate();
                        msg.PositionTime = moment(localTime).format(window.COM_TIMEFORMAT);
                        list[i].payload = msg;                        
                    }                
                }  
                /*if recieved push and notification when app running, remove one of them */
                /*var popped = pushList[user].pop(); 
                if (JSON.stringify(popped) !== JSON.stringify(list[i]) ) {
                    pushList[user].push(popped);
                } */       
                pushList[user].push(list[i]);
            }                                
        }    
    }
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST", JSON.stringify(pushList));
}

function getNotificationList(){
    var ret = {};var str = localStorage.getItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST");if(str) {ret = JSON.parse(str);}return ret;
}

function clearNotificationList(){
    var list = getNotificationList();
    var user = localStorage.ACCOUNT;   
    if(list) {
        list[user] = [];
    }
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST", JSON.stringify(list));
}

function showNotification(list){    
    var data = null;
    if (list) {       
        for (var i = 0; i < list.length; i++) {                 
            var isJson = isJsonString(list[i].payload);
            if (isJson) {
                data = isJson;                
            }else{
                data = list[i].payload;                
            } 
            if (data) {
                var index = $('.notification_list li').first().data('id');                                   
                if (typeof index == "undefined") {
                    data.listIndex = 0;
                }else{
                    index = index+1;                       
                    data.listIndex = index; 
                }
                 
                if (data.PositionTime) {
                    data.PositionTime = data.PositionTime.replace("T", " ");
                }
                //console.log(data); 
                data.alarm = toTitleCase(data.alarm);
                virtualNotificationList.prependItem(data); 
            }
        }
    }
    //console.log(list);
    
}

function processClickOnPushNotification(msgJ){
    var msg = isJsonString(msgJ[0].payload);
    if (!msg) {                  
        msg = msgJ[0].payload;     
    }
    if (msg.AssetName && msg.alarm) {
        $$('.notification_button').removeClass('new_not');                     
        var message = msg.AssetName+'</br>'+msg.alarm;
        var data = {};
        data.lat = msg.Lat;
        data.lng = msg.Lng;
        data.alarm = msg.alarm;
               
        /*if (data.lat && data.lng) {                             
            data.asset_id = msg.Imei;
            data.name = msg.AssetName;
            data.speed = msg.Speed;
            data.direct = msg.Direction;
            data.time = msg.PositionTime.replace("T", " ");
            loadPositionPage(data);                     
        }else if(data.alarm == 'status'){
            loadStatusPage(msg);
        }else{                    
            mainView.router.loadPage('resources/templates/notification.html');
        }  */        
    }            
}

function showMsgNotification(arrMsgJ){
    console.log(arrMsgJ);
    var msg = isJsonString(arrMsgJ[0].payload);
    if (!msg) {               
        msg = arrMsgJ[0].payload;
    }
    if (msg.alarm && msg.AssetName) {
        var message = msg.AssetName+'</br>'+msg.alarm;        
        App.addNotification({
            hold: 5000,
            message: message,
            button: {
                text: LANGUAGE.COM_MSG12,
                close: false,         
            },
            onClick: function () { 
                App.closeNotification('.notifications');
                $$('.notification_button').removeClass('new_not'); 
                var data = {};
                data.lat = msg.Lat;
                data.lng = msg.Lng;
                data.alarm = msg.alarm;
                   
                if (data.lat && data.lng) {                             
                    data.asset_id = msg.Imei;
                    data.name = msg.AssetName;
                    data.speed = msg.Speed;
                    data.direct = msg.Direction;
                    data.time = msg.PositionTime.replace("T", " ");

                    loadPositionPage(data);                     
                }else if(data.alarm == 'status'){
                    loadStatusPage(msg);
                    
                }else{                
                    mainView.router.loadPage('resources/templates/notification.html');
                }
            },                          
        }); 
        
    }       
}