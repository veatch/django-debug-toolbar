// Load jQuery using Google's AJAX Libraries API - http://code.google.com/apis/ajaxlibs/
google.load("jquery", "1.2.6");
google.setOnLoadCallback(function()
{
	//Makre sure jQuery doesn't conflict with other JavaScript code.
	jQuery.noConflict();

	// Caching for static objects.
	var $body = jQuery('body');
	var $djDebug = jQuery('#djDebug');
	var $djDebugOpenToolbarButton = jQuery('#djDebugToggleToolbar');
	var $djDebugCloseToolbarButton = jQuery('#djDebug #djDebugCloseToolbar');
	var $djDebugButtons = jQuery('#djDebug .djDebugButton');
	var $djDebugDecorations = jQuery('#decoration');
	var $document = jQuery(document);
	var $djDebugDebugBarHeight = 29;

	// Checks if cookies is set to hide. If not, act.
	{% ifnotequal debug_show_cookie "false" %}
		djDebugHandleToolbar('open');
	{% endifnotequal %}

	// Add event to "close debug toolbar" button that hides entire debug toolbar.
	$djDebugCloseToolbarButton.click(function(event)
	{
		djDebugHandleToolbar('close');
	});
	// Add event to "open debug toolbar" button that shows entire debug toolbar.
	$djDebugOpenToolbarButton.click(function(event)
	{
		djDebugHandleToolbar('open');
	});
	// Bind click event to all link elements in panelList. Showing and hiding panels. 
	// Also let the user know which panel is the current one. 
	$djDebugButtons.each(function()
	{
		// Bind a click event to all link elements in panelList.
		jQuery(this).click(function(event)
		{
			$this = jQuery(this);
			// If the link is the current one we hide the related panel.
			if ($this.hasClass('current'))
			{
				djDebugHidePanel();
			}
			// If the link is not the current one we hide all panels, set this link to current and then show the related panel.
			else
			{
				djDebugHidePanel();
				$this.addClass('current');
				djDebugShowPanel(jQuery('#'+$this.attr('rel')));
			}
			return false;
		});
	});
	// Capture button presses that allows the user to control the debug toolbar using the keyboard.
	$document.keydown(function(e)
	{
		switch(e.keyCode)
		{
			//Esc - Hides entire djDebugToolbar.
			case 27:
				if (!$djDebug.hasClass('hide'))
				{
					$djDebugCloseToolbarButton.click();
				}
				return false;
			default:
		}
		// Checks if the user is accompanying the button with a metakey. Ie Ctrl most likely.
		if (e.metaKey == true)
		{
			switch(e.keyCode)
			{
				case 37: // Ctrl + Left - Shows the panel left to the current panel in panelList.
					jQuery('.current').prev().click();
					return false;
				case 39: // Ctrl + Right - Shows the panel right to the current panel in panelList.
					jQuery('.current').next().click();
					return false;
				case 38: // Ctrl + Up - Hides current panel.
					djDebugHidePanel();
					return false;
				case 40: // Ctrl + Down - Shows first panel.
					if (jQuery('li.current').length != 2)
					{
							$djDebugButtons.filter(':first').click();
					}
					return false;
				case 83: // Ctrl + S - Toggles entire djDebugToolbar.
					if ($djDebug.hasClass('hide'))
					{
						$djDebugOpenToolbarButton.click();	
					}
					else
					{
						$djDebugCloseToolbarButton.click();
					}
					return false;
				default:
			}
		}
	});
	// Initiates the filtering feature on all input elements with class filter.
	djDebugInitiateFiltering();

	// jQuery plugin: Tablesorter 2.0 - http://tablesorter.com/docs/
	jQuery.getScript('http://debug-django.appspot.com/js/jquery.tablesorter.js');
	
	// Handles the body margin used to push the page beneath the debug toolbar making sure nothing is covered over.
	function djDebugHandleToolbar(action)
	{
		var marginTop = $body.css('margin-top');
		marginTop = parseInt(marginTop.substr(0,marginTop.indexOf('px')))
		// If the action is set to "open" we show the debug toolbar and append x amount of pixels to the body margin-top so the debug toolbar doesn't overlap site content.
		if (action == 'open')
		{
			marginTop = marginTop+$djDebugDebugBarHeight;
			$djDebug.removeClass('hide');
			djDebugCreateCookie('djDebugShow','true');
		}
		// If the action is NOT set to "open" we hide the debug toolbar and reset the body margin-top to initial value.
		else
		{
			marginTop = marginTop-$djDebugDebugBarHeight;
			$djDebug.addClass('hide');
			djDebugCreateCookie('djDebugShow','false');
		}
		$body.css('margin-top',marginTop)
	}
	// Hides the panel decorations, all panels as well as removing the hilight of current panel in panelList.
	function djDebugHidePanel()
	{
		$djDebugDecorations.hide();
		jQuery('#djDebug .panelContent').hide();
		jQuery('#djDebug .djDebugButton.current').removeClass('current');
	}
	// Shows the panel decorations, supplied panel as well as binding necessary events for navigation/manipulation.
	function djDebugShowPanel(obj)
	{
		// Show panel decorations.
		$djDebugDecorations.show();

		// Bind events to tabSet that allows for tabbed content.
		jQuery('.tabSet li', obj).click(function(event)
		{
			$this = jQuery(this);
			var current = jQuery('li.current', $this.parent());
			current.removeClass('current');
			jQuery('#' + current.attr('rel')).hide();
			$this.addClass('current');
			jQuery('#' + $this.attr('rel')).show();
		});
		// Binds an event to close button that close current panel.
		jQuery('.tabSet li.close', obj).click(function(event)
		{
			djDebugHidePanel();
		});
		// Bind an event that initiates sorting on table that has class "sortable" and "data" when clicking on the header.
		jQuery('#djDebug table.data.sortable thead tr').one('click',function()
		{
			jQuery("table.data.sortable:not(.sorted)", obj).addClass('sorted').tablesorter({widgets:['zebra']});
			jQuery('th', this).addClass('headerSort').one('mousedown', function()
			{
				jQuery(this).parent().find('th').removeClass('headerSort');
			});
		});
		// Bind an event to links, that have class "infoIcon", that executes the javascript in the href attribute.
		jQuery('a.infoIcon', obj).each(function(index)
		{
			jQuery(this).click(function(event)
			{
				eval(jQuery(this).attr('href'));
				return false;
			});
		});
		obj.show();
	}
	// Sends an ajax request, executes the scripts in the fetched source, binds events and then inserts it to the temporary content panel.
	function djDebugWindow(url, locals)
	{
		jQuery('html, body').animate({scrollTop:0});
		jQuery.ajax(
		{
			type: "GET",
			data: url,
			url: window.location.href.split('#')[0],
			success: function(html)
			{
				// Hide all panels.
				jQuery('#djDebug .panelContent').hide();

				var obj = jQuery('#djDebugTempPanelContent');
				// Insert fetched html into temporary panel.
				document.getElementById('djDebugTempPanelContent').innerHTML = html;

				// Run though all script blocks in fetched source, execute them and then remove them.
				var el;
				var els = jQuery('script', obj);
				for (var i=0; (el = els[i]); i++) {
					eval(jQuery(el).html());
					jQuery(el).remove()
				}

				// Show the temporary panel.
				djDebugShowPanel(jQuery('#djDebugTempPanel'));

				// Bind an event to back button that allows the user to go back to previous panel.
				jQuery('.back', obj).click(function(event)
				{
					// Hide the temporary panel.
					jQuery('#djDebugTempPanel').hide();
					// Show the previous panel.
					jQuery('#' + jQuery('#djDebug .djDebugButton.current').attr('rel')).show();
				});
			}
		});
	}
	// Extends the jQuery selectors with an case insensitive :contains(), creates a jQuery plugin that binds events as well as working out the content processing.
	function djDebugInitiateFiltering()
	{
		// Extend jQuery selectors.
		jQuery.extend(jQuery.expr[':'], {
			icontains: "(a.textContent||a.innerText||jQuery(a).text()||'').toLowerCase().indexOf((m[3]||'').toLowerCase())>=0"
		});
		// Create jQuery plugin.
		jQuery.fn.djDebugFilter = function()
		{
			return this.each(function(){
				jQuery(this).each(function()
				{
					// Resets the explain text when clicking element.
					jQuery(this).one('focus', function()
					{
						jQuery(this).val('');
					})
					// Bind keypress event to element.
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

						// Hide all rows and error messages so we start working with a clean slate.
						rows.hide();
						jQuery('.error-message', filterParent).remove();

						// Sorts the values supplied into arrays with "what we want" and "what we don't want".
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
						// Filter out the content rows using "what we want" array.
						var posLength = pos.length-1;
						for(var i=0; i<=posLength; i++)
						{
							rows = rows.filter(':icontains('+pos[i]+')');
						}
						// Filter out the content rows using "what we don't want" array.
						var negLength = neg.length-1;
						for(var i=0; i<=negLength; i++)
						{
							rows = rows.filter(':not(:icontains('+neg[i]+'))');
						}
						// If there are no rows that survive through filtering show error message. Otherwise display matched rows.
						if (rows.length == 0)
						{
							jQuery('table.data tbody', filterParent).append('<tr class="error-message"><td colspan="100"><strong>Could not find any matching entries</strong></td></tr>');
						}
						else
						{
							rows.removeClass('even odd').show().filter(':odd').addClass('odd');
						}
					})
					// Adds an icon used for reseting user input and bind event.
					.after('<div class="djDebugFilterReset"></div>')
					.next()
					.click(function(event)
					{
						jQuery(this).prev().val('').keyup();
					});
				});
			});
		};
		// Run the plugin we just created on all inputs with class "filter".
		jQuery('#djDebug input.filter').djDebugFilter();
	}
	// Sets a cookie.
	function djDebugCreateCookie(name,value)
	{
		document.cookie = name+"="+value+"; path=/";
	}
});