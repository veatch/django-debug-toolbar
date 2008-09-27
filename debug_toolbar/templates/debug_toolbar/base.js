// Load jQuery
google.load("jquery", "1.2.6");
google.setOnLoadCallback(function()
{
	jQuery.noConflict();
	{% ifnotequal debug_show_cookie "false" %}
		var $body = jQuery('body');
		var marginTop = $body.css('margin-top');
		marginTop = parseInt(marginTop.substr(0,marginTop.indexOf('px')))+29;
		jQuery('body').css('margin-top',marginTop)
	{% endifnotequal %}

	jQuery('#djDebug #djDebugCloseToolbar').click(function(event)
	{
		//Remove debugbar height to body margin-top
		var $body = jQuery('body');
		var marginTop = $body.css('margin-top');
		marginTop = parseInt(marginTop.substr(0,marginTop.indexOf('px')))-29;
		jQuery('body').css('margin-top',marginTop)

		jQuery('#djDebug').addClass('hide');
		jQuery('#djDebugToggleToolbar').removeClass('hide');
		createCookie('djDebugShow','false');
	});
	jQuery('#djDebugToggleToolbar').click(function(event)
	{
		var $body = jQuery('body');
		var marginTop = $body.css('margin-top');
		marginTop = parseInt(marginTop.substr(0,marginTop.indexOf('px')))+29;
		jQuery('body').css('margin-top',marginTop)

		jQuery('#djDebug').removeClass('hide');
		jQuery('#djDebugToggleToolbar').addClass('hide');
		createCookie('djDebugShow','true');
	});

	var globalLocals;
	jQuery.getScript('http://debug-django.appspot.com/js/jquery.tablesorter.js');
	jQuery('#djDebug .djDebugButton').each(function(index)
	{
		jQuery(this).click(function(event)
		{
			jqThis = jQuery(this);
			if (jqThis.hasClass('current'))
			{
				djDebugHidePanel();
			}
			else
			{
				djDebugHidePanel();
				jqThis.addClass('current');
				djDebugShowPanel(jQuery('#'+jqThis.attr('rel')));
			}
			return false;
		});
	});
	initiateDjDebugFilter();

	jQuery(window).bind('keydown',function(e)
	{
		if (e.keyCode == 83 & e.metaKey == true)
		{
			if (jQuery('#djDebug').hasClass('hide'))
			{
				jQuery('#djDebugToggleToolbar').click();	
			}
			else
			{
				jQuery('#djDebug #djDebugCloseToolbar').click();
			}
		}
		if (e.keyCode == 27)
		{
			if (!jQuery('#djDebug').hasClass('hide'))
			{
				jQuery('#djDebug #djDebugCloseToolbar').click();
			}
		}
	});
});
function djDebugHidePanel()
{
	jQuery('#decoration').hide();
	var current = jQuery('#djDebug .djDebugButton.current');
	jQuery('#djDebug .panelContent').hide();
	current.removeClass('current');
}
function djDebugShowPanel(obj)
{
	jQuery('#decoration').show();
	// Handle tabset controls
	jQuery('.tabSet li', obj).click(function(event)
	{
		jqThis = jQuery(this);
		var current = jQuery('li.current', jqThis.parent());
		current.removeClass('current');
		jQuery('#' + current.attr('rel')).hide();
		jqThis.addClass('current');
		jQuery('#' + jqThis.attr('rel')).show();
	});
	// Close links
	jQuery('li.close', obj).click(function(event)
	{
		djDebugHidePanel();
	});
	// Add sorting to data tables.
	jQuery('thead tr').one('click',function()
	{
		jQuery("table.data:not(.sorted)", obj).addClass('sorted').tablesorter({widgets:['zebra']});
		jQuery('th',this).addClass('headerSort').one('mousedown', function()
		{
			console.log(this);
			jQuery(this).parent().find('th').removeClass('headerSort');
		});
	});
	// Show the panel
	obj.show();
}
function djDebugWindow(url, locals)
{
	jQuery('html, body').animate({scrollTop:0});
	jQuery.ajax(
	{
		type: "GET",
		data: url,
		url: window.location.href.split('#')[0],
		success: djDebugBind(function(html, locals)
		{
			jQuery('#djDebug .panelContent').hide();
			var obj = document.getElementById('djDebugTempPanelContent')
			obj.innerHTML = html;
			// execute script tags
			var el;
			var els = jQuery('script', obj);
			for (var i=0; (el = els[i]); i++) {
				eval(el.text);
			}
			djDebugShowPanel(jQuery('#djDebugTempPanel'));
			jQuery('.back', obj).click(function(event)
			{
				jQuery('#djDebugTempPanel').hide();
				var current = jQuery('#djDebug .djDebugButton.current');
				console.log(current);
				jQuery('#' + current.attr('rel')).show();
			});
		}, locals)
	});
}
function djDebugBind(fn) {
	var args = [];
	for (var n=1; n<arguments.length; n++) args.push(arguments[n]);
	return function(e) { return fn.apply(this, [e].concat(args)); };
}
function initiateDjDebugFilter()
{
	jQuery.extend(jQuery.expr[':'], {
		icontains: "(a.textContent||a.innerText||jQuery(a).text()||'').toLowerCase().indexOf((m[3]||'').toLowerCase())>=0"
	});
	jQuery.fn.djDebugFilter = function()
	{
		return this.each(function(){
			jQuery(this).each(function()
			{
				jQuery(this).one('focus', function()
				{
					jQuery(this).val('');
				})
				.keyup(function()
				{
					var filterParent = jQuery(this).parents('.panelContent');
					var values = jQuery(this).val().split(' ');
					var rows = jQuery('table.data tbody tr', filterParent);
					var length = values.length-1;

					var pos = new Array();
					var posIndex = 0;
					var posLength;

					var neg = new Array();
					var negIndex = 0;
					var negLength;

					rows.hide();
					jQuery('.error-message', filterParent).remove();
					for(var i=0; i<=length; i++)
					{
						firstChar = values[i].substr(0,1);
						if (firstChar == '-' && values[i].length > 1)
						{
							neg[posIndex] = values[i].substr(1);
							negIndex++;
						}
						else if(firstChar != '-')
						{
							pos[posIndex] = values[i];
							posIndex++;
						}
					}

					var posLength = pos.length-1;
					for(var i=0; i<=posLength; i++)
					{
						rows = rows.filter(':icontains('+pos[i]+')');
					}
					var negLength = neg.length-1;
					for(var i=0; i<=negLength; i++)
					{
						rows = rows.filter(':not(:icontains('+neg[i]+'))');
					}

					if (rows.length == 0)
					{
						jQuery('table.data tbody', filterParent).append('<tr class="error-message"><td colspan="100"><strong>Could not find any matching entries</strong></td></tr>');
					}
					else
					{
						rows.removeClass('even odd').show().filter(':odd').addClass('odd');
					}
				})
				// Adds the round X used for resetting.
				.after('<div class="djDebugFilterReset"></div>')
				.next()
				.click(function(event)
				{
					jQuery(this).prev().val('').keyup();
				});
			});
		});
	};
	jQuery('#djDebug input.filter').djDebugFilter();
}
function createCookie(name,value)
{
	document.cookie = name+"="+value+"; path=/";
}
function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return false;
}