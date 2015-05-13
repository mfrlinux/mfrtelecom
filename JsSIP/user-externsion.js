/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* ************************************************************************
 
    Licence : LGPLv3
 
    Version: 0.1
 
    Authors: deisss
 
    Date: 2012-08-30
 
    Date of last modification: 2012-08-30
 
    Description: Selenium user extension to add two multiple window management
************************************************************************ */
Selenium.prototype.doOpenMultipleWindow = function(maximum, options){
    /**
    * open many windows in a row
    *
    * @param maximum The number of window to open (up to 16 window)
    * @param options Add some extra options, we may have :
            {prefix : string} The prefix is used for catching the window id : like a prefix "win" with a number 2 will create win1 and win2 accessible as window ID
            {url : string} The url to load for every window
    */
 
    //Getting the screen width and screen height
    var maxWidth = this.browserbot.getUserWindow().screen.availWidth;
    var maxHeight = this.browserbot.getUserWindow().screen.availHeight;
 
    maximum = parseInt(maximum, 10);
 
    var param = {
        url : "",
        prefix : ""
    };
 
    if(typeof(options) !== "undefined"){
        var customOptions = options.split(",");
 
        for(var i=0; i<customOptions.length; i++){
            var onePair = customOptions[i];
            var nameAndValue = onePair.split("=");
 
            // rz: using String.trim from htmlutils.js of selenium to get rid of whitespace
            var name = new String(nameAndValue[0]).trim();
            var value = new String(nameAndValue[1]).trim();
            param[name] = value;
        }
    }
 
    //The creation and placement is directly linked to number
    for(var i=0; i<maximum; ++i){
        var windowID = param.prefix+(i+1);
        // this.openNewWindow(param.url, windowID);
        selenium.doOpenWindow(param.url, windowID.toString());
        selenium.doWaitForPopUp(windowID.toString(), "30000");
        selenium.doWaitForPageToLoad("30000");
    }
 
 
    var dividerWidth = 1, dividerHeight = 1;
    //Now they are all created, we can place them
    switch(maximum){
        case 1:                                                                     break;
        case 2:                             dividerWidth = 2;                       break;
        case 3:case 4:                      dividerWidth = 2;   dividerHeight = 2;  break;
        case 5:case 6:                      dividerWidth = 3;   dividerHeight = 2;  break;
        case 7:case 8:                      dividerWidth = 4;   dividerHeight = 2;  break;
        case 9:case 10:case 11:case 12:     dividerWidth = 4;   dividerHeight = 3;  break;
        case 13:case 14:case 15:case 16:    dividerWidth = 4;   dividerHeight = 4;  break;
        default:
            return;
    }
 
    var width = maxWidth/dividerWidth,
        height = maxHeight/dividerHeight;
    for(var i=0, j=0; i<maximum; ++i){
        var windowID = param.prefix+(i+1);
        selenium.doSelectWindow(windowID.toString());
        selenium.browserbot.getUserWindow().resizeTo(width, height);
 
        var newWidth = (i - (j * dividerWidth)) * width, newHeight = j * height;
 
        //Small bug, there is a small shift, correcting it...
        if(newWidth < 0){
            newWidth = -2 * newWidth;
            newHeight = ((j - 1) * height);
        }
 
        LOG.info('placing ' + windowID + ' at ' + Math.round(newWidth) + ' : ' + Math.round(newHeight));
 
        selenium.browserbot.getUserWindow().moveTo(newWidth, newHeight);
 
        if( (i - 1) % dividerWidth === 0){
            ++j;
        }
    }
}
 
Selenium.prototype.doCloseMultipleWindow = function(maximum, prefix){
    /**
    * Close many windows in a row, according to shared prefix
    *
    * @param maximum The number of window to close
    * @param prefix The prefix for windows name
    */
    for(var i=0; i<maximum; ++i){
        var windowID = prefix + (i + 1);
        this.doSelectWindow(windowID);
        this.doClose(windowID);
    }
}
 
 
Selenium.prototype.doCommandMultipleWindow = function(include, executeCommand){
    /**
    * Execute a command on many window
    *
    * @param include The include use the window specified in parameter (with prefix included !), and launch the command on every selected include
    *   ex include : win1, win2, win4
    * @param executeCommand The command to execute
    */
 
    var param = include.split(new RegExp('[, ]+', 'g'));
 
    //Trimming command
    executeCommand = executeCommand.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
 
    //Splitting the command
    var brace = executeCommand.indexOf('(');
    var commands = new Array(
        executeCommand.substring(0, brace),
        executeCommand.substring(brace+1)
    );
 
    //Removing last bracket
    commands[1] = commands[1].substring(0, commands[1].length - 1);
 
    var parameters = {target:"",value:""};
    var tmp = this.browserbot.getCurrentWindow().JSON.parse(commands[1]);
 
    if(typeof(tmp.target) !== "undefined"){
        parameters.target = tmp.target;
    }
 
    if(typeof(tmp.value) !== "undefined"){
        parameters.value = tmp.value;
    }
 
    var command = {
        command : commands[0],
        target : parameters.target,
        value : parameters.value
    }
 
    if(param === []){
        throw new SeleniumError("You must provide include parameter: '" + command.command + "'");
    }
 
    LOG.info("Executing: | " + command.command + " | " + command.target + " | " + command.value + " |");
 
    //Converting to real function name
    if(command.command.substring(0, 6) == "assert"){
        command.command = "is" + command.command.charAt(6).toUpperCase() + command.command.substring(7);
    }else{
        command.command = "do" + command.command.charAt(0).toUpperCase() + command.command.slice(1);
    }
 
    //Now trying to load function
    for(var i=0; i<param.length; ++i){
        var windowID = param[i];
        this.doSelectWindow(windowID);
        this[command.command](command.target, command.value);
    }
}