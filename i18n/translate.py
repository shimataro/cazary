# coding: utf-8
""" generate translation data

Usage:
$ python translate.py
"""

def main():
	import json
	data = {}
	for lang, infile in get_files():
		data[lang] = parse_file(infile)

	print(json.dumps(data))


def get_files():
	""" get language codes and file objects

	@return: (language code, file object); generator
	"""
	import re, glob
	r = re.compile(r"^(\w+)\.data$")
	for filename in glob.glob("*.data"):
		m = r.match(filename)
		if m == None:
			continue

		lang = m.group(1)
		if lang == "_":
			# template file
			continue

		with open(filename, "rt") as infile:
			yield (lang, infile)


def parse_file(infile):
	""" parse data file

	@param infile: file object
	@return: parsed translation data; dictionary
	"""
	result = {}
	for line in infile:
		if line == "":
			# empty line
			continue

		if line[0] == "#":
			# begins with "#"
			continue

		pieces = line.rstrip("\r\n").split("\t", 2);
		if len(pieces) == 1:
			# no tabs
			continue

		result[pieces[0]] = pieces[1]

	return result


main()
