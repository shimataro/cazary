/*! Cazary (jQuery 1.7+) - JavaScript WYSIWYG editor (https://github.com/shimataro/cazary) */
(function(factory)
{
	if(typeof module === "object" && typeof module.exports === "object")
	{
		module.exports = factory(require("jquery"), window);
	}
	else
	{
		factory(jQuery, window);
	}
}
(function($, window, undefined)
{
	"use strict";
	const document = window.document;

	/**
	 * simplified translation function that can be used just like GNU gettext
	 * @function
	 * @param {String} text: text to be translated
	 * @return: {String} translated text
	 */
	const _ = (function()
	{
		// NOTE: below placeholder will be replaced by real data in gulp task.
		const translation_data = {/*@TRANSLATION_DATA@*/};
		const current_translation_data = _getCurrentTranslationData();

		return function(text)
		{
			if(current_translation_data[text] === undefined)
			{
				return text;
			}
			return current_translation_data[text];
		};

		function _getCurrentTranslationData()
		{
			let language = _detectBrowserLanguage().toLowerCase();
			let result = translation_data[language];
			if(result !== undefined)
			{
				return result;
			}

			// 'en-us' -> 'en'
			language = language.split('-')[0];
			result = translation_data[language];
			if(result !== undefined)
			{
				return result;
			}

			return {};
		}

		/**
		 * @see http://blog.masuidrive.jp/index.php/2008/09/19/how-to-detect-your-browser-language-from-javascript/
		 */
		function _detectBrowserLanguage()
		{
			try
			{
				const navigator = window.navigator;
				return (navigator.browserLanguage || navigator.language || navigator.userLanguage);
			}
			catch(e)
			{
				return undefined;
			}
		}
	})();

	/**
	 * validate email
	 * @function
	 * @param {String} string: email
	 * @return: {Boolean} OK/NG
	 */
	const checkEmail = (function()
	{
		const regexp = /^[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~](\.?[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~])*@([\w\-]+\.)+(\w+)$/;

		return function(string)
		{
			if(string.length > 256)
			{
				// length is up to 256 characters（cf. RFC 5321 4.5.3.1.3.）
				return false;
			}
			if(string.indexOf("@") > 64)
			{
				// length of local part is up to 64 characters（cf. RFC 5321 4.5.3.1.1.）
				return false;
			}
			if(string.match(regexp) === null)
			{
				return false;
			}
			return true;
		};
	})();

	/**
	 * validate URL
	 * @function
	 * @param {String} string: URL
	 * @return: {Boolean} OK/NG
	 */
	const checkURL = (function()
	{
		const regexp = /^https?:\/\//;

		return function(string)
		{
			if(string.match(regexp) === null)
			{
				return false;
			}
			return true;
		};
	})();

	/**
	 * Editor Component
	 * @class
	 */
	const EditorCore = (function()
	{
		const STATUS = {
			NORMAL: 0,
			ACTIVE: 1,
			DISABLED: 2,
		};

		const COMMAND = {
			FONTNAME            : "fontname",
			FONTSIZE            : "fontsize",
			BOLD                : "bold",
			ITALIC              : "italic",
			UNDERLINE           : "underline",
			STRIKETHROUGH       : "strikethrough",
			REMOVEFORMAT        : "removeformat",
			FORECOLOR           : "forecolor",
			BACKCOLOR           : "backcolor",
			HILITECOLOR         : "hilitecolor",
			SUPERSCRIPT         : "superscript",
			SUBSCRIPT           : "subscript",
			JUSTIFYLEFT         : "justifyleft",
			JUSTIFYCENTER       : "justifycenter",
			JUSTIFYRIGHT        : "justifyright",
			JUSTIFYFULL         : "justifyfull",
			INDENT              : "indent",
			OUTDENT             : "outdent",
			ORDEREDLIST         : "insertorderedlist",
			UNORDEREDLIST       : "insertunorderedlist",
			INSERTHORIZONTALRULE: "inserthorizontalrule",
			INSERTIMAGE         : "insertimage",
			CREATELINK          : "createlink",
			UNLINK              : "unlink",
			UNDO                : "undo",
			REDO                : "redo",
		};

		return function(edit, value, style)
		{
			// init
			let contentWindow   = edit.contentWindow;
			let contentDocument = contentWindow.document;
			if(edit.contentDocument)
			{
				// if contentDocument exists, W3C compliant
				contentDocument = edit.contentDocument;
			}

			// TextRange object (selected range for IE)
			let range = null;

			// public properties
			this.STATUS = STATUS;
			this.COMMAND = COMMAND;

			this.contentWindow   = contentWindow;
			this.contentDocument = contentDocument;

			// public methods
			this.getCurrentStatus = _getCurrentStatus;
			this.execCommand      = _execCommand;
			this.canExecCommand   = _canExecCommand;
			this.value            = _value;
			this.getSelectedText  = _getSelectedText;
			this.insertText       = _insertText;
			this.setFocus         = _setFocus;

			// construction
			_construct(value);

			function _construct(value)
			{
/*
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<style type="text/css">[STYLE]</style>
	</head>
	<body></body>
</html>
*/
				const iframehtml = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style type="text/css">${style}</style></head><body></body></html>`;

//				contentDocument.body.contentEditable = true;
				contentDocument.designMode = "on";

				_setHTML(iframehtml);
				_setValue(value);
			}

			function _execCommand(commandName, parameters)
			{
				// if browser supports "hilitecolor", use it.
				if(commandName === COMMAND.BACKCOLOR && _canExecCommand(COMMAND.HILITECOLOR))
				{
					commandName = COMMAND.HILITECOLOR;
				}

				_setFocus();
				contentDocument.execCommand(commandName, false, parameters);
			}
			function _canExecCommand(commandName)
			{
				try
				{
					return contentDocument.queryCommandEnabled(commandName);
				}
				catch(e)
				{
					return false;
				}
			}

			function _value(value)
			{
				if(value === undefined)
				{
					return _getValue();
				}
				else
				{
					_setValue(value);
				}
			}

			function _getValue()
			{
				let html = contentDocument.body.innerHTML;

				// replace tags
				html = html
					.replace(/(<\/?)p\b/gi, "$1div")
					.replace(/(<\/?)em\b/gi, "$1i")
					.replace(/(<\/?)strong\b/gi, "$1b")
					.replace(/(<\/?)del\b/gi, "$1s")
				;
				return html;
			}
			function _setValue(value)
			{
				contentDocument.body.innerHTML = value;
			}
			function _setHTML(html)
			{
				contentDocument.open();
				contentDocument.write(html);
				contentDocument.close();
			}

			function _getCurrentStatus()
			{
				const result = {
					fontname: null,
					fontsize: null,

					forecolor: null,
					backcolor: null,

					bold         : STATUS.NORMAL,
					italic       : STATUS.NORMAL,
					underline    : STATUS.NORMAL,
					strikethrough: STATUS.NORMAL,

					superscript: STATUS.NORMAL,
					subscript  : STATUS.NORMAL,

					justifyleft  : STATUS.NORMAL,
					justifycenter: STATUS.NORMAL,
					justifyright : STATUS.NORMAL,
					justifyfull  : STATUS.NORMAL,

					insertorderedlist  : STATUS.NORMAL,
					insertunorderedlist: STATUS.NORMAL,

					createlink: STATUS.NORMAL,
					unlink    : STATUS.NORMAL,

					undo: STATUS.NORMAL,
					redo: STATUS.NORMAL,
				};
				if(_getSelectedText() === "")
				{
					result[COMMAND.CREATELINK] = STATUS.DISABLED;
					result[COMMAND.UNLINK    ] = STATUS.DISABLED;
				}
				$.each([COMMAND.CREATELINK, COMMAND.UNLINK, COMMAND.UNDO, COMMAND.REDO], function(index, value)
				{
					if(!_canExecCommand(value))
					{
						result[value] = STATUS.DISABLED;
					}
				});

				let node = _getCurrentNode();
				while(node !== null)
				{
					// check tag
					if(node.tagName !== undefined)
					{
						const tagName = node.tagName.toLowerCase();
						switch(tagName)
						{
						case "b":
						case "strong":
							result[COMMAND.BOLD] = STATUS.ACTIVE;
							break;

						case "i":
						case "em":
							result[COMMAND.ITALIC] = STATUS.ACTIVE;
							break;

						case "u":
							result[COMMAND.UNDERLINE] = STATUS.ACTIVE;
							break;

						case "s":
						case "strike":
						case "del":
							result[COMMAND.STRIKETHROUGH] = STATUS.ACTIVE;
							break;

						case "sup":
							result[COMMAND.SUPERSCRIPT] = STATUS.ACTIVE;
							break;

						case "sub":
							result[COMMAND.SUBSCRIPT] = STATUS.ACTIVE;
							break;

						case "ol":
							result[COMMAND.ORDEREDLIST] = STATUS.ACTIVE;
							break;

						case "ul":
							result[COMMAND.UNORDEREDLIST] = STATUS.ACTIVE;
							break;

						case "font":
							if(node.face.length > 0 && result[COMMAND.FONTNAME] === null)
							{
								result[COMMAND.FONTNAME] = node.face;
							}
							if(node.size.length > 0 && result[COMMAND.FONTSIZE] === null)
							{
								result[COMMAND.FONTSIZE] = node.size;
							}
							if(node.color.length > 0 && result[COMMAND.FORECOLOR] === null)
							{
								result[COMMAND.FORECOLOR] = node.color;
							}
							break;
						}
					}

					// check general attributes
					if(node.align !== undefined)
					{
						const align = node.align.toLowerCase();
						switch(align)
						{
						case "left":
							result[COMMAND.JUSTIFYLEFT] = STATUS.ACTIVE;
							break;

						case "center":
							result[COMMAND.JUSTIFYCENTER] = STATUS.ACTIVE;
							break;

						case "right":
							result[COMMAND.JUSTIFYRIGHT] = STATUS.ACTIVE;
							break;

						case "justify":
							result[COMMAND.JUSTIFYFULL] = STATUS.ACTIVE;
							break;
						}
					}

					// check CSS
					if(node.style !== undefined)
					{
						const style = node.style;
						if(style.fontFamily !== undefined)
						{
							const fontFamily = style.fontFamily;
							if(fontFamily.length > 0 && result[COMMAND.FONTNAME] === null)
							{
								result[COMMAND.FONTNAME] = fontFamily;
							}
						}

						if(style.fontWeight !== undefined)
						{
							const fontWeight = style.fontWeight.toLowerCase();
							switch(fontWeight)
							{
							case "bold":
							case "bolder":
								result[COMMAND.BOLD] = STATUS.ACTIVE;
								break;
							}
						}

						if(style.fontStyle !== undefined)
						{
							const fontStyle = style.fontStyle.toLowerCase();
							switch(fontStyle)
							{
							case "italic":
							case "oblique":
								result[COMMAND.ITALIC] = STATUS.ACTIVE;
								break;
							}
						}

						if(style.textDecoration !== undefined)
						{
							const textDecoration = style.textDecoration.toLowerCase();
							if(textDecoration.indexOf("underline") !== -1)
							{
								result[COMMAND.UNDERLINE] = STATUS.ACTIVE;
							}
							if(textDecoration.indexOf("line-through") !== -1)
							{
								result[COMMAND.STRIKETHROUGH] = STATUS.ACTIVE;
							}
						}

						if(style.color !== undefined)
						{
							const color = style.color;
							if(color.length > 0 && result[COMMAND.FORECOLOR] === null)
							{
								result[COMMAND.FORECOLOR] = color;
							}
						}

						if(style.backgroundColor !== undefined)
						{
							const color = style.backgroundColor;
							if(color.length > 0 && result[COMMAND.BACKCOLOR] === null)
							{
								result[COMMAND.BACKCOLOR] = color;
							}
						}

						if(style.verticalAlign !== undefined)
						{
							const verticalAlign = style.verticalAlign.toLowerCase();
							switch(verticalAlign)
							{
							case "super":
								result[COMMAND.SUPERSCRIPT] = STATUS.ACTIVE;
								break;

							case "sub":
								result[COMMAND.SUBSCRIPT] = STATUS.ACTIVE;
								break;
							}
						}

						// block
						if(style.textAlign !== undefined)
						{
							const textAlign = style.textAlign.toLowerCase();
							switch(textAlign)
							{
							case "left":
								result[COMMAND.JUSTIFYLEFT] = STATUS.ACTIVE;
								break;

							case "center":
								result[COMMAND.JUSTIFYCENTER] = STATUS.ACTIVE;
								break;

							case "right":
								result[COMMAND.JUSTIFYRIGHT] = STATUS.ACTIVE;
								break;

							case "justify":
								result[COMMAND.JUSTIFYFULL] = STATUS.ACTIVE;
								break;
							}
						}
					}

					node = node.parentNode;
				}

				// save selected range for IE
				if(contentDocument.selection)
				{
					range = contentDocument.selection.createRange();
				}

				return result;
			}

			function _getCurrentStyle()
			{
				const node = _getCurrentNode();
				if(node === null)
				{
					return null;
				}
				return node.currentStyle || contentDocument.defaultView.getComputedStyle(node.parentElement, "");
			}

			function _getCurrentNode()
			{
				if(contentWindow.getSelection)
				{
					return contentWindow.getSelection().anchorNode;
				}
				return contentDocument.selection.createRange().parentElement();
			}

			function _getSelectedText()
			{
				if(contentWindow.getSelection)
				{
					const selection = contentWindow.getSelection();
					if(selection === null || selection.rangeCount === 0)
					{
						return "";
					}
					return selection.getRangeAt(0).toString();
				}
				else
				{
					return contentDocument.selection.createRange().text;
				}
			}

			function _insertText(text, removeFormat)
			{
				if(contentWindow.getSelection)
				{
					const node      = contentDocument.createTextNode(text);
					const selection = contentWindow.getSelection();
					selection.deleteFromDocument();
					selection.getRangeAt(0).insertNode(node);
				}
				else
				{
					contentDocument.selection.createRange().text = text;
				}

				if(removeFormat)
				{
					_execCommand(COMMAND.REMOVEFORMAT);
				}
				else
				{
					_setFocus();
				}
			}

			function _setFocus()
			{
				contentWindow.focus();
				if(range !== null)
				{
					range.select();
				}
			}
		};
	})();

	$.fn.extend(
	{
		cazary: (function($)
		{
			// keycodes
			const KEYCODE = {
				ENTER: 13,
				ESCAPE: 27,
			};

/*
<div class="cazary">
	<!-- commands wrapper is here -->
	<iframe class="cazary-edit" src="javascript:" style="display:none;"></iframe>
	<!-- original textarea is here -->
</div>
*/
			const CAZARY = '<div class="cazary"><iframe class="cazary-edit" src="javascript:" style="display:none;"></iframe></div>';

			// command => name
			const ASSOC_COMMANDNAMES = {
				separator: "",

				fontname: "Font",
				fontsize: "Size",

				bold         : "Bold",
				italic       : "Italic",
				underline    : "Underline",
				strikethrough: "Strike-Through",
				removeformat : "Remove Format",

				forecolor: "Foreground Color",
				backcolor: "Background Color",

				superscript: "Superscript",
				subscript  : "Subscript",

				justifyleft  : "Justify Left",
				justifycenter: "Justify Center",
				justifyright : "Justify Right",
				justifyfull  : "Justify Full",

				indent : "Indent",
				outdent: "Outdent",

				insertorderedlist  : "Ordered List",
				insertunorderedlist: "Unordered List",

				inserthorizontalrule: "Horizontal Rule",
				insertimage         : "Insert Image",
				createlink          : "Insert Link",
				unlink              : "Unlink",

				undo: "Undo",
				redo: "Redo",

				source: "Show Source",
			};
			/* font sizes */
			const ASSOC_FONTSIZES = {
				1: "Size 1",
				2: "Size 2",
				3: "Size 3",
				4: "Size 4",
				5: "Size 5",
				6: "Size 6",
				7: "Size 7",
			};
			/* pre-defined macros */
			const PRE_DEFINED_MACROS = {
				"MINIMAL" : ["bold italic underline strikethrough removeformat"],
				"STANDARD": [
					"fontname fontsize",
					"bold italic underline strikethrough removeformat | forecolor backcolor | superscript subscript",
					"source",
				],
				"FULL": [
					"fontname fontsize",
					"bold italic underline strikethrough removeformat | forecolor backcolor | superscript subscript",
					"justifyleft justifycenter justifyright justifyfull | indent outdent | insertorderedlist insertunorderedlist",
					"inserthorizontalrule insertimage createlink unlink",
					"undo redo",
					"source",
				],
			};

			$(function($)
			{
				// window events
				$(document)
					.on("click", function()
					{
						destroyAllPanels();
					})
					.on("keydown", function(event)
					{
						if(event.keyCode === KEYCODE.ESCAPE)
						{
							destroyAllPanels();
						}
					});
			});

			return function(options)
			{
				options = $.extend(
					{
						mode: "rte",
						style: "body{margin:0px;padding:8px;}p{margin:0px;padding:0px;}",
						fontnames: [
							"sans-serif", "serif", "cursive", "fantasy", "monospace",
							"Arial", "Arial Black", "Comic Sans MS", "Courier New", "Narrow", "Garamond",
							"Georgia", "Impact", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
						],
						colors: [
                    		["#ffffff", "#ffcccc", "#ffcc99", "#ffff99", "#ffffcc", "#99ff99", "#99ffff", "#ccffff", "#ccccff", "#ffccff"],
                    		["#cccccc", "#ff6666", "#ff9966", "#ffff66", "#ffff33", "#66ff99", "#33ffff", "#66ffff", "#9999ff", "#ff99ff"],
							["#bbbbbb", "#ff0000", "#ff9900", "#ffcc66", "#ffff00", "#33ff33", "#66cccc", "#33ccff", "#6666cc", "#cc66cc"],
							["#999999", "#cc0000", "#ff6600", "#ffcc33", "#ffcc00", "#33cc00", "#00cccc", "#3366ff", "#6633ff", "#cc33cc"],
							["#666666", "#990000", "#cc6600", "#cc9933", "#999900", "#009900", "#339999", "#3333ff", "#6600cc", "#993399"],
							["#333333", "#660000", "#993300", "#996633", "#666600", "#006600", "#336666", "#000099", "#333399", "#663366"],
							["#000000", "#330000", "#663300", "#663333", "#333300", "#003300", "#003333", "#000066", "#330099", "#330033"],
						],
						commands: "STANDARD",
					},
					options);

				return this.each(function()
				{
					const uniqueId = parseInt(Math.random() * 10000);
					const $origin = $(this);

					// Cazary object
					const $cazary = $(CAZARY).css({width: $origin.width()});
					$cazary.prepend(createCommandsWrapper(options.commands));

					// editor object
					const $cazary_edit = $cazary.find(".cazary-edit").css({height: $origin.height()});

					// source command & others
					const $cazary_command_source         = $cazary.find("ul.cazary-commands-list li.cazary-command-source");
					const $cazary_commands_except_source = $cazary.find("ul.cazary-commands-list li:not(.cazary-command-source)");

					// set objects
					$origin
						.hide()
						.before($cazary)
						.insertAfter($cazary_edit)
						.addClass("cazary-source")
					;

					// add style for placeholder
					let style = options.style;
					let placeholder_text = $origin.attr("placeholder");
					if(placeholder_text !== undefined)
					{
						placeholder_text = placeholder_text.replace("'", "\\'");
						style += `body.empty:before{position:fixed;color:#888;content:'${placeholder_text}';}`;
					}
					const editor = new EditorCore($cazary_edit.get(0), $origin.val(), style);

					const commands_generic = [
						editor.COMMAND.BOLD, editor.COMMAND.ITALIC, editor.COMMAND.UNDERLINE, editor.COMMAND.STRIKETHROUGH, editor.COMMAND.REMOVEFORMAT,
						editor.COMMAND.SUPERSCRIPT, editor.COMMAND.SUBSCRIPT,
						editor.COMMAND.JUSTIFYLEFT, editor.COMMAND.JUSTIFYCENTER, editor.COMMAND.JUSTIFYRIGHT, editor.COMMAND.JUSTIFYFULL,
						editor.COMMAND.INDENT, editor.COMMAND.OUTDENT,
						editor.COMMAND.ORDEREDLIST, editor.COMMAND.UNORDEREDLIST,
						editor.COMMAND.INSERTHORIZONTALRULE, editor.COMMAND.UNLINK,
						editor.COMMAND.UNDO, editor.COMMAND.REDO,
					];
					const commands_with_panel = [
						editor.COMMAND.FONTNAME, editor.COMMAND.FONTSIZE,
						editor.COMMAND.FORECOLOR, editor.COMMAND.BACKCOLOR,
						editor.COMMAND.INSERTIMAGE, editor.COMMAND.CREATELINK,
					];

					if(options.mode === "html")
					{
						_setHtmlMode();
					}
					else
					{
						_setRteMode();
					}

					$origin
						.on("change", function()
						{
							// hook "change" event
							const value = $(this).val();
							editor.value(value);

							_setEmptyClass();
						});

					// editor events
					$(editor.contentDocument)
						.on("select", function()
						{
							_updateCommandStatus();
						})
						.on("mouseup", function()
						{
							destroyAllPanels();
							_updateCommandStatus();
						})
						.on("keydown", function(event)
						{
							if(event.keyCode === KEYCODE.ESCAPE)
							{
								destroyAllPanels();
							}
						})
						.on("keyup paste", function()
						{
							window.setTimeout(function()
							{
								_updateCommandStatus();
								_setEmptyClass();
							}, 10);
						});

					$(editor.contentWindow)
						.on("focus", function()
						{
							destroyAllPanels();
							_updateCommandStatus();
						})
						.on("blur", function()
						{
							// update original element when focus is out
							$origin.val(editor.value());
						});

					// cancel other handler when command is disabled
					$cazary
						.on("click", "ul.cazary-commands-list li", function(event)
						{
							const $target = $(this);
							if($target.hasClass("cazary-disabled"))
							{
								event.stopImmediatePropagation();
								_setFocus();
							}
						});

					// toggle RTE <-> HTML mode
					$cazary_command_source
						.on("click", function()
						{
							_toggleMode();
							_setFocus();
						});

					// command handler
					$.each(commands_generic, function()
					{
						const commandName = this.toLowerCase();
						$cazary
							.on("click", `.cazary-command-${commandName}`, function()
							{
								// execute command
								_execCommand(commandName);
							});
					});
					$.each(commands_with_panel, function()
					{
						const commandName = this.toLowerCase();
						$cazary
							.on("click", `.cazary-command-${commandName}`, function()
							{
								// open panel
								const $target = $(this);
								createPanel(commandName, options, $target);
								return false;
							});
					});

					function _execCommand(commandName, parameters)
					{
						destroyAllPanels();
						editor.execCommand(commandName, parameters);
						_updateCommandStatus();
					}

					function _setRteMode()
					{
						// set visibility
						$origin.hide();
						$cazary_edit.css("display", "");

						$cazary_commands_except_source.removeClass("cazary-disabled");
						$cazary_command_source.removeClass("cazary-active");
						_updateCommandStatus();
					}

					function _setHtmlMode()
					{
						const html = editor.value();
						$origin.val(html);

						$cazary_edit.hide();
						$origin.css("display", "");

						$cazary_commands_except_source.addClass("cazary-disabled");
						$cazary_command_source.addClass("cazary-active");
					}

					function _toggleMode()
					{
						if(_isHtmlMode())
						{
							// HTML -> RTE
							_setRteMode();
						}
						else
						{
							// RTE -> HTML
							_setHtmlMode();
						}
					}

					function _isHtmlMode()
					{
						return $cazary_command_source.hasClass("cazary-active");
					}
					function _isRteMode()
					{
						return !_isHtmlMode();
					}

					/**
					 * create specified panel
					 * @param {String} commandName: command name
					 * @param {Object} options:     options
					 * @param {jQuery} $command:    command object
					 */
					function createPanel(commandName, options, $command)
					{
						let $panel = $(".cazary-panel");
						if($panel.length > 0)
						{
							const uniqueId_panel    = $panel.data("id");
							const commandName_panel = $panel.data("command");
							destroyAllPanels();
							if(commandName_panel === commandName && uniqueId_panel === uniqueId)
							{
								_setFocus();
								return;
							}
						}

						let list = false;
						switch(commandName)
						{
						case editor.COMMAND.FONTNAME:
							$panel = createPanel_fontname(commandName, options.fontnames);
							list = true;
							break;

						case editor.COMMAND.FONTSIZE:
							$panel = createPanel_fontsize(commandName);
							list = true;
							break;

						case editor.COMMAND.FORECOLOR:
						case editor.COMMAND.BACKCOLOR:
							$panel = createPanel_color(commandName, options.colors);
							list = true;
							break;

						case editor.COMMAND.INSERTIMAGE:
							$panel = createPanel_insertimage(commandName);
							break;

						case editor.COMMAND.CREATELINK:
							$panel = createPanel_createlink(commandName);
							break;

						default:
							return null;
						}

						if(list)
						{
							// set click event to "li"
							$panel
								.on("click", "li", function()
								{
									// execute command
									const $target = $(this);
									const param = $target.data("param");
									_execCommand(commandName, param);
								});
						}

						// set class and position and
						const offset = $command.addClass("cazary-active").offset();
						offset.top += $command.outerHeight();
						$panel
							.addClass("cazary-panel")
							.addClass(`cazary-panel-${commandName}`)
							.data("id", uniqueId)
							.data("command", commandName)
							.css({
								left: `${offset.left}px`,
								top : `${offset.top}px`,
							})
							.on("click", function()
							{
								// stop bubbling
								return false;
							})
							.appendTo($(document.body))
							.find(":text:first")
								.trigger("focus");

						return $panel;
					}

					function createPanel_fontname(commandName, fontnames)
					{
/*
<div class="cazary-panel cazary-panel-fontname">
	<ul class="cazary-widget-select">
		<li unselectable="on" style="font-family: XXX" title="XXX" data-param="XXX">XXX</li>
		...
	</ul>
</div>
*/
						const $ul = $("<ul />").addClass("cazary-widget-select");
						$.each(fontnames, function()
						{
							const fontName = this.toString();
							const $li = $("<li />")
								.attr({
									"unselectable": "on",
									"title": fontName,
								})
								.css({
									"font-family": fontName,
								})
								.data("param", fontName)
								.text(fontName);

							$ul.append($li);
						});
						return $("<div>").append($ul);
					}

					function createPanel_fontsize(commandName)
					{
/*
<div class="cazary-panel cazary-panel-fontsize">
	<ul class="cazary-widget-select">
		<li unselectable="on" title="Smallest" data-param="1"><font size="1">Size 1</font></li>
		<li unselectable="on" title="Smallest" data-param="2"><font size="2">Size 2</font></li>
		<li unselectable="on" title="Smallest" data-param="3"><font size="3">Size 3</font></li>
		<li unselectable="on" title="Smallest" data-param="4"><font size="4">Size 4</font></li>
		<li unselectable="on" title="Smallest" data-param="5"><font size="5">Size 5</font></li>
		<li unselectable="on" title="Smallest" data-param="6"><font size="6">Size 6</font></li>
		<li unselectable="on" title="Smallest" data-param="7"><font size="7">Size 7</font></li>
	</ul>
</div>
*/
						const $ul = $("<ul />").addClass("cazary-widget-select");
						$.each(ASSOC_FONTSIZES, function(param, text)
						{
							const _text = _(text);
							const $li = $("<li />")
								.attr({
									"unselectable": "on",
									"title": _text,
								})
								.data("param", param);

							const $font = $("<font />")
								.attr({
									"size": param
								})
								.text(text);

							$ul.append($li.append($font));
						});
						return $("<div>").append($ul);
					}

					function createPanel_color(commandName, colors)
					{
/*
<div class="cazary-panel cazary-panel-[COMMANDNAME]">
	<ul class="cazary-widget-select-color">
		<li unselectable="on" style="background: XXX" title="XXX" data-param="XXX">XXX</li>
		...
	</ul>
	<ul class="cazary-widget-select-color">
		<li unselectable="on" style="background: XXX" title="XXX" data-param="XXX">XXX</li>
		...
	</ul>
</div>
*/
						const $panel = $("<div>");

						$.each(colors, function()
						{
							const $ul = $("<ul />").addClass("cazary-widget-select-color");
							$.each(this, function()
							{
								const colorName = this.toString();
								const $li = $("<li />")
									.attr({
										"unselectable": "on",
										"title": colorName,
									})
									.css({
										"background-color": colorName,
									})
									.data("param", colorName)
									.text(colorName);

								$ul.append($li);
							});
							$panel.append($ul);
						});
						return $panel;
					}

					function createPanel_insertimage(commandName)
					{
/*
<div class="cazary-panel cazary-panel-insertimage">
	<form action="#">
		<div>
			<fieldset>
				<legend>Input image URL</legend>
				<input type="url" class="cazary-widget-insertimage-url" required="required" placeholder="http://example.com/path/to/image.jpg" />
			</fieldset>
			<input type="button" class="cazary-widget-submit" value="Insert" />
		</div>
		<fieldset class="cazary-widget-preview">
			<legend>Preview</legend>
			<img class="cazary-widget-preview-insertimage" />
		</fieldset>
	</form>
</div>
*/
						const $panel = $("<div>")
							.append(
								$("<form />")
									.attr("action", "#")
									.append(
										$("<div />")
											.append(
												$("<fieldset />")
													.append(
														$("<legend />")
															.text(_("Input image URL"))
													)
													.append(
														$("<input type=\"text\" />")
															.addClass("cazary-widget-insertimage-url")
															.attr({
																"required": "required",
																"placeholder": _("http://example.com/path/to/image.jpg"),
															})
													)
											)
											.append(
												$("<input type=\"submit\" />")
													.addClass("cazary-widget-submit")
													.val(_("Insert"))
											)
									)
									.append(
										$("<fieldset />")
											.addClass("cazary-widget-preview")
											.append(
												$("<legend />")
													.text(_("Preview"))
											)
											.append(
											$("<img />")
												.addClass("cazary-widget-preview-insertimage")
											)
									)
								);

						return $panel
							.on("submit", "form", onsubmit)
							.on("click", ".cazary-widget-submit", onsubmit)
							.on("keydown paste", ".cazary-widget-insertimage-url", onupdate);

						function onsubmit()
						{
							const $url = $panel.find(".cazary-widget-insertimage-url");
							const  url = $url.val();
							if(!checkURL(url))
							{
								$url.trigger("focus");
								return false;
							}
							_execCommand(commandName, url);
							return false;
						}

						function onupdate()
						{
							const $url = $(this);
							window.setTimeout(function()
							{
								const dataName = "url_old";
								const url     = $url.val();
								const url_old = $url.data(dataName);
								if(url === url_old)
								{
									return;
								}
								$url.data(dataName, url);
								const $preview = $panel.find(".cazary-widget-preview");
								if(checkURL(url))
								{
									$preview.show();
									$panel
										.find(".cazary-widget-preview-insertimage")
											.attr("src", url);
								}
								else
								{
									$preview.hide();
								}
							}, 10);
						}
					}

					function createPanel_createlink(commandName)
					{
/*
<div class="cazary-panel cazary-panel-createlink">
	<form action="#">
		<div>
			<fieldset>
				<legend>Input link URL or E-mail address</legend>
				<input type="url" class="cazary-widget-createlink-url" required="required" placeholder="http://example.com/, someone@example.com" />
			</fieldset>
			<input type="button" class="cazary-widget-submit" value="Insert" />
		</div>
		<fieldset class="cazary-widget-preview">
			<legend>Preview</legend>
			<iframe class="cazary-widget-preview-createlink"></iframe>
		</fieldset>
	</form>
</div>
*/
						const $panel = $("<div>")
							.append(
								$("<form />")
									.attr("action", "#")
									.append(
										$("<div />")
											.append(
												$("<fieldset />")
													.append(
														$("<legend />")
															.text(_("Input link URL or E-mail address"))
													)
													.append(
														$("<input type=\"text\" />")
															.addClass("cazary-widget-createlink-url")
															.attr({
																"required": "required",
																"placeholder": _("http://example.com/, someone@example.com"),
															})
													)
											)
											.append(
												$("<input type=\"button\" />")
													.addClass("cazary-widget-submit")
													.val(_("Insert"))
											)
									)
									.append(
										$("<fieldset />")
											.addClass("cazary-widget-preview")
											.append(
												$("<legend />")
													.text(_("Preview"))
											)
											.append(
											$("<iframe />")
												.addClass("cazary-widget-preview-createlink")
											)
									)
								);

						return $panel
							.on("submit", "form", onsubmit)
							.on("click", ".cazary-widget-submit", onsubmit)
							.on("keydown paste", ".cazary-widget-createlink-url", onupdate);

						function onsubmit()
						{
							const $url = $panel.find(".cazary-widget-createlink-url");
							let url = $url.val();
							if(checkEmail(url))
							{
								url = `mailto:${url}`;
							}
							else if(!checkURL(url))
							{
								$url.trigger("focus");
								return false;
							}
							_execCommand(commandName, url);
							return false;
						}

						function onupdate()
						{
							const $url = $(this);
							window.setTimeout(function()
							{
								const dataName = "url_old";
								const url     = $url.val();
								const url_old = $url.data(dataName);
								if(url === url_old)
								{
									return;
								}
								$url.data(dataName, url);
								const $preview = $panel.find(".cazary-widget-preview");
								if(checkURL(url))
								{
									$preview.show();
									$panel
										.find(".cazary-widget-preview-createlink")
											.attr("src", url);
								}
								else
								{
									$preview.hide();
								}
							}, 10);
						}
					}

					/**
					 * update command status
					 * when to be called:
					 * <ul>
					 *  <li>after switched to RTE mode</li>
					 *  <li>after execCommand method</li>
					 *  <li>select event to RTE object</li>
					 *  <li>click event to RTE object</li>
					 *  <li>keyup event to RTE object</li>
					 *  <li>focus event to RTE object</li>
					 * </ul>
					 */
					function _updateCommandStatus()
					{
						const status = editor.getCurrentStatus();
						for(const name in status)
						{
							let value = status[name];
							const $element = $cazary.find(`.cazary-command-${name}`);

							// set font name
							if(name === editor.COMMAND.FONTNAME)
							{
								let title = value;
								if(title === null)
								{
									value = "";
									title = $element.attr("title");
								}
								$element.css({"font-family": value}).text(title);
								continue;
							}

							// set font size
							if(name === editor.COMMAND.FONTSIZE)
							{
								let title = value;
								if(title === null)
								{
									value = "";
									title = $element.attr("title");
								}
								else
								{
									title = _(ASSOC_FONTSIZES[title]);
								}
								$element.text(title);
								continue;
							}

							// set font color
							if(name === editor.COMMAND.FORECOLOR || name === editor.COMMAND.BACKCOLOR)
							{
								const $command = $cazary.find(`.cazary-command-${name}`);
								const color = (value === null) ? "" : value;
								$command.css("background-color", color);
								continue;
							}

							if(value === editor.STATUS.ACTIVE)
							{
								$element.addClass("cazary-active");
							}
							else
							{
								$element.removeClass("cazary-active");
							}
							if(value === editor.STATUS.DISABLED)
							{
								$element.addClass("cazary-disabled");
							}
							else
							{
								$element.removeClass("cazary-disabled");
							}
						}
					}

					/**
					 * set focus to editor window
					 */
					function _setFocus()
					{
						if(_isHtmlMode())
						{
							$origin.trigger("focus");
						}
						else
						{
							editor.setFocus();
						}
					}

					/**
					 * set/unset "empty" class to body
					 */
					function _setEmptyClass()
					{
						const $body = $(editor.contentDocument.body);
						if($body.text().length === 0)
						{
							$body.addClass("empty");
						}
						else
						{
							$body.removeClass("empty");
						}
					}
				});
			};

			function createCommandsWrapper(commands)
			{
/*
<div class="cazary-commands-wrapper">
	<ul class="cazary-commands-list">
		<li unselectable="on" class="cazary-command-aaa" title="AAA">AAA</li>
		...
	</ul>
	<ul class="cazary-commands-list">
		<li unselectable="on" class="cazary-command-bbb" title="BBB">BBB</li>
		...
	</ul>
	...
</div>
*/
				if(typeof(commands) === "string")
				{
					if(PRE_DEFINED_MACROS[commands] !== undefined)
					{
						commands = PRE_DEFINED_MACROS[commands];
					}
					else
					{
						commands = [commands];
					}
				}

				const $obj = $("<div />").addClass("cazary-commands-wrapper");
				$.each(commands, function()
				{
					const $ul = $("<ul />").addClass("cazary-commands-list");
					const command_list = this.toLowerCase().split(" ");
					$.each(command_list, function()
					{
						let command = this.toString();
						if(command === "|")
						{
							command = "separator";
						}

						if(ASSOC_COMMANDNAMES[command] === undefined)
						{
							return;
						}

						const text = _(ASSOC_COMMANDNAMES[command]);
						const className = `cazary-command-${command}`;

						const $li = $("<li />")
							.attr({
								"unselectable": "on",
								"title": text,
							})
							.addClass(className)
							.text(text);

						$ul.append($li);
					});
					$obj.append($ul);
				});
				return $obj;
			}

			/**
			 * destroy all panels
			 */
			function destroyAllPanels()
			{
				$(".cazary-panel")
					.each(function()
					{
						const commandName = $(this).data("command");
						const selector = `.cazary-command-${commandName}`;
						$(selector).removeClass("cazary-active");
					})
					.remove();
			}
		})($)
	});
	return $;
}));
