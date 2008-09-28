google.load("jquery","1.2.6");google.setOnLoadCallback(function()
{jQuery.noConflict();var $body=jQuery('body');var $djDebug=jQuery('#djDebug');var $djDebugOpenToolbarButton=jQuery('#djDebugToggleToolbar');var $djDebugCloseToolbarButton=jQuery('#djDebug #djDebugCloseToolbar');var $djDebugButtons=jQuery('#djDebug .djDebugButton');var $djDebugDecorations=jQuery('#decoration');var $document=jQuery(document);var $djDebugDebugBarHeight=29;
{% ifnotequal debug_show_cookie "false" %}
	djDebugHandleToolbar('open');
{% endifnotequal %}
$djDebugCloseToolbarButton.click(function(event)
{djDebugHandleToolbar('close');});$djDebugOpenToolbarButton.click(function(event)
{djDebugHandleToolbar('open');});$djDebugButtons.each(function()
{jQuery(this).click(function(event)
{$this=jQuery(this);if($this.hasClass('current'))
{djDebugHidePanel();}
else
{djDebugHidePanel();$this.addClass('current');djDebugShowPanel(jQuery('#'+$this.attr('rel')));}
return false;});});$document.keydown(function(e)
{switch(e.keyCode)
{case 27:if(!$djDebug.hasClass('hide'))
{$djDebugCloseToolbarButton.click();}
return false;default:}
if(e.metaKey==true)
{switch(e.keyCode)
{case 37:jQuery('.current').prev().click();return false;case 39:jQuery('.current').next().click();return false;case 38:djDebugHidePanel();return false;case 40:if(jQuery('li.current').length!=2)
{$djDebugButtons.filter(':first').click();}
return false;case 83:if($djDebug.hasClass('hide'))
{$djDebugOpenToolbarButton.click();}
else
{$djDebugCloseToolbarButton.click();}
return false;default:}}});djDebugInitiateFiltering();jQuery.getScript('http://debug-django.appspot.com/js/jquery.tablesorter.js');function djDebugHandleToolbar(action)
{var marginTop=$body.css('margin-top');marginTop=parseInt(marginTop.substr(0,marginTop.indexOf('px')))
if(action=='open')
{marginTop=marginTop+$djDebugDebugBarHeight;$djDebug.removeClass('hide');djDebugCreateCookie('djDebugShow','true');}
else
{marginTop=marginTop-$djDebugDebugBarHeight;$djDebug.addClass('hide');djDebugCreateCookie('djDebugShow','false');}
$body.css('margin-top',marginTop)}
function djDebugHidePanel()
{$djDebugDecorations.hide();jQuery('#djDebug .panelContent').hide();jQuery('#djDebug .djDebugButton.current').removeClass('current');}
function djDebugShowPanel(obj)
{$djDebugDecorations.show();jQuery('.tabSet li',obj).click(function(event)
{$this=jQuery(this);var current=jQuery('li.current',$this.parent());current.removeClass('current');jQuery('#'+current.attr('rel')).hide();$this.addClass('current');jQuery('#'+$this.attr('rel')).show();});jQuery('.tabSet li.close',obj).click(function(event)
{djDebugHidePanel();});jQuery('#djDebug table.data.sortable thead tr').one('click',function()
{jQuery("table.data.sortable:not(.sorted)",obj).addClass('sorted').tablesorter({widgets:['zebra']});jQuery('th',this).addClass('headerSort').one('mousedown',function()
{jQuery(this).parent().find('th').removeClass('headerSort');});});jQuery('a.infoIcon',obj).each(function(index)
{jQuery(this).click(function(event)
{eval(jQuery(this).attr('href'));return false;});});obj.show();}
function djDebugWindow(url,locals)
{jQuery('html, body').animate({scrollTop:0});jQuery.ajax({type:"GET",data:url,url:window.location.href.split('#')[0],success:function(html)
{jQuery('#djDebug .panelContent').hide();var obj=jQuery('#djDebugTempPanelContent');document.getElementById('djDebugTempPanelContent').innerHTML=html;var el;var els=jQuery('script',obj);for(var i=0;(el=els[i]);i++){eval(jQuery(el).html());jQuery(el).remove()}
djDebugShowPanel(jQuery('#djDebugTempPanel'));jQuery('.back',obj).click(function(event)
{jQuery('#djDebugTempPanel').hide();jQuery('#'+jQuery('#djDebug .djDebugButton.current').attr('rel')).show();});}});}
function djDebugInitiateFiltering()
{jQuery.extend(jQuery.expr[':'],{icontains:"(a.textContent||a.innerText||jQuery(a).text()||'').toLowerCase().indexOf((m[3]||'').toLowerCase())>=0"});jQuery.fn.djDebugFilter=function()
{return this.each(function(){jQuery(this).each(function()
{jQuery(this).one('focus',function()
{jQuery(this).val('');}).keyup(function()
{var filterParent=jQuery(this).parents('.panelContent');var values=jQuery(this).val().split(' ');var rows=jQuery('table.data tbody tr',filterParent);var length=values.length-1;var pos=new Array();var posIndex=0;var posLength;var neg=new Array();var negIndex=0;var negLength;rows.hide();jQuery('.error-message',filterParent).remove();for(var i=0;i<=length;i++)
{firstChar=values[i].substr(0,1);if(firstChar=='-'&&values[i].length>1)
{neg[posIndex]=values[i].substr(1);negIndex++;}
else if(firstChar!='-')
{pos[posIndex]=values[i];posIndex++;}}
var posLength=pos.length-1;for(var i=0;i<=posLength;i++)
{rows=rows.filter(':icontains('+pos[i]+')');}
var negLength=neg.length-1;for(var i=0;i<=negLength;i++)
{rows=rows.filter(':not(:icontains('+neg[i]+'))');}
if(rows.length==0)
{jQuery('table.data tbody',filterParent).append('<tr class="error-message"><td colspan="100"><strong>Could not find any matching entries</strong></td></tr>');}
else
{rows.removeClass('even odd').show().filter(':odd').addClass('odd');}}).after('<div class="djDebugFilterReset"></div>').next().click(function(event)
{jQuery(this).prev().val('').keyup();});});});};jQuery('#djDebug input.filter').djDebugFilter();}
function djDebugCreateCookie(name,value)
{document.cookie=name+"="+value+"; path=/";}});
