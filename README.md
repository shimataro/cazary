Cazary
======

jQuery plugin of WYSIWYG editor that aims for fast, lightweight, stylish, customizable, cross-browser, and multi-language.

## jQuery version

* [1.7+](http://code.jquery.com/jquery-1.7.js) (cazary.js)
* [1.2.4+](http://code.jquery.com/jquery-1.2.4.js) (cazary-legacy.js)

## Supported browsers

* [Internet Explorer](http://windows.microsoft.com/en-us/internet-explorer/download-ie): 8 or later
* [Mozilla Firefox](http://www.mozilla.com/firefox/): Latest version
* [Google Chrome](http://www.google.com/chrome/): Latest version
* [Opera](http://www.opera.com/): version 12(Presto based), 15([Blink](http://www.chromium.org/blink) based)
* [Safari for Windows](http://support.apple.com/kb/DL1531): version 5
* [Safari for Mac](https://www.apple.com/jp/safari/): Latest version (thanks, Brad!)

## Supported Languages

* English
* Japanese
* Polish

## How to use

```js
$(function($)
{
	// that's it!
	$("textarea").cazary();

	// initial mode: HTML
	$("textarea").cazary({
		mode: "html"
	});

	// full commands
	$("textarea").cazary({
		commands: "FULL"
	});
});
```

see [demo page](http://rawgit.com/shimataro/cazary/master/demo.html)

## Options

| name | type | description | default |
|------|------|-------------|---------|
| mode | String | initial mode ("rte" or "html") | "rte" |
| style | String | style of RTE area | "body{margin:0px;padding:8px;}p{margin:0px;padding:0px;}" |
| fontnames | Array | array of fontname | ["Arial", "Arial Black", "Comic Sans MS", "Courier New", "Narrow", "Garamond", "Georgia", "Impact", "Sans Serif", "Serif", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana" ] |
| colors | Array (two-dimensional) | color table | [<br />["#ffffff", "#ffcccc", "#ffcc99", "#ffff99", "#ffffcc", "#99ff99", "#99ffff", "#ccffff", "#ccccff", "#ffccff"],<br />["#cccccc", "#ff6666", "#ff9966", "#ffff66", "#ffff33", "#66ff99", "#33ffff", "#66ffff", "#9999ff", "#ff99ff"],<br />["#bbbbbb", "#ff0000", "#ff9900", "#ffcc66", "#ffff00", "#33ff33", "#66cccc", "#33ccff", "#6666cc", "#cc66cc"],<br />["#999999", "#cc0000", "#ff6600", "#ffcc33", "#ffcc00", "#33cc00", "#00cccc", "#3366ff", "#6633ff", "#cc33cc"],<br />["#666666", "#990000", "#cc6600", "#cc9933", "#999900", "#009900", "#339999", "#3333ff", "#6600cc", "#993399"],<br />["#333333", "#660000", "#993300", "#996633", "#666600", "#006600", "#336666", "#000099", "#333399", "#663366"],<br />["#000000", "#330000", "#663300", "#663333", "#333300", "#003300", "#003333", "#000066", "#330099", "#330033"]<br />] |
| commands | String or Array | pre-defined macro or (array of) space-separated commands (see below) | "STANDARD" |

## Commands

* "commands" option must be specified one of followings:
    * one of "pre-defined macros"
    * any combination of space-separated commands or "|"(separator)
* set of commands can be array
* see below about pre-defined macros and commands

### pre-defined macros

| name | is expanded to... |
|------|----------------|
| MINIMAL | ["bold italic underline strikethrough removeformat"] |
| STANDARD | [<br />"fontname fontsize",<br />"bold italic underline strikethrough removeformat &#x7c; forecolor backcolor &#x7c; superscript subscript",<br />"source"<br />] |
| FULL | [<br />"fontname fontsize",<br />"bold italic underline strikethrough removeformat &#x7c; forecolor backcolor &#x7c; superscript subscript",<br />"justifyleft justifycenter justifyright justifyfull &#x7c; indent outdent &#x7c; insertorderedlist insertunorderedlist",<br />"inserthorizontalrule insertimage createlink unlink",<br />"undo redo",<br />"source"<br />] |

### commands (inline styles)

| name | description |
|------|-------------|
| fontname | set font name |
| fontsize | set font size |
| bold | set style to bold |
| italic | set style to italic |
| underline | set style to underline |
| strikethrough | set style to strikethrough |
| removeformat | remove all format |
| forecolor | set foreground color |
| backcolor | set background color |
| superscript | set style to superscript |
| subscript | set style to subscript |

### commands (block styles)

| name | description |
|------|-------------|
| justifyleft | align current block to left |
| justifycenter | align current block to center |
| justifyright | align current block to right |
| justifyfull | justify current block |
| indent | indent current block |
| outdent | un-indent current block |
| insertorderedlist | set current block to ordered list |
| insertunorderedlist | set current block to un-ordered list |

### commands (insertion / creation)

| name | description |
|------|-------------|
| inserthorizontalrule | insert horizontal rule to current position |
| insertimage | insert image to current position current position |
| createlink | create link to selected text |
| unlink | remove link of selected text |

### commands (editing)

| name | description |
|------|-------------|
| undo | undo command |
| redo | undo the undone command |
| source | toggle HTML/RTE mode |

## Project Page

http://github.com/shimataro/cazary

## Release note

* 2015-11-05 *version 1.1.0*
	* Supports CommonJS.

* 2015-10-08 *version 1.0.1*
	* Fixed Polish translation.

* 2015-10-06 *version 1.0*
	* First release.

## Recruitment

I'm looking for human resources.
[Please contact me in my GitHub page!](https://github.com/shimataro)

* translators - except English and Japanese (translate from English or Japanese)
* designers - please create cool themes!

## Special Thanks

<dl>
	<dt><a href="https://github.com/jqueryscript">yuqianyumo</a></dt>
	<dd>Introducing Cazary in <a href="http://www.jqueryscript.net/text/Simple-Html-WYSIWYG-Editor-Plugin-with-jQuery-Cazary.html">website</a></dd>

	<dt>Paweł Klockiewicz</dt>
	<dd>Polish Translation</dd>
</dl>
